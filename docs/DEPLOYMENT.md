# Deployment

## Runtime contract

- Node.js 24 recommended (`.nvmrc` and `.node-version`). The application requires Node 22 or newer.
- Install with `npm ci`; build with `npm run build`; serve with `npm start`.
- A Node-capable Next.js host is required. Static export cannot serve the GitHub proxy.
- Outbound HTTPS to `api.github.com` is required at runtime.
- No PostgreSQL, Prisma migrations, storage bucket, OAuth application or billing integration is needed.

## Environment

| Variable               | Required | Purpose                                                                                   |
| ---------------------- | -------- | ----------------------------------------------------------------------------------------- |
| `GITHUB_TOKEN`         | No       | Server-only GitHub read-only token; public access works without it, with lower API limits |
| `NEXT_PUBLIC_SITE_URL` | No       | Canonical public origin, e.g. `https://devlens.example.com`; omit for local development   |

Use a fine-grained token restricted to public resources with read-only metadata and contents access. Never use `NEXT_PUBLIC_GITHUB_TOKEN`, commit a token, or place it in a URL. DevLens explicitly refuses metadata marked private even if a token could access it. The proxy and report schemas strip upstream fields that are not needed.

## Vercel

1. Import `gupta-srishtii/DevLens` into your Vercel account. Select the intended branch for a preview deployment; promote only after review.
2. Use the Next.js framework preset, repository root, Node 24, `npm ci`, and `npm run build`.
3. Add optional environment values in the project settings, separately for preview and production. Set the production origin only after its URL is assigned.
4. Deploy. `vercel.json` declares the framework and function durations; analysis allows 60 seconds, file reads 30 seconds.
5. Open the home page, analyze a small public project, expand a folder, preview a file, compare two projects, and download both report formats.
6. Check that a bad repository produces a recoverable error and that security headers are present. Verify no GitHub token appears in page source, browser network payloads, or downloaded reports.
7. For public traffic, add an edge rate-limit rule on `/api/analyze` and `/api/files`. The in-process guard is not a global quota and forwarded IP headers are trustworthy only behind a trusted proxy.

The CLI equivalent after authentication is `npx vercel` for preview, then `npx vercel --prod` after validation. No domain or repository visibility changes are needed.

## Current environment blockers

At implementation time the repository had no Vercel project link, no installed Vercel CLI, and no Vercel authentication file in the usual local configuration locations. A production deployment requires the owner's Vercel account/project authorization. No deployment URL has been created or claimed. All local implementation, checks and configuration proceed independently of that login.

Git push availability and the final checked revision are recorded in `docs/PROGRESS.md`; remote state is never assumed from local commits.

## Checks before deployment

```sh
npm ci
npm run check
npm run format:check
npx playwright install --with-deps chromium
npm run test:e2e
```

On Windows, `npm.cmd` and `npx.cmd` avoid a restricted PowerShell script launcher. Browser tests reuse installed Microsoft Edge when available; Linux CI installs Chromium. All browser API responses are intercepted with deterministic, explicitly test-only fixtures. They do not verify GitHub network availability; a live API smoke check is recorded separately.

## Self-hosting

`npm start` binds to loopback by default for local development. Behind a production reverse proxy, invoke `npx next start --hostname 0.0.0.0 --port 3000` in your process manager, forward trusted client IPs, terminate HTTPS, and provide the environment through your host's secret manager. Configure persistent Next.js caching or shared cache coordination if running multiple instances. Do not serve `.env` files.

## Rollback

Redeploy a previously verified Git SHA or use the host's deployment rollback. There are no data migrations. Revoke and replace a compromised token through GitHub and the deployment's environment manager, then redeploy; never place its value in a bug report.

Reference: [Next.js on Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs).
