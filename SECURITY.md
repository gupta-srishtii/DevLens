# Security

DevLens reads public GitHub data and does not execute repository code.

- Credentials are optional and server-only. Production builds use the `server-only` import boundary.
- API requests use a fixed GitHub origin, validated repository names and validated file paths. Redirects are not followed.
- Private repositories are rejected before secondary requests. Directory/file access repeats the public metadata check.
- Zod validates upstream bodies and removes unknown fields. Error responses do not echo arbitrary upstream content or exception details.
- README rendering omits raw HTML and images, filters link protocols, and gives external links `rel="noreferrer"`. File contents render as React text.
- Preview sizes, list sizes, upstream concurrency and timeouts are bounded. Browser requests can be canceled. A per-process request guard complements GitHub's API limits.
- Response headers include CSP, frame restrictions, MIME sniffing protection, referrer policy and restricted permissions.
- Production uses no analytics tracker, analysis database or browser token storage.

The CSP allows inline scripts/styles required by Next.js and runtime animation. It is defense in depth, not nonce-based strict CSP. Only development mode permits eval and WebSocket connections for Next.js HMR; production validation uses `next start`. A production reverse proxy should trust its own forwarded IP headers only and add distributed/edge rate limiting. The in-process guard is not a denial-of-service protection guarantee.

For a vulnerability, contact the repository owner privately through their GitHub profile. Do not include credentials in public issues. No private reporting channel is claimed to be configured.
