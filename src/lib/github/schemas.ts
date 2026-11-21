import { z } from "zod";

export const githubUserSchema = z.object({
  login: z.string(), avatar_url: z.string(), html_url: z.string(),
});
export const repoSchema = z.object({
  id: z.number(), name: z.string(), full_name: z.string(), private: z.boolean(),
  description: z.string().nullable(), html_url: z.string(), homepage: z.string().nullable().optional(),
  owner: githubUserSchema, stargazers_count: z.number().nonnegative(), forks_count: z.number().nonnegative(),
  subscribers_count: z.number().nonnegative().optional(), open_issues_count: z.number().nonnegative(),
  size: z.number().nonnegative(), language: z.string().nullable(), default_branch: z.string(),
  created_at: z.string(), updated_at: z.string(), pushed_at: z.string().nullable(),
  archived: z.boolean(), disabled: z.boolean().optional(), fork: z.boolean(),
  license: z.object({ name: z.string(), spdx_id: z.string().nullable() }).nullable(),
  topics: z.array(z.string()).optional().default([]),
});
export const languagesSchema = z.record(z.string(), z.number().nonnegative());
export const commitSchema = z.object({
  sha: z.string(), html_url: z.string(),
  commit: z.object({ message: z.string(), author: z.object({ name: z.string(), date: z.string().nullable() }).nullable() }),
  author: githubUserSchema.nullable(),
});
export const contributorSchema = githubUserSchema.extend({ contributions: z.number().nonnegative(), type: z.string().optional() });
export const issueSchema = z.object({
  number: z.number(), title: z.string(), html_url: z.string(), state: z.enum(["open", "closed"]),
  created_at: z.string(), updated_at: z.string(), closed_at: z.string().nullable(),
  pull_request: z.unknown().optional(),
  labels: z.array(z.union([z.string(), z.object({ name: z.string().optional(), color: z.string().optional() })])),
  user: githubUserSchema.nullable(), comments: z.number().optional().default(0),
});
export const pullSchema = issueSchema.omit({ pull_request: true }).extend({ draft: z.boolean().optional(), merged_at: z.string().nullable().optional() });
export const contentSchema = z.object({
  name: z.string(), path: z.string(), type: z.enum(["file", "dir", "symlink", "submodule"]),
  size: z.number(), html_url: z.string().nullable(), sha: z.string(),
  content: z.string().optional(), encoding: z.string().optional(),
});
export const readmeSchema = contentSchema.extend({ type: z.literal("file") });

export type GitHubRepo = z.infer<typeof repoSchema>;
export type GitHubCommit = z.infer<typeof commitSchema>;
export type GitHubIssue = z.infer<typeof issueSchema>;
export type GitHubPull = z.infer<typeof pullSchema>;
export type GitHubContent = z.infer<typeof contentSchema>;
