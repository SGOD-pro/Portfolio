import { GITHUB_CONFIG } from "./config.ts";
import type { GitHubRateLimitInfo } from "./types.ts";

interface CacheEntry<T> {
  data: T;
  timestamp: number; // ms
  ttlMs: number;
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<unknown>>();

  get<T>(key: string): { data: T; isStale: boolean; fetchedAt: string } | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;
    const now = Date.now();
    const isStale = now - entry.timestamp > entry.ttlMs;
    return {
      data: entry.data,
      isStale,
      fetchedAt: new Date(entry.timestamp).toISOString(),
    };
  }

  set<T>(key: string, data: T, ttlSeconds: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttlMs: ttlSeconds * 1000,
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

export const githubCache = new MemoryCache();

class ConcurrencyLimiter {
  private active = 0;
  private queue: Array<() => void> = [];
  private maxConcurrent: number;

  constructor(maxConcurrent: number) {
    this.maxConcurrent = maxConcurrent;
  }

  async run<T>(fn: () => Promise<T>): Promise<T> {
    if (this.active >= this.maxConcurrent) {
      await new Promise<void>((resolve) => this.queue.push(resolve));
    }
    this.active++;
    try {
      return await fn();
    } finally {
      this.active--;
      const next = this.queue.shift();
      if (next) next();
    }
  }
}

export const githubLimiter = new ConcurrencyLimiter(GITHUB_CONFIG.maxConcurrentRequests);

// Deduplication map for in-flight requests
const inFlightRequests = new Map<string, Promise<unknown>>();

export class GitHubApiError extends Error {
  statusCode: number;
  rateLimit?: GitHubRateLimitInfo;
  isGraphQL: boolean;

  constructor(
    message: string,
    statusCode: number,
    rateLimit?: GitHubRateLimitInfo,
    isGraphQL: boolean = false
  ) {
    super(message);
    this.name = "GitHubApiError";
    this.statusCode = statusCode;
    this.rateLimit = rateLimit;
    this.isGraphQL = isGraphQL;
  }
}

export function getServerGitHubToken(): string | null {
  // Only server-side environment variables
  if (typeof window !== "undefined") return null;
  return process.env.GITHUB_TOKEN || process.env.GH_TOKEN || null;
}

function parseRateLimitHeaders(headers: Headers): GitHubRateLimitInfo | undefined {
  const remaining = headers.get("x-ratelimit-remaining");
  const limit = headers.get("x-ratelimit-limit");
  const reset = headers.get("x-ratelimit-reset");
  const retryAfter = headers.get("retry-after");

  if (remaining !== null && limit !== null && reset !== null) {
    return {
      remaining: parseInt(remaining, 10),
      limit: parseInt(limit, 10),
      resetTime: parseInt(reset, 10),
      retryAfterSeconds: retryAfter ? parseInt(retryAfter, 10) : undefined,
    };
  }
  return undefined;
}

export async function fetchGitHubRest<T>(
  endpoint: string,
  options?: {
    customFetch?: typeof fetch;
    headers?: Record<string, string>;
    timeoutMs?: number;
  }
): Promise<{ data: T; headers: Headers; rateLimit?: GitHubRateLimitInfo }> {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${GITHUB_CONFIG.apiBaseUrl}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  // Validate URL to ensure we only talk to api.github.com
  const parsed = new URL(url);
  if (parsed.hostname !== "api.github.com") {
    throw new GitHubApiError(`Target host not allowed: ${parsed.hostname}`, 400);
  }

  const dedupKey = `REST:${url}`;
  if (inFlightRequests.has(dedupKey)) {
    return inFlightRequests.get(dedupKey) as Promise<{
      data: T;
      headers: Headers;
      rateLimit?: GitHubRateLimitInfo;
    }>;
  }

  const fetchPromise = githubLimiter.run(async () => {
    const token = getServerGitHubToken();
    const reqHeaders: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "SGOD-Portfolio-Client",
      ...(options?.headers || {}),
    };

    if (token) {
      reqHeaders.Authorization = `Bearer ${token}`;
    }

    const fetcher = options?.customFetch || fetch;
    const timeoutMs = options?.timeoutMs || GITHUB_CONFIG.requestTimeoutMs;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetcher(url, {
        headers: reqHeaders,
        signal: controller.signal,
      });

      const rateLimit = parseRateLimitHeaders(response.headers);

      if (!response.ok) {
        let errorMsg = `GitHub API error: ${response.status} ${response.statusText}`;
        try {
          const body = await response.json();
          if (body && typeof body.message === "string") {
            errorMsg = body.message;
          }
        } catch {
          // ignore json parse error on non-ok
        }
        throw new GitHubApiError(errorMsg, response.status, rateLimit);
      }

      const data = (await response.json()) as T;
      return { data, headers: response.headers, rateLimit };
    } catch (err: unknown) {
      if (err instanceof GitHubApiError) throw err;
      if (err instanceof Error && err.name === "AbortError") {
        throw new GitHubApiError(`Request timed out after ${timeoutMs}ms`, 408);
      }
      throw new GitHubApiError(
        err instanceof Error ? err.message : "Network error contacting GitHub",
        500
      );
    } finally {
      clearTimeout(timer);
    }
  });

  inFlightRequests.set(dedupKey, fetchPromise);
  try {
    return await fetchPromise;
  } finally {
    inFlightRequests.delete(dedupKey);
  }
}

