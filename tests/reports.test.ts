import { describe, it, expect } from "vitest";
import { markdownReport } from "@/lib/reports";
import { makeAnalysis } from "./fixtures";

describe("analysis reports", () => {
  it("includes provenance, scope, maintenance rationale and exact statistics", () => {
    const report = markdownReport(makeAnalysis());
    expect(report).toContain("Stars: 2400");
    expect(report).toContain("2026-11-22T00:00:00.000Z");
    expect(report).toContain("not a code quality");
    expect(report).toContain("recently updated");
    expect(report).not.toContain("GITHUB_TOKEN");
  });
  it("does not represent unavailable data as zero", () => {
    const report = markdownReport(makeAnalysis({ commits: null, languages: null }));
    expect(report).toContain("Commits in sample: Unavailable");
  });
  it("strips markdown control characters from repository descriptions", () => {
    const analysis = makeAnalysis();
    analysis.repository = {
      ...analysis.repository,
      description: "[click](javascript:alert(1))\n# injected",
    };
    expect(markdownReport(analysis)).not.toContain("[click]");
  });
});
