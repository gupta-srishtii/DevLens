"use client";
import { useState } from "react";
import { CircleDot, GitMerge, GitPullRequest, MessageSquare } from "lucide-react";
import type { Analysis } from "@/lib/types";
import { medianResolutionDays } from "@/lib/analytics";
import { formatDate, safeGithubUrl } from "@/lib/utils";
import { Panel, EmptyState, ScopeNote } from "./ui/panel";

export function IssuesPanel({ analysis }: { analysis: Analysis }) {
  const [kind, setKind] = useState("issues");
  const [state, setState] = useState("all");
  const [query, setQuery] = useState("");
  const entries = kind === "issues" ? analysis.issues : analysis.pulls;
  const filtered =
    entries?.filter(
      (entry) =>
        (state === "all" || entry.state === state) &&
        `${entry.title} ${entry.number}`.toLowerCase().includes(query.toLowerCase()),
    ) ?? [];
  const median = analysis.issues ? medianResolutionDays(analysis.issues) : null;
  const merged = analysis.pulls?.filter((pull) => pull.merged_at).length;
  const stats = [
    {
      label: "Issues in sample",
      value: analysis.issues?.length ?? "—",
      detail: "PR entries excluded",
    },
    {
      label: "PRs in sample",
      value: analysis.pulls?.length ?? "—",
      detail: "Most recently updated",
    },
    { label: "Merged PRs in sample", value: merged ?? "—", detail: "From the returned PRs" },
    {
      label: "Median issue resolution",
      value: median === null ? "—" : `${median.toFixed(1)}d`,
      detail: "Closed issues in sample",
    },
  ];
  return (
    <>
      <div className="stats-grid issue-stats">
        {stats.map((stat) => (
          <section className="stat-card" key={stat.label}>
            <div className="stat-label">{stat.label}</div>
            <strong className="stat-value">{stat.value}</strong>
            <p>{stat.detail}</p>
          </section>
        ))}
      </div>
      <Panel title="Where collaboration happens" eyebrow="ISSUES & PULL REQUESTS">
        <div className="list-filters">
          <div className="segmented-control" role="group" aria-label="Entry type">
            <button aria-pressed={kind === "issues"} onClick={() => setKind("issues")}>
              <CircleDot size={14} />
              Issues
            </button>
            <button aria-pressed={kind === "pulls"} onClick={() => setKind("pulls")}>
              <GitPullRequest size={14} />
              Pull requests
            </button>
          </div>
          <label className="filter-input">
            <span className="sr-only">Search issues or pull requests</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search title or number…"
            />
          </label>
          <label className="select-wrap">
            <span className="sr-only">Filter by status</span>
            <select value={state} onChange={(event) => setState(event.target.value)}>
              <option value="all">All states</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </label>
        </div>
        {filtered.length ? (
          <div className="issue-list">
            {filtered.map((entry) => {
              const isMerged = "merged_at" in entry && Boolean(entry.merged_at);
              return (
                <a
                  key={entry.number}
                  href={safeGithubUrl(entry.html_url)}
                  target="_blank"
                  rel="noreferrer"
                  className="issue-row"
                >
                  <span className={`issue-status ${isMerged ? "merged" : entry.state}`}>
                    {isMerged ? (
                      <GitMerge size={18} />
                    ) : kind === "issues" ? (
                      <CircleDot size={18} />
                    ) : (
                      <GitPullRequest size={18} />
                    )}
                  </span>
                  <div>
                    <strong>{entry.title}</strong>
                    <p>
                      #{entry.number} · {isMerged ? "merged" : entry.state} · updated{" "}
                      {formatDate(entry.updated_at)}
                      {entry.user ? ` · ${entry.user.login}` : ""}
                    </p>
                    <div className="issue-labels">
                      {entry.labels.slice(0, 4).map((label, index) => {
                        const name = typeof label === "string" ? label : label.name;
                        return name ? <span key={`${name}-${index}`}>{name}</span> : null;
                      })}
                    </div>
                  </div>
                  <span className="issue-comments">
                    <MessageSquare size={13} />
                    {entry.comments}
                  </span>
                </a>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title={entries === null ? "This sample is unavailable" : "No matching entries"}
            description={
              entries === null
                ? "GitHub couldn't return these records. Other analysis sections may still be available."
                : "Try different filters. An empty sample does not imply this repository has no issues or PRs."
            }
          />
        )}
        <ScopeNote>
          {kind === "issues" ? analysis.scope.issues : analysis.scope.pulls} Resolution is time from
          creation to closure; it is not a first-response metric.
        </ScopeNote>
      </Panel>
    </>
  );
}
