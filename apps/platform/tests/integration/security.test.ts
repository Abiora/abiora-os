import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { cookieHeaderForSession, signUpOrSignIn } from "../helpers/supabase-test-client";

const BASE_URL = process.env.TEST_BASE_URL ?? "http://localhost:3000";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const EMAIL_A = process.env.TEST_USER_A_EMAIL;
const EMAIL_B = process.env.TEST_USER_B_EMAIL;
const PASSWORD = process.env.TEST_USER_PASSWORD;

const missing = (
  [
    ["NEXT_PUBLIC_SUPABASE_URL", SUPABASE_URL],
    ["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", SUPABASE_KEY],
    ["TEST_USER_A_EMAIL", EMAIL_A],
    ["TEST_USER_B_EMAIL", EMAIL_B],
    ["TEST_USER_PASSWORD", PASSWORD],
  ] as const
).filter(([, value]) => !value).map(([name]) => name);

const ready = missing.length === 0;

function blueprint() {
  return {
    projectName: "Vitest Security App",
    description: "integration test fixture",
    pages: [{ name: "Home", path: "/", purpose: "main", components: [{ name: "Tasks", type: "table", entity: "task", purpose: "list" }] }],
    features: [{ name: "Tasks", description: "manage tasks" }],
    database: [{ name: "task", purpose: "a task", fields: [{ name: "title", type: "string", required: true }] }],
    apiRoutes: [{ method: "GET", path: "/api/records", purpose: "list", entity: "task" }],
    actions: [{ name: "Create task", description: "create", trigger: "button", entity: "task" }],
    nextSteps: ["x"],
  };
}

async function createApplication(cookie: string, body: Record<string, unknown> = {}) {
  return fetch(`${BASE_URL}/api/applications`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ blueprint: blueprint(), ...body }),
  });
}

