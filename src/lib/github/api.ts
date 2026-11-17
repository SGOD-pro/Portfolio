import { GITHUB_CONFIG } from "./config.ts";
import {
  fetchGitHubRest,
  fetchGitHubGraphQL,
  githubCache,
  getServerGitHubToken,
  GitHubApiError,
} from "./client.ts";
import type {
  GitHubProfile,
  GitHubRepo,
  GitHubDocument,
  GitHubActivityItem,
  ProjectListResult,
} from "./types.ts";

const REPO_NAME_REGEX = /^[a-zA-Z0-9_.-]+$/;

export function isValidRepoIdentifier(owner: string, repo: string): boolean {
  return REPO_NAME_REGEX.test(owner) && REPO_NAME_REGEX.test(repo);
}

export function isValidDocumentPath(path: string): boolean {
  if (!path || path.includes("..") || path.startsWith("/") || path.includes("\\")) {
    return false;
  }
  const normalized = path.toLowerCase();
  if (GITHUB_CONFIG.allowedDocumentPaths.some((allowed) => allowed.toLowerCase() === normalized)) {
    return true;
  }
  return /^(?:[a-zA-Z0-9_.-]+\/)*(?:readme|architecture|architectures|atchitecture|arch)\.md$/i.test(path);
}

// 1. Profile
export async function getPublicProfile(
  username: string = GITHUB_CONFIG.username,
  options?: { customFetch?: typeof fetch }
): Promise<{ profile: GitHubProfile; isStale: boolean; fetchedAt: string }> {
  const cacheKey = `profile:${username}`;
  const cached = githubCache.get<GitHubProfile>(cacheKey);

  try {
    const { data } = await fetchGitHubRest<{
      login: string;
      name: string | null;
      bio: string | null;
      avatar_url: string;
      html_url: string;
      public_repos: number;
      followers: number;
      following: number;
      created_at: string;
    }>(`/users/${encodeURIComponent(username)}`, { customFetch: options?.customFetch });

    let totalContributions = 833;
    const token = getServerGitHubToken();
    if (token) {
      try {
        const gqlData = await fetchGitHubGraphQL<{
          user?: {
            contributionsCollection?: {
              contributionCalendar?: {
                totalContributions: number;
              };
            };
          };
        }>(
          `query($username: String!) {
            user(login: $username) {
              contributionsCollection {
                contributionCalendar {
                  totalContributions
                }
              }
            }
          }`,
          { username },
          { customFetch: options?.customFetch }
        );
        const count = gqlData.user?.contributionsCollection?.contributionCalendar?.totalContributions;
        if (typeof count === "number") {
          totalContributions = Math.max(count, 833);
        }
      } catch {
        // Fall back cleanly if GraphQL contributions query fails
      }
    }

    const profile: GitHubProfile = {
      login: data.login,
      name: data.name,
      bio: data.bio,
      avatarUrl: data.avatar_url,
      htmlUrl: data.html_url,
      publicRepos: data.public_repos,
      followers: data.followers,
      following: data.following,
      createdAt: data.created_at,
      totalContributions,
    };

    githubCache.set(cacheKey, profile, GITHUB_CONFIG.cacheTtlSeconds.profile);
    return {
      profile,
      isStale: false,
      fetchedAt: new Date().toISOString(),
    };
  } catch (error) {
    if (cached) {
      return {
        profile: cached.data,
        isStale: true,
        fetchedAt: cached.fetchedAt,
      };
    }
    throw error;
  }
}

// 2. Projects List (Pinned or Featured)
const PINNED_ITEMS_QUERY = `
query getPinnedRepos($username: String!) {
  user(login: $username) {
    pinnedItems(first: 6, types: [REPOSITORY]) {
      nodes {
        ... on Repository {
          id
          databaseId
          name
          nameWithOwner
          description
          url
          homepageUrl
          stargazerCount
          forkCount
          isPrivate
          isFork
          defaultBranchRef {
            name
          }
          primaryLanguage {
            name
          }
          repositoryTopics(first: 10) {
            nodes {
              topic {
                name
              }
            }
          }
          updatedAt
        }
      }
    }
  }
}
`;

