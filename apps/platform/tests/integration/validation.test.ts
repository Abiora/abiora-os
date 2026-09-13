import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { cookieHeaderForSession, signUpOrSignIn } from "../helpers/supabase-test-client";

const BASE_URL = process.env.TEST_BASE_URL ?? "http://localhost:3000";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const EMAIL_A = process.env.TEST_USER_A_EMAIL;
const PASSWORD = process.env.TEST_USER_PASSWORD;

const missing = (
  [
    ["NEXT_PUBLIC_SUPABASE_URL", SUPABASE_URL],
    ["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", SUPABASE_KEY],
    ["TEST_USER_A_EMAIL", EMAIL_A],
    ["TEST_USER_PASSWORD", PASSWORD],
  ] as const
).filter(([, value]) => !value).map(([name]) => name);

const ready = missing.length === 0;

// A "project" and a "task" entity, where task.projectId names-match "project" —
// the same relation() convention app/generated/page.tsx uses to render a dropdown.
function blueprint() {
  return {
    projectName: "Vitest Validation App",
    description: "field-type and relationship-validation fixture",
    pages: [{ name: "Home", path: "/", purpose: "main", components: [{ name: "Tasks", type: "table", entity: "task", purpose: "list" }] }],
    features: [{ name: "Tasks", description: "manage tasks" }],
    database: [
      { name: "project", purpose: "a project", fields: [{ name: "name", type: "string", required: true }] },
      {
        name: "task",
        purpose: "a task",
        fields: [
          { name: "title", type: "string", required: true },
          { name: "done", type: "boolean", required: false },
          { name: "estimateHours", type: "number", required: false },
          { name: "projectId", type: "string", required: false },
        ],
      },
    ],
    apiRoutes: [{ method: "GET", path: "/api/records", purpose: "list", entity: "task" }],
    actions: [{ name: "Create task", description: "create", trigger: "button", entity: "task" }],
    nextSteps: ["x"],
  };
}

