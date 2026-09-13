import { describe, expect, it } from "vitest";
import { GENERATE_BUILD_SYSTEM_PROMPT, GENERATE_APP_SYSTEM_PROMPT } from "../../lib/generation-prompts";

// Regression coverage for the BarberBook finding: Barber had a required
// relationship to a generic "User" entity that no generated page could ever
// populate, because neither generation prompt clarified that Abiora's own
// authentication/ownership is separate from the product's own data model.
// These assertions guard the disambiguating instructions so they can't be
// silently removed in a future prompt edit.

describe("GENERATE_BUILD_SYSTEM_PROMPT", () => {
  it("clarifies that Abiora's own authentication/ownership is not the product's data model", () => {
    expect(GENERATE_BUILD_SYSTEM_PROMPT).toMatch(/abiora itself already provides authentication/i);
    expect(GENERATE_BUILD_SYSTEM_PROMPT).toMatch(/not a request to design a generic .user.\/.account.\/.owner. table/i);
  });

  it("instructs against inventing a generic user entity absent an explicit end-user requirement", () => {
    expect(GENERATE_BUILD_SYSTEM_PROMPT).toMatch(/do not add a generic user-account entity/i);
    expect(GENERATE_BUILD_SYSTEM_PROMPT).toMatch(/end-user\/customer records/i);
  });

  it("still specifies the required build-plan JSON structure", () => {
    expect(GENERATE_BUILD_SYSTEM_PROMPT).toContain('"productName"');
    expect(GENERATE_BUILD_SYSTEM_PROMPT).toContain('"dataModel"');
    expect(GENERATE_BUILD_SYSTEM_PROMPT).toContain('"apiRoutes"');
  });
});

describe("GENERATE_APP_SYSTEM_PROMPT", () => {
  it("clarifies that Abiora's own authentication/ownership is not the product's data model", () => {
    expect(GENERATE_APP_SYSTEM_PROMPT).toMatch(/abiora itself already provides authentication/i);
    expect(GENERATE_APP_SYSTEM_PROMPT).toMatch(/do not invent a generic .user.\/.account.\/.owner. database entity/i);
  });

  it("requires every relationship target to be reachable through a generated page", () => {
    expect(GENERATE_APP_SYSTEM_PROMPT).toMatch(/must be an entity the generated pages actually let the founder create/i);
    expect(GENERATE_APP_SYSTEM_PROMPT).toMatch(/do not create a required relationship to an entity that has no corresponding page/i);
  });

  it("still specifies the required application blueprint JSON structure", () => {
    expect(GENERATE_APP_SYSTEM_PROMPT).toContain('"projectName"');
    expect(GENERATE_APP_SYSTEM_PROMPT).toContain('"database"');
    expect(GENERATE_APP_SYSTEM_PROMPT).toContain('"pages"');
  });
});
