"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Github, Search, LoaderCircle } from "lucide-react";
import { repositorySchema, repositoryHref } from "@/lib/repository";
import { Button } from "./ui/button";
import { useId } from "react";

export function RepoInput({ compact = false, initialValue = "" }: { compact?: boolean; initialValue?: string }) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const id = useId();
  function submit(event: React.FormEvent) {
    event.preventDefault();
    const result = repositorySchema.safeParse(value);
    if (!result.success) { setError(result.error.issues[0]?.message ?? "Enter a public GitHub repository."); return; }
    setError("");
    startTransition(() => router.push(repositoryHref(result.data.fullName)));
  }
  return <form onSubmit={submit} className={compact ? "repo-form compact" : "repo-form"} aria-label="Analyze a repository">
    <div className="repo-input-wrap"><Github aria-hidden="true" size={20} /><label htmlFor={id} className="sr-only">GitHub repository URL or owner/name</label><input id={id} value={value} onChange={(event) => { setValue(event.target.value); if (error) setError(""); }} placeholder="https://github.com/owner/repository" autoComplete="off" autoCapitalize="none" spellCheck={false} maxLength={300} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} /><Button type="submit" disabled={pending}>{pending ? <LoaderCircle className="spin" /> : <Search />}<span>{pending ? "Opening…" : "Analyze repository"}</span></Button></div>
    {error && <p id={`${id}-error`} className="form-error" role="alert">{error}</p>}
  </form>;
}