export async function fetchGitHubGraphQL<T>(
  query: string,
  variables: Record<string, unknown> = {},
  options?: {
    customFetch?: typeof fetch;
    timeoutMs?: number;
  }
): Promise<T> {
  const token = getServerGitHubToken();
  if (!token) {
    throw new GitHubApiError("No GitHub token configured for GraphQL query", 401);
  }

  const url = `${GITHUB_CONFIG.apiBaseUrl}/graphql`;
  const dedupKey = `GQL:${JSON.stringify({ query, variables })}`;
  if (inFlightRequests.has(dedupKey)) {
    return inFlightRequests.get(dedupKey) as Promise<T>;
  }

  const fetchPromise = githubLimiter.run(async () => {
    const fetcher = options?.customFetch || fetch;
    const timeoutMs = options?.timeoutMs || GITHUB_CONFIG.requestTimeoutMs;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetcher(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
          "User-Agent": "SGOD-Portfolio-Client",
        },
        body: JSON.stringify({ query, variables }),
        signal: controller.signal,
      });

      const rateLimit = parseRateLimitHeaders(response.headers);

      if (!response.ok) {
        throw new GitHubApiError(
          `GraphQL request failed with status ${response.status}`,
          response.status,
          rateLimit
        );
      }

      const result = (await response.json()) as {
        data?: T;
        errors?: Array<{ message: string }>;
      };

      if (result.errors && result.errors.length > 0) {
        const errorMessages = result.errors.map((e) => e.message).join("; ");
        throw new GitHubApiError(`GraphQL error: ${errorMessages}`, 200, rateLimit, true);
      }

      if (!result.data) {
        throw new GitHubApiError("GraphQL response missing data field", 200, rateLimit, true);
      }

      return result.data;
    } catch (err: unknown) {
      if (err instanceof GitHubApiError) throw err;
      if (err instanceof Error && err.name === "AbortError") {
        throw new GitHubApiError(`GraphQL request timed out after ${timeoutMs}ms`, 408);
      }
      throw new GitHubApiError(
        err instanceof Error ? err.message : "Network error contacting GitHub GraphQL",
        500
      );
    } finally {
      clearTimeout(timer);
    }
  });

  inFlightRequests.set(dedupKey, fetchPromise);
  try {
    return await fetchPromise;
  } finally {
    inFlightRequests.delete(dedupKey);
  }
}
