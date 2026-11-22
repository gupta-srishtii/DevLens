"use client";
import Link from "next/link";
import { AlertCircle, RefreshCw, Search, Timer } from "lucide-react";
import type { AnalysisError } from "@/hooks/use-analysis";
import { Button } from "./ui/button";
import { RepoInput } from "./repo-input";

export function AnalysisLoading({ fullName }: { fullName?: string }) {
  return (
    <div className="analysis-loading" role="status" aria-live="polite">
      <div className="loading-heading">
        <span className="loading-lens">
          <Search size={24} />
        </span>
        <div>
          <h1>Bringing the pieces together.</h1>
          <p>
            {fullName
              ? `Reading ${fullName} from GitHub. This can take up to a minute.`
              : "Loading your workspace…"}
          </p>
        </div>
      </div>
      <div className="skeleton-stats">
        {[1, 2, 3, 4].map((key) => (
          <div className="skeleton skeleton-stat" key={key} />
        ))}
      </div>
      <div className="skeleton-grid">
        <div className="skeleton skeleton-chart" />
        <div className="skeleton skeleton-chart" />
      </div>
      <span className="sr-only">Loading repository analysis</span>
    </div>
  );
}
export function AnalysisFailure({
  error,
  retry,
  showInput = true,
}: {
  error: AnalysisError;
  retry: () => void;
  showInput?: boolean;
}) {
  const rateLimited = error.code.includes("RATE_LIMIT");
  return (
    <section className="analysis-failure" role="alert">
      <div className="failure-icon">
        {rateLimited ? <Timer size={28} /> : <AlertCircle size={28} />}
      </div>
      <p className="eyebrow">{rateLimited ? "A MOMENT TO CATCH UP" : "LET’S TAKE ANOTHER LOOK"}</p>
      <h1>
        {rateLimited
          ? "GitHub needs a breather."
          : error.code === "NOT_FOUND"
            ? "We couldn’t find that repository."
            : "This view is temporarily unavailable."}
      </h1>
      <p>{error.message}</p>
      {error.retryAt && (
        <p className="retry-time">
          Try again after {new Date(error.retryAt).toLocaleString("en", { timeZoneName: "short" })}.
        </p>
      )}
      <div className="failure-actions">
        <Button onClick={retry}>
          <RefreshCw />
          Try again
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Back to explore</Link>
        </Button>
      </div>
      {showInput && (
        <div className="failure-search">
          <p>Or take a look at a different repository.</p>
          <RepoInput compact />
        </div>
      )}
    </section>
  );
}
