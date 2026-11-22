import "server-only";
import { z } from "zod";
import { github, GitHubError, repoPath } from "./client";
import { contentSchema } from "./schemas";
import { publicRepository } from "./analyze";
import type { RepositoryRef } from "../repository";

export async function repositoryContents(ref: RepositoryRef, path: string) {
  await publicRepository(ref);
  const encoded = path.split("/").map(encodeURIComponent).join("/");
  const data = await github(
    `${repoPath(ref.owner, ref.repo)}/contents${encoded ? `/${encoded}` : ""}`,
    z.union([z.array(contentSchema), contentSchema]),
  );
  if (Array.isArray(data))
    return {
      kind: "directory" as const,
      entries: data.map(({ name, path, type, size, html_url, sha }) => ({
        name,
        path,
        type,
        size,
        html_url,
        sha,
      })),
      capped: data.length >= 1000,
    };
  if (data.type !== "file")
    return {
      kind: "unsupported" as const,
      message: "Symlinks and submodules cannot be previewed. Open this entry on GitHub.",
      htmlUrl: data.html_url,
    };
  if (data.size > 100_000)
    return {
      kind: "unsupported" as const,
      message: "This file exceeds the 100 KB preview limit. Open it on GitHub.",
      htmlUrl: data.html_url,
    };
  if (data.encoding !== "base64" || data.content === undefined)
    throw new GitHubError("GitHub did not return file text.", 422, "UNSUPPORTED_FILE");
  const buffer = Buffer.from(data.content, "base64");
  if (buffer.includes(0))
    return {
      kind: "unsupported" as const,
      message: "Binary files cannot be previewed. Open this file on GitHub.",
      htmlUrl: data.html_url,
    };
  let text: string;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(buffer);
  } catch {
    return {
      kind: "unsupported" as const,
      message: "This file is binary or uses a non-UTF-8 encoding. Open it on GitHub.",
      htmlUrl: data.html_url,
    };
  }
  return { kind: "file" as const, name: data.name, path: data.path, text, htmlUrl: data.html_url };
}
export type FileResult = Awaited<ReturnType<typeof repositoryContents>>;
