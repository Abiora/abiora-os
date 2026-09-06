import { randomUUID } from "crypto";
import { getApplicationBlueprint } from "@/lib/applications";
import { getDatabase } from "@/lib/database";
import { entityForBlueprint, isApplicationId, resolveLimit, resolveOffset, toPublicRecord, validateRecordData } from "@/lib/records";
import { getAuthenticatedUser } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const applicationId = searchParams.get("applicationId");
  const entityName = searchParams.get("entity");
  if (!isApplicationId(applicationId) || !entityName) return Response.json({ error: "A valid applicationId and entity are required." }, { status: 400 });
  const limit = resolveLimit(searchParams.get("limit"));
  const offset = resolveOffset(searchParams.get("offset"));
  try {
    const user = await getAuthenticatedUser();
    if (!user) return Response.json({ error: "Authentication is required." }, { status: 401 });
    const blueprint = await getApplicationBlueprint(applicationId, user.id);
    if (!blueprint) return Response.json({ error: "Application not found." }, { status: 404 });
    const entity = entityForBlueprint(blueprint, entityName);
    if (!entity) return Response.json({ error: "The entity is not available in this application." }, { status: 400 });
    const result = await getDatabase().query<{ record_id: string; data: Record<string, string | number | boolean | null> }>(
      "SELECT record_id, data FROM generated_records WHERE application_id = $1 AND entity_name = $2 ORDER BY created_at DESC LIMIT $3 OFFSET $4",
      [applicationId, entity.name, limit, offset]
    );
    return Response.json({ records: result.rows.map(toPublicRecord) });
  } catch (error) {
    console.error("Load generated records error:", error);
    return Response.json({ error: "Could not load records." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return Response.json({ error: "Authentication is required." }, { status: 401 });
    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "Request body must be valid JSON." }, { status: 400 });
    }
    const { applicationId, entity: entityName, data } = body ?? {};
    if (!isApplicationId(applicationId)) return Response.json({ error: "A valid applicationId is required." }, { status: 400 });
    const blueprint = await getApplicationBlueprint(applicationId, user.id);
    if (!blueprint) return Response.json({ error: "Application not found." }, { status: 404 });
    const entity = entityForBlueprint(blueprint, entityName);
    if (!entity) return Response.json({ error: "The entity is not available in this application." }, { status: 400 });
    const validated = await validateRecordData(entity, blueprint.database, applicationId, data);
    if ("error" in validated) return Response.json(validated, { status: 400 });
    const recordId = randomUUID();
    const result = await getDatabase().query<{ record_id: string; data: typeof validated.data }>("INSERT INTO generated_records (application_id, entity_name, record_id, data) VALUES ($1, $2, $3, $4::jsonb) RETURNING record_id, data", [applicationId, entity.name, recordId, JSON.stringify(validated.data)]);
    return Response.json({ record: toPublicRecord(result.rows[0]) }, { status: 201 });
  } catch (error) {
    console.error("Create generated record error:", error);
    return Response.json({ error: "Could not create record." }, { status: 500 });
  }
}