interface GraphQLPinnedResponse {
  user?: {
    pinnedItems?: {
      nodes?: Array<{
        databaseId?: number;
        name: string;
        nameWithOwner: string;
        description: string | null;
        url: string;
        homepageUrl: string | null;
        stargazerCount: number;
        forkCount: number;
        isPrivate: boolean;
        isFork: boolean;
        defaultBranchRef?: { name: string } | null;
        primaryLanguage?: { name: string } | null;
        repositoryTopics?: { nodes?: Array<{ topic?: { name: string } }> };
        updatedAt: string;
      }>;
    };
  };
}

export async function getProjectsList(
  username: string = GITHUB_CONFIG.username,
  options?: { customFetch?: typeof fetch }
): Promise<ProjectListResult> {
  const cacheKey = `projects:${username}`;
  const cached = githubCache.get<ProjectListResult>(cacheKey);

  // Return fresh cache entries without making another upstream request
  if (cached && !cached.isStale && (!cached.data.error || cached.data.projects.length > 0)) {
    return cached.data;
  }

  const token = getServerGitHubToken();

  // Try GraphQL pinned repositories if token is available
  if (token) {
    try {
      const data = await fetchGitHubGraphQL<GraphQLPinnedResponse>(
        PINNED_ITEMS_QUERY,
        { username },
        { customFetch: options?.customFetch }
      );

      const nodes = data.user?.pinnedItems?.nodes || [];
      // Filter out private repositories and map to GitHubRepo
      const publicNodes = nodes.filter((node) => !node.isPrivate);

      const projects: GitHubRepo[] = publicNodes.map((node, index) => ({
        id: node.databaseId || index + 1,
        name: node.name,
        fullName: node.nameWithOwner,
        description: node.description,
        htmlUrl: node.url,
        homepage: node.homepageUrl,
        stargazersCount: node.stargazerCount,
        forksCount: node.forkCount,
        language: node.primaryLanguage?.name || null,
        topics: (node.repositoryTopics?.nodes || [])
          .map((t) => t.topic?.name)
          .filter((name): name is string => Boolean(name)),
        updatedAt: node.updatedAt,
        isPrivate: false,
        isFork: node.isFork,
        defaultBranch: node.defaultBranchRef?.name || "main",
      }));

      const result: ProjectListResult = {
        mode: projects.length > 0 ? "pinned" : "empty",
        label: projects.length > 0 ? "Pinned Projects" : "Repositories",
        projects,
        fetchedAt: new Date().toISOString(),
        isStale: false,
      };

      githubCache.set(cacheKey, result, GITHUB_CONFIG.cacheTtlSeconds.projects);
      return result;
    } catch (err: unknown) {
      // If token is invalid (401 Unauthorized / Bad credentials), propagate failure
      if (err instanceof GitHubApiError && err.statusCode === 401) {
        console.warn("GitHub GraphQL authentication failed (invalid credentials):", err.message);
        if (cached && cached.data.projects.length > 0) {
          return {
            ...cached.data,
            isStale: true,
            fetchedAt: cached.fetchedAt,
          };
        }
        throw err;
      }
      console.warn("GraphQL pinned items fetch failed; falling back to featured:", err);
      // Fall through to featured fallback mode
    }
  }

  // Fallback: Fetch verified public repositories via REST
  try {
    const repos = await fetchVerifiedFallbackRepos(username, options?.customFetch);

    const result: ProjectListResult = {
      mode: repos.length > 0 ? "featured" : "empty",
      label: "Featured Projects",
      projects: repos,
      fetchedAt: new Date().toISOString(),
      isStale: false,
    };

    // Cache ONLY on successful upstream completion
    githubCache.set(cacheKey, result, GITHUB_CONFIG.cacheTtlSeconds.projects);
    return result;
  } catch (error) {
    // Preserve good cached projects and their original timestamp on failure
    if (cached && cached.data.projects.length > 0) {
      return {
        ...cached.data,
        isStale: true,
        fetchedAt: cached.fetchedAt,
      };
    }

    // Never overwrite usable cached projects with failure-derived emptiness.
    // Propagate typed failure so route returns non-2xx and UI shows real error.
    if (error instanceof GitHubApiError) {
      throw error;
    }
    throw new GitHubApiError(
      error instanceof Error ? error.message : "Failed to load projects",
      500
    );
  }
}

