"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftRight, Download, GitCompareArrows, Github } from "lucide-react";
import { motion } from "motion/react";
import { AppShell } from "./navigation";
import { Button } from "./ui/button";
import { Panel, ScopeNote } from "./ui/panel";
import { repositorySchema } from "@/lib/repository";
import { useAnalysis } from "@/hooks/use-analysis";
import { AnalysisFailure } from "./analysis-state";
import { number } from "@/lib/utils";
import type { Analysis } from "@/lib/types";
import { downloadComparison } from "@/lib/reports";
import { LanguagesPanel } from "./languages-panel";
import { HealthPanel } from "./health-panel";

function ComparisonResults({ left, right }: { left: string; right: string }) {
  const a = useAnalysis(left);
  const b = useAnalysis(right);
  const readyA = a.status === "success" ? a.data : null;
  const readyB = b.status === "success" ? b.data : null;
  const both = readyA && readyB;
  const metrics: { label: string; get: (analysis: Analysis) => number | null; note: string }[] = [
    {
      label: "GitHub stars",
      get: (data) => data.repository.stargazers_count,
      note: "Community interest, not a quality assessment",
    },
    {
      label: "Forks",
      get: (data) => data.repository.forks_count,
      note: "Copies of the repository across GitHub",
    },
    {
      label: "Open issues + PRs",
      get: (data) => data.repository.open_issues_count,
      note: "Combined total; a higher count is not inherently worse",
    },
    {
      label: "Sampled recent commits",
      get: (data) => data.commits?.length ?? null,
      note: "Up to 100 per repository, last 90 UTC calendar days",
    },
    {
      label: "Contributors returned",
      get: (data) => data.contributors?.length ?? null,
      note: "Up to 30 per repository, all-time contribution ranking",
    },
    {
      label: "Maintenance checklist",
      get: (data) => data.health.score,
      note: "Out of 100; inspect each assessed denominator below",
    },
  ];
  return (
    <div className="comparison-results">
      <div className="compare-repo-headers">
        {[
          { name: left, result: a, label: "REPOSITORY A" },
          { name: right, result: b, label: "REPOSITORY B" },
        ].map(({ name, result, label }) => (
          <section className="compare-repo-header" key={label}>
            <p className="eyebrow">{label}</p>
            <h2>
              <Github size={20} />
              {name}
            </h2>
            {result.status === "loading" ? (
              <p className="compare-status" role="status">
                Collecting GitHub signals…
              </p>
            ) : result.status === "error" ? (
              <AnalysisFailure error={result.error} retry={result.retry} showInput={false} />
            ) : (
              <>
                <p>{result.data.repository.description ?? "No repository description provided."}</p>
                <span className="compare-status">
                  {result.data.repository.license?.spdx_id ?? "No license detected"} ·{" "}
                  {result.data.repository.archived ? "Archived" : "Public"}
                </span>
                {result.data.warnings.length > 0 && (
                  <details className="warning-banner">
                    <summary>
                      Partial analysis · {result.data.warnings.length} unavailable sources
                    </summary>
                    <ul>
                      {result.data.warnings.map((warning) => (
                        <li key={warning}>{warning}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </>
            )}
          </section>
        ))}
      </div>
      {both && (
        <>
          <Panel
            title="The same signals, side by side"
            eyebrow="SHARED PERSPECTIVE"
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadComparison(readyA, readyB)}
              >
                <Download />
                Export comparison
              </Button>
            }
          >
            <div className="comparison-metrics">
              {metrics.map((metric) => {
                const valueA = metric.get(readyA);
                const valueB = metric.get(readyB);
                const max = Math.max(valueA ?? 0, valueB ?? 0, 1);
                return (
                  <div className="comparison-metric" key={metric.label}>
                    <div className="comparison-metric-heading">
                      <h3>{metric.label}</h3>
                      <span>{metric.note}</span>
                    </div>
                    <div className="compare-bars">
                      {[valueA, valueB].map((value, index) => (
                        <div
                          key={index}
                          className={`compare-bar-item ${index ? "violet" : "cyan"}`}
                        >
                          <span className="compare-bar-label">{index ? "B" : "A"}</span>
                          <div className="compare-bar-track">
                            <motion.span
                              initial={{ width: 0 }}
                              animate={{ width: `${((value ?? 0) / max) * 100}%` }}
                              transition={{ duration: 0.55 }}
                            />
                          </div>
                          <strong>{value === null ? "N/A" : number(value)}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <ScopeNote>
              Values reflect separately assembled, cached GitHub responses. Both commit samples have
              the same 100-record cap and 90-day scope; high-activity projects may be undercounted.
              Maintenance scores may have different assessed denominators. These are tradeoffs, not
              a universal ranking.
            </ScopeNote>
          </Panel>
          <div className="compare-details-grid">
            <LanguagesPanel analysis={readyA} />
            <LanguagesPanel analysis={readyB} />
            <HealthPanel health={readyA.health} />
            <HealthPanel health={readyB.health} />
          </div>
        </>
      )}
    </div>
  );
}

export function Comparison({
  initialLeft = "",
  initialRight = "",
}: {
  initialLeft?: string;
  initialRight?: string;
}) {
  const router = useRouter();
  const [left, setLeft] = useState(initialLeft);
  const [right, setRight] = useState(initialRight);
  const [error, setError] = useState("");
  const [pair, setPair] = useState<{ left: string; right: string } | null>(() => {
    const a = repositorySchema.safeParse(initialLeft);
    const b = repositorySchema.safeParse(initialRight);
    return a.success && b.success && a.data.fullName.toLowerCase() !== b.data.fullName.toLowerCase()
      ? { left: a.data.fullName, right: b.data.fullName }
      : null;
  });
  function submit(event: React.FormEvent) {
    event.preventDefault();
    const a = repositorySchema.safeParse(left);
    const b = repositorySchema.safeParse(right);
    if (!a.success || !b.success) {
      setError("Enter two public repositories as owner/name or complete HTTPS GitHub URLs.");
      return;
    }
    if (a.data.fullName.toLowerCase() === b.data.fullName.toLowerCase()) {
      setError("Choose two different repositories to compare.");
      return;
    }
    setError("");
    setPair({ left: a.data.fullName, right: b.data.fullName });
    router.replace(
      `/compare?left=${encodeURIComponent(a.data.fullName)}&right=${encodeURIComponent(b.data.fullName)}`,
      { scroll: false },
    );
  }
  return (
    <AppShell>
      <div className="workspace-title">
        <div>
          <p className="eyebrow">A DIFFERENT POINT OF VIEW</p>
          <h1>
            Better together<span className="cyan-period">.</span>
          </h1>
        </div>
        <span className="comparison-kicker">
          <GitCompareArrows size={16} />
          Repository comparison
        </span>
      </div>
      <p className="comparison-description">
        Two projects. The same lens. Understand the tradeoffs before you choose.
      </p>
      <form className="compare-form" onSubmit={submit}>
        <div>
          <label htmlFor="compare-left">
            Repository A <span>CYAN</span>
          </label>
          <div className="compare-input">
            <Github size={18} />
            <input
              id="compare-left"
              value={left}
              onChange={(event) => setLeft(event.target.value)}
              placeholder="e.g. vercel/next.js"
              maxLength={300}
              autoCapitalize="none"
              spellCheck={false}
              aria-describedby={error ? "compare-error" : undefined}
            />
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Swap repository inputs"
          onClick={() => {
            setLeft(right);
            setRight(left);
          }}
        >
          <ArrowLeftRight />
        </Button>
        <div>
          <label htmlFor="compare-right">
            Repository B <span>VIOLET</span>
          </label>
          <div className="compare-input">
            <Github size={18} />
            <input
              id="compare-right"
              value={right}
              onChange={(event) => setRight(event.target.value)}
              placeholder="e.g. vitejs/vite"
              maxLength={300}
              autoCapitalize="none"
              spellCheck={false}
              aria-describedby={error ? "compare-error" : undefined}
            />
          </div>
        </div>
        <Button type="submit">
          <GitCompareArrows />
          Compare
        </Button>
        {error && (
          <p className="form-error" id="compare-error" role="alert">
            {error}
          </p>
        )}
      </form>
      {pair ? (
        <ComparisonResults key={`${pair.left}:${pair.right}`} left={pair.left} right={pair.right} />
      ) : (
        <div className="comparison-empty">
          <div className="comparison-empty-icon">
            <GitCompareArrows size={32} />
          </div>
          <h2>Put your options in perspective.</h2>
          <p>
            Enter two public GitHub repositories to compare their community,
            <br className="desktop-break" /> recent activity, code composition, and maintenance
            signals.
          </p>
          <div>
            <span>Same methodology</span>
            <span>Transparent samples</span>
            <span>Exportable results</span>
          </div>
          <ScopeNote>
            GitHub rate limits apply. Comparing two repositories makes up to 18 upstream API
            requests on a cold cache.
          </ScopeNote>
        </div>
      )}
    </AppShell>
  );
}
