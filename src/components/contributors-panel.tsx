"use client";
import { useState } from "react";
import { Users } from "lucide-react";
import type { Analysis } from "@/lib/types";
import { Panel, EmptyState, ScopeNote } from "./ui/panel";
import { compact, number, safeGithubUrl } from "@/lib/utils";

export function ContributorsPanel({
  analysis,
  preview = false,
}: {
  analysis: Analysis;
  preview?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [hideBots, setHideBots] = useState(false);
  const [sort, setSort] = useState("contributions");
  const all =
    analysis.contributors?.filter(
      (person) =>
        person.login.toLowerCase().includes(query.toLowerCase()) &&
        (!hideBots || person.type !== "Bot"),
    ) ?? [];
  const sorted = [...all].sort((a, b) =>
    sort === "name" ? a.login.localeCompare(b.login) : b.contributions - a.contributions,
  );
  const shown = preview ? sorted.slice(0, 5) : sorted;
  const max = Math.max(...(analysis.contributors ?? []).map((person) => person.contributions), 1);
  return (
    <Panel
      title={preview ? "The people behind the project" : "Built by people"}
      eyebrow="CONTRIBUTORS"
      action={<Users size={19} className="text-muted-foreground" />}
    >
      {!preview && (
        <div className="list-filters">
          <label className="filter-input">
            <span className="sr-only">Search contributors</span>
            <input
              placeholder="Find a contributor…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <label className="select-wrap">
            <span className="sr-only">Sort contributors</span>
            <select value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="contributions">Most contributions</option>
              <option value="name">Name A–Z</option>
            </select>
          </label>
          <label className="checkbox-filter">
            <input
              type="checkbox"
              checked={hideBots}
              onChange={(event) => setHideBots(event.target.checked)}
            />
            Hide bots
          </label>
        </div>
      )}
      {shown.length ? (
        <div className="contributors-list">
          {shown.map((person, index) => (
            <a
              className="contributor-row"
              key={person.login}
              href={safeGithubUrl(person.html_url)}
              target="_blank"
              rel="noreferrer"
            >
              <span className="contributor-rank">{String(index + 1).padStart(2, "0")}</span>
              <span className="contributor-avatar" aria-hidden="true">
                {person.login.slice(0, 2).toUpperCase()}
              </span>
              <div className="contributor-detail">
                <strong>
                  {person.login}
                  {person.type === "Bot" && <span className="bot-badge">BOT</span>}
                </strong>
                <div className="contribution-track">
                  <span style={{ width: `${(person.contributions / max) * 100}%` }} />
                </div>
              </div>
              <span
                className="contribution-count"
                title={`${number(person.contributions)} commits`}
              >
                {compact(person.contributions)}
                <small>commits</small>
              </span>
            </a>
          ))}
        </div>
      ) : (
        <EmptyState
          title={
            analysis.contributors === null
              ? "Contributors unavailable"
              : query || hideBots
                ? "No matching contributors"
                : "No contributors returned"
          }
          description="Try changing the filters, or check the project on GitHub."
        />
      )}
      <ScopeNote>{analysis.scope.contributors}</ScopeNote>
    </Panel>
  );
}
