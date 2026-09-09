/**
 * Pure input validation for the AI generation endpoints
 * (/api/analyze, /api/generate-build, /api/generate-app). Kept separate from
 * the route handlers -- which call OpenAI and can't be unit-tested without a
 * live network/mocked SDK -- so the validation rules themselves are covered
 * by fast, deterministic unit tests.
 */

export const MAX_IDEA_LENGTH = 4000;
export const MAX_ARCHITECTURE_BYTES = 20_000;
export const MAX_BUILD_PLAN_BYTES = 20_000;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function validateIdea(input: unknown): { idea: string } | { error: string } {
  const idea = typeof input === "string" ? input.trim() : "";
  if (!idea) return { error: "A product idea is required." };
  if (idea.length > MAX_IDEA_LENGTH) return { error: `The product idea must be ${MAX_IDEA_LENGTH} characters or fewer.` };
  return { idea };
}

export function validateArchitecture(input: unknown): { architecture: Record<string, unknown>; json: string } | { error: string } {
  if (typeof input !== "object" || input === null || Array.isArray(input) || !isNonEmptyString((input as Record<string, unknown>).productName)) {
    return { error: "A valid architecture with a productName is required." };
  }
  const json = JSON.stringify(input);
  if (json.length > MAX_ARCHITECTURE_BYTES) return { error: "The approved architecture is too large." };
  return { architecture: input as Record<string, unknown>, json };
}

export function validateBuildPlan(input: unknown): { buildPlan: Record<string, unknown>; json: string } | { error: string } {
  if (typeof input !== "object" || input === null || Array.isArray(input) || !isNonEmptyString((input as Record<string, unknown>).productName)) {
    return { error: "A valid build plan with a productName is required." };
  }
  const json = JSON.stringify(input);
  if (json.length > MAX_BUILD_PLAN_BYTES) return { error: "The build plan is too large." };
  return { buildPlan: input as Record<string, unknown>, json };
}
