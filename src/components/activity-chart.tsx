"use client";
import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useReducedMotion } from "motion/react";
import type { Analysis } from "@/lib/types";
import { Panel, EmptyState, ScopeNote } from "./ui/panel";
import { formatDate, number, safeGithubUrl } from "@/lib/utils";
import { GitCommitHorizontal } from "lucide-react";

export function ActivityChart({
  analysis,
  expanded = false,
}: {
  analysis: Analysis;
  expanded?: boolean;
}) {
  const [days, setDays] = useState(90);
  const reduced = useReducedMotion();
  const points = analysis.activity?.slice(-days) ?? [];
  const count = points.reduce((total, day) => total + day.commits, 0);
  return (
    <Panel
      title="A pulse on development"
      eyebrow="COMMIT ACTIVITY"
      className="activity-panel"
      action={
        <div className="range-control" role="group" aria-label="Activity date range">
          {[30, 60, 90].map((range) => (
            <button key={range} onClick={() => setDays(range)} aria-pressed={days === range}>
              {range}d
            </button>
          ))}
        </div>
      }
    >
      <div className="chart-caption">
        <strong>{analysis.commits === null ? "—" : number(count)}</strong>
        <span>
          commits in the returned sample
          <br />
          <small>last {days} UTC calendar days</small>
        </span>
        <span className="chart-key">
          <span />
          Default branch
        </span>
      </div>
      {analysis.activity === null ? (
        <EmptyState
          title="Activity unavailable"
          description="GitHub could not return recent commits for this repository."
        />
      ) : !analysis.commits?.length ? (
        <EmptyState
          title="A quiet stretch"
          description="No default-branch commits were returned for this 90-day window."
          icon={<GitCommitHorizontal />}
        />
      ) : (
        <>
          <div
            className="activity-chart"
            role="img"
            aria-label={`${count} sampled commits in the last ${days} days. Daily values are available in the data table below.`}
          >
            <ResponsiveContainer
              width="100%"
              height="100%"
              minWidth={0}
              initialDimension={{ width: 600, height: 215 }}
            >
              <AreaChart data={points} margin={{ top: 10, right: 6, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient
                    id={expanded ? "activity-fill-expanded" : "activity-fill"}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#72e4dc" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="#72e4dc" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#233047" strokeDasharray="3 5" vertical={false} />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  minTickGap={42}
                  tick={{ fill: "#93a0b7", fontSize: 12 }}
                  tickFormatter={(value: string) => value.slice(5)}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                  tick={{ fill: "#93a0b7", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    background: "#101b2c",
                    border: "1px solid #34435b",
                    borderRadius: 8,
                    color: "#e9eef8",
                    fontSize: 14,
                  }}
                  labelFormatter={(value) => formatDate(String(value))}
                  formatter={(value) => [value, "Sampled commits"]}
                />
                <Area
                  dataKey="commits"
                  type="monotone"
                  stroke="#72e4dc"
                  strokeWidth={2}
                  fill={`url(#${expanded ? "activity-fill-expanded" : "activity-fill"})`}
                  isAnimationActive={!reduced}
                  animationDuration={700}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <details className="chart-data">
            <summary>View daily data</summary>
            <div className="table-scroll">
              <table>
                <caption className="sr-only">Daily sampled commits, most recent first</caption>
                <thead>
                  <tr>
                    <th>Date (UTC)</th>
                    <th>Sampled commits</th>
                  </tr>
                </thead>
                <tbody>
                  {[...points].reverse().map((point) => (
                    <tr key={point.date}>
                      <td>{formatDate(point.date)}</td>
                      <td>{point.commits}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </>
      )}
      <ScopeNote>
        {analysis.scope.commits} Chart zeroes mean no commits in the returned sample for that date.
      </ScopeNote>
    </Panel>
  );
}

export function RecentCommits({ analysis }: { analysis: Analysis }) {
  const [query, setQuery] = useState("");
  const commits = analysis.commits?.filter((commit) =>
    `${commit.commit.message} ${commit.author?.login ?? commit.commit.author?.name ?? ""}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <Panel
      title="The latest changes"
      eyebrow="RECENT COMMITS"
      action={<span className="small-count">{analysis.commits?.length ?? "—"} sampled</span>}
    >
      <label className="filter-input">
        <span className="sr-only">Search commits</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search commit messages or authors…"
        />
      </label>
      {commits?.length ? (
        <div className="commit-list">
          {commits.slice(0, 30).map((commit) => (
            <a
              key={commit.sha}
              href={safeGithubUrl(commit.html_url)}
              target="_blank"
              rel="noreferrer"
              className="commit-row"
            >
              <GitCommitHorizontal size={18} />
              <div>
                <strong>{commit.commit.message.split("\n")[0]}</strong>
                <p>
                  {commit.author?.login ?? commit.commit.author?.name ?? "Unknown author"} ·{" "}
                  {formatDate(commit.commit.author?.date ?? null)}
                </p>
              </div>
              <code>{commit.sha.slice(0, 7)}</code>
            </a>
          ))}
        </div>
      ) : (
        <EmptyState
          title={query ? "No matching commits" : "No recent commits to show"}
          description={
            query
              ? "Try a different message or author."
              : "The commit sample is empty or unavailable."
          }
        />
      )}
      <ScopeNote>
        Showing up to 30 matches from the returned sample. {analysis.scope.commits}
      </ScopeNote>
    </Panel>
  );
}