describe.skipIf(!ready)(
  ready ? "Field-type and relationship validation (integration)" : `Field-type and relationship validation (integration) [skipped: missing env vars ${missing.join(", ")}]`,
  () => {
    let cookie: string;
    let applicationId: string;

    beforeAll(async () => {
      const session = await signUpOrSignIn(SUPABASE_URL!, SUPABASE_KEY!, EMAIL_A!, PASSWORD!);
      cookie = await cookieHeaderForSession(SUPABASE_URL!, SUPABASE_KEY!, session);

      const created = await fetch(`${BASE_URL}/api/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: cookie },
        body: JSON.stringify({ blueprint: blueprint() }),
      });
      const body = await created.json();
      applicationId = body.applicationId;
    });

    afterAll(async () => {
      if (cookie) await fetch(`${BASE_URL}/api/auth/logout`, { method: "POST", headers: { Cookie: cookie } }).catch(() => {});
    });

    it("rejects a string value for a boolean-typed field", async () => {
      const response = await fetch(`${BASE_URL}/api/records`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: cookie },
        body: JSON.stringify({ applicationId, entity: "task", data: { title: "x", done: "yes" } }),
      });
      expect(response.status).toBe(400);
      expect((await response.json()).error).toMatch(/must be a boolean/);
    });

    it("rejects a string value for a number-typed field", async () => {
      const response = await fetch(`${BASE_URL}/api/records`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: cookie },
        body: JSON.stringify({ applicationId, entity: "task", data: { title: "x", estimateHours: "a lot" } }),
      });
      expect(response.status).toBe(400);
      expect((await response.json()).error).toMatch(/must be a number/);
    });

    it("accepts correctly-typed boolean and number values", async () => {
      const response = await fetch(`${BASE_URL}/api/records`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: cookie },
        body: JSON.stringify({ applicationId, entity: "task", data: { title: "x", done: true, estimateHours: 3 } }),
      });
      expect(response.status).toBe(201);
    });

    it("rejects a relationship field value that does not correspond to an existing record", async () => {
      const response = await fetch(`${BASE_URL}/api/records`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: cookie },
        body: JSON.stringify({ applicationId, entity: "task", data: { title: "x", projectId: "00000000-0000-4000-8000-000000000000" } }),
      });
      expect(response.status).toBe(400);
      expect((await response.json()).error).toMatch(/does not exist/);
    });

    it("accepts a relationship field value that points to a real record", async () => {
      const projectRes = await fetch(`${BASE_URL}/api/records`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: cookie },
        body: JSON.stringify({ applicationId, entity: "project", data: { name: "Real Project" } }),
      });
      expect(projectRes.status).toBe(201);
      const projectId = (await projectRes.json()).record.__id;

      const taskRes = await fetch(`${BASE_URL}/api/records`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: cookie },
        body: JSON.stringify({ applicationId, entity: "task", data: { title: "x", projectId } }),
      });
      expect(taskRes.status).toBe(201);
    });

    it("leaves an optional relationship field blank without error", async () => {
      const response = await fetch(`${BASE_URL}/api/records`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: cookie },
        body: JSON.stringify({ applicationId, entity: "task", data: { title: "x", projectId: "" } }),
      });
      expect(response.status).toBe(201);
    });

    describe("stale relationship references on update", () => {
      async function createProject(name: string) {
        const response = await fetch(`${BASE_URL}/api/records`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Cookie: cookie },
          body: JSON.stringify({ applicationId, entity: "project", data: { name } }),
        });
        expect(response.status).toBe(201);
        return ((await response.json()).record as { __id: string }).__id;
      }

      async function createTask(projectId: string) {
        const response = await fetch(`${BASE_URL}/api/records`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Cookie: cookie },
          body: JSON.stringify({ applicationId, entity: "task", data: { title: "Original title", projectId } }),
        });
        expect(response.status).toBe(201);
        return ((await response.json()).record as { __id: string }).__id;
      }

      async function deleteProject(projectId: string) {
        const response = await fetch(`${BASE_URL}/api/records/${projectId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json", Cookie: cookie },
          body: JSON.stringify({ applicationId, entity: "project" }),
        });
        expect(response.status).toBe(204);
      }

      it("allows updating an unrelated field when the stored relationship value has gone stale", async () => {
        const projectId = await createProject("Doomed Project");
        const taskId = await createTask(projectId);
        await deleteProject(projectId);

        const response = await fetch(`${BASE_URL}/api/records/${taskId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Cookie: cookie },
          body: JSON.stringify({ applicationId, entity: "task", data: { title: "Updated title", projectId } }),
        });
        expect(response.status).toBe(200);
        expect((await response.json()).record.title).toBe("Updated title");
      });

      it("still rejects changing a stale relationship to a different nonexistent id", async () => {
        const projectId = await createProject("Doomed Project 2");
        const taskId = await createTask(projectId);
        await deleteProject(projectId);

        const response = await fetch(`${BASE_URL}/api/records/${taskId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Cookie: cookie },
          body: JSON.stringify({ applicationId, entity: "task", data: { title: "x", projectId: "00000000-0000-4000-8000-000000000000" } }),
        });
        expect(response.status).toBe(400);
        expect((await response.json()).error).toMatch(/does not exist/);
      });

      it("accepts changing a stale relationship to a different, valid id", async () => {
        const staleProjectId = await createProject("Doomed Project 3");
        const taskId = await createTask(staleProjectId);
        await deleteProject(staleProjectId);
        const freshProjectId = await createProject("Replacement Project");

        const response = await fetch(`${BASE_URL}/api/records/${taskId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Cookie: cookie },
          body: JSON.stringify({ applicationId, entity: "task", data: { title: "x", projectId: freshProjectId } }),
        });
        expect(response.status).toBe(200);
        expect((await response.json()).record.projectId).toBe(freshProjectId);
      });

      it("still allows clearing an optional relationship to blank on update", async () => {
        const projectId = await createProject("Project To Unlink");
        const taskId = await createTask(projectId);

        const response = await fetch(`${BASE_URL}/api/records/${taskId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Cookie: cookie },
          body: JSON.stringify({ applicationId, entity: "task", data: { title: "x", projectId: "" } }),
        });
        expect(response.status).toBe(200);
        expect((await response.json()).record.projectId).toBe("");
      });

      it("still validates a relationship value that is unchanged but whose target still exists (no regression)", async () => {
        const projectId = await createProject("Still Alive Project");
        const taskId = await createTask(projectId);

        const response = await fetch(`${BASE_URL}/api/records/${taskId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Cookie: cookie },
          body: JSON.stringify({ applicationId, entity: "task", data: { title: "Updated", projectId } }),
        });
        expect(response.status).toBe(200);
        expect((await response.json()).record.projectId).toBe(projectId);
      });

      it("returns 404 for a well-formed but nonexistent record id, not a validation or server error", async () => {
        const response = await fetch(`${BASE_URL}/api/records/00000000-0000-4000-8000-000000000000`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Cookie: cookie },
          body: JSON.stringify({ applicationId, entity: "task", data: { title: "x" } }),
        });
        expect(response.status).toBe(404);
      });
    });
  }
);
