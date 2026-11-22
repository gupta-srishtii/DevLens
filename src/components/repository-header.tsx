"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  GitBranch,
  GitCompareArrows,
  Github,
} from "lucide-react";
import { Button } from "./ui/button";
import { formatDate, safeGithubUrl } from "@/lib/utils";
import type { Analysis } from "@/lib/types";
import { downloadReport } from "@/lib/reports";

export function RepositoryHeader({ analysis }: { analysis: Analysis }) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");
  const repo = analysis.repository;
  async function share() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyError("Copy the URL from your address bar to share this analysis.");
    }
  }
  return (
    <>
      <div className="workspace-title">
        <div>
          <p className="eyebrow">A CLOSER LOOK</p>
          <h1>
            Repository overview<span className="cyan-period">.</span>
          </h1>
        </div>
        <div className="workspace-actions">
          <Button
            variant="ghost"
            size="icon"
            onClick={share}
            aria-label={copied ? "Link copied" : "Copy analysis link"}
          >
            {copied ? <Check /> : <Copy />}
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/compare?left=${encodeURIComponent(repo.full_name)}`}>
              <GitCompareArrows />
              Compare
            </Link>
          </Button>
          <details className="export-menu">
            <summary className="export-summary">
              <Download size={16} />
              Export report
            </summary>
            <div className="export-options">
              <button onClick={() => downloadReport(analysis, "md")}>
                Markdown report <span>.md</span>
              </button>
              <button onClick={() => downloadReport(analysis, "json")}>
                Complete snapshot <span>.json</span>
              </button>
            </div>
          </details>
        </div>
      </div>
      {copyError && (
        <p role="status" className="scope-note">
          {copyError}
        </p>
      )}
      <section className="repository-banner">
        <div className="repo-avatar">
          <Github size={30} />
        </div>
        <div className="repository-identity">
          <div className="repo-name">
            <span>{repo.owner.login} /</span>
            <strong>{repo.name}</strong>
            <span className="repo-badge">{repo.archived ? "Archived" : "Public"}</span>
            {repo.fork && <span className="repo-badge">Fork</span>}
          </div>
          <p>{repo.description || "This repository has no description yet."}</p>
          <div className="repo-meta">
            <span>
              <GitBranch size={14} />
              {repo.default_branch}
            </span>
            <span>{repo.license?.spdx_id ?? "No recognized license"}</span>
            <span>Last push {formatDate(repo.pushed_at)}</span>
          </div>
        </div>
        <a
          className="github-open"
          href={safeGithubUrl(repo.html_url)}
          target="_blank"
          rel="noreferrer"
          aria-label={`Open ${repo.full_name} on GitHub`}
        >
          <ExternalLink size={18} />
        </a>
      </section>
      <div className="snapshot-line">
        <span className="snapshot-label">GITHUB SNAPSHOT</span>
        <span>
          Assembled {formatDate(analysis.fetchedAt)} · Upstream cache up to 5 min · Not
          commit-pinned
        </span>
        <span className="sr-only" role="status">
          {copied ? "Analysis link copied" : ""}
        </span>
      </div>
    </>
  );
}
