import { describe, expect, it } from "vitest";
import { validateBlueprint } from "../../lib/applications";

function validBlueprint() {
  return {
    projectName: "Test App",
    description: "A test app",
    pages: [
      {
        name: "Home",
        path: "/",
        purpose: "main page",
        components: [{ name: "Tasks", type: "table", entity: "task", purpose: "list tasks" }],
      },
    ],
    features: [{ name: "Tasks", description: "manage tasks" }],
    database: [
      {
        name: "task",
        purpose: "a task",
        fields: [{ name: "title", type: "string", required: true }],
      },
    ],
    apiRoutes: [{ method: "GET", path: "/api/records", purpose: "list", entity: "task" }],
    actions: [{ name: "Create task", description: "create", trigger: "button", entity: "task" }],
    nextSteps: ["Add auth"],
  };
}

describe("validateBlueprint", () => {
  it("accepts a well-formed blueprint", () => {
    const result = validateBlueprint(validBlueprint());
    expect("blueprint" in result).toBe(true);
  });

  it("rejects a non-object input", () => {
    expect("error" in validateBlueprint(null)).toBe(true);
    expect("error" in validateBlueprint("nope")).toBe(true);
    expect("error" in validateBlueprint([])).toBe(true);
  });

  it("rejects a missing projectName", () => {
    const input = validBlueprint();
    // @ts-expect-error intentionally invalid for the test
    delete input.projectName;
    const result = validateBlueprint(input);
    expect("error" in result && result.error).toMatch(/projectName/);
  });

  it("rejects an empty database array", () => {
    const input = { ...validBlueprint(), database: [] };
    const result = validateBlueprint(input);
    expect("error" in result && result.error).toMatch(/database/);
  });

  it("rejects a database entity with no fields", () => {
    const input = validBlueprint();
    input.database[0].fields = [];
    const result = validateBlueprint(input);
    expect("error" in result && result.error).toMatch(/database/);
  });

  it("rejects a field with an invalid identifier name", () => {
    const input = validBlueprint();
    input.database[0].fields[0].name = "bad name!";
    const result = validateBlueprint(input);
    expect("error" in result && result.error).toMatch(/database/);
  });

  it("rejects a component with an invalid type", () => {
    const input = validBlueprint();
    input.pages[0].components[0].type = "not-a-real-type";
    const result = validateBlueprint(input);
    expect("error" in result && result.error).toMatch(/pages/);
  });

  it("rejects an apiRoute with an invalid HTTP method", () => {
    const input = validBlueprint();
    input.apiRoutes[0].method = "TRACE";
    const result = validateBlueprint(input);
    expect("error" in result && result.error).toMatch(/API routes/);
  });

  it("rejects nextSteps that are not an array of strings", () => {
    const input = { ...validBlueprint(), nextSteps: [1, 2, 3] };
    const result = validateBlueprint(input);
    expect("error" in result && result.error).toMatch(/nextSteps/);
  });
});
