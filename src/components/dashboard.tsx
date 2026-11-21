"use client";
import { useState, lazy, Suspense } from "react";
import { Activity, BookOpen, CircleDot, FolderTree, LayoutDashboard, Users } from "lucide-react";
import { useAnalysis } from "@/hooks/use-analysis";
import { AppShell } from "./navigation";
import { AnalysisFailure, AnalysisLoading } from "./analysis-state";
import { RepositoryHeader } from "./repository-header";
import { Tabs, TabsContent } from "./ui/tabs";
import { Overview } from "./overview";
import { ActivityChart, RecentCommits } from "./activity-chart";
import { ContributorsPanel } from "./contributors-panel";
import { FileExplorer } from "./file-explorer";
import { IssuesPanel } from "./issues-panel";

const DocumentationPanel = lazy(() => import("./documentation-panel").then((module) => ({ default: module.DocumentationPanel })));
const sections = [{ value: "overview", label: "Overview", icon: <LayoutDashboard /> }, { value: "activity", label: "Activity", icon: <Activity /> }, { value: "contributors", label: "Contributors", icon: <Users /> }, { value: "files", label: "Code explorer", icon: <FolderTree /> }, { value: "docs", label: "Docs", icon: <BookOpen /> }, { value: "issues", label: "Issues & PRs", icon: <CircleDot /> }];

export function Dashboard({ fullName }: { fullName: string }) {
  const result = useAnalysis(fullName);
  const [section, setSection] = useState("overview");
  return <AppShell repository={fullName}>{result.status === "loading" ? <AnalysisLoading fullName={fullName} /> : result.status === "error" ? <AnalysisFailure error={result.error} retry={result.retry} /> : <><RepositoryHeader analysis={result.data} />{result.data.warnings.length > 0 && <details className="warning-banner" open><summary>Some sources are unavailable. This is a partial analysis.</summary><ul>{result.data.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul></details>}<Tabs value={section} onValueChange={setSection} items={sections}><TabsContent value="overview"><Overview analysis={result.data} /></TabsContent><TabsContent value="activity"><ActivityChart analysis={result.data} expanded /><RecentCommits analysis={result.data} /></TabsContent><TabsContent value="contributors"><ContributorsPanel analysis={result.data} /></TabsContent><TabsContent value="files"><FileExplorer analysis={result.data} /></TabsContent><TabsContent value="docs"><Suspense fallback={<p role="status">Loading documentation viewer…</p>}><DocumentationPanel analysis={result.data} /></Suspense></TabsContent><TabsContent value="issues"><IssuesPanel analysis={result.data} /></TabsContent></Tabs></>}</AppShell>;
}
