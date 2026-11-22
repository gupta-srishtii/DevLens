import type { GitHubCommit, GitHubContent, GitHubIssue } from "./github/schemas";
import type { Language, Readme } from "./types";

const colors: Record<string, string> = {
  TypeScript: "#60b9ff",
  JavaScript: "#ead97b",
  Python: "#83b3e8",
  Rust: "#e7a187",
  Go: "#68d7df",
  CSS: "#b89afa",
  HTML: "#f69c81",
  Java: "#edb674",
  Shell: "#a2d7a4",
  Ruby: "#ec8b9c",
  C: "#b6bfd6",
  "C++": "#e597c5",
};
const palette = ["#72e4dc", "#a89bf7", "#eab97e", "#81b9e4", "#df9fc4"];
export function languageBreakdown(data: Record<string, number>): Language[] {
  const total = Object.values(data).reduce((sum, value) => sum + value, 0);
  return Object.entries(data)
    .filter(([, bytes]) => bytes > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([name, bytes], index) => ({
      name,
      bytes,
      percentage: total ? (bytes / total) * 100 : 0,
      color: colors[name] ?? palette[index % palette.length]!,
    }));
}

export function commitActivity(commits: GitHubCommit[], since: Date, now: Date) {
  const days = new Map<string, number>();
  const start = new Date(since);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(now);
  end.setUTCHours(0, 0, 0, 0);
  for (let day = start.getTime(); day <= end.getTime(); day += 86_400_000)
    days.set(new Date(day).toISOString().slice(0, 10), 0);
  for (const commit of commits) {
    const key = commit.commit.author?.date?.slice(0, 10);
    if (key && days.has(key)) days.set(key, days.get(key)! + 1);
  }
  return [...days].map(([date, count]) => ({ date, commits: count }));
}

export function medianResolutionDays(issues: GitHubIssue[]) {
  const values = issues
    .flatMap((issue) => {
      if (!issue.closed_at) return [];
      const days = (Date.parse(issue.closed_at) - Date.parse(issue.created_at)) / 86_400_000;
      return Number.isFinite(days) && days >= 0 ? [days] : [];
    })
    .sort((a, b) => a - b);
  if (!values.length) return null;
  const middle = Math.floor(values.length / 2);
  return values.length % 2 ? values[middle]! : (values[middle - 1]! + values[middle]!) / 2;
}

export function readmeInsights(
  name: string,
  path: string,
  text: string,
  htmlUrl: string | null,
  truncated: boolean,
): Readme {
  const withoutCode = text.replace(/```[\s\S]*?```/g, "");
  const headings = [...withoutCode.matchAll(/^#{1,6}\s+(.+)$/gm)].map((match) =>
    match[1]!.replace(/[#*_`]/g, "").trim(),
  );
  return {
    name,
    path,
    text,
    htmlUrl,
    truncated,
    words: text.trim() ? text.trim().split(/\s+/).length : 0,
    headings,
    hasInstallation: /install|getting started|setup|quick\s?start/i.test(headings.join(" ")),
    hasUsage: /usage|example|how to use|tutorial/i.test(headings.join(" ")),
    hasContributing: /contribut/i.test(headings.join(" ")),
  };
}

export function detectTechnologies(files: Pick<GitHubContent, "name">[]) {
  const markers: [RegExp, string][] = [
    [/^package\.json$/, "Node.js ecosystem"],
    [/^pnpm-lock\.yaml$/, "pnpm"],
    [/^package-lock\.json$/, "npm"],
    [/^yarn\.lock$/, "Yarn"],
    [/^next\.config\./, "Next.js"],
    [/^vite\.config\./, "Vite"],
    [/^tsconfig\.json$/, "TypeScript"],
    [/^(pyproject\.toml|requirements\.txt)$/, "Python ecosystem"],
    [/^Cargo\.toml$/, "Rust / Cargo"],
    [/^go\.mod$/, "Go modules"],
    [/^Dockerfile$/, "Docker"],
    [/^\.github$/, "GitHub configuration"],
    [/^Gemfile$/, "Ruby / Bundler"],
  ];
  return markers.flatMap(([pattern, name]) => {
    const file = files.find((entry) => pattern.test(entry.name));
    return file ? [{ name, evidence: file.name }] : [];
  });
}