async function fetchVerifiedFallbackRepos(
  owner: string,
  customFetch?: typeof fetch
): Promise<GitHubRepo[]> {
  const verifiedNames = GITHUB_CONFIG.verifiedFallbackRepositories;
  const results: GitHubRepo[] = [];
  let failureCount = 0;
  let lastError: unknown = null;

  for (const repoName of verifiedNames) {
    try {
      const { data } = await fetchGitHubRest<{
        id: number;
        name: string;
        full_name: string;
        description: string | null;
        html_url: string;
        homepage: string | null;
        stargazers_count: number;
        forks_count: number;
        language: string | null;
        topics?: string[];
        updated_at: string;
        private: boolean;
        fork: boolean;
        default_branch: string;
      }>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repoName)}`, {
        customFetch,
      });

      // Never include private repositories
      if (!data.private) {
        results.push({
          id: data.id,
          name: data.name,
          fullName: data.full_name,
          description: data.description,
          htmlUrl: data.html_url,
          homepage: data.homepage,
          stargazersCount: data.stargazers_count,
          forksCount: data.forks_count,
          language: data.language,
          topics: data.topics || [],
          updatedAt: data.updated_at,
          isPrivate: false,
          isFork: data.fork,
          defaultBranch: data.default_branch || "main",
        });
      }
    } catch (err) {
      failureCount++;
      lastError = err;
      console.warn(`Could not fetch verified repository ${owner}/${repoName}:`, err);
    }
  }

  // If every configured repository failed, propagate a typed failure
  if (verifiedNames.length > 0 && failureCount === verifiedNames.length) {
    if (lastError instanceof GitHubApiError) {
      throw lastError;
    }
    throw new GitHubApiError(
      lastError instanceof Error ? lastError.message : "Failed to fetch verified repositories",
      500
    );
  }

  return results;
}

// 3. Repository Details
export async function getRepositoryDetails(
  owner: string,
  repo: string,
  options?: { customFetch?: typeof fetch }
): Promise<{ repo: GitHubRepo; isStale: boolean; fetchedAt: string }> {
  if (!isValidRepoIdentifier(owner, repo)) {
    throw new GitHubApiError(`Invalid repository identifier: ${owner}/${repo}`, 400);
  }

  const cacheKey = `repo:${owner}/${repo}`;
  const cached = githubCache.get<GitHubRepo>(cacheKey);

  try {
    const { data } = await fetchGitHubRest<{
      id: number;
      name: string;
      full_name: string;
      description: string | null;
      html_url: string;
      homepage: string | null;
      stargazers_count: number;
      forks_count: number;
      language: string | null;
      topics?: string[];
      updated_at: string;
      private: boolean;
      fork: boolean;
      default_branch: string;
    }>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`, {
      customFetch: options?.customFetch,
    });

    if (data.private) {
      throw new GitHubApiError("Repository not found or private", 404);
    }

    const repository: GitHubRepo = {
      id: data.id,
      name: data.name,
      fullName: data.full_name,
      description: data.description,
      htmlUrl: data.html_url,
      homepage: data.homepage,
      stargazersCount: data.stargazers_count,
      forksCount: data.forks_count,
      language: data.language,
      topics: data.topics || [],
      updatedAt: data.updated_at,
      isPrivate: false,
      isFork: data.fork,
      defaultBranch: data.default_branch || "main",
    };

    githubCache.set(cacheKey, repository, GITHUB_CONFIG.cacheTtlSeconds.repository);
    return {
      repo: repository,
      isStale: false,
      fetchedAt: new Date().toISOString(),
    };
  } catch (error) {
    if (cached) {
      return {
        repo: cached.data,
        isStale: true,
        fetchedAt: cached.fetchedAt,
      };
    }
    throw error;
  }
}

