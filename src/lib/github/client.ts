import "server-only";
import { z } from "zod";

const API = "https://api.github.com";
export const CACHE_SECONDS = 300;

export class GitHubError extends Error {
  constructor(message: string, public readonly status: number, public readonly code: string, public readonly retryAt?: string) {
    super(message);
    this.name = "GitHubError";
  }
}

export async function github<T>(path: string, schema: z.ZodType<T>): Promise<T> {
  if (!/^\/repos\/[a-z\d-]+\/[a-z\d_.-]+(?:[/?]|$)/i.test(path) || /(?:^|\/)\.\.(?:\/|\?|$)/.test(path) || path.includes("\\")) {
    throw new GitHubError("Invalid API resource.", 400, "INVALID_RESOURCE");
  }
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2026-03-10",
    "User-Agent": "DevLens-Repository-Intelligence",
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

  let response: Response;
  try {
    response = await fetch(`${API}${path}`, { headers, redirect: "manual", signal: AbortSignal.timeout(12_000), next: { revalidate: CACHE_SECONDS } });
  } catch {
    throw new GitHubError("GitHub could not be reached. Please try again shortly.", 502, "UPSTREAM_UNAVAILABLE");
  }
  if (response.status === 202) throw new GitHubError("GitHub is preparing these statistics. Try again in a few minutes.", 503, "STATISTICS_PENDING");
  if (response.status === 204) throw new GitHubError("This repository has no data for this section.", 404, "EMPTY_DATA");
  if (response.status === 301 || response.status === 302) throw new GitHubError("This repository has moved. Use its current GitHub URL.", 422, "REPOSITORY_MOVED");
  if (response.status === 429 || (response.status === 403 && (response.headers.get("x-ratelimit-remaining") === "0" || response.headers.has("retry-after")))) {
    const reset = Number(response.headers.get("x-ratelimit-reset"));
    const retry = Number(response.headers.get("retry-after"));
    const resetMs = reset > 0 ? reset * 1000 : Date.now() + (retry > 0 ? retry : 60) * 1000;
    const retryAt = Number.isFinite(resetMs) && resetMs < 8.64e15 ? new Date(resetMs).toISOString() : undefined;
    throw new GitHubError("GitHub's API rate limit has been reached. Wait for the reset, or configure a server-side read-only token.", 429, "RATE_LIMITED", retryAt);
  }
  if (response.status === 404) throw new GitHubError("Repository or resource not found. Check the name and make sure it is public.", 404, "NOT_FOUND");
  if (response.status === 409) throw new GitHubError("This repository is empty. There are no commits or files to inspect yet.", 409, "EMPTY_REPOSITORY");
  if (response.status === 401) throw new GitHubError("The server's GitHub token is invalid or expired. Contact the deployment owner.", 502, "INVALID_TOKEN");
  if (!response.ok) throw new GitHubError("GitHub could not provide this resource. Please try again later.", response.status === 403 ? 403 : 502, "UPSTREAM_ERROR");
  try {
    return schema.parse(await response.json());
  } catch {
    throw new GitHubError("GitHub returned an unexpected response. This section is temporarily unavailable.", 502, "INVALID_RESPONSE");
  }
}

export function repoPath(owner: string, repo: string) {
  return `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
}

export async function optionalResource<T>(label: string, work: () => Promise<T>, warnings: string[]): Promise<T | null> {
  try { return await work(); }
  catch (error) {
    if (error instanceof GitHubError && ["NOT_FOUND", "EMPTY_DATA", "EMPTY_REPOSITORY"].includes(error.code)) return null;
    warnings.push(`${label}: ${error instanceof GitHubError ? error.message : "Temporarily unavailable."}`);
    return null;
  }
}
