# DevLens implementation roadmap

Build a public GitHub repository intelligence platform with verifiable data, a restrained midnight/cyan interface, and transparent analytical limits.

## Starting point

- Empty repository on `main`; no existing work to preserve.
- Remote: `https://github.com/gupta-srishtii/DevLens.git`.
- Node 24.19.0, npm 11.17.0, Git 2.55.0 on Windows. Use `npm.cmd` because PowerShell script execution is restricted.
- No persistence needed: analyses are read-only, cacheable snapshots. Keep credentials server-side.

## Sequential delivery phases

1. **Architecture and scaffold** — strict TypeScript, Next.js App Router, Tailwind, ESLint, Vitest, environment contract, security headers, reusable UI primitives.
2. **Design system and landing** — original wordmark, midnight surfaces, restrained cyan/violet, responsive navigation, accessible repository input, reduced-motion-aware animations. Reference 21st.dev patterns without copying unverified registry code.
3. **Dashboard foundation** — shareable repository URLs, navigation, loading/error/empty states, metadata and statistics.
4. **GitHub integration** — fixed-origin REST client, runtime schemas, timeouts, bounded concurrency, cache policy, rate-limit errors, partial-failure reporting.
5. **Analytics** — language bytes, recent commit activity, sampled contributors, issue/PR samples, README insights, explainable health signals. Clearly distinguish samples from totals.
6. **Visualizations** — responsive activity charts, language composition, accessible textual alternatives, animated entrances and counters.
7. **Comparison** — two independently validated repositories, side-by-side metrics, proportional bars, same methodology on both sides.
8. **Reporting** — downloadable JSON and Markdown snapshots with source, timestamps, health rationale, scope and sampling notes.
9. **Quality** — unit tests for validation/analytics; mocked integration tests for external API and routes; React component tests; deterministic Playwright browser journeys, mobile, keyboard and reduced motion checks.
10. **Delivery** — GitHub Actions, production build, screenshots, architecture/security/deployment docs, changelog, progress log, Vercel preparation; verify remote and push only if authentication permits.

## Acceptance criteria

- Analyze any accessible public repository by URL or `owner/repository`.
- Never render fictional values as live data. Missing upstream data stays unavailable.
- GitHub tokens never enter client bundles or reports.
- Surface rate limits, empty repositories, unavailable statistics, truncation and partial failures.
- All inputs validated; server requests restricted to GitHub's API origin.
- Desktop/mobile layouts; keyboard access; readable contrast; reduced motion throughout.
- Lint, typecheck, unit/integration tests and production build pass at meaningful phase boundaries. Browser checks use deterministic API fixtures explicitly limited to tests.
- At least 30 meaningful conventional commits, with no empty or duplicate commits.

## Commit plan

Keep commits bounded by real capabilities: project roadmap; app scaffold; security and environment configuration; repository validation; GitHub schemas; REST transport; analytics; health scoring; file access; analysis routes; report generation; UI primitives; navigation; landing; overview; charts; contributors; file explorer; documentation; issue analytics; comparison; filters; error states; unit tests; route tests; component tests; browser tests; CI; architecture; user guide; deployment; final verification fixes and screenshots as needed.

## Verification and deployment limits

Network access and Git metadata writes may require the executor's native approval. Record observed blockers with exact commands and continue independent work. Target Vercel as requested; no DNS, payment, repository-setting or secret changes are required for preparation.
