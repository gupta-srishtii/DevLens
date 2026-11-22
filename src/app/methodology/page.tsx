import type { Metadata } from "next";
import { AppShell } from "@/components/navigation";
import { Panel } from "@/components/ui/panel";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = { title: "Data & methodology" };
const signals = [
  ["Readable README", "20", "GitHub returns a decodable README."],
  ["Recognized license", "20", "GitHub identifies an SPDX license other than NOASSERTION."],
  ["Contribution guide", "15", "A root CONTRIBUTING file is present."],
  ["Code of conduct", "10", "A root CODE_OF_CONDUCT file is present."],
  [
    "Automation configured",
    "20",
    "A .yml or .yaml file exists in .github/workflows. Run success is not assessed.",
  ],
  ["Recent development", "15", "Last push within 90 days and the repository is not archived."],
];
export default function Methodology() {
  return (
    <AppShell>
      <div className="workspace-title">
        <div>
          <p className="eyebrow">NO BLACK BOXES</p>
          <h1>
            Every signal has a source<span className="cyan-period">.</span>
          </h1>
        </div>
        <ShieldCheck size={24} className="text-primary" />
      </div>
      <div className="methodology-content">
        <p className="methodology-lead">
          DevLens is a lens, not a verdict. We bring public GitHub data together so you can ask
          better questions about a repository. We don’t invent metrics, infer code quality, or hide
          missing information.
        </p>
        <Panel title="What you’re actually looking at" eyebrow="DATA PROVENANCE">
          <p>
            All repository data comes from GitHub’s REST API. Each analysis shows when it was
            assembled. Upstream responses are cached for up to five minutes, and GitHub may cache
            its own statistics longer. A snapshot is assembled from separate requests and is not
            pinned to one commit.
          </p>
          <p>
            Stars, forks, and the combined open issue/PR count are repository-level totals returned
            by GitHub. Everything labeled a sample is a bounded list of returned records.
          </p>
          <ul>
            <li>
              <strong>Languages:</strong> GitHub Linguist’s byte counts. Percentages are shares of
              classified bytes, not lines of code or dependency usage.
            </li>
            <li>
              <strong>Commits:</strong> Up to 100 latest default-branch commits in the last 90 UTC
              calendar days, including merges. When the cap is reached, the chart may omit activity.
              A zero means no returned sample records on that date.
            </li>
            <li>
              <strong>Contributors:</strong> Up to 30, ordered by GitHub’s all-time contribution
              counts. Anonymous contributors are excluded. Bot filtering is optional.
            </li>
            <li>
              <strong>Issues:</strong> Non-PR entries among 100 most recently updated issues/PRs.
              This can be a small or biased sample. Counts do not describe all issues.
            </li>
            <li>
              <strong>Pull requests:</strong> Up to 100 most recently updated PRs, across all
              states. Merged counts refer only to this sample.
            </li>
            <li>
              <strong>Resolution time:</strong> Median creation-to-closure time for closed issues in
              the returned sample. It is not a first-response time.
            </li>
            <li>
              <strong>Technology clues:</strong> Root filenames indicate likely tooling. We do not
              read dependency manifests to assert frameworks or versions.
            </li>
          </ul>
          <a href="https://docs.github.com/en/rest" target="_blank" rel="noreferrer">
            GitHub REST API documentation
          </a>
        </Panel>
        <Panel title="A checklist you can inspect" eyebrow="MAINTENANCE SIGNALS">
          <p>
            The score measures the presence of six maintenance conventions. It does not measure
            correctness, performance, security, popularity, or suitability for your project. Healthy
            stable projects may have little recent activity. Other CI systems and organization-level
            policies are not detected.
          </p>
          <div className="table-scroll methodology-table">
            <table>
              <caption className="sr-only">Maintenance checklist weights</caption>
              <thead>
                <tr>
                  <th>Signal</th>
                  <th>Weight</th>
                  <th>Evidence</th>
                </tr>
              </thead>
              <tbody>
                {signals.map(([label, weight, evidence]) => (
                  <tr key={label}>
                    <td>{label}</td>
                    <td>{weight}</td>
                    <td>{evidence}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            <code>score = round(earned points / available points × 100)</code>
          </p>
          <p>
            When a source fails, its signal is unknown and its weight is excluded from the
            denominator. A confirmed missing resource scores zero. Always inspect the assessed
            points beside the score, especially when comparing repositories. Root-only checks may
            miss documentation in subdirectories or organization defaults.
          </p>
        </Panel>
        <Panel title="Boundaries worth knowing" eyebrow="FILES, PRIVACY & AVAILABILITY">
          <ul>
            <li>
              Public repositories only. No account is required. An optional GitHub token stays on
              the server and is never included in reports.
            </li>
            <li>
              Directories are capped at 1,000 entries by GitHub’s contents API. File previews are
              capped at 100 KB. Binary files are not rendered. Symlinks may be resolved by GitHub.
            </li>
            <li>
              README previews stop at 150,000 characters. HTML and embedded images are omitted.
              Heading heuristics may miss differently named sections.
            </li>
            <li>
              GitHub rate limits apply. Unauthenticated API access normally allows 60 requests/hour
              per originating IP. A cold analysis makes up to nine API requests. The app also has a
              per-process 30 requests/minute abuse guard; production should add edge rate limiting.
            </li>
            <li>
              Missing optional data does not prevent other panels from loading. Warnings explain
              which sources failed.
            </li>
            <li>
              Reports are generated locally in your browser from the loaded snapshot. No analysis
              database is used.
            </li>
            <li>
              Comparisons use the same method on both sides, but repository size, differing sample
              coverage, and unknown signals limit direct ranking.
            </li>
          </ul>
          <a
            href="https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api"
            target="_blank"
            rel="noreferrer"
          >
            GitHub’s rate-limit documentation
          </a>
        </Panel>
      </div>
    </AppShell>
  );
}
