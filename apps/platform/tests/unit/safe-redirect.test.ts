import { describe, expect, it } from "vitest";
import { safeNextPath } from "../../lib/safe-redirect";

describe("safeNextPath", () => {
  it("allows a plain same-origin path", () => {
    expect(safeNextPath("/dashboard")).toBe("/dashboard");
  });

  it("allows a same-origin path with a query string", () => {
    expect(safeNextPath("/generated?applicationId=123")).toBe("/generated?applicationId=123");
  });

  it("rejects an absolute external URL", () => {
    expect(safeNextPath("https://evil.example")).toBe("/");
  });

  it("rejects a protocol-relative URL", () => {
    expect(safeNextPath("//evil.example")).toBe("/");
  });

  it("rejects a javascript: URL", () => {
    expect(safeNextPath("javascript:alert(1)")).toBe("/");
  });

  it("falls back to / for malformed or empty values", () => {
    expect(safeNextPath("")).toBe("/");
    expect(safeNextPath(undefined)).toBe("/");
    expect(safeNextPath(null)).toBe("/");
    expect(safeNextPath(123)).toBe("/");
    expect(safeNextPath("not-a-path")).toBe("/");
  });

  it("rejects a backslash-prefixed value some browsers normalize to protocol-relative", () => {
    expect(safeNextPath("/\\evil.example")).toBe("/");
  });

  it("rejects other external schemes disguised with a leading slash check bypass", () => {
    expect(safeNextPath("http://evil.example")).toBe("/");
    expect(safeNextPath("ftp://evil.example")).toBe("/");
    expect(safeNextPath("mailto:test@evil.example")).toBe("/");
  });

  it("supports a custom fallback", () => {
    expect(safeNextPath("https://evil.example", "/login")).toBe("/login");
  });

  it("preserves a hash fragment on a safe path", () => {
    expect(safeNextPath("/architect#section")).toBe("/architect#section");
  });
});
