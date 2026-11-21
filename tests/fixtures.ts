import type { Analysis } from "@/lib/types";
import type { GitHubRepo, GitHubCommit, GitHubIssue } from "@/lib/github/schemas";
import { calculateHealth } from "@/lib/health";
import { commitActivity, languageBreakdown, readmeInsights } from "@/lib/analytics";

export const user = { login: "octocat", avatar_url: "https://avatars.githubusercontent.com/u/1", html_url: "https://github.com/octocat" };
export const repo: GitHubRepo = {
  id: 1, name: "hello-world", full_name: "octocat/hello-world", private: false,
  description: "An explicitly labeled test repository for deterministic browser checks.", html_url: "https://github.com/octocat/hello-world", homepage: "https://example.com",
  owner: user, stargazers_count: 2400, forks_count: 240, subscribers_count: 24, open_issues_count: 18,
  size: 1024, language: "TypeScript", default_branch: "main", created_at: "2024-01-01T00:00:00Z", updated_at: "2026-11-21T00:00:00Z", pushed_at: "2026-11-20T00:00:00Z",
  archived: false, fork: false, license: { name: "MIT License", spdx_id: "MIT" }, topics: ["typescript", "testing"],
};
export const commits: GitHubCommit[] = [{ sha: "abcdef1234567890", html_url: "https://github.com/octocat/hello-world/commit/abcdef", commit: { message: "feat: add a useful feature\n\nLong description", author: { name: "Octocat", date: "2026-11-20T12:00:00Z" } }, author: user }];
export const issues: GitHubIssue[] = [{ number: 12, title: "Improve documentation", html_url: "https://github.com/octocat/hello-world/issues/12", state: "closed", created_at: "2026-11-18T00:00:00Z", updated_at: "2026-11-20T00:00:00Z", closed_at: "2026-11-20T00:00:00Z", labels: [{ name: "documentation", color: "0088cc" }], user, comments: 3 }];
export const files = [{ name: "src", path: "src", type: "dir" as const, size: 0, html_url: "https://github.com/octocat/hello-world/tree/main/src", sha: "abc" }, { name: "README.md", path: "README.md", type: "file" as const, size: 100, html_url: "https://github.com/octocat/hello-world/blob/main/README.md", sha: "def" }, { name: "package.json", path: "package.json", type: "file" as const, size: 70, html_url: null, sha: "ghi" }];
export function makeAnalysis(overrides: Partial<Analysis> = {}): Analysis {
  const now = new Date("2026-11-22T00:00:00Z");
  return {
    repository: repo, fetchedAt: now.toISOString(), windowStart: "2026-08-25T00:00:00Z", cacheSeconds: 300,
    languages: languageBreakdown({ TypeScript: 8000, CSS: 2000 }), commits, activity: commitActivity(commits, new Date("2026-08-25T00:00:00Z"), now),
    contributors: [{ ...user, contributions: 125 }], issues, pulls: [{ ...issues[0]!, number: 13, title: "Add analysis endpoint", merged_at: "2026-11-20T00:00:00Z" }], files,
    readme: readmeInsights("README.md", "README.md", "# Test repository\n\n## Installation\n\nRun npm install.\n\n## Usage\n\nAnalyze a repository.", "https://github.com/octocat/hello-world", false),
    technologies: [{ name: "Node.js ecosystem", evidence: "package.json" }], health: calculateHealth(repo, files, true, false, now), warnings: [],
    scope: { commits: "TEST FIXTURE: up to 100 commits, 90 days.", contributors: "Up to 30 contributors.", issues: "Issues sampled from 100 recently updated issues/PRs.", pulls: "Up to 100 recently updated PRs.", files: "Up to 1,000 entries per directory." }, ...overrides,
  };
}
