import type { GitHubRepo } from "./github/schemas";
import type { FileEntry, Health, HealthSignal } from "./types";

export function calculateHealth(repo: GitHubRepo, files: FileEntry[] | null, readmePresent: boolean | null, workflows: boolean | null, now: Date): Health {
  const has = (pattern: RegExp): boolean | null => files ? files.some((file) => pattern.test(file.name)) : null;
  const age = repo.pushed_at ? (now.getTime() - Date.parse(repo.pushed_at)) / 86_400_000 : null;
  const signal = (id: string, label: string, points: number, passed: boolean | null, yes: string, no: string): HealthSignal => ({ id, label, points, passed, reason: passed === null ? "Source unavailable; excluded from score." : passed ? yes : no });
  const signals = [
    signal("readme", "README present", 20, readmePresent, "GitHub returned a readable README.", "No readable README was returned by GitHub."),
    signal("license", "Recognized license", 20, Boolean(repo.license && repo.license.spdx_id && repo.license.spdx_id !== "NOASSERTION"), repo.license?.name ?? "License detected.", "GitHub did not identify an SPDX license."),
    signal("contributing", "Contribution guide", 15, has(/^contributing(?:\.|$)/i), "A contribution guide exists at the repository root.", "No root CONTRIBUTING file detected; guides elsewhere may exist."),
    signal("conduct", "Code of conduct", 10, has(/^code_of_conduct(?:\.|$)/i), "A code of conduct exists at the repository root.", "No root CODE_OF_CONDUCT file detected; organization defaults may exist."),
    signal("workflows", "Automation configured", 20, workflows, "At least one workflow file exists in .github/workflows. Execution success is not assessed.", "No workflow YAML detected in .github/workflows. Other CI services may exist."),
    signal("activity", "Recent development", 15, age === null || !Number.isFinite(age) ? null : age <= 90 && age >= 0 && !repo.archived, "A push occurred within 90 days and the repository is not archived.", repo.archived ? "This repository is archived." : "The last push was more than 90 days ago."),
  ];
  const available = signals.reduce((sum, item) => sum + (item.passed === null ? 0 : item.points), 0);
  const earned = signals.reduce((sum, item) => sum + (item.passed ? item.points : 0), 0);
  return { score: available ? Math.round(earned / available * 100) : null, earned, available, signals };
}
