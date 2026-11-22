// @vitest-environment node
import { describe, it, expect, vi, afterEach } from "vitest";
import { analyzeRepository } from "@/lib/github/analyze";
import { repositoryContents } from "@/lib/github/files";
import { GET as analyzeRoute } from "@/app/api/analyze/route";
import { GET as filesRoute } from "@/app/api/files/route";
import { repo, commits, issues, files, user } from "./fixtures";

const ref = { owner: "octocat", repo: "hello-world", fullName: "octocat/hello-world" };
function mockGitHub(
  overrides: Record<
    string,
    { body: unknown; status?: number; headers?: Record<string, string> }
  > = {},
) {
  const resources: Record<
    string,
    { body: unknown; status?: number; headers?: Record<string, string> }
  > = {
    "": { body: repo },
    "/languages": { body: { TypeScript: 80, CSS: 20 } },
    "/commits": { body: commits },
    "/contributors": { body: [{ ...user, contributions: 50 }] },
    "/issues": {
      body: [
        ...issues,
        {
          ...issues[0]!,
          number: 99,
          pull_request: { url: "https://api.github.com/repos/a/b/pulls/99" },
        },
      ],
    },
    "/pulls": { body: [{ ...issues[0]!, merged_at: "2026-11-20T00:00:00Z" }] },
    "/contents": { body: files },
    "/readme": {
      body: {
        ...files[1]!,
        encoding: "base64",
        content: Buffer.from("# Test\n## Usage\nRun it.").toString("base64"),
      },
    },
    "/contents/.github/workflows": {
      body: [
        {
          name: "ci.yml",
          path: ".github/workflows/ci.yml",
          size: 5,
          type: "file",
          sha: "ci",
          html_url: null,
        },
      ],
    },
    ...overrides,
  };
  const fetcher = vi.fn(async (input: string) => {
    const path = new URL(input).pathname.replace("/repos/octocat/hello-world", "");
    const item = resources[path] ?? { body: {}, status: 404 };
    return new Response(JSON.stringify(item.body), {
      status: item.status ?? 200,
      headers: item.headers,
    });
  });
  vi.stubGlobal("fetch", fetcher);
  return fetcher;
}
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("repository analysis integration", () => {
  it("assembles real API-shaped data, excludes PRs from issues and supplies scope", async () => {
    const fetcher = mockGitHub();
    const analysis = await analyzeRepository(ref);
    expect(fetcher).toHaveBeenCalledTimes(9);
    expect(analysis.issues).toHaveLength(1);
    expect(analysis.pulls).toHaveLength(1);
    expect(analysis.languages?.[0]?.percentage).toBe(80);
    expect(analysis.readme?.hasUsage).toBe(true);
    expect(analysis.warnings).toEqual([]);
    expect(analysis.scope.contributors).toContain("30");
  });
  it("preserves a partial snapshot and excludes failed health sources", async () => {
    mockGitHub({
      "/languages": { body: {}, status: 500 },
      "/contents": { body: {}, status: 500 },
      "/readme": { body: {}, status: 500 },
    });
    const analysis = await analyzeRepository(ref);
    expect(analysis.languages).toBeNull();
    expect(analysis.files).toBeNull();
    expect(analysis.readme).toBeNull();
    expect(analysis.warnings).toHaveLength(3);
    expect(analysis.health.available).toBe(55);
  });
  it("rejects private data before fetching any secondary resource", async () => {
    const fetcher = mockGitHub({ "": { body: { ...repo, private: true } } });
    await expect(analyzeRepository(ref)).rejects.toMatchObject({ code: "PRIVATE_REPOSITORY" });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it("does not treat a missing README as a successful signal", async () => {
    mockGitHub({ "/readme": { body: {}, status: 404 } });
    const analysis = await analyzeRepository(ref);
    expect(analysis.health.signals.find((signal) => signal.id === "readme")?.passed).toBe(false);
    expect(analysis.warnings).toEqual([]);
  });
  it("keeps empty repository sections empty while retaining metadata", async () => {
    mockGitHub({
      "/commits": { body: {}, status: 409 },
      "/contents": { body: {}, status: 404 },
      "/readme": { body: {}, status: 404 },
      "/languages": { body: {} },
    });
    const analysis = await analyzeRepository(ref);
    expect(analysis.repository.full_name).toBe(ref.fullName);
    expect(analysis.commits).toBeNull();
    expect(analysis.languages).toEqual([]);
  });
});
describe("file contents integration", () => {
  it("returns normalized directories", async () => {
    mockGitHub();
    const result = await repositoryContents(ref, "");
    expect(result.kind).toBe("directory");
  });
  it("decodes a small text file without interpreting HTML", async () => {
    mockGitHub({
      "/contents/README.md": {
        body: {
          ...files[1]!,
          encoding: "base64",
          content: Buffer.from("<script>alert(1)</script>").toString("base64"),
        },
      },
    });
    expect(await repositoryContents(ref, "README.md")).toMatchObject({
      kind: "file",
      text: "<script>alert(1)</script>",
    });
  });
  it("refuses binary and oversized previews", async () => {
    mockGitHub({
      "/contents/test.png": {
        body: {
          ...files[1]!,
          encoding: "base64",
          content: Buffer.from([0, 1, 2]).toString("base64"),
        },
      },
    });
    expect(await repositoryContents(ref, "test.png")).toMatchObject({ kind: "unsupported" });
    mockGitHub({ "/contents/big.txt": { body: { ...files[1]!, size: 100001 } } });
    expect(await repositoryContents(ref, "big.txt")).toMatchObject({ kind: "unsupported" });
  });
  it("rejects non-UTF-8 binary content even when it has no NUL byte", async () => {
    mockGitHub({
      "/contents/binary.dat": {
        body: {
          ...files[1]!,
          encoding: "base64",
          content: Buffer.from([255, 254, 253]).toString("base64"),
        },
      },
    });
    expect(await repositoryContents(ref, "binary.dat")).toMatchObject({ kind: "unsupported" });
  });
});
describe("API route contracts", () => {
  it("rejects invalid input without contacting GitHub", async () => {
    const fetcher = mockGitHub();
    const response = await analyzeRoute(
      new Request("http://localhost/api/analyze?repo=https://evil.com/a/b"),
    );
    expect(response.status).toBe(400);
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("validates paths before fetching any content", async () => {
    const fetcher = mockGitHub();
    const response = await filesRoute(
      new Request("http://localhost/api/files?repo=octocat/hello-world&path=../secret"),
    );
    expect(response.status).toBe(400);
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("returns a rate-limit status and retry header", async () => {
    mockGitHub({ "": { body: {}, status: 429, headers: { "retry-after": "120" } } });
    const response = await analyzeRoute(
      new Request("http://localhost/api/analyze?repo=octocat/hello-world"),
    );
    expect(response.status).toBe(429);
    expect(Number(response.headers.get("retry-after"))).toBeGreaterThan(0);
    expect(await response.json()).toMatchObject({ code: "RATE_LIMITED" });
  });
  it("returns a cacheable public snapshot with provenance", async () => {
    mockGitHub();
    const response = await analyzeRoute(
      new Request("http://localhost/api/analyze?repo=octocat/hello-world"),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, max-age=60");
    expect(await response.json()).toMatchObject({
      repository: { private: false },
      cacheSeconds: 300,
    });
  });
});
