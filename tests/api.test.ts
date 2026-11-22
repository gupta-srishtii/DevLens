// @vitest-environment node
import { describe, it, expect, vi, afterEach } from "vitest";
import { apiError, guardRequest } from "@/lib/api";

afterEach(() => vi.useRealTimers());

describe("API abuse guard", () => {
  it("limits bursts and allows requests again after the window", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-11-22T10:00:00Z"));
    const request = new Request("http://localhost/api/analyze", {
      headers: { "x-forwarded-for": "test-burst-client" },
    });
    for (let count = 0; count < 30; count++) guardRequest(request);
    expect(() => guardRequest(request)).toThrow("Too many analysis requests");
    vi.setSystemTime(new Date("2026-11-22T10:01:01Z"));
    expect(() => guardRequest(request)).not.toThrow();
  });
  it("does not expose unexpected exception details", async () => {
    const response = apiError(new Error("Authorization: Bearer sensitive-value"));
    expect(response.status).toBe(500);
    expect(await response.text()).not.toContain("sensitive-value");
  });
});
