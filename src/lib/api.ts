import "server-only";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { GitHubError } from "./github/client";

export function apiError(error: unknown) {
  if (error instanceof ZodError)
    return NextResponse.json(
      { error: error.issues[0]?.message ?? "Invalid input.", code: "INVALID_INPUT" },
      { status: 400 },
    );
  if (error instanceof GitHubError) {
    return NextResponse.json(
      { error: error.message, code: error.code, retryAt: error.retryAt },
      {
        status: error.status,
        headers: error.retryAt
          ? {
              "Retry-After": String(
                Math.max(1, Math.ceil((Date.parse(error.retryAt) - Date.now()) / 1000)),
              ),
            }
          : undefined,
      },
    );
  }
  return NextResponse.json(
    {
      error: "Something went wrong while preparing this analysis. Please try again.",
      code: "INTERNAL_ERROR",
    },
    { status: 500 },
  );
}

// A bounded, per-process abuse guard. Production deployments should also enable edge rate limiting.
const requests = new Map<string, { count: number; until: number }>();
export function guardRequest(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  for (const [key, value] of requests) if (value.until <= now) requests.delete(key);
  const current = requests.get(ip);
  if (current && current.count >= 30)
    throw new GitHubError(
      "Too many analysis requests. Please wait a minute before trying again.",
      429,
      "LOCAL_RATE_LIMIT",
      new Date(current.until).toISOString(),
    );
  if (current) current.count++;
  else {
    if (requests.size >= 1000) requests.delete(requests.keys().next().value!);
    requests.set(ip, { count: 1, until: now + 60_000 });
  }
}