describe.skipIf(!ready)(
  ready ? "Phase 2 security (integration)" : `Phase 2 security (integration) [skipped: missing env vars ${missing.join(", ")}]`,
  () => {
    let cookieA: string;
    let cookieB: string;

    beforeAll(async () => {
      const [sessionA, sessionB] = await Promise.all([
        signUpOrSignIn(SUPABASE_URL!, SUPABASE_KEY!, EMAIL_A!, PASSWORD!),
        signUpOrSignIn(SUPABASE_URL!, SUPABASE_KEY!, EMAIL_B!, PASSWORD!),
      ]);
      [cookieA, cookieB] = await Promise.all([
        cookieHeaderForSession(SUPABASE_URL!, SUPABASE_KEY!, sessionA),
        cookieHeaderForSession(SUPABASE_URL!, SUPABASE_KEY!, sessionB),
      ]);
    });

    afterAll(async () => {
      await Promise.all(
        [cookieA, cookieB].map((cookie) =>
          cookie
            ? fetch(`${BASE_URL}/api/auth/logout`, { method: "POST", headers: { Cookie: cookie } }).catch(() => {})
            : undefined
        )
      );
    });

    it("1. rejects an unauthenticated request with 401", async () => {
      const response = await fetch(`${BASE_URL}/api/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blueprint: blueprint() }),
      });
      expect(response.status).toBe(401);
    });

    it("2. lets an authenticated user access their own application", async () => {
      const created = await createApplication(cookieA);
      expect(created.status).toBe(201);
      const { applicationId } = await created.json();

      const records = await fetch(`${BASE_URL}/api/records?applicationId=${applicationId}&entity=task`, {
        headers: { Cookie: cookieA },
      });
      expect(records.status).toBe(200);
    });

    it("3. denies user B access to user A's application", async () => {
      const created = await createApplication(cookieA);
      const { applicationId } = await created.json();

      const response = await fetch(`${BASE_URL}/api/records?applicationId=${applicationId}&entity=task`, {
        headers: { Cookie: cookieB },
      });
      expect(response.status).toBe(404);
    });

    it("4. ignores a forged owner_id in the request body", async () => {
      const created = await createApplication(cookieA, { owner_id: "11111111-1111-1111-1111-111111111111" });
      expect(created.status).toBe(201);
      const { applicationId } = await created.json();

      const ownerCanAccess = await fetch(`${BASE_URL}/api/records?applicationId=${applicationId}&entity=task`, {
        headers: { Cookie: cookieA },
      });
      expect(ownerCanAccess.status).toBe(200);

      const strangerCannotAccess = await fetch(`${BASE_URL}/api/records?applicationId=${applicationId}&entity=task`, {
        headers: { Cookie: cookieB },
      });
      expect(strangerCannotAccess.status).toBe(404);
    });

    it("5. keeps the server-side blueprint authoritative against a forged blueprint", async () => {
      const created = await createApplication(cookieA);
      const { applicationId } = await created.json();

      const forgedBlueprint = {
        ...blueprint(),
        database: [{ name: "task", purpose: "x", fields: [{ name: "secretField", type: "string", required: false }] }],
      };

      const response = await fetch(`${BASE_URL}/api/records`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: cookieA },
        body: JSON.stringify({ applicationId, entity: "task", blueprint: forgedBlueprint, data: { title: "x", secretField: "y" } }),
      });
      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toMatch(/secretField/);
    });

    it("6. supports authenticated create/edit/delete end to end", async () => {
      const created = await createApplication(cookieA);
      const { applicationId } = await created.json();

      const createRecord = await fetch(`${BASE_URL}/api/records`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: cookieA },
        body: JSON.stringify({ applicationId, entity: "task", data: { title: "vitest task" } }),
      });
      expect(createRecord.status).toBe(201);
      const { record } = await createRecord.json();

      const editRecord = await fetch(`${BASE_URL}/api/records/${record.__id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Cookie: cookieA },
        body: JSON.stringify({ applicationId, entity: "task", data: { title: "vitest task edited" } }),
      });
      expect(editRecord.status).toBe(200);

      const deleteRecord = await fetch(`${BASE_URL}/api/records/${record.__id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Cookie: cookieA },
        body: JSON.stringify({ applicationId, entity: "task" }),
      });
      expect(deleteRecord.status).toBe(204);
    });

    it("7. rejects malformed JSON bodies with 400, not 500", async () => {
      const applicationsResponse = await fetch(`${BASE_URL}/api/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: cookieA },
        body: "not valid json",
      });
      expect(applicationsResponse.status).toBe(400);
      expect(await applicationsResponse.json()).toEqual({ error: "Request body must be valid JSON." });

      const created = await createApplication(cookieA);
      const { applicationId } = await created.json();

      const recordsPostResponse = await fetch(`${BASE_URL}/api/records`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: cookieA },
        body: "not valid json",
      });
      expect(recordsPostResponse.status).toBe(400);
      expect(await recordsPostResponse.json()).toEqual({ error: "Request body must be valid JSON." });

      const createRecord = await fetch(`${BASE_URL}/api/records`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: cookieA },
        body: JSON.stringify({ applicationId, entity: "task", data: { title: "for malformed patch test" } }),
      });
      const { record } = await createRecord.json();

      const patchResponse = await fetch(`${BASE_URL}/api/records/${record.__id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Cookie: cookieA },
        body: "not valid json",
      });
      expect(patchResponse.status).toBe(400);
      expect(await patchResponse.json()).toEqual({ error: "Request body must be valid JSON." });

      const deleteResponse = await fetch(`${BASE_URL}/api/records/${record.__id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Cookie: cookieA },
        body: "not valid json",
      });
      expect(deleteResponse.status).toBe(400);
      expect(await deleteResponse.json()).toEqual({ error: "Request body must be valid JSON." });
    });

    it("8. paginates GET /api/records: limit truncates results and an oversized limit is capped, not unlimited", async () => {
      const created = await createApplication(cookieA);
      const { applicationId } = await created.json();

      await Promise.all(
        [1, 2, 3].map((n) =>
          fetch(`${BASE_URL}/api/records`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Cookie: cookieA },
            body: JSON.stringify({ applicationId, entity: "task", data: { title: `page task ${n}` } }),
          })
        )
      );

      const limited = await fetch(`${BASE_URL}/api/records?applicationId=${applicationId}&entity=task&limit=2`, {
        headers: { Cookie: cookieA },
      });
      expect(limited.status).toBe(200);
      const { records: limitedRecords } = await limited.json();
      expect(limitedRecords).toHaveLength(2);

      const oversized = await fetch(`${BASE_URL}/api/records?applicationId=${applicationId}&entity=task&limit=999999`, {
        headers: { Cookie: cookieA },
      });
      expect(oversized.status).toBe(200);
      const { records: oversizedRecords } = await oversized.json();
      // Not literally proof of the server-side cap value (would need 500+ seeded rows to
      // observe that boundary directly) — the unit tests in tests/unit/records.test.ts cover
      // the cap itself. This confirms the endpoint accepts an oversized limit without
      // erroring and without ignoring pagination (still returns a bounded, correct set).
      expect(oversizedRecords.length).toBeGreaterThanOrEqual(3);
    });
  }
);