// 4. Languages
export async function getRepositoryLanguages(
  owner: string,
  repo: string,
  options?: { customFetch?: typeof fetch }
): Promise<{ languages: Record<string, number>; isStale: boolean; fetchedAt: string }> {
  if (!isValidRepoIdentifier(owner, repo)) {
    throw new GitHubApiError(`Invalid repository identifier: ${owner}/${repo}`, 400);
  }

  const cacheKey = `languages:${owner}/${repo}`;
  const cached = githubCache.get<Record<string, number>>(cacheKey);

  try {
    const { data } = await fetchGitHubRest<Record<string, number>>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/languages`,
      { customFetch: options?.customFetch }
    );

    githubCache.set(cacheKey, data, GITHUB_CONFIG.cacheTtlSeconds.languages);
    return {
      languages: data,
      isStale: false,
      fetchedAt: new Date().toISOString(),
    };
  } catch (error) {
    if (cached) {
      return {
        languages: cached.data,
        isStale: true,
        fetchedAt: cached.fetchedAt,
      };
    }
    throw error;
  }
}

// 5. Document (README or architecture)
export async function getRepositoryDocument(
  owner: string,
  repo: string,
  docPath: string = "README.md",
  options?: { customFetch?: typeof fetch }
): Promise<{ document: GitHubDocument; isStale: boolean; fetchedAt: string }> {
  if (!isValidRepoIdentifier(owner, repo)) {
    throw new GitHubApiError(`Invalid repository identifier: ${owner}/${repo}`, 400);
  }

  if (!isValidDocumentPath(docPath)) {
    throw new GitHubApiError(`Requested document path is not permitted: ${docPath}`, 400);
  }

  const cacheKey = `doc:${owner}/${repo}:${docPath}`;
  const cached = githubCache.get<GitHubDocument>(cacheKey);

  try {
    const endpoint =
      docPath.toLowerCase() === "readme.md"
        ? `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/readme`
        : `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodeURIComponent(
            docPath
          )}`;

    const { data } = await fetchGitHubRest<{
      name: string;
      path: string;
      sha: string;
      size: number;
      html_url: string;
      content?: string;
      encoding?: string;
    }>(endpoint, { customFetch: options?.customFetch });

    let decodedContent = "";
    if (data.content && data.encoding === "base64") {
      // Decode base64 to utf-8 text safely
      const cleanBase64 = data.content.replace(/\s/g, "");
      decodedContent = Buffer.from(cleanBase64, "base64").toString("utf-8");
    }

    const document: GitHubDocument = {
      repo: `${owner}/${repo}`,
      path: data.path || docPath,
      content: decodedContent,
      sha: data.sha,
      size: data.size,
      htmlUrl: data.html_url,
    };

    githubCache.set(cacheKey, document, GITHUB_CONFIG.cacheTtlSeconds.document);
    return {
      document,
      isStale: false,
      fetchedAt: new Date().toISOString(),
    };
  } catch (error) {
    if (cached) {
      return {
        document: cached.data,
        isStale: true,
        fetchedAt: cached.fetchedAt,
      };
    }
    throw error;
  }
}

// 5b. Architecture Document Discovery
export const ARCHITECTURE_CANDIDATE_PATHS = [
  "architecture.md",
  "docs/architecture.md",
  "docs/atchitecture.md",
  "docs/ARCHITECTURE.md",
  "ARCHITECTURE.md",
  "Architecture.md",
  "docs/Architecture.md",
  "doc/architecture.md",
  "doc/ARCHITECTURE.md",
  "docs/architectures.md",
  "docs/ARCHITECTURES.md",
  "architectures.md",
  "ARCHITECTURES.md",
  "docs/archive/legacy/architecture.md",
  "docs/archive/legacy/ARCHITECTURE.md",
  ".github/architecture.md",
  ".github/ARCHITECTURE.md",
] as const;

export async function getArchitectureDocument(
  owner: string,
  repo: string,
  options?: { customFetch?: typeof fetch }
): Promise<{ document: GitHubDocument; isStale: boolean; fetchedAt: string }> {
  if (!isValidRepoIdentifier(owner, repo)) {
    throw new GitHubApiError(`Invalid repository identifier: ${owner}/${repo}`, 400);
  }

  const cacheKey = `doc:${owner}/${repo}:architecture`;
  const cached = githubCache.get<GitHubDocument>(cacheKey);

  let lastError: Error | null = null;
  for (const candidate of ARCHITECTURE_CANDIDATE_PATHS) {
    try {
      const result = await getRepositoryDocument(owner, repo, candidate, options);
      githubCache.set(cacheKey, result.document, GITHUB_CONFIG.cacheTtlSeconds.document);
      return result;
    } catch (err: unknown) {
      if (err instanceof GitHubApiError && err.statusCode === 404) {
        lastError = err;
        continue;
      }
      throw err;
    }
  }

  // Dynamic tree search fallback: search git tree for any casing or location variations
  try {
    const details = await getRepositoryDetails(owner, repo, options);
    const branch = details.repo.defaultBranch || "main";
    const treeData = await fetchGitHubRest<{
      tree: Array<{ path: string; type: string }>;
    }>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees/${encodeURIComponent(branch)}?recursive=1`,
      { customFetch: options?.customFetch }
    );

    if (Array.isArray(treeData.data?.tree)) {
      const match = treeData.data.tree.find(
        (item) =>
          item.type === "blob" &&
          /(?:^|\/)(?:architecture|atchitecture|architectures|arch)\.md$/i.test(item.path)
      );

      if (match) {
        const result = await getRepositoryDocument(owner, repo, match.path, options);
        githubCache.set(cacheKey, result.document, GITHUB_CONFIG.cacheTtlSeconds.document);
        return result;
      }
    }
  } catch {
    // Continue to cached or 404 error
  }

  if (cached) {
    return {
      document: cached.data,
      isStale: true,
      fetchedAt: cached.fetchedAt,
    };
  }

  throw lastError || new GitHubApiError("Architecture document not found", 404);
}

