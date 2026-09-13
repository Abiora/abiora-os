import { describe, expect, it } from "vitest";
import { recordLabel, relation } from "../../app/generated/page";

// Regression coverage for the Maintainly finding: a relationship field's
// target is often declared through its type (reference:Tenant,
// relationship:Vendor) rather than its name (currentTenant, assignedVendor),
// and an entity like Unit with no name/title-pattern field must not fall
// back to displaying one of its own relationship fields as a "label".
const tenant = { name: "Tenant", purpose: "a tenant", fields: [{ name: "firstName", type: "string", required: true }] };
const customer = { name: "Customer", purpose: "a customer", fields: [{ name: "name", type: "string", required: true }] };
const vendor = { name: "Vendor", purpose: "a vendor", fields: [{ name: "name", type: "string", required: true }] };
const order = { name: "Order", purpose: "an order", fields: [{ name: "total", type: "number", required: true }] };
const workOrder = { name: "WorkOrder", purpose: "a work order", fields: [{ name: "summary", type: "string", required: true }] };
const barber = { name: "Barber", purpose: "a barber", fields: [{ name: "name", type: "string", required: true }] };

describe("relation", () => {
  it("resolves a declared 'reference:Tenant' type to the Tenant entity", () => {
    expect(relation({ name: "someField", type: "reference:Tenant", required: false }, [tenant, customer])).toEqual(tenant);
  });

  it("resolves a declared 'relationship:Customer' type to the Customer entity", () => {
    expect(relation({ name: "someField", type: "relationship:Customer", required: false }, [tenant, customer])).toEqual(customer);
  });

  it("detects currentTenant via its declared type even though the field name doesn't say Tenant", () => {
    expect(relation({ name: "currentTenant", type: "reference:Tenant", required: false }, [tenant, customer])).toEqual(tenant);
  });

  it("detects assignedVendor via its declared type even though the field name doesn't say Vendor", () => {
    expect(relation({ name: "assignedVendor", type: "reference:Vendor", required: false }, [vendor, customer])).toEqual(vendor);
  });

  it("does not let a declared 'reference:Order' incorrectly match a WorkOrder entity", () => {
    const field = { name: "sourceOrder", type: "reference:Order", required: false };
    expect(relation(field, [order, workOrder])).toEqual(order);
    expect(relation(field, [workOrder])).toBeUndefined();
  });

  it("still resolves customerId/barberId-style fields via the name heuristic when the type has no colon", () => {
    expect(relation({ name: "customerId", type: "string", required: false }, [customer, vendor])).toEqual(customer);
    expect(relation({ name: "barberId", type: "uuid", required: false }, [barber, customer])).toEqual(barber);
  });
});

describe("recordLabel", () => {
  it("prefers unitIdentifier over the building relationship field when Unit has no name-pattern field", () => {
    const building = { name: "Building", purpose: "a building", fields: [{ name: "address", type: "string", required: true }] };
    const unit = {
      name: "Unit",
      purpose: "a rental unit",
      fields: [
        { name: "building", type: "reference:Building", required: true },
        { name: "unitIdentifier", type: "string", required: true },
        { name: "occupancyStatus", type: "string", required: true },
        { name: "currentTenant", type: "reference:Tenant", required: false },
        { name: "accessNotes", type: "text", required: false },
      ],
    };
    const record = {
      __id: "unit-1",
      building: "11111111-1111-4111-8111-111111111111",
      unitIdentifier: "Unit 4B",
      occupancyStatus: "Occupied",
      currentTenant: "22222222-2222-4222-8222-222222222222",
      accessNotes: "",
    };
    expect(recordLabel(record, unit, [building, tenant, unit])).toBe("Unit 4B");
  });
});
