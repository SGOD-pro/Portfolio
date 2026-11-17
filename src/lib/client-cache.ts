/**
 * Client-side localStorage cache with TTL expiration.
 * Avoids repeated API roundtrips during client-side navigation.
 */

const CACHE_PREFIX = "portfolio_cache:";

export function getLocalCache<T>(key: string, maxAgeMs = 30 * 60 * 1000): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!raw) return null;
    const entry = JSON.parse(raw);
    if (!entry || typeof entry.timestamp !== "number") return null;
    if (Date.now() - entry.timestamp > maxAgeMs) {
      localStorage.removeItem(`${CACHE_PREFIX}${key}`);
      return null;
    }
    return entry.data as T;
  } catch {
    return null;
  }
}

export function setLocalCache<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      `${CACHE_PREFIX}${key}`,
      JSON.stringify({ data, timestamp: Date.now() })
    );
  } catch {
    // Graceful fallback if storage quota exceeded or disabled
  }
}