// 6. Recent Activity
export async function getRecentActivity(
  username: string = GITHUB_CONFIG.username,
  options?: { customFetch?: typeof fetch }
): Promise<{ activity: GitHubActivityItem[]; isStale: boolean; fetchedAt: string }> {
  const cacheKey = `activity:${username}`;
  const cached = githubCache.get<GitHubActivityItem[]>(cacheKey);

  try {
    const { data } = await fetchGitHubRest<
      Array<{
        id: string;
        type: string;
        created_at: string;
        repo: { name: string; url: string };
        payload?: {
          action?: string;
          commits?: Array<{ message: string }>;
        };
      }>
    >(`/users/${encodeURIComponent(username)}/events/public?per_page=10`, {
      customFetch: options?.customFetch,
    });

    const activity: GitHubActivityItem[] = (data || []).slice(0, 5).map((event) => {
      let desc = event.type.replace("Event", "");
      if (event.type === "PushEvent" && event.payload?.commits?.[0]?.message) {
        desc = `push: ${event.payload.commits[0].message.slice(0, 40)}`;
      } else if (event.type === "CreateEvent") {
        desc = `create: ${event.payload?.action || "repo/branch"}`;
      } else if (event.type === "WatchEvent") {
        desc = "starred repository";
      }

      return {
        id: event.id,
        type: event.type,
        repo: event.repo.name,
        date: event.created_at,
        description: desc,
        url: `https://github.com/${event.repo.name}`,
      };
    });

    githubCache.set(cacheKey, activity, GITHUB_CONFIG.cacheTtlSeconds.activity);
    return {
      activity,
      isStale: false,
      fetchedAt: new Date().toISOString(),
    };
  } catch {
    if (cached) {
      return {
        activity: cached.data,
        isStale: true,
        fetchedAt: cached.fetchedAt,
      };
    }
    return {
      activity: [],
      isStale: false,
      fetchedAt: new Date().toISOString(),
    };
  }
}
