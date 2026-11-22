import type { GitHubRepo, GitHubCommit, GitHubIssue, GitHubPull } from "./github/schemas";

export type Language = { name: string; bytes: number; percentage: number; color: string };
export type FileEntry = {
  name: string;
  path: string;
  type: "file" | "dir" | "symlink" | "submodule";
  size: number;
  html_url: string | null;
  sha: string;
};
export type Contributor = {
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
  type?: string;
};
export type HealthSignal = {
  id: string;
  label: string;
  points: number;
  passed: boolean | null;
  reason: string;
};
export type Health = {
  score: number | null;
  earned: number;
  available: number;
  signals: HealthSignal[];
};
export type Readme = {
  name: string;
  path: string;
  text: string;
  htmlUrl: string | null;
  truncated: boolean;
  words: number;
  headings: string[];
  hasInstallation: boolean;
  hasUsage: boolean;
  hasContributing: boolean;
};
export type Analysis = {
  repository: GitHubRepo;
  fetchedAt: string;
  windowStart: string;
  cacheSeconds: number;
  languages: Language[] | null;
  commits: GitHubCommit[] | null;
  activity: { date: string; commits: number }[] | null;
  contributors: Contributor[] | null;
  issues: GitHubIssue[] | null;
  pulls: GitHubPull[] | null;
  files: FileEntry[] | null;
  readme: Readme | null;
  technologies: { name: string; evidence: string }[];
  health: Health;
  warnings: string[];
  scope: { commits: string; contributors: string; issues: string; pulls: string; files: string };
};
