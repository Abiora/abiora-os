import { describe, expect, it } from "vitest";
import {
  DEFAULT_RECORD_LIMIT,
  MAX_RECORD_LIMIT,
  entityForBlueprint,
  isApplicationId,
  relatedEntity,
  resolveLimit,
  resolveOffset,
  toPublicRecord,
  validateRecordData,
} from "../../lib/records";

const entity = {
  name: "task",
  purpose: "a task",
  fields: [
    { name: "title", type: "string", required: true },
    { name: "done", type: "boolean", required: false },
    { name: "id", type: "string", required: false },
    { name: "password", type: "string", required: false },
  ],
};

const blueprint = {
  projectName: "Test",
  description: "d",
  pages: [],
  features: [],
  database: [entity],
  apiRoutes: [],
  actions: [],
  nextSteps: [],
};

describe("isApplicationId", () => {
  it("accepts a well-formed application id", () => {
    expect(isApplicationId("app_abc123")).toBe(true);
  });

  it("rejects missing prefix, null, and non-string values", () => {
    expect(isApplicationId("abc123")).toBe(false);
    expect(isApplicationId(null)).toBe(false);
    expect(isApplicationId(undefined)).toBe(false);
    expect(isApplicationId(42)).toBe(false);
  });

  it("rejects disallowed characters", () => {
    expect(isApplicationId("app_has space")).toBe(false);
    expect(isApplicationId("app_has/slash")).toBe(false);
  });
});

describe("entityForBlueprint", () => {
  it("returns the matching entity for a valid blueprint and name", () => {
    expect(entityForBlueprint(blueprint, "task")).toEqual(entity);
  });

  it("returns null when the entity name does not exist", () => {
    expect(entityForBlueprint(blueprint, "missing")).toBeNull();
  });

  it("returns null for a malformed blueprint (no database array)", () => {
    expect(entityForBlueprint({ ...blueprint, database: undefined }, "task")).toBeNull();
  });

  it("returns null for an invalid entity name format", () => {
    expect(entityForBlueprint(blueprint, "task name")).toBeNull();
    expect(entityForBlueprint(blueprint, "")).toBeNull();
  });
});

describe("relatedEntity", () => {
  const tenant = { name: "Tenant", purpose: "a tenant", fields: [{ name: "firstName", type: "string", required: true }] };
  const customer = { name: "Customer", purpose: "a customer", fields: [{ name: "name", type: "string", required: true }] };
  const vendor = { name: "Vendor", purpose: "a vendor", fields: [{ name: "name", type: "string", required: true }] };
  const order = { name: "Order", purpose: "an order", fields: [{ name: "total", type: "number", required: true }] };
  const workOrder = { name: "WorkOrder", purpose: "a work order", fields: [{ name: "summary", type: "string", required: true }] };
  const barber = { name: "Barber", purpose: "a barber", fields: [{ name: "name", type: "string", required: true }] };

  it("resolves a declared 'reference:Tenant' type to the Tenant entity", () => {
    expect(relatedEntity({ name: "someField", type: "reference:Tenant", required: false }, [tenant, customer])).toEqual(tenant);
  });

  it("resolves a declared 'relationship:Customer' type to the Customer entity", () => {
    expect(relatedEntity({ name: "someField", type: "relationship:Customer", required: false }, [tenant, customer])).toEqual(customer);
  });

  it("detects currentTenant via its declared type even though the field name doesn't say Tenant", () => {
    expect(relatedEntity({ name: "currentTenant", type: "reference:Tenant", required: false }, [tenant, customer])).toEqual(tenant);
  });

  it("detects assignedVendor via its declared type even though the field name doesn't say Vendor", () => {
    expect(relatedEntity({ name: "assignedVendor", type: "reference:Vendor", required: false }, [vendor, customer])).toEqual(vendor);
  });

  it("does not let a declared 'reference:Order' incorrectly match a WorkOrder entity", () => {
    const field = { name: "sourceOrder", type: "reference:Order", required: false };
    expect(relatedEntity(field, [order, workOrder])).toEqual(order);
    expect(relatedEntity(field, [workOrder])).toBeUndefined();
  });

  it("still resolves customerId/barberId-style fields via the name heuristic when the type has no colon", () => {
    expect(relatedEntity({ name: "customerId", type: "string", required: false }, [customer, vendor])).toEqual(customer);
    expect(relatedEntity({ name: "barberId", type: "uuid", required: false }, [barber, customer])).toEqual(barber);
  });
});

