import { describe, expect, it } from "vitest";
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from "../../lib/rate-limit";

function uniqueKey(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2)}`;
}

describe("checkRateLimit", () => {
  it("allows requests up to the limit", () => {
    const key = uniqueKey("allow");
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit(key, 5, 60_000).allowed).toBe(true);
    }
  });

  it("blocks requests once the limit is exceeded, with a positive retryAfterSeconds", () => {
    const key = uniqueKey("block");
    for (let i = 0; i < 3; i++) checkRateLimit(key, 3, 60_000);
    const result = checkRateLimit(key, 3, 60_000);
    expect(result.allowed).toBe(false);
    expect(result.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("resets once the window has elapsed", async () => {
    const key = uniqueKey("reset");
    expect(checkRateLimit(key, 1, 40).allowed).toBe(true);
    expect(checkRateLimit(key, 1, 40).allowed).toBe(false);
    await new Promise((resolve) => setTimeout(resolve, 60));
    expect(checkRateLimit(key, 1, 40).allowed).toBe(true);
  });

  it("tracks separate keys independently", () => {
    const keyA = uniqueKey("a");
    const keyB = uniqueKey("b");
    expect(checkRateLimit(keyA, 1, 60_000).allowed).toBe(true);
    expect(checkRateLimit(keyA, 1, 60_000).allowed).toBe(false);
    expect(checkRateLimit(keyB, 1, 60_000).allowed).toBe(true);
  });
});

describe("rateLimitResponse", () => {
  it("returns null while a user is under the configured limit for a route", () => {
    const userId = uniqueKey("user");
    expect(rateLimitResponse("analyze", userId)).toBeNull();
  });

  it("returns a 429 with a Retry-After header once a user exceeds the configured limit", async () => {
    const userId = uniqueKey("user");
    for (let i = 0; i < RATE_LIMITS.analyze.limit; i++) {
      expect(rateLimitResponse("analyze", userId)).toBeNull();
    }
    const response = rateLimitResponse("analyze", userId);
    expect(response).not.toBeNull();
    expect(response!.status).toBe(429);
    expect(Number(response!.headers.get("Retry-After"))).toBeGreaterThan(0);
    const body = await response!.json();
    expect(body.error).toMatch(/too many requests/i);
  });

  it("gives each route its own budget for the same user", () => {
    const userId = uniqueKey("user");
    for (let i = 0; i < RATE_LIMITS.generateBuild.limit; i++) {
      rateLimitResponse("generateBuild", userId);
    }
    expect(rateLimitResponse("generateBuild", userId)).not.toBeNull();
    expect(rateLimitResponse("generateApp", userId)).toBeNull();
  });

  it("gives each user their own budget for the same route", () => {
    const userA = uniqueKey("user");
    const userB = uniqueKey("user");
    for (let i = 0; i < RATE_LIMITS.generateApp.limit; i++) {
      rateLimitResponse("generateApp", userA);
    }
    expect(rateLimitResponse("generateApp", userA)).not.toBeNull();
    expect(rateLimitResponse("generateApp", userB)).toBeNull();
  });
});
