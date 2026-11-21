"use client";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { BookOpen, Check, ExternalLink, ImageOff, Minus } from "lucide-react";
import type { Analysis } from "@/lib/types";
import { Panel, EmptyState, ScopeNote } from "./ui/panel";
import { safeGithubUrl } from "@/lib/utils";

function readmeLink(value: string | undefined, fullName: string, branch: string, path: string) {
  if (!value) return undefined;
  try {
    const directory = path.includes("/") ? `${path.slice(0, path.lastIndexOf("/") + 1)}` : "";
    const base = `https://github.com/${fullName}/blob/${encodeURIComponent(branch)}/${directory}`;
    const url = new URL(value, base);
    return ["https:", "http:"].includes(url.protocol) ? url.href : undefined;
  } catch { return undefined; }
}
export function DocumentationPanel({ analysis }: { analysis: Analysis }) {
  const readme = analysis.readme;
  if (!readme) return <Panel title="Documentation" eyebrow="README INSIGHTS"><EmptyState title="No readable README returned" description="The repository may not have a README, it may be too large, or GitHub could not return it. Check GitHub for other documentation." icon={<BookOpen />} /></Panel>;
  const signals = [{ label: "Installation section", passed: readme.hasInstallation }, { label: "Usage or examples", passed: readme.hasUsage }, { label: "Contribution section", passed: readme.hasContributing }];
  return <div className="docs-layout"><Panel title="The first introduction" eyebrow="DOCUMENTATION SIGNALS"><div className="docs-word-count"><strong>{readme.words.toLocaleString("en")}</strong><span>whitespace-separated words in preview</span></div><div className="docs-signals">{signals.map((signal) => <div key={signal.label}>{signal.passed ? <Check size={16} /> : <Minus size={16} />}<span>{signal.label}</span><small>{signal.passed ? "Detected" : "Not detected"}</small></div>)}</div><ScopeNote>Section detection uses Markdown headings. This checks discoverability, not documentation quality. HTML headings and differently named sections may be missed.</ScopeNote>{readme.headings.length > 0 && <div className="readme-outline"><h3>IN THIS README</h3><ul>{readme.headings.slice(0, 25).map((heading, index) => <li key={`${heading}-${index}`}>{heading}</li>)}</ul></div>}</Panel><Panel title={readme.name} eyebrow="README PREVIEW" action={<a href={safeGithubUrl(readme.htmlUrl)} target="_blank" rel="noreferrer" aria-label="Open README on GitHub"><ExternalLink size={16} /></a>}>{readme.truncated && <div className="warning-banner">Preview limited to the first 150,000 characters. Word counts and detected sections refer to this preview.</div>}<div className="markdown-body"><Markdown remarkPlugins={[remarkGfm]} skipHtml components={{
    a: ({ href, children }) => <a href={readmeLink(href, analysis.repository.full_name, analysis.repository.default_branch, readme.path)} target="_blank" rel="noreferrer">{children}</a>,
    img: ({ alt }) => <span className="readme-image-placeholder"><ImageOff size={14} />{alt || "Repository image"} <small>View images on GitHub</small></span>,
  }}>{readme.text}</Markdown></div><ScopeNote>Raw HTML and embedded images are omitted. Relative links point to this repository on GitHub. External links open in a new tab.</ScopeNote></Panel></div>;
}