describe("validateRecordData", () => {
  // None of `entity`'s fields are relation-shaped (no "*Id" field matching another
  // entity's name), so these never reach the DB-backed relationship check below —
  // they stay fast, hermetic unit tests. That check is covered by a live integration
  // test in tests/integration/security.test.ts instead.
  const noEntities: typeof blueprint.database = [];
  const appId = "app_unit_test_only";

  it("accepts valid data for editable fields", async () => {
    const result = await validateRecordData(entity, noEntities, appId, { title: "Buy milk", done: true });
    expect(result).toEqual({ data: { title: "Buy milk", done: true } });
  });

  it("rejects an unknown field", async () => {
    const result = await validateRecordData(entity, noEntities, appId, { nope: "x" });
    expect("error" in result && result.error).toMatch(/not writable/);
  });

  it("rejects internal/blocked field names even when declared on the entity", async () => {
    const result = await validateRecordData(entity, noEntities, appId, { id: "x" });
    expect("error" in result && result.error).toMatch(/not writable/);
  });

  it("rejects a non-primitive value", async () => {
    const result = await validateRecordData(entity, noEntities, appId, { title: { nested: true } });
    expect("error" in result && result.error).toMatch(/simple value/);
  });

  it("rejects a non-finite numeric value", async () => {
    const result = await validateRecordData(entity, noEntities, appId, { title: "x", done: Number.POSITIVE_INFINITY });
    expect("error" in result && result.error).toMatch(/finite number/);
  });

  it("rejects a missing required field", async () => {
    const result = await validateRecordData(entity, noEntities, appId, { done: true });
    expect("error" in result && result.error).toMatch(/required/);
  });

  it("rejects non-object input", async () => {
    expect("error" in (await validateRecordData(entity, noEntities, appId, null))).toBe(true);
    expect("error" in (await validateRecordData(entity, noEntities, appId, ["x"]))).toBe(true);
    expect("error" in (await validateRecordData(entity, noEntities, appId, "x"))).toBe(true);
  });

  it("rejects a string value for a boolean-typed field", async () => {
    const result = await validateRecordData(entity, noEntities, appId, { title: "x", done: "yes" });
    expect("error" in result && result.error).toMatch(/must be a boolean/);
  });

  it("accepts a real boolean for a boolean-typed field", async () => {
    const result = await validateRecordData(entity, noEntities, appId, { title: "x", done: false });
    expect(result).toEqual({ data: { title: "x", done: false } });
  });

  it("rejects a string value for a number-typed field", async () => {
    const numericEntity = { ...entity, fields: [...entity.fields, { name: "quantity", type: "number", required: false }] };
    const result = await validateRecordData(numericEntity, noEntities, appId, { title: "x", quantity: "five" });
    expect("error" in result && result.error).toMatch(/must be a number/);
  });

  it("accepts a real number for a number-typed field", async () => {
    const numericEntity = { ...entity, fields: [...entity.fields, { name: "quantity", type: "number", required: false }] };
    const result = await validateRecordData(numericEntity, noEntities, appId, { title: "x", quantity: 5 });
    expect(result).toEqual({ data: { title: "x", quantity: 5 } });
  });

  it("does not enforce boolean/number type-checking when the field is left empty (optional, blank)", async () => {
    const numericEntity = { ...entity, fields: [...entity.fields, { name: "quantity", type: "number", required: false }] };
    const result = await validateRecordData(numericEntity, noEntities, appId, { title: "x", quantity: "" });
    expect("error" in result).toBe(false);
  });
});

