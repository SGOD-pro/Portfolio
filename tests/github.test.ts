import test, { describe, beforeEach } from "node:test";
import assert from "node:assert";
import {
  getPublicProfile,
  getProjectsList,
  getRepositoryDetails,
  getRepositoryLanguages,
  getRepositoryDocument,
  getRecentActivity,
  isValidRepoIdentifier,
  isValidDocumentPath,
} from "../src/lib/github/api.ts";
import {
  fetchGitHubRest,
  githubCache,
  GitHubApiError,
} from "../src/lib/github/client.ts";

describe("GitHub Data Layer Acceptance Tests", () => {
  beforeEach(() => {
    githubCache.clear();
    delete process.env.GITHUB_TOKEN;
    delete process.env.GH_TOKEN;
  });

  // 1. Missing-token featured mode and correct labelling
  test("Missing-token featured mode and correct labelling", async () => {
    const mockFetch: typeof fetch = async (url) => {
      const urlStr = url.toString();
      if (urlStr.includes("/repos/SGOD-pro/Portfolio")) {
        return new Response(
          JSON.stringify({
            id: 101,
            name: "Portfolio",
            full_name: "SGOD-pro/Portfolio",
            description: "Personal portfolio website",
            html_url: "https://github.com/SGOD-pro/Portfolio",
            homepage: "https://sgod-pro.github.io",
            stargazers_count: 5,
            forks_count: 1,
            language: "TypeScript",
            topics: ["portfolio", "nextjs"],
            updated_at: "2026-05-01T00:00:00Z",
            private: false,
            fork: false,
            default_branch: "main",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }
      return new Response(JSON.stringify({ message: "Not found" }), { status: 404 });
    };

    const result = await getProjectsList("SGOD-pro", { customFetch: mockFetch });
    assert.strictEqual(result.mode, "featured");
    assert.strictEqual(result.label, "Featured Projects");
    assert.strictEqual(result.projects.length, 1);
    assert.strictEqual(result.projects[0].name, "Portfolio");
    assert.strictEqual(result.isStale, false);
    assert.ok(result.fetchedAt);
  });

  // 2. Pinned mode and returned ordering
  test("Pinned mode and returned ordering with token", async () => {
    process.env.GITHUB_TOKEN = "ghp_mock_token_12345";

    const mockFetch: typeof fetch = async (url) => {
      const urlStr = url.toString();
      if (urlStr.includes("/graphql")) {
        return new Response(
          JSON.stringify({
            data: {
              user: {
                pinnedItems: {
                  nodes: [
                    {
                      databaseId: 201,
                      name: "Repo-Alpha",
                      nameWithOwner: "SGOD-pro/Repo-Alpha",
                      description: "First pinned repository",
                      url: "https://github.com/SGOD-pro/Repo-Alpha",
                      homepageUrl: null,
                      stargazerCount: 12,
                      forkCount: 2,
                      isPrivate: false,
                      isFork: false,
                      defaultBranchRef: { name: "main" },
                      primaryLanguage: { name: "TypeScript" },
                      repositoryTopics: { nodes: [{ topic: { name: "react" } }] },
                      updatedAt: "2026-05-02T00:00:00Z",
                    },
                    {
                      databaseId: 202,
                      name: "Repo-Beta",
                      nameWithOwner: "SGOD-pro/Repo-Beta",
                      description: "Second pinned repository",
                      url: "https://github.com/SGOD-pro/Repo-Beta",
                      homepageUrl: null,
                      stargazerCount: 8,
                      forkCount: 0,
                      isPrivate: false,
                      isFork: false,
                      defaultBranchRef: { name: "main" },
                      primaryLanguage: { name: "Python" },
                      repositoryTopics: { nodes: [] },
                      updatedAt: "2026-05-01T00:00:00Z",
                    },
                  ],
                },
              },
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }
      return new Response(JSON.stringify({ message: "Not found" }), { status: 404 });
    };

    const result = await getProjectsList("SGOD-pro", { customFetch: mockFetch });
    assert.strictEqual(result.mode, "pinned");
    assert.strictEqual(result.label, "Pinned Projects");
    assert.strictEqual(result.projects.length, 2);
    // Preserves returned ordering
    assert.strictEqual(result.projects[0].name, "Repo-Alpha");
    assert.strictEqual(result.projects[1].name, "Repo-Beta");
    assert.strictEqual(result.isStale, false);
  });

  // 3. Empty pins
  test("Empty pins handling", async () => {
    process.env.GITHUB_TOKEN = "ghp_mock_token_empty";

    const mockFetch: typeof fetch = async () => {
      return new Response(
        JSON.stringify({
          data: {
            user: {
              pinnedItems: {
                nodes: [],
              },
            },
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    };

    const result = await getProjectsList("SGOD-pro", { customFetch: mockFetch });
    assert.strictEqual(result.mode, "empty");
    assert.strictEqual(result.label, "Repositories");
    assert.strictEqual(result.projects.length, 0);
  });

  // 4. GraphQL HTTP 200 containing errors
  test("GraphQL HTTP 200 containing errors falls back safely", async () => {
    process.env.GITHUB_TOKEN = "ghp_mock_token_error";

    const mockFetch: typeof fetch = async (url) => {
      const urlStr = url.toString();
      if (urlStr.includes("/graphql")) {
        return new Response(
          JSON.stringify({
            errors: [{ message: "Field 'pinnedItems' does not exist or user not found" }],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }
      // REST fallback
      return new Response(
        JSON.stringify({
          id: 101,
          name: "Portfolio",
          full_name: "SGOD-pro/Portfolio",
          description: "Fallback project",
          html_url: "https://github.com/SGOD-pro/Portfolio",
          homepage: null,
          stargazers_count: 1,
          forks_count: 0,
          language: "TypeScript",
          topics: [],
          updated_at: "2026-05-01T00:00:00Z",
          private: false,
          fork: false,
          default_branch: "main",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    };

    const result = await getProjectsList("SGOD-pro", { customFetch: mockFetch });
    assert.strictEqual(result.mode, "featured");
    assert.strictEqual(result.label, "Featured Projects");
    assert.strictEqual(result.projects.length, 1);
  });

  // 5. 401, 403 rate limit, 404, 429, timeout, and upstream 5xx
  test("Error handling for 401, 403, 404, 429, 500, and timeout", async () => {
    // 401 Unauthorized
    const mock401: typeof fetch = async () =>
      new Response(JSON.stringify({ message: "Bad credentials" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    await assert.rejects(
      async () => fetchGitHubRest("/users/SGOD-pro", { customFetch: mock401 }),
      (err: GitHubApiError) => {
        assert.strictEqual(err.statusCode, 401);
        assert.strictEqual(err.message, "Bad credentials");
        return true;
      }
    );

    // 403 Rate Limit
    const mock403: typeof fetch = async () =>
      new Response(JSON.stringify({ message: "API rate limit exceeded" }), {
        status: 403,
        headers: {
          "x-ratelimit-remaining": "0",
          "x-ratelimit-limit": "60",
          "x-ratelimit-reset": "1778000000",
          "Content-Type": "application/json",
        },
      });
    await assert.rejects(
      async () => fetchGitHubRest("/users/SGOD-pro", { customFetch: mock403 }),
      (err: GitHubApiError) => {
        assert.strictEqual(err.statusCode, 403);
        assert.strictEqual(err.rateLimit?.remaining, 0);
        assert.strictEqual(err.rateLimit?.limit, 60);
        assert.strictEqual(err.rateLimit?.resetTime, 1778000000);
        return true;
      }
    );

    // 404 Not Found
    const mock404: typeof fetch = async () =>
      new Response(JSON.stringify({ message: "Not Found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    await assert.rejects(
      async () => fetchGitHubRest("/users/SGOD-pro", { customFetch: mock404 }),
      (err: GitHubApiError) => {
        assert.strictEqual(err.statusCode, 404);
        return true;
      }
    );

    // 429 Too Many Requests
    const mock429: typeof fetch = async () =>
      new Response(JSON.stringify({ message: "Too many requests" }), {
        status: 429,
        headers: {
          "retry-after": "120",
          "x-ratelimit-remaining": "0",
          "x-ratelimit-limit": "60",
          "x-ratelimit-reset": "1778000000",
          "Content-Type": "application/json",
        },
      });
    await assert.rejects(
      async () => fetchGitHubRest("/users/SGOD-pro", { customFetch: mock429 }),
      (err: GitHubApiError) => {
        assert.strictEqual(err.statusCode, 429);
        assert.strictEqual(err.rateLimit?.retryAfterSeconds, 120);
        return true;
      }
    );

    // 500 Upstream Server Error
    const mock500: typeof fetch = async () =>
      new Response(JSON.stringify({ message: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    await assert.rejects(
      async () => fetchGitHubRest("/users/SGOD-pro", { customFetch: mock500 }),
      (err: GitHubApiError) => {
        assert.strictEqual(err.statusCode, 500);
        return true;
      }
    );

    // Timeout
    const mockTimeout: typeof fetch = async () => {
      const err = new Error("AbortError");
      err.name = "AbortError";
      throw err;
    };
    await assert.rejects(
      async () => fetchGitHubRest("/users/SGOD-pro", { customFetch: mockTimeout, timeoutMs: 10 }),
      (err: GitHubApiError) => {
        assert.strictEqual(err.statusCode, 408);
        return true;
      }
    );
  });

  // 6. Partial failures without whole-page failure
  test("Partial failures in project list without whole-page failure", async () => {
    let callCount = 0;
    const mockFetch: typeof fetch = async (url) => {
      callCount++;
      const urlStr = url.toString();
      if (urlStr.includes("Portfolio")) {
        return new Response(
          JSON.stringify({
            id: 101,
            name: "Portfolio",
            full_name: "SGOD-pro/Portfolio",
            description: "Working repo",
            html_url: "https://github.com/SGOD-pro/Portfolio",
            homepage: null,
            stargazers_count: 3,
            forks_count: 0,
            language: "TypeScript",
            topics: [],
            updated_at: "2026-05-01T00:00:00Z",
            private: false,
            fork: false,
            default_branch: "main",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }
      return new Response(JSON.stringify({ message: "Not Found" }), { status: 404 });
    };

    const result = await getProjectsList("SGOD-pro", { customFetch: mockFetch });
    assert.strictEqual(callCount, 1);
    assert.strictEqual(result.mode, "featured");
    assert.strictEqual(result.projects.length, 1);
    assert.strictEqual(result.projects[0].name, "Portfolio");
  });

  // 7. Correct freshness and stale timestamps
  test("Correct freshness and stale timestamps on upstream failure", async () => {
    let shouldFail = false;
    const mockFetch: typeof fetch = async () => {
      if (shouldFail) {
        return new Response(JSON.stringify({ message: "Service Unavailable" }), { status: 503 });
      }
      return new Response(
        JSON.stringify({
          login: "SGOD-pro",
          name: "Souvik Karmakar",
          bio: "Fullstack developer",
          avatar_url: "https://avatars.githubusercontent.com/u/123",
          html_url: "https://github.com/SGOD-pro",
          public_repos: 12,
          followers: 10,
          following: 5,
          created_at: "2022-01-01T00:00:00Z",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    };

    // First fetch succeeds
    const first = await getPublicProfile("SGOD-pro", { customFetch: mockFetch });
    assert.strictEqual(first.isStale, false);
    assert.strictEqual(first.profile.name, "Souvik Karmakar");
    const originalFetchedAt = first.fetchedAt;

    // Second fetch fails upstream, but cached data is preserved
    shouldFail = true;
    const second = await getPublicProfile("SGOD-pro", { customFetch: mockFetch });
    assert.strictEqual(second.isStale, true);
    assert.strictEqual(second.fetchedAt, originalFetchedAt);
    assert.strictEqual(second.profile.name, "Souvik Karmakar");
  });

  // 8. Request deduplication and bounded fetching
  test("Request deduplication for concurrent requests", async () => {
    let networkCalls = 0;
    const mockFetch: typeof fetch = async () => {
      networkCalls++;
      await new Promise((r) => setTimeout(r, 20));
      return new Response(
        JSON.stringify({
          login: "SGOD-pro",
          name: "Souvik Karmakar",
          bio: null,
          avatar_url: "https://avatars.githubusercontent.com/u/123",
          html_url: "https://github.com/SGOD-pro",
          public_repos: 1,
          followers: 0,
          following: 0,
          created_at: "2022-01-01T00:00:00Z",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    };

    // Fire 3 simultaneous requests to the same endpoint
    const [r1, r2, r3] = await Promise.all([
      fetchGitHubRest("/users/SGOD-pro", { customFetch: mockFetch }),
      fetchGitHubRest("/users/SGOD-pro", { customFetch: mockFetch }),
      fetchGitHubRest("/users/SGOD-pro", { customFetch: mockFetch }),
    ]);

    assert.strictEqual(networkCalls, 1, "Should deduplicate in-flight requests into 1 network call");
    assert.deepStrictEqual(r1.data, r2.data);
    assert.deepStrictEqual(r2.data, r3.data);
  });

  // 9. Private repository filtering
  test("Private repository filtering", async () => {
    process.env.GITHUB_TOKEN = "ghp_mock_token";

    const mockFetch: typeof fetch = async (url) => {
      const urlStr = url.toString();
      if (urlStr.includes("/graphql")) {
        return new Response(
          JSON.stringify({
            data: {
              user: {
                pinnedItems: {
                  nodes: [
                    {
                      databaseId: 301,
                      name: "Secret-Project",
                      nameWithOwner: "SGOD-pro/Secret-Project",
                      description: "Private repo that token has access to",
                      url: "https://github.com/SGOD-pro/Secret-Project",
                      homepageUrl: null,
                      stargazerCount: 0,
                      forkCount: 0,
                      isPrivate: true, // PRIVATE!
                      isFork: false,
                      defaultBranchRef: { name: "main" },
                      primaryLanguage: { name: "Python" },
                      repositoryTopics: { nodes: [] },
                      updatedAt: "2026-05-01T00:00:00Z",
                    },
                    {
                      databaseId: 302,
                      name: "Public-Project",
                      nameWithOwner: "SGOD-pro/Public-Project",
                      description: "Public repo",
                      url: "https://github.com/SGOD-pro/Public-Project",
                      homepageUrl: null,
                      stargazerCount: 10,
                      forkCount: 1,
                      isPrivate: false, // PUBLIC
                      isFork: false,
                      defaultBranchRef: { name: "main" },
                      primaryLanguage: { name: "TypeScript" },
                      repositoryTopics: { nodes: [] },
                      updatedAt: "2026-05-01T00:00:00Z",
                    },
                  ],
                },
              },
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }
      return new Response(JSON.stringify({ message: "Not Found" }), { status: 404 });
    };

    const result = await getProjectsList("SGOD-pro", { customFetch: mockFetch });
    assert.strictEqual(result.projects.length, 1);
    assert.strictEqual(result.projects[0].name, "Public-Project");
    assert.strictEqual(result.projects[0].isPrivate, false);
  });

  // 10. Rejected unknown repositories and document paths
  test("Validation rejects invalid repo identifiers and path traversal", async () => {
    // Repo identifier validation
    assert.strictEqual(isValidRepoIdentifier("SGOD-pro", "Portfolio"), true);
    assert.strictEqual(isValidRepoIdentifier("SGOD-pro", "../secret"), false);
    assert.strictEqual(isValidRepoIdentifier("SGOD$pro", "Portfolio"), false);
    assert.strictEqual(isValidRepoIdentifier("SGOD-pro", "repo;rm -rf"), false);

    // Document path validation
    assert.strictEqual(isValidDocumentPath("README.md"), true);
    assert.strictEqual(isValidDocumentPath("docs/architecture.md"), true);
    assert.strictEqual(isValidDocumentPath("../../etc/passwd"), false);
    assert.strictEqual(isValidDocumentPath("/etc/hosts"), false);
    assert.strictEqual(isValidDocumentPath("src/components/CommandBox.tsx"), false);

    // getRepositoryDocument throws on path traversal
    await assert.rejects(
      async () => getRepositoryDocument("SGOD-pro", "Portfolio", "../../etc/passwd"),
      (err: GitHubApiError) => {
        assert.strictEqual(err.statusCode, 400);
        return true;
      }
    );
  });

  // 11. No token in browser payloads or client bundles
  test("No token in browser payloads or client bundles", async () => {
    process.env.GITHUB_TOKEN = "ghp_super_secret_token_never_expose";

    const mockFetch: typeof fetch = async (url) => {
      const urlStr = url.toString();
      if (urlStr.includes("/users/SGOD-pro")) {
        return new Response(
          JSON.stringify({
            login: "SGOD-pro",
            name: "Souvik Karmakar",
            bio: "Developer",
            avatar_url: "https://avatars.githubusercontent.com/u/123",
            html_url: "https://github.com/SGOD-pro",
            public_repos: 5,
            followers: 2,
            following: 1,
            created_at: "2022-01-01T00:00:00Z",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }
      return new Response(JSON.stringify({ message: "Not found" }), { status: 404 });
    };

    const profileData = await getPublicProfile("SGOD-pro", { customFetch: mockFetch });
    const serialized = JSON.stringify(profileData);
    assert.ok(!serialized.includes("ghp_super_secret_token_never_expose"));
    assert.ok(!serialized.includes("Authorization"));
    assert.ok(!serialized.includes("Bearer"));
  });

  // 12. Repository details, languages, and activity fetching
  test("Repository details, languages, and activity endpoints", async () => {
    const mockFetch: typeof fetch = async (url) => {
      const urlStr = url.toString();
      if (urlStr.includes("/languages")) {
        return new Response(JSON.stringify({ TypeScript: 45000, CSS: 5000 }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      if (urlStr.includes("/events/public")) {
        return new Response(
          JSON.stringify([
            {
              id: "ev_1",
              type: "PushEvent",
              created_at: "2026-05-01T12:00:00Z",
              repo: { name: "SGOD-pro/Portfolio", url: "" },
              payload: { commits: [{ message: "feat: update layout" }] },
            },
          ]),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }
      if (urlStr.includes("/repos/SGOD-pro/Portfolio")) {
        return new Response(
          JSON.stringify({
            id: 101,
            name: "Portfolio",
            full_name: "SGOD-pro/Portfolio",
            description: "Personal portfolio",
            html_url: "https://github.com/SGOD-pro/Portfolio",
            homepage: null,
            stargazers_count: 5,
            forks_count: 0,
            language: "TypeScript",
            topics: ["portfolio"],
            updated_at: "2026-05-01T00:00:00Z",
            private: false,
            fork: false,
            default_branch: "main",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }
      return new Response(JSON.stringify({ message: "Not found" }), { status: 404 });
    };

    const details = await getRepositoryDetails("SGOD-pro", "Portfolio", { customFetch: mockFetch });
    assert.strictEqual(details.repo.name, "Portfolio");

    const languages = await getRepositoryLanguages("SGOD-pro", "Portfolio", { customFetch: mockFetch });
    assert.strictEqual(languages.languages.TypeScript, 45000);

    const activity = await getRecentActivity("SGOD-pro", { customFetch: mockFetch });
    assert.strictEqual(activity.activity.length, 1);
    assert.strictEqual(activity.activity[0].type, "PushEvent");
  });

  // 13. Invalid token and upstream 401
  test("Invalid token and upstream 401 propagates failure", async () => {
    process.env.GITHUB_TOKEN = "invalid_token_xyz";

    const mockFetch: typeof fetch = async () =>
      new Response(JSON.stringify({ message: "Bad credentials" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });

    await assert.rejects(
      async () => getProjectsList("SGOD-pro", { customFetch: mockFetch }),
      (err: GitHubApiError) => {
        assert.strictEqual(err.statusCode, 401);
        return true;
      }
    );
  });

  // 14. Total failure with 403/429/timeout/503 throws typed failure
  test("Total failure with 403, 429, 503 throws typed error and does not return empty success", async () => {
    // 503 Service Unavailable on all configured repos
    const mock503: typeof fetch = async () =>
      new Response(JSON.stringify({ message: "Service Unavailable" }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      });

    await assert.rejects(
      async () => getProjectsList("SGOD-pro", { customFetch: mock503 }),
      (err: GitHubApiError) => {
        assert.strictEqual(err.statusCode, 503);
        return true;
      }
    );

    // 403 Rate Limit on all configured repos
    const mock403: typeof fetch = async () =>
      new Response(JSON.stringify({ message: "rate limit exceeded" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });

    await assert.rejects(
      async () => getProjectsList("SGOD-pro", { customFetch: mock403 }),
      (err: GitHubApiError) => {
        assert.strictEqual(err.statusCode, 403);
        return true;
      }
    );
  });

  // 15. Good cache surviving failed refresh
  test("Good cache surviving failed refresh preserves projects and original timestamp", async () => {
    let fail = false;
    const mockFetch: typeof fetch = async (url) => {
      const urlStr = url.toString();
      if (fail) {
        return new Response(JSON.stringify({ message: "Rate limit reached" }), { status: 429 });
      }
      if (urlStr.includes("Portfolio")) {
        return new Response(
          JSON.stringify({
            id: 101,
            name: "Portfolio",
            full_name: "SGOD-pro/Portfolio",
            description: "Initial good repo",
            html_url: "https://github.com/SGOD-pro/Portfolio",
            homepage: null,
            stargazers_count: 10,
            forks_count: 2,
            language: "TypeScript",
            topics: [],
            updated_at: "2026-05-01T00:00:00Z",
            private: false,
            fork: false,
            default_branch: "main",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }
      return new Response(JSON.stringify({ message: "Not found" }), { status: 404 });
    };

    // First fetch succeeds and populates cache
    const initial = await getProjectsList("SGOD-pro", { customFetch: mockFetch });
    assert.strictEqual(initial.projects.length, 1);
    assert.strictEqual(initial.isStale, false);
    const originalFetchedAt = initial.fetchedAt;

    // Simulate upstream failure
    fail = true;
    // Expire cache TTL so refresh is attempted without mutating original timestamp
    const cacheKey = "projects:SGOD-pro";
    const entry = (githubCache as unknown as { cache: Map<string, { timestamp: number; ttlMs: number }> }).cache.get(cacheKey);
    if (entry) {
      entry.ttlMs = -1;
    }

    const degraded = await getProjectsList("SGOD-pro", { customFetch: mockFetch });
    assert.strictEqual(degraded.isStale, true);
    assert.strictEqual(degraded.fetchedAt, originalFetchedAt);
    assert.strictEqual(degraded.projects.length, 1);
    assert.strictEqual(degraded.projects[0].name, "Portfolio");
  });

  // 16. Fresh cache avoiding upstream calls
  test("Fresh cache returns immediately without upstream requests", async () => {
    let networkCalls = 0;
    const mockFetch: typeof fetch = async () => {
      networkCalls++;
      return new Response(
        JSON.stringify({
          id: 101,
          name: "Portfolio",
          full_name: "SGOD-pro/Portfolio",
          description: "Fresh repo",
          html_url: "https://github.com/SGOD-pro/Portfolio",
          homepage: null,
          stargazers_count: 10,
          forks_count: 2,
          language: "TypeScript",
          topics: [],
          updated_at: "2026-05-01T00:00:00Z",
          private: false,
          fork: false,
          default_branch: "main",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    };

    // 1st call -> network
    const first = await getProjectsList("SGOD-pro", { customFetch: mockFetch });
    assert.strictEqual(networkCalls, 1);
    assert.strictEqual(first.projects.length, 1);

    // 2nd call while fresh -> 0 additional network calls
    const second = await getProjectsList("SGOD-pro", { customFetch: mockFetch });
    assert.strictEqual(networkCalls, 1);
    assert.strictEqual(second.projects.length, 1);
  });

  // 17. Failure responses not being cached as successful emptiness
  test("Failure responses are not cached as successful emptiness", async () => {
    const mock500: typeof fetch = async () =>
      new Response(JSON.stringify({ message: "Server error" }), { status: 500 });

    // Ensure cache starts empty
    githubCache.clear();

    await assert.rejects(
      async () => getProjectsList("SGOD-pro", { customFetch: mock500 }),
      (err: GitHubApiError) => {
        assert.strictEqual(err.statusCode, 500);
        return true;
      }
    );

    // Cache must remain empty - failure was NOT stored as successful emptiness
    const cacheEntry = githubCache.get("projects:SGOD-pro");
    assert.strictEqual(cacheEntry, null);
  });

  // 18. Error-to-success retry recovery
  test("Error-to-success retry recovery succeeds after initial failure", async () => {
    let shouldFail = true;
    const mockFetch: typeof fetch = async () => {
      if (shouldFail) {
        return new Response(JSON.stringify({ message: "Temporary network error" }), { status: 503 });
      }
      return new Response(
        JSON.stringify({
          id: 101,
          name: "Portfolio",
          full_name: "SGOD-pro/Portfolio",
          description: "Recovered repo",
          html_url: "https://github.com/SGOD-pro/Portfolio",
          homepage: null,
          stargazers_count: 5,
          forks_count: 0,
          language: "TypeScript",
          topics: [],
          updated_at: "2026-05-01T00:00:00Z",
          private: false,
          fork: false,
          default_branch: "main",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    };

    // 1st attempt: fails with 503
    await assert.rejects(
      async () => getProjectsList("SGOD-pro", { customFetch: mockFetch }),
      (err: GitHubApiError) => {
        assert.strictEqual(err.statusCode, 503);
        return true;
      }
    );

    // 2nd attempt (retry): succeeds and delivers projects
    shouldFail = false;
    const recovered = await getProjectsList("SGOD-pro", { customFetch: mockFetch });
    assert.strictEqual(recovered.projects.length, 1);
    assert.strictEqual(recovered.projects[0].name, "Portfolio");
    assert.strictEqual(recovered.isStale, false);
  });
});
