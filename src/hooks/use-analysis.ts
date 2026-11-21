"use client";
import { useEffect, useState, useCallback } from "react";
import type { Analysis } from "@/lib/types";

export type AnalysisError = { message: string; code: string; retryAt?: string };
type State = { status: "loading" } | { status: "success"; data: Analysis } | { status: "error"; error: AnalysisError };

export function useAnalysis(fullName: string) {
  const [state, setState] = useState<State>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => { setState({ status: "loading" }); setAttempt((value) => value + 1); }, []);
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    fetch(`/api/analyze?repo=${encodeURIComponent(fullName)}`, { signal: controller.signal }).then(async (response) => {
      const body = await response.json();
      if (!active) return;
      if (!response.ok) setState({ status: "error", error: { message: body.error ?? "Analysis is unavailable.", code: body.code ?? "UNKNOWN", retryAt: body.retryAt } });
      else setState({ status: "success", data: body as Analysis });
    }).catch((error: unknown) => {
      if (!active || (error instanceof Error && error.name === "AbortError")) return;
      setState({ status: "error", error: { message: "We couldn't reach the analysis service. Check your connection and try again.", code: "NETWORK_ERROR" } });
    });
    return () => { active = false; controller.abort(); };
  }, [fullName, attempt]);
  return { ...state, retry };
}
