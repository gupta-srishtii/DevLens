import { z } from "zod";

const ownerPattern = /^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i;
const repoPattern = /^[a-z\d_.-]{1,100}$/i;

export const repositorySchema = z
  .string()
  .trim()
  .min(3)
  .max(300)
  .transform((input, ctx) => {
    let value = input;
    if (/^https?:\/\//i.test(value)) {
      try {
        const url = new URL(value);
        if (
          url.protocol !== "https:" ||
          url.hostname !== "github.com" ||
          url.port ||
          url.username ||
          url.password ||
          url.search ||
          url.hash
        )
          throw new Error();
        value = url.pathname;
      } catch {
        ctx.addIssue({
          code: "custom",
          message: "Use an HTTPS github.com repository URL, without a query or fragment.",
        });
        return z.NEVER;
      }
    }
    const parts = value
      .replace(/^\/+|\/+$/g, "")
      .replace(/\.git$/i, "")
      .split("/");
    const [owner, repo] = parts;
    if (
      parts.length !== 2 ||
      !owner ||
      !repo ||
      !ownerPattern.test(owner) ||
      !repoPattern.test(repo) ||
      repo === "." ||
      repo === ".."
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Enter a repository as owner/name or https://github.com/owner/name.",
      });
      return z.NEVER;
    }
    return { owner, repo, fullName: `${owner}/${repo}` };
  });

export type RepositoryRef = z.infer<typeof repositorySchema>;

export const filePathSchema = z
  .string()
  .max(1000)
  .refine((value) => {
    if (value === "") return true;
    return value
      .split("/")
      .every(
        (part) =>
          part.length > 0 && part !== "." && part !== ".." && !/[\\\x00-\x1f\x7f?#%]/.test(part),
      );
  }, "Invalid repository path.");

export function repositoryHref(fullName: string) {
  return `/repo/${fullName.split("/").map(encodeURIComponent).join("/")}`;
}
