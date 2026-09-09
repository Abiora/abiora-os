import { randomUUID } from "crypto";
import { getDatabase } from "@/lib/database";
import { identifier } from "@/lib/records";
import type { ApplicationBlueprint } from "@/types/application";

const httpMethods = new Set(["GET", "POST", "PUT", "PATCH", "DELETE"]);
const componentTypes = new Set(["stats", "table", "list", "form", "detail", "calendar", "chart", "text"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isField(value: unknown) {
  return isRecord(value) && identifier.test(String(value.name)) && isNonEmptyString(value.type) && typeof value.required === "boolean";
}

function isEntity(value: unknown) {
  return isRecord(value) && identifier.test(String(value.name)) && typeof value.purpose === "string" && Array.isArray(value.fields) && value.fields.length > 0 && value.fields.every(isField);
}

function isComponent(value: unknown) {
  return isRecord(value) && isNonEmptyString(value.name) && componentTypes.has(String(value.type)) && typeof value.entity === "string" && typeof value.purpose === "string";
}

function isPage(value: unknown) {
  return isRecord(value) && isNonEmptyString(value.name) && isNonEmptyString(value.path) && typeof value.purpose === "string" && Array.isArray(value.components) && value.components.every(isComponent);
}

function isFeature(value: unknown) {
  return isRecord(value) && isNonEmptyString(value.name) && typeof value.description === "string";
}

function isApiRoute(value: unknown) {
  return isRecord(value) && httpMethods.has(String(value.method)) && isNonEmptyString(value.path) && typeof value.purpose === "string" && typeof value.entity === "string";
}

function isAction(value: unknown) {
  return isRecord(value) && isNonEmptyString(value.name) && typeof value.description === "string" && typeof value.trigger === "string" && typeof value.entity === "string";
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

export function validateBlueprint(input: unknown): { blueprint: ApplicationBlueprint } | { error: string } {
  if (!isRecord(input)) return { error: "A blueprint object is required." };
  if (!isNonEmptyString(input.projectName)) return { error: "The blueprint must include a projectName." };
  if (typeof input.description !== "string") return { error: "The blueprint must include a description." };
  if (!Array.isArray(input.pages) || !input.pages.every(isPage)) return { error: "The blueprint pages are invalid." };
  if (!Array.isArray(input.features) || !input.features.every(isFeature)) return { error: "The blueprint features are invalid." };
  if (!Array.isArray(input.database) || input.database.length === 0 || !input.database.every(isEntity)) return { error: "The blueprint database entities are invalid." };
  if (!Array.isArray(input.apiRoutes) || !input.apiRoutes.every(isApiRoute)) return { error: "The blueprint API routes are invalid." };
  if (!Array.isArray(input.actions) || !input.actions.every(isAction)) return { error: "The blueprint actions are invalid." };
  if (!isStringArray(input.nextSteps)) return { error: "The blueprint nextSteps are invalid." };
  return { blueprint: input as unknown as ApplicationBlueprint };
}

export async function createApplication(blueprint: ApplicationBlueprint, ownerId: string) {
  const id = `app_${randomUUID().replace(/-/g, "")}`;
  await getDatabase().query("INSERT INTO applications (id, blueprint, owner_id) VALUES ($1, $2::jsonb, $3)", [id, JSON.stringify(blueprint), ownerId]);
  return id;
}

/**
 * Returns the blueprint only when `ownerId` matches the application's owner.
 * A missing application and one owned by someone else are indistinguishable
 * (both return null) so callers can respond 404 without leaking existence.
 */
export async function getApplicationBlueprint(applicationId: string, ownerId: string): Promise<ApplicationBlueprint | null> {
  const result = await getDatabase().query<{ blueprint: ApplicationBlueprint }>("SELECT blueprint FROM applications WHERE id = $1 AND owner_id = $2", [applicationId, ownerId]);
  return result.rows[0]?.blueprint ?? null;
}

export type ApplicationSummary = {
  id: string;
  projectName: string;
  description: string;
  createdAt: string;
};

/** Lightweight summaries (not full blueprints) for listing an owner's applications, newest first. */
export async function listApplications(ownerId: string): Promise<ApplicationSummary[]> {
  const result = await getDatabase().query<{ id: string; project_name: string; description: string; created_at: string }>(
    "SELECT id, blueprint->>'projectName' AS project_name, blueprint->>'description' AS description, created_at FROM applications WHERE owner_id = $1 ORDER BY created_at DESC",
    [ownerId]
  );
  return result.rows.map((row) => ({ id: row.id, projectName: row.project_name, description: row.description, createdAt: row.created_at }));
}
