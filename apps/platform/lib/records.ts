import { getDatabase } from "@/lib/database";
import type { ApplicationBlueprint } from "@/types/application";

type Entity = ApplicationBlueprint["database"][number];
type Field = Entity["fields"][number];
export type RecordData = Record<string, string | number | boolean | null>;

export const identifier = /^[a-zA-Z][a-zA-Z0-9_-]{0,99}$/;
const internal = /(^|[_\s-])(id|uuid|createdat|updatedat|deletedat|password|passwordhash|hash|token|secret|apikey|salt)($|[_\s-])/i;
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const boolType = /bool/i;
const numericType = /number|integer|decimal|float|double|currency|amount/i;

// Mirrors app/generated/page.tsx's client-side relation() detection, so the
// server validates the same fields the UI renders as relation dropdowns.
const clean = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");
const singularize = (value: string) => {
  const v = clean(value);
  return v.endsWith("ies") ? `${v.slice(0, -3)}y` : v.endsWith("s") ? v.slice(0, -1) : v;
};
function relatedEntity(field: Field, entities: Entity[]): Entity | undefined {
  return entities.find((entity) => singularize(entity.name) === singularize(field.name.replace(/_?id$/i, "")));
}

export function isApplicationId(value: unknown): value is string {
  return typeof value === "string" && /^app_[a-z0-9_-]{1,180}$/i.test(value);
}

export const DEFAULT_RECORD_LIMIT = 200;
export const MAX_RECORD_LIMIT = 500;

/** Falls back to the default for missing/invalid/non-positive values; always caps at MAX_RECORD_LIMIT. */
export function resolveLimit(value: string | null): number {
  const parsed = Number(value);
  if (!value || !Number.isFinite(parsed) || parsed < 1) return DEFAULT_RECORD_LIMIT;
  return Math.min(Math.trunc(parsed), MAX_RECORD_LIMIT);
}

/** Falls back to 0 for missing/invalid/negative values. */
export function resolveOffset(value: string | null): number {
  const parsed = Number(value);
  if (!value || !Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.trunc(parsed);
}

function editableFields(entity: Entity) {
  return entity.fields.filter((field) => identifier.test(field.name) && !internal.test(field.name));
}

export function entityForBlueprint(blueprint: unknown, entityName: unknown): Entity | null {
  if (!blueprint || typeof blueprint !== "object" || !Array.isArray((blueprint as ApplicationBlueprint).database) || typeof entityName !== "string" || !identifier.test(entityName)) return null;
  const entity = (blueprint as ApplicationBlueprint).database.find((item) => item?.name === entityName && Array.isArray(item.fields));
  return entity ?? null;
}

function hasValue(value: unknown) {
  return typeof value === "boolean" || (typeof value === "number" && Number.isFinite(value)) || (typeof value === "string" && value.trim().length > 0);
}

/** Only checks the two type/field patterns actually rendered as typed inputs client-side (checkbox, number); other declared types (string, date, email, ...) accept any primitive, unchanged. */
function checkFieldType(field: Field, value: unknown): string | null {
  if (boolType.test(field.type) && typeof value !== "boolean") return `Field \"${field.name}\" must be a boolean.`;
  if (numericType.test(field.type) && typeof value !== "number") return `Field \"${field.name}\" must be a number.`;
  return null;
}

async function recordExists(applicationId: string, entityName: string, recordId: string): Promise<boolean> {
  if (!uuid.test(recordId)) return false;
  const result = await getDatabase().query("SELECT 1 FROM generated_records WHERE application_id = $1 AND entity_name = $2 AND record_id = $3 LIMIT 1", [applicationId, entityName, recordId]);
  return (result.rowCount ?? 0) > 0;
}

/**
 * `existingData` (update context only; omitted/null for create) is the
 * record's currently-stored data. When a relationship field's incoming
 * value is byte-for-byte identical to what's already stored, the
 * existence check for that field is skipped -- this lets an update to an
 * unrelated field go through even if the relationship's target was
 * deleted after this record was created, without weakening validation for
 * any value that is actually changing. A field with no matching entry in
 * `existingData` (or no `existingData` at all) is always fully validated,
 * so create -- which never has a prior record to compare against --
 * remains exactly as strict as before this parameter existed.
 */
export async function validateRecordData(entity: Entity, entities: Entity[], applicationId: string, input: unknown, existingData: RecordData | null = null): Promise<{ data: RecordData } | { error: string }> {
  if (!input || typeof input !== "object" || Array.isArray(input)) return { error: "Record data must be an object." };
  const data = input as Record<string, unknown>;
  const allowed = new Map(editableFields(entity).map((field) => [field.name, field]));
  for (const [name, value] of Object.entries(data)) {
    const field = allowed.get(name);
    if (!field) return { error: `Field \"${name}\" is not writable for this entity.` };
    if (value !== null && typeof value !== "string" && typeof value !== "number" && typeof value !== "boolean") return { error: `Field \"${name}\" must be a simple value.` };
    if (typeof value === "number" && !Number.isFinite(value)) return { error: `Field \"${name}\" must be a finite number.` };
    if (hasValue(value)) {
      const typeError = checkFieldType(field, value);
      if (typeError) return { error: typeError };
    }
  }
  for (const field of allowed.values()) {
    if (field.required && !hasValue(data[field.name])) return { error: `Field \"${field.name}\" is required.` };
  }
  for (const [name, value] of Object.entries(data)) {
    if (!hasValue(value)) continue;
    const field = allowed.get(name)!;
    const related = relatedEntity(field, entities);
    if (!related) continue;
    if (existingData && existingData[name] === value) continue;
    if (!(await recordExists(applicationId, related.name, String(value)))) return { error: `Field \"${name}\" refers to a ${related.name} record that does not exist.` };
  }
  return { data: Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined)) as RecordData };
}

export function toPublicRecord(row: { record_id: string; data: RecordData }) {
  return { __id: row.record_id, ...row.data };
}
