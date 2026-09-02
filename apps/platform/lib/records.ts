import type { ApplicationBlueprint } from "@/types/application";

type Entity = ApplicationBlueprint["database"][number];
export type RecordData = Record<string, string | number | boolean | null>;

export const identifier = /^[a-zA-Z][a-zA-Z0-9_-]{0,99}$/;
const internal = /(^|[_\s-])(id|uuid|createdat|updatedat|deletedat|password|passwordhash|hash|token|secret|apikey|salt)($|[_\s-])/i;

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

export function validateRecordData(entity: Entity, input: unknown): { data: RecordData } | { error: string } {
  if (!input || typeof input !== "object" || Array.isArray(input)) return { error: "Record data must be an object." };
  const data = input as Record<string, unknown>;
  const allowed = new Map(editableFields(entity).map((field) => [field.name, field]));
  for (const [name, value] of Object.entries(data)) {
    if (!allowed.has(name)) return { error: `Field \"${name}\" is not writable for this entity.` };
    if (value !== null && typeof value !== "string" && typeof value !== "number" && typeof value !== "boolean") return { error: `Field \"${name}\" must be a simple value.` };
    if (typeof value === "number" && !Number.isFinite(value)) return { error: `Field \"${name}\" must be a finite number.` };
  }
  for (const field of allowed.values()) {
    if (field.required && !hasValue(data[field.name])) return { error: `Field \"${field.name}\" is required.` };
  }
  return { data: Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined)) as RecordData };
}

export function toPublicRecord(row: { record_id: string; data: RecordData }) {
  return { __id: row.record_id, ...row.data };
}
