import { describe, expect, it } from "vitest";

const BASE_URL = process.env.TEST_BASE_URL ?? "http://localhost:3000";

describe("GET /api/health", () => {
  it("returns 200 and { status: 'ok' } without requiring authentication", async () => {
    const response = await fetch(`${BASE_URL}/api/health`);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "ok" });
  });

  it("only accepts GET", async () => {
    const response = await fetch(`${BASE_URL}/api/health`, { method: "POST" });
    expect(response.status).toBe(405);
  });
});
