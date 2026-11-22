"use client";
import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ChevronRight,
  ExternalLink,
  File,
  Folder,
  FolderOpen,
  LoaderCircle,
  Search,
  X,
} from "lucide-react";
import type { Analysis, FileEntry } from "@/lib/types";
import type { FileResult } from "@/lib/github/files";
import { Panel, EmptyState, ScopeNote } from "./ui/panel";
import { Button } from "./ui/button";
import { safeGithubUrl } from "@/lib/utils";

function sortFiles(files: FileEntry[]) {
  return [...files].sort(
    (a, b) => Number(b.type === "dir") - Number(a.type === "dir") || a.name.localeCompare(b.name),
  );
}

function FileNode({
  entry,
  fullName,
  depth,
  onSelect,
}: {
  entry: FileEntry;
  fullName: string;
  depth: number;
  onSelect: (entry: FileEntry) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [children, setChildren] = useState<FileEntry[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [capped, setCapped] = useState(false);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  async function toggle() {
    if (entry.type !== "dir") {
      onSelect(entry);
      return;
    }
    if (loading) return;
    const next = !expanded;
    setExpanded(next);
    if (!next || children) return;
    setLoading(true);
    setError("");
    controller.current = new AbortController();
    try {
      const response = await fetch(
        `/api/files?repo=${encodeURIComponent(fullName)}&path=${encodeURIComponent(entry.path)}`,
        { signal: controller.current.signal },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Couldn't load this folder.");
      if (data.kind !== "directory")
        throw new Error("This folder is no longer a directory. Refresh the analysis.");
      setChildren((data as Extract<FileResult, { kind: "directory" }>).entries);
      setCapped(Boolean(data.capped));
    } catch (cause) {
      if (cause instanceof Error && cause.name !== "AbortError") setError(cause.message);
    } finally {
      setLoading(false);
    }
  }
  return (
    <li className="file-node">
      <button
        className="file-row"
        onClick={toggle}
        style={{ paddingLeft: 13 + depth * 19 }}
        aria-expanded={entry.type === "dir" ? expanded : undefined}
        aria-label={
          entry.type === "dir"
            ? `${expanded ? "Collapse" : "Expand"} ${entry.path}`
            : `Preview ${entry.path}`
        }
      >
        {loading ? (
          <LoaderCircle size={13} className="spin" />
        ) : entry.type === "dir" ? (
          <ChevronRight size={13} className={expanded ? "file-chevron expanded" : "file-chevron"} />
        ) : (
          <span className="file-chevron-space" />
        )}
        {entry.type === "dir" ? (
          expanded ? (
            <FolderOpen size={16} />
          ) : (
            <Folder size={16} />
          )
        ) : (
          <File size={15} />
        )}
        <span>{entry.name}</span>
        {entry.type !== "dir" && (
          <small>
            {entry.size < 1024 ? `${entry.size} B` : `${(entry.size / 1024).toFixed(1)} KB`}
          </small>
        )}
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: "hidden" }}
          >
            {error ? (
              <div className="file-error" role="alert">
                {error}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setExpanded(false);
                    setError("");
                  }}
                >
                  Close and retry
                </Button>
              </div>
            ) : children && children.length === 0 ? (
              <p className="file-empty">This folder is empty.</p>
            ) : (
              <ul>
                {children &&
                  sortFiles(children).map((child) => (
                    <FileNode
                      key={child.path}
                      entry={child}
                      fullName={fullName}
                      depth={depth + 1}
                      onSelect={onSelect}
                    />
                  ))}
              </ul>
            )}
            {capped && (
              <p className="file-empty">GitHub returned 1,000 entries. More may exist on GitHub.</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

export function FileExplorer({ analysis }: { analysis: Analysis }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [preview, setPreview] = useState<FileResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const active = useRef<AbortController | null>(null);
  useEffect(() => () => active.current?.abort(), []);
  const entries = sortFiles(analysis.files ?? []).filter((file) =>
    file.name.toLowerCase().includes(query.toLowerCase()),
  );
  async function select(entry: FileEntry) {
    active.current?.abort();
    const controller = new AbortController();
    active.current = controller;
    setSelected(entry.path);
    setPreview(null);
    setError("");
    setLoading(true);
    try {
      const response = await fetch(
        `/api/files?repo=${encodeURIComponent(analysis.repository.full_name)}&path=${encodeURIComponent(entry.path)}`,
        { signal: controller.signal },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Couldn't preview this file.");
      if (!controller.signal.aborted) setPreview(data as FileResult);
    } catch (cause) {
      if (!controller.signal.aborted)
        setError(cause instanceof Error ? cause.message : "File preview unavailable.");
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }
  return (
    <Panel
      title="Get to know the codebase"
      eyebrow="FILE EXPLORER"
      action={<span className="small-count">{analysis.repository.default_branch}</span>}
    >
      <div className="file-explorer">
        <div className="file-tree">
          <label className="file-filter">
            <Search size={15} />
            <span className="sr-only">Filter root entries</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filter root entries…"
            />
          </label>
          <div className="file-tree-heading">
            {analysis.repository.name} <span>/</span>
          </div>
          {entries.length ? (
            <ul className="file-tree-list">
              {entries.map((entry) => (
                <FileNode
                  key={entry.path}
                  entry={entry}
                  fullName={analysis.repository.full_name}
                  depth={0}
                  onSelect={select}
                />
              ))}
            </ul>
          ) : (
            <EmptyState
              title={
                query
                  ? "No matching root entries"
                  : analysis.files === null
                    ? "Files unavailable"
                    : "No files yet"
              }
              description={
                query
                  ? "This filter checks root entry names. Clear it to browse folders."
                  : "The repository is empty, or GitHub couldn't return its files."
              }
            />
          )}
        </div>
        <div className="file-preview" aria-busy={loading}>
          <div className="file-preview-heading">
            <span>{selected ?? "File preview"}</span>
            {selected && (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Close file preview"
                onClick={() => {
                  active.current?.abort();
                  setSelected(null);
                  setPreview(null);
                  setError("");
                  setLoading(false);
                }}
              >
                <X size={14} />
              </Button>
            )}
          </div>
          {loading ? (
            <div className="empty-state" role="status">
              <LoaderCircle className="spin" />
              <p>Reading file…</p>
            </div>
          ) : error ? (
            <div className="file-error" role="alert">
              {error}
            </div>
          ) : preview?.kind === "file" ? (
            <>
              <div className="code-preview">
                <pre>
                  <code>{preview.text || "(Empty file)"}</code>
                </pre>
              </div>
              <a
                className="file-github-link"
                href={safeGithubUrl(preview.htmlUrl)}
                target="_blank"
                rel="noreferrer"
              >
                Open on GitHub <ExternalLink size={13} />
              </a>
            </>
          ) : preview?.kind === "unsupported" ? (
            <>
              <EmptyState
                title="Preview unavailable"
                description={preview.message}
                icon={<File />}
              />
              {safeGithubUrl(preview.htmlUrl) && (
                <a
                  className="file-github-link"
                  href={safeGithubUrl(preview.htmlUrl)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open on GitHub <ExternalLink size={13} />
                </a>
              )}
            </>
          ) : (
            <EmptyState
              title="Follow the file trail"
              description="Expand a folder or select a file to preview its contents. Files are read directly from GitHub."
              icon={<File />}
            />
          )}
        </div>
      </div>
      <ScopeNote>
        {analysis.scope.files} Folder expansion fetches its current default-branch contents; files
        may change after the overview was assembled. Symlinks may resolve to file contents through
        GitHub.
      </ScopeNote>
    </Panel>
  );
}
