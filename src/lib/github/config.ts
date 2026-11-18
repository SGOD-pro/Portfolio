export const GITHUB_CONFIG = {
  username: "SGOD-pro",
  // Small list of verified public repositories belonging to SGOD-pro
  verifiedFallbackRepositories: [
    "Portfolio",
  ],
  allowedDocumentPaths: [
    "readme.md",
    "readme",
    "architecture.md",
    "architectures.md",
    "architecture",
    "docs/architecture.md",
    "docs/architectures.md",
    "docs/atchitecture.md",
    "doc/architecture.md",
    "docs/archive/legacy/architecture.md",
    ".github/architecture.md",
  ],
  cacheTtlSeconds: {
    profile: 300,
    projects: 3600,
    repository: 3600,
    document: 3600,
    languages: 3600,
    activity: 300,
  },
  maxConcurrentRequests: 3,
  requestTimeoutMs: 15000,
  apiBaseUrl: "https://api.github.com",
} as const;
