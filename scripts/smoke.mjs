import assert from "node:assert/strict";

const base = new URL(process.env.DEVLENS_SMOKE_URL || "http://127.0.0.1:3000");
assert.ok(["http:", "https:"].includes(base.protocol), "Smoke URL must be an HTTP origin.");
const home = await fetch(base, { signal: AbortSignal.timeout(15_000) });
assert.equal(home.status, 200, "Landing page must respond successfully.");
assert.equal(home.headers.get("x-content-type-options"), "nosniff");
assert.equal(home.headers.get("x-frame-options"), "DENY");
assert.ok(home.headers.get("content-security-policy")?.includes("object-src 'none'"));

const invalid = await fetch(new URL("/api/analyze?repo=https://example.com/a/b", base));
assert.equal(invalid.status, 400, "Invalid hosts must fail validation.");

const response = await fetch(new URL("/api/analyze?repo=octocat/Hello-World", base), {
  signal: AbortSignal.timeout(60_000),
});
const data = await response.json();
assert.equal(response.status, 200, `Live GitHub analysis failed: ${data.code ?? "unknown"}`);
assert.equal(data.repository.full_name.toLowerCase(), "octocat/hello-world");
assert.equal(data.repository.private, false);
assert.equal(typeof data.repository.stargazers_count, "number");
assert.ok(Number.isFinite(Date.parse(data.fetchedAt)));
assert.ok(data.scope.commits.includes("100"));
assert.equal(data.health.signals.length, 6);
const payload = JSON.stringify(data);
assert.ok(!payload.includes("Authorization"), "Transport headers must not enter reports.");
assert.ok(!payload.includes("GITHUB_TOKEN"), "Token configuration must not enter reports.");
console.log(
  JSON.stringify(
    {
      result: "passed",
      repository: data.repository.full_name,
      fetchedAt: data.fetchedAt,
      stars: data.repository.stargazers_count,
      commitsReturned: data.commits?.length ?? null,
      warningCount: data.warnings.length,
      checks: [
        "landing",
        "security headers",
        "input validation",
        "live public metadata",
        "snapshot provenance",
        "scope",
        "credential isolation",
      ],
    },
    null,
    2,
  ),
);
