"use client";
import { AnalysisFailure } from "@/components/analysis-state";
import { AppShell } from "@/components/navigation";
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <AppShell><AnalysisFailure error={{ message: "An unexpected error interrupted this view. Your repository is unchanged. Please reload the workspace.", code: "APPLICATION_ERROR" }} retry={reset} /></AppShell>;
}
