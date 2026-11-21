import { describe, it, expect } from "vitest";
import { languageBreakdown, commitActivity, medianResolutionDays, readmeInsights, detectTechnologies } from "@/lib/analytics";
import { calculateHealth } from "@/lib/health";
import { commits, issues, repo, files } from "./fixtures";

describe("language composition", () => {
  it("sorts by bytes and computes exact proportions", () => {
    const data = languageBreakdown({ CSS: 20, TypeScript: 80, Empty: 0 });
    expect(data.map((item) => [item.name, item.percentage])).toEqual([["TypeScript", 80], ["CSS", 20]]);
  });
  it("handles an empty repository", () => expect(languageBreakdown({})).toEqual([]));
});
describe("sample analytics", () => {
  it("groups commits by UTC date and ignores data outside the window", () => {
    const result = commitActivity(commits, new Date("2026-11-19Z"), new Date("2026-11-21Z"));
    expect(result).toEqual([{ date: "2026-11-19", commits: 0 }, { date: "2026-11-20", commits: 1 }, { date: "2026-11-21", commits: 0 }]);
  });
  it("does not assign a resolution time to open issues", () => {
    expect(medianResolutionDays([{ ...issues[0]!, closed_at: null }])).toBeNull();
    expect(medianResolutionDays(issues)).toBe(2);
  });
  it("computes the median for an even sample", () => {
    expect(medianResolutionDays([...issues, { ...issues[0]!, closed_at: "2026-11-22T00:00:00Z" }])).toBe(3);
  });
  it("detects headings outside fenced code", () => {
    const insight = readmeInsights("README.md", "README.md", "# Project\n```md\n## Usage\n```\n## Installation\nHello", null, false);
    expect(insight.headings).toEqual(["Project", "Installation"]);
    expect(insight.hasInstallation).toBe(true);
    expect(insight.hasUsage).toBe(false);
  });
  it("reports technology evidence rather than guessing dependencies", () => {
    expect(detectTechnologies(files)).toEqual([{ name: "Node.js ecosystem", evidence: "package.json" }]);
  });
});
describe("explainable health checklist", () => {
  it("uses documented weights", () => {
    const result = calculateHealth(repo, files, true, false, new Date("2026-11-22Z"));
    expect(result.score).toBe(55);
    expect(result.available).toBe(100);
    expect(result.signals.every((signal) => signal.reason.length > 10)).toBe(true);
  });
  it("excludes unknown signals from the denominator", () => {
    const result = calculateHealth(repo, null, null, null, new Date("2026-11-22Z"));
    expect(result.available).toBe(35); expect(result.score).toBe(100);
  });
  it("does not reward archived repositories for recent activity", () => {
    const result = calculateHealth({ ...repo, archived: true }, files, true, true, new Date("2026-11-22Z"));
    expect(result.signals.find((signal) => signal.id === "activity")?.passed).toBe(false);
  });
});
