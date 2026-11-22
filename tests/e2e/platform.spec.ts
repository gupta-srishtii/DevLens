import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { makeAnalysis, files } from "../fixtures";

async function mockAnalysis(page: Page) {
  await page.route("**/api/analyze?*", (route) => {
    const name = new URL(route.request().url()).searchParams.get("repo") ?? "octocat/hello-world";
    const analysis = makeAnalysis();
    analysis.repository = {
      ...analysis.repository,
      full_name: name,
      name: name.split("/")[1]!,
      owner: { ...analysis.repository.owner, login: name.split("/")[0]! },
    };
    return route.fulfill({ json: analysis });
  });
  await page.route("**/api/files?*", (route) => {
    const path = new URL(route.request().url()).searchParams.get("path");
    return route.fulfill({
      json:
        path === "src"
          ? {
              kind: "directory",
              entries: [{ ...files[1]!, name: "index.ts", path: "src/index.ts" }],
              capped: false,
            }
          : {
              kind: "file",
              name: path,
              path,
              text: "export const answer = 42;",
              htmlUrl: "https://github.com/octocat/hello-world",
            },
    });
  });
}

test("landing validates input, has accessible navigation and fits the viewport", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "See beyond the code." })).toBeVisible();
  await page
    .getByRole("textbox", { name: "GitHub repository URL or owner/name" })
    .fill("https://evil.com/a/b");
  await page.getByRole("button", { name: "Analyze repository" }).click();
  await expect(page.getByRole("main").getByRole("alert")).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(accessibility.violations).toEqual([]);
});

test("repository journey covers tabs, folder expansion, previews and report download", async ({
  page,
}) => {
  const browserErrors: string[] = [];
  page.on("pageerror", (error) => browserErrors.push(error.message));
  await mockAnalysis(page);
  await page.goto("/");
  await page
    .getByRole("textbox", { name: "GitHub repository URL or owner/name" })
    .fill("octocat/hello-world");
  await page.getByRole("button", { name: "Analyze repository" }).click();
  await expect(page.getByRole("heading", { name: "Repository overview." })).toBeVisible();
  await expect(page.getByText("55 of 100 assessed points")).toBeVisible();
  await page.getByRole("tab", { name: "Code explorer" }).click();
  await page.getByRole("button", { name: "Expand src" }).click();
  await page.getByRole("button", { name: "Preview src/index.ts" }).click();
  await expect(page.getByText("export const answer = 42;")).toBeVisible();
  await page.getByRole("tab", { name: "Docs", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Installation", exact: true })).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByRole("tab", { name: "Issues & PRs" }).click();
  await expect(page.getByText("Improve documentation")).toBeVisible();
  await page.getByText("Export report", { exact: true }).click();
  const downloading = page.waitForEvent("download");
  await page.getByRole("button", { name: "Markdown report .md" }).click();
  expect((await downloading).suggestedFilename()).toBe("devlens-octocat-hello-world.md");
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
  expect(browserErrors).toEqual([]);
});

test("comparison validates distinct projects and renders both sourced snapshots", async ({
  page,
}) => {
  await mockAnalysis(page);
  await page.goto("/compare");
  await page.getByLabel("Repository A CYAN").fill("octocat/hello-world");
  await page.getByLabel("Repository B VIOLET").fill("octocat/hello-world");
  await page.getByRole("button", { name: "Compare", exact: true }).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText("two different");
  await page.getByLabel("Repository B VIOLET").fill("vercel/next.js");
  await page.getByRole("button", { name: "Compare", exact: true }).click();
  await expect(page.getByRole("heading", { name: "The same signals, side by side" })).toBeVisible();
  await expect(page).toHaveURL(/left=octocat%2Fhello-world&right=vercel%2Fnext.js/);
  await expect(page.getByText("55 of 100 assessed points")).toHaveCount(2);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
});

test("rate limits show actionable errors and recover on retry", async ({ page }) => {
  let failed = true;
  await page.route("**/api/analyze?*", (route) =>
    route.fulfill(
      failed
        ? {
            status: 429,
            json: {
              error: "Rate limit reached. Try again shortly.",
              code: "RATE_LIMITED",
              retryAt: "2026-11-22T06:00:00Z",
            },
          }
        : { json: makeAnalysis() },
    ),
  );
  await page.goto("/repo/octocat/hello-world");
  await expect(page.getByRole("heading", { name: "GitHub needs a breather." })).toBeVisible();
  failed = false;
  await page.getByRole("button", { name: "Try again", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Repository overview." })).toBeVisible();
});

test("dashboard is accessible with keyboard navigation and reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await mockAnalysis(page);
  await page.goto("/repo/octocat/hello-world");
  await expect(page.getByRole("tab", { name: "Overview", exact: true })).toBeVisible();
  await page.getByRole("tab", { name: "Overview", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Activity", exact: true })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(accessibility.violations).toEqual([]);
});

test("empty and partial snapshots retain honest unavailable states", async ({ page }) => {
  await page.route("**/api/analyze?*", (route) =>
    route.fulfill({
      json: makeAnalysis({
        languages: null,
        contributors: [],
        commits: [],
        activity: [],
        files: [],
        warnings: ["Languages: upstream unavailable."],
        readme: null,
      }),
    }),
  );
  await page.goto("/repo/octocat/hello-world");
  await expect(
    page.getByText("Some sources are unavailable. This is a partial analysis."),
  ).toBeVisible();
  await expect(page.getByText("Languages unavailable")).toBeVisible();
  await expect(page.getByText("A quiet stretch")).toBeVisible();
  await page.getByRole("tab", { name: "Docs", exact: true }).click();
  await expect(page.getByText("No readable README returned")).toBeVisible();
});

test("capture documented UI screenshots", async ({ page }, testInfo) => {
  test.skip(
    testInfo.project.name !== "desktop-chromium",
    "Documentation captures use the desktop project.",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await mockAnalysis(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "See beyond the code." })).toBeVisible();
  await page.screenshot({
    path: "docs/screenshots/landing.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.goto("/repo/octocat/hello-world");
  await expect(page.getByText("55 of 100 assessed points")).toBeVisible();
  await page.screenshot({
    path: "docs/screenshots/dashboard.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.goto("/compare?left=octocat%2Fhello-world&right=vercel%2Fnext.js");
  await expect(page.getByText("55 of 100 assessed points")).toHaveCount(2);
  await page.screenshot({
    path: "docs/screenshots/comparison.png",
    fullPage: true,
    animations: "disabled",
  });
});
