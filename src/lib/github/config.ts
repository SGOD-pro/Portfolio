export const GITHUB_CONFIG = {
  username: "SGOD-pro",
  // Small list of verified public repositories belonging to SGOD-pro
  verifiedFallbackRepositories: [
    "Portfolio",
  ],
  allowedDocumentPaths: [
    "README.md",
    "readme.md",
    "README",
    "docs/architecture.md",
    "ARCHITECTURE.md",
    "architecture.md",
  ],
  cacheTtlSeconds: {
    profile: 3600,
    projects: 3600,
    repository: 3600,
    document: 3600,
    languages: 3600,
    activity: 3600,
  },
  maxConcurrentRequests: 3,
  requestTimeoutMs: 8000,
  apiBaseUrl: "https://api.github.com",
} as const;
