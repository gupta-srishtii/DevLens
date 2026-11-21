import "server-only";
import { z } from "zod";
import { github, repoPath, GitHubError, optionalResource, CACHE_SECONDS } from "./client";
import { repoSchema, languagesSchema, commitSchema, contributorSchema, issueSchema, pullSchema, contentSchema, readmeSchema } from "./schemas";
import { commitActivity, detectTechnologies, languageBreakdown, readmeInsights } from "../analytics";
import { calculateHealth } from "../health";
import type { RepositoryRef } from "../repository";
import type { Analysis } from "../types";

export async function publicRepository(ref: RepositoryRef) {
  const repository = await github(repoPath(ref.owner, ref.repo), repoSchema);
  if (repository.private) throw new GitHubError("DevLens analyzes public repositories only.", 403, "PRIVATE_REPOSITORY");
  return repository;
}

export async function analyzeRepository(ref: RepositoryRef): Promise<Analysis> {
  const repository = await publicRepository(ref);
  const base = repoPath(ref.owner, ref.repo);
  const now = new Date();
  const since = new Date(now); since.setUTCDate(since.getUTCDate() - 89); since.setUTCHours(0, 0, 0, 0);
  const warnings: string[] = [];
  // Three requests at a time to avoid bursts against GitHub's secondary limits.
  const [languageData, commits, contributors] = await Promise.all([
    optionalResource("Languages", () => github(`${base}/languages`, languagesSchema), warnings),
    optionalResource("Commits", () => github(`${base}/commits?per_page=100&since=${encodeURIComponent(since.toISOString())}`, z.array(commitSchema)), warnings),
    optionalResource("Contributors", () => github(`${base}/contributors?per_page=30`, z.array(contributorSchema)), warnings),
  ]);
  const [issueData, pulls, files] = await Promise.all([
    optionalResource("Issues", () => github(`${base}/issues?state=all&sort=updated&direction=desc&per_page=100`, z.array(issueSchema)), warnings),
    optionalResource("Pull requests", () => github(`${base}/pulls?state=all&sort=updated&direction=desc&per_page=100`, z.array(pullSchema)), warnings),
    optionalResource("Root files", () => github(`${base}/contents`, z.array(contentSchema)), warnings),
  ]);
  const [readmeData, workflowFiles] = await Promise.all([
    optionalResource("README", () => github(`${base}/readme`, readmeSchema), warnings),
    optionalResource("Workflows", () => github(`${base}/contents/.github/workflows`, z.array(contentSchema)), warnings),
  ]);
  const readmeWarning = warnings.some((warning) => warning.startsWith("README:"));
  const workflowWarning = warnings.some((warning) => warning.startsWith("Workflows:"));
  const readmeText = readmeData?.encoding === "base64" && readmeData.content ? Buffer.from(readmeData.content, "base64").toString("utf8") : null;
  const readme = readmeData && readmeText !== null ? readmeInsights(readmeData.name, readmeData.path, readmeText.slice(0, 150_000), readmeData.html_url, readmeText.length > 150_000) : null;
  if (readmeData && readmeText === null) warnings.push("README: GitHub did not return decodable text; large files may be unavailable.");
  const issues = issueData ? issueData.filter((issue) => !issue.pull_request) : null;
  return {
    repository, fetchedAt: now.toISOString(), windowStart: since.toISOString(), cacheSeconds: CACHE_SECONDS,
    languages: languageData ? languageBreakdown(languageData) : null,
    commits, activity: commits ? commitActivity(commits, since, now) : null,
    contributors, issues, pulls, files, readme,
    technologies: files ? detectTechnologies(files) : [],
    health: calculateHealth(repository, files, readmeWarning || (readmeData !== null && readme === null) ? null : Boolean(readme), workflowWarning ? null : Boolean(workflowFiles?.some((file) => /\.ya?ml$/i.test(file.name))), now),
    warnings,
    scope: {
      commits: `Up to 100 latest default-branch commits since ${since.toISOString().slice(0, 10)} (90 UTC calendar days). ${commits?.length === 100 ? "Sample cap reached; the chart may omit commits." : "The GitHub commits endpoint includes merge commits."}`,
      contributors: "Up to 30 contributors, ranked by GitHub's all-time commit contribution count. Anonymous contributors excluded; counts may be cached by GitHub.",
      issues: "Issues among the 100 most recently updated issues/PRs; pull requests excluded. Sample counts are not repository totals.",
      pulls: "Up to 100 most recently updated pull requests, all states. Merged counts apply only to this sample.",
      files: "Each directory is limited to GitHub's 1,000-entry contents API cap. File previews are limited to 100 KB; README previews to 150,000 characters.",
    },
  };
}
