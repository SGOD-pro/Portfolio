export interface GitHubProfile {
  login: string;
  name: string | null;
  bio: string | null;
  avatarUrl: string;
  htmlUrl: string;
  publicRepos: number;
  followers: number;
  following: number;
  createdAt: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  htmlUrl: string;
  homepage: string | null;
  stargazersCount: number;
  forksCount: number;
  language: string | null;
  topics: string[];
  updatedAt: string;
  isPrivate: boolean;
  isFork: boolean;
  defaultBranch: string;
}

export interface GitHubDocument {
  repo: string;
  path: string;
  content: string;
  sha: string;
  size: number;
  htmlUrl: string;
}

export interface GitHubActivityItem {
  id: string;
  type: string;
  repo: string;
  date: string;
  description: string;
  url: string;
}

export type ProjectListMode = "pinned" | "featured" | "fallback" | "empty";

export interface ProjectListResult {
  mode: ProjectListMode;
  label: string;
  projects: GitHubRepo[];
  fetchedAt: string;
  isStale: boolean;
  error?: string;
}

export interface GitHubRateLimitInfo {
  remaining: number;
  limit: number;
  resetTime: number; // Unix timestamp in seconds
  retryAfterSeconds?: number;
}
