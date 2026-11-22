import { describe, it, expect } from "vitest";
import { repositorySchema, filePathSchema, repositoryHref } from "@/lib/repository";

describe("repository input", () => {
  it.each([
    "vercel/next.js",
    "https://github.com/vercel/next.js",
    " https://github.com/vercel/next.js.git/ ",
  ])("normalizes %s", (input) => {
    expect(repositorySchema.parse(input)).toEqual({
      owner: "vercel",
      repo: "next.js",
      fullName: "vercel/next.js",
    });
  });
  it.each([
    "",
    "vercel",
    "a/b/c",
    "https://github.com/a/b/tree/main",
    "https://evil.com/a/b",
    "https://github.com.evil.com/a/b",
    "http://github.com/a/b",
    "https://user@github.com/a/b",
    "https://github.com:444/a/b",
    "https://github.com/a/b?token=x",
    "https://github.com/a/b#readme",
    "a/..",
    "-a/b",
    "a/b%2fc",
    "a\\b",
    "a/b\n/c",
  ])("rejects %s", (input) => {
    expect(repositorySchema.safeParse(input).success).toBe(false);
  });
  it("builds a shareable path", () =>
    expect(repositoryHref("vercel/next.js")).toBe("/repo/vercel/next.js"));
});
describe("file paths", () => {
  it.each(["", "src/app/page.tsx", "docs/getting started.md"])("accepts %s", (path) =>
    expect(filePathSchema.safeParse(path).success).toBe(true),
  );
  it.each(["../secret", "src/../secret", "/etc", "a//b", "a\\b", "a%2fb", "a?b", "a#b", "a\0b"])(
    "rejects %s",
    (path) => expect(filePathSchema.safeParse(path).success).toBe(false),
  );
});
