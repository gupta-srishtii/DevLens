import { describe, it, expect, vi, afterEach } from "vitest";
import { z } from "zod";
import { github, optionalResource, GitHubError } from "@/lib/github/client";

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
const respond = (body: unknown, status = 200, headers = {}) => vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status, headers })));
describe("GitHub transport", () => {
  it("validates responses and keeps the token server-side", async () => {
    vi.stubEnv("GITHUB_TOKEN", "test-only-secret"); respond({ name: "repo" });
    expect(await github("/repos/a/b", z.object({ name: z.string() }))).toEqual({ name: "repo" });
    expect(fetch).toHaveBeenCalledWith("https://api.github.com/repos/a/b", expect.objectContaining({ redirect: "manual", headers: expect.objectContaining({ Authorization: "Bearer test-only-secret" }), next: { revalidate: 300 } }));
  });
  it("rejects requests outside the fixed API resource", async () => {
    const mock = vi.fn(); vi.stubGlobal("fetch", mock);
    await expect(github("https://evil.com", z.unknown())).rejects.toMatchObject({ code: "INVALID_RESOURCE" });
    expect(mock).not.toHaveBeenCalled();
  });
  it.each([[404, "NOT_FOUND"], [401, "INVALID_TOKEN"], [500, "UPSTREAM_ERROR"], [301, "REPOSITORY_MOVED"], [202, "STATISTICS_PENDING"], [409, "EMPTY_REPOSITORY"]])("maps status %s to %s", async (status, code) => {
    respond({}, status as number); await expect(github("/repos/a/b", z.unknown())).rejects.toMatchObject({ code });
  });
  it("provides a rate-limit reset without exposing upstream error bodies", async () => {
    respond({ message: "sensitive error" }, 403, { "x-ratelimit-remaining": "0", "x-ratelimit-reset": "1800000000" });
    await expect(github("/repos/a/b", z.unknown())).rejects.toMatchObject({ status: 429, code: "RATE_LIMITED", retryAt: new Date(1800000000000).toISOString() });
  });
  it("maps malformed upstream data to a recoverable error", async () => {
    respond({ name: 4 }); await expect(github("/repos/a/b", z.object({ name: z.string() }))).rejects.toMatchObject({ code: "INVALID_RESPONSE" });
  });
  it("turns network failures into safe messages", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("token=secret")));
    await expect(github("/repos/a/b", z.unknown())).rejects.toMatchObject({ code: "UPSTREAM_UNAVAILABLE" });
  });
  it("keeps partial failures visible while treating missing resources as absent", async () => {
    const warnings: string[] = [];
    expect(await optionalResource("README", () => Promise.reject(new GitHubError("Missing", 404, "NOT_FOUND")), warnings)).toBeNull();
    expect(warnings).toEqual([]);
    await optionalResource("Languages", () => Promise.reject(new GitHubError("Unavailable", 502, "UPSTREAM_ERROR")), warnings);
    expect(warnings).toEqual(["Languages: Unavailable"]);
  });
});
