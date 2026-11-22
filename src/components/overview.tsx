import { Star, GitFork, CircleDot, Users, BookOpen, GitCommitHorizontal } from "lucide-react";
import type { Analysis } from "@/lib/types";
import { Counter } from "./counter";
import { Reveal } from "./reveal";
import { ActivityChart } from "./activity-chart";
import { LanguagesPanel } from "./languages-panel";
import { HealthPanel } from "./health-panel";
import { ContributorsPanel } from "./contributors-panel";
import { Panel, ScopeNote } from "./ui/panel";

export function Overview({ analysis }: { analysis: Analysis }) {
  const repo = analysis.repository;
  const stats = [
    {
      label: "GitHub stars",
      value: repo.stargazers_count,
      icon: <Star />,
      note: "Community interest",
      color: "amber",
    },
    {
      label: "Forks",
      value: repo.forks_count,
      icon: <GitFork />,
      note: "Copies across GitHub",
      color: "cyan",
    },
    {
      label: "Open issues + PRs",
      value: repo.open_issues_count,
      icon: <CircleDot />,
      note: "Combined GitHub total",
      color: "violet",
    },
    {
      label: "Contributors returned",
      value: analysis.contributors?.length ?? null,
      icon: <Users />,
      note: "Up to 30 · all-time",
      color: "blue",
    },
  ];
  return (
    <>
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <Reveal key={stat.label} delay={index * 0.05}>
            <section className="stat-card">
              <div className="stat-label">
                <span>{stat.label}</span>
                <span className={`stat-icon ${stat.color}`}>{stat.icon}</span>
              </div>
              <strong className="stat-value">
                {stat.value === null ? "—" : <Counter value={stat.value} />}
              </strong>
              <p>{stat.note}</p>
            </section>
          </Reveal>
        ))}
      </div>
      <div className="overview-grid">
        <Reveal>
          <ActivityChart analysis={analysis} />
        </Reveal>
        <Reveal delay={0.1}>
          <LanguagesPanel analysis={analysis} />
        </Reveal>
        <Reveal>
          <ContributorsPanel analysis={analysis} preview />
        </Reveal>
        <Reveal delay={0.1}>
          <HealthPanel health={analysis.health} />
        </Reveal>
      </div>
      <Panel title="A few useful starting points" eyebrow="ORIENTATION">
        <div className="orientation-grid">
          <div>
            <BookOpen />
            <section>
              <h3>
                {analysis.readme
                  ? `${analysis.readme.headings.length} README sections`
                  : "README not available"}
              </h3>
              <p>
                {analysis.readme
                  ? "Explore installation, usage, and documentation in the Docs tab."
                  : "This resource is missing or could not be loaded."}
              </p>
            </section>
          </div>
          <div>
            <GitCommitHorizontal />
            <section>
              <h3>{analysis.commits?.length ?? "No"} commits returned</h3>
              <p>
                {analysis.commits === null
                  ? "Commit data is temporarily unavailable."
                  : analysis.commits.length === 100
                    ? "The sample cap was reached. Activity may be undercounted."
                    : "A default-branch snapshot of the last 90 UTC days."}
              </p>
            </section>
          </div>
        </div>
        <ScopeNote>
          Repository statistics come from GitHub REST. Sample counts describe returned records; they
          are not all-time totals.
        </ScopeNote>
      </Panel>
    </>
  );
}