describe("validateRecordData with existingData (update/stale-relationship handling)", () => {
  // A real relation-shaped field (projectId -> project), so these prove the
  // *skip* path specifically never reaches the DB-backed existence check --
  // unlike the relationship checks in `validateRecordData` above, which stay
  // hermetic only because they use `noEntities`. The "still validates when
  // changed" side of this is covered by a live integration test instead
  // (tests/integration/validation.test.ts), same convention as before.
  const projectEntity = { name: "project", purpose: "a project", fields: [{ name: "name", type: "string", required: true }] };
  const taskEntity = {
    name: "task",
    purpose: "a task",
    fields: [
      { name: "title", type: "string", required: true },
      { name: "projectId", type: "string", required: false },
    ],
  };
  const relatedEntities = [projectEntity, taskEntity];
  const appId = "app_unit_test_only";
  const staleId = "00000000-0000-4000-8000-000000000000"; // would fail an existence check if one ran

  it("skips the existence check when a relationship value is unchanged from existingData", async () => {
    const result = await validateRecordData(
      taskEntity,
      relatedEntities,
      appId,
      { title: "new title", projectId: staleId },
      { title: "old title", projectId: staleId }
    );
    expect(result).toEqual({ data: { title: "new title", projectId: staleId } });
  });

  it("has no effect when existingData is omitted (defaults to null, matching create behavior)", async () => {
    // No relationship-bearing value is submitted here, so this stays hermetic
    // either way -- it documents that the parameter is optional and inert
    // when absent, not that relationship checks are skipped by default.
    const result = await validateRecordData(taskEntity, relatedEntities, appId, { title: "x" });
    expect(result).toEqual({ data: { title: "x" } });
  });

  it("still enforces required-field presence regardless of existingData", async () => {
    const result = await validateRecordData(taskEntity, relatedEntities, appId, { projectId: staleId }, { title: "old", projectId: staleId });
    expect("error" in result && result.error).toMatch(/required/);
  });

  it("still rejects a non-primitive or malformed value regardless of existingData", async () => {
    const result = await validateRecordData(taskEntity, relatedEntities, appId, { title: { nested: true } }, { title: "old" });
    expect("error" in result && result.error).toMatch(/simple value/);
  });
});

describe("toPublicRecord", () => {
  it("spreads the row's data alongside __id", () => {
    expect(toPublicRecord({ record_id: "abc-123", data: { title: "x" } })).toEqual({
      __id: "abc-123",
      title: "x",
    });
  });
});

describe("resolveLimit", () => {
  it("returns the default when the value is missing", () => {
    expect(resolveLimit(null)).toBe(DEFAULT_RECORD_LIMIT);
  });

  it("returns the default for non-numeric or non-positive values", () => {
    expect(resolveLimit("not-a-number")).toBe(DEFAULT_RECORD_LIMIT);
    expect(resolveLimit("0")).toBe(DEFAULT_RECORD_LIMIT);
    expect(resolveLimit("-5")).toBe(DEFAULT_RECORD_LIMIT);
  });

  it("honors a valid value within range", () => {
    expect(resolveLimit("10")).toBe(10);
  });

  it("truncates a fractional value", () => {
    expect(resolveLimit("10.9")).toBe(10);
  });

  it("caps at MAX_RECORD_LIMIT no matter how large the request", () => {
    expect(resolveLimit("999999")).toBe(MAX_RECORD_LIMIT);
    expect(resolveLimit(String(MAX_RECORD_LIMIT + 1))).toBe(MAX_RECORD_LIMIT);
  });

  it("never allows an unlimited query", () => {
    expect(resolveLimit(null)).toBeLessThanOrEqual(MAX_RECORD_LIMIT);
    expect(resolveLimit("Infinity")).toBeLessThanOrEqual(MAX_RECORD_LIMIT);
  });
});

describe("resolveOffset", () => {
  it("returns 0 when the value is missing", () => {
    expect(resolveOffset(null)).toBe(0);
  });

  it("returns 0 for non-numeric or negative values", () => {
    expect(resolveOffset("not-a-number")).toBe(0);
    expect(resolveOffset("-1")).toBe(0);
  });

  it("honors a valid value", () => {
    expect(resolveOffset("50")).toBe(50);
  });
});
