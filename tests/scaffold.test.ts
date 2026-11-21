import { describe, expect, it } from "vitest";
import nextConfig from "../next.config";

describe("production configuration", () => {
  it("disables the framework header and protects embedding", async () => {
    expect(nextConfig.poweredByHeader).toBe(false);
    const headers = await nextConfig.headers?.();
    expect(headers?.[0]?.headers).toContainEqual({ key: "X-Frame-Options", value: "DENY" });
  });
});
