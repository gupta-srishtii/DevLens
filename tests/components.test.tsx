import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RepoInput } from "@/components/repo-input";
import { HealthPanel } from "@/components/health-panel";
import { LanguagesPanel } from "@/components/languages-panel";
import { IssuesPanel } from "@/components/issues-panel";
import { DocumentationPanel } from "@/components/documentation-panel";
import { ContributorsPanel } from "@/components/contributors-panel";
import { makeAnalysis } from "./fixtures";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

describe("repository input", () => {
  it("displays accessible validation feedback", () => {
    render(<RepoInput />);
    fireEvent.click(screen.getByRole("button", { name: "Analyze repository" }));
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
  });
  it("navigates to a normalized repository", () => {
    render(<RepoInput />);
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "https://github.com/vercel/next.js.git" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Analyze repository" }));
    expect(push).toHaveBeenCalledWith("/repo/vercel/next.js");
  });
});
describe("analytical UI", () => {
  it("shows the maintenance denominator and expandable evidence", () => {
    render(<HealthPanel health={makeAnalysis().health} />);
    expect(screen.getByText("55 of 100 assessed points")).toBeVisible();
    expect(screen.getByText("README present")).toBeVisible();
  });
  it("shows unavailable languages without fictional percentages", () => {
    render(<LanguagesPanel analysis={makeAnalysis({ languages: null })} />);
    expect(screen.getByText("Languages unavailable")).toBeVisible();
    expect(screen.queryByText("0.0")).not.toBeInTheDocument();
  });
  it("filters contributors by login", () => {
    render(<ContributorsPanel analysis={makeAnalysis()} />);
    fireEvent.change(screen.getByRole("textbox", { name: "Search contributors" }), {
      target: { value: "no-match" },
    });
    expect(screen.getByText("No matching contributors")).toBeVisible();
  });
  it("filters issues and preserves sample labels", () => {
    render(<IssuesPanel analysis={makeAnalysis()} />);
    expect(screen.getByText("Improve documentation")).toBeVisible();
    fireEvent.change(screen.getByRole("combobox", { name: "Filter by status" }), {
      target: { value: "open" },
    });
    expect(screen.getByText("No matching entries")).toBeVisible();
    expect(screen.getByText("Issues in sample")).toBeVisible();
  });
  it("renders Markdown without executing embedded HTML", () => {
    const analysis = makeAnalysis();
    analysis.readme = {
      ...analysis.readme!,
      text: '# Hello\n<script>alert("x")</script>\n\n![badge](https://tracking.example/a.png)\n\n[unsafe](javascript:alert(1))',
    };
    const { container } = render(<DocumentationPanel analysis={analysis} />);
    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector('a[href^="javascript:"]')).toBeNull();
    expect(screen.getByText("View images on GitHub")).toBeVisible();
  });
});
