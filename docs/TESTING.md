# Testing

## Commands

| Command                 | What it checks                                                               |
| ----------------------- | ---------------------------------------------------------------------------- |
| `npm run lint`          | Next.js accessibility/core-web-vitals and TypeScript lint rules, no warnings |
| `npm run typecheck`     | Strict TypeScript, including unchecked-index protection                      |
| `npm test`              | Vitest unit, mocked integration and React Testing Library suites             |
| `npm run test:coverage` | V8 coverage report for the data and analytical layers                        |
| `npm run build`         | Optimized Next.js production build and route generation                      |
| `npm run check`         | Lint, typecheck, tests, then production build                                |
| `npm run format:check`  | Repository formatting consistency                                            |
| `npm run test:e2e`      | Production-server Playwright journeys in desktop and mobile Chromium         |
| `npm run smoke`         | Live server, security headers, invalid input and real GitHub analysis        |

## Test layers

Validation tests cover normalized GitHub URLs, `.git` suffixes, hostile hosts, nested paths, credentials, query/fragment rejection and traversal attempts. Analytical tests cover byte percentages, UTC grouping, medians, README heuristics, file markers, unknown weights and archived-project handling.

Transport tests replace `fetch` and verify fixed origin, server-only headers, safe errors, pending statistics, rate limits, timeouts/network failures and malformed responses. Integration tests use API-shaped GitHub responses across the real assembly and route handlers, checking private-repository rejection, partial failures, missing README, empty repositories, binary files and oversized previews.

React tests exercise input feedback, navigation, filtering, unavailable data, signal evidence and Markdown sanitization. Playwright tests intercept only DevLens's browser API routes; they do not modify production code or enable a fixture mode. They cover the full repository flow, expanded folders, text previews, README rendering, issue filters, report downloads, shareable comparison, retry recovery, partial and empty states, keyboard tabs, reduced motion, overflow checks and axe accessibility scans.

Browser projects use a 1440×1000 desktop viewport and an iPhone-sized touch viewport running Chromium. These are not claims of Safari or real-device testing. On this Windows machine tests use installed Microsoft Edge; Linux CI downloads Playwright Chromium. Trace and failure screenshots are retained under ignored report directories. The mobile screenshot-only documentation case is intentionally skipped, since documentation images use desktop dimensions.

## Screenshots

`docs/screenshots/landing.png` is the application landing page. `dashboard.png` and `comparison.png` use deterministic test fixtures; the repository description explicitly labels them test data. They are documentation illustrations, not live GitHub metrics. The screenshot case regenerates them during browser testing.

## Live smoke check

Mocked tests provide reproducibility; they do not prove external connectivity. A final live check should call `/api/analyze?repo=octocat/Hello-World` on a running server and verify provenance, non-fictional metadata, warnings and token absence. The observed outcome belongs in `PROGRESS.md`.

Run `npm run smoke` while the production server is running. Set `DEVLENS_SMOKE_URL` to another deployment origin if needed. The script checks page/security headers, invalid-host rejection, real public GitHub metadata, analytical scope and credential/transport-field exclusion. It uses the live API allowance and is deliberately separate from deterministic CI tests.

## Scope of assurance

Passing axe checks is useful evidence, not a complete accessibility certification. No screen-reader user study, browser-engine matrix, external penetration test, load test or exhaustive API pagination is claimed. Health score correctness means the documented heuristic is calculated correctly, not that it predicts project quality.
