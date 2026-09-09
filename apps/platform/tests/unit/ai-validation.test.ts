import { describe, expect, it } from "vitest";
import { validateIdea, validateArchitecture, validateBuildPlan, MAX_IDEA_LENGTH, MAX_ARCHITECTURE_BYTES, MAX_BUILD_PLAN_BYTES } from "../../lib/ai-validation";

describe("validateIdea", () => {
  it("accepts a well-formed idea and trims it", () => {
    const result = validateIdea("  A barber shop booking app  ");
    expect("idea" in result && result.idea).toBe("A barber shop booking app");
  });

  it("rejects a missing, non-string, or empty/whitespace-only idea", () => {
    expect("error" in validateIdea(undefined)).toBe(true);
    expect("error" in validateIdea(null)).toBe(true);
    expect("error" in validateIdea(42)).toBe(true);
    expect("error" in validateIdea("   ")).toBe(true);
  });

  it("rejects an idea longer than the maximum length", () => {
    const result = validateIdea("a".repeat(MAX_IDEA_LENGTH + 1));
    expect("error" in result).toBe(true);
  });

  it("accepts an idea exactly at the maximum length", () => {
    const result = validateIdea("a".repeat(MAX_IDEA_LENGTH));
    expect("idea" in result).toBe(true);
  });
});

describe("validateArchitecture", () => {
  it("accepts an architecture object with a non-empty productName", () => {
    const result = validateArchitecture({ productName: "BarberBook", summary: "..." });
    expect("architecture" in result).toBe(true);
    expect("json" in result && typeof result.json).toBe("string");
  });

  it("rejects a missing, non-object, or array input", () => {
    expect("error" in validateArchitecture(undefined)).toBe(true);
    expect("error" in validateArchitecture(null)).toBe(true);
    expect("error" in validateArchitecture("nope")).toBe(true);
    expect("error" in validateArchitecture([])).toBe(true);
  });

  it("rejects an object with a missing or empty productName", () => {
    expect("error" in validateArchitecture({})).toBe(true);
    expect("error" in validateArchitecture({ productName: "" })).toBe(true);
    expect("error" in validateArchitecture({ productName: "   " })).toBe(true);
    expect("error" in validateArchitecture({ productName: 123 })).toBe(true);
  });

  it("rejects an architecture whose JSON size exceeds the maximum", () => {
    const result = validateArchitecture({ productName: "BarberBook", bloat: "a".repeat(MAX_ARCHITECTURE_BYTES) });
    expect("error" in result).toBe(true);
  });
});

describe("validateBuildPlan", () => {
  it("accepts a build plan object with a non-empty productName", () => {
    const result = validateBuildPlan({ productName: "BarberBook", overview: "..." });
    expect("buildPlan" in result).toBe(true);
    expect("json" in result && typeof result.json).toBe("string");
  });

  it("rejects a missing, non-object, or array input", () => {
    expect("error" in validateBuildPlan(undefined)).toBe(true);
    expect("error" in validateBuildPlan(null)).toBe(true);
    expect("error" in validateBuildPlan("nope")).toBe(true);
    expect("error" in validateBuildPlan([])).toBe(true);
  });

  it("rejects a build plan with a missing or empty productName", () => {
    expect("error" in validateBuildPlan({})).toBe(true);
    expect("error" in validateBuildPlan({ productName: "" })).toBe(true);
  });

  it("rejects a build plan whose JSON size exceeds the maximum", () => {
    const result = validateBuildPlan({ productName: "BarberBook", bloat: "a".repeat(MAX_BUILD_PLAN_BYTES) });
    expect("error" in result).toBe(true);
  });
});
