import { getApplicationBlueprint } from "@/lib/applications";
import { getDatabase } from "@/lib/database";
import { entityForBlueprint, isApplicationId, toPublicRecord, validateRecordData } from "@/lib/records";
import { getAuthenticatedUser } from "@/lib/supabase/server";

export const runtime = "nodejs";
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function update(request: Request, context: { params: Promise<{ recordId: string }> }) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return Response.json({ error: "Authentication is required." }, { status: 401 });
    const { recordId } = await context.params;
    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "Request body must be valid JSON." }, { status: 400 });
    }
    const { applicationId, entity: entityName, data } = body ?? {};
    if (!uuid.test(recordId) || !isApplicationId(applicationId)) return Response.json({ error: "A valid applicationId and record ID are required." }, { status: 400 });
    const blueprint = await getApplicationBlueprint(applicationId, user.id);
    if (!blueprint) return Response.json({ error: "Application not found." }, { status: 404 });
    const entity = entityForBlueprint(blueprint, entityName);
    if (!entity) return Response.json({ error: "The entity is not available in this application." }, { status: 400 });
    const existing = await getDatabase().query<{ data: Record<string, string | number | boolean | null> }>("SELECT data FROM generated_records WHERE application_id = $1 AND entity_name = $2 AND record_id = $3", [applicationId, entity.name, recordId]);
    const validated = await validateRecordData(entity, blueprint.database, applicationId, data, existing.rows[0]?.data ?? null);
    if ("error" in validated) return Response.json(validated, { status: 400 });
    const result = await getDatabase().query<{ record_id: string; data: typeof validated.data }>("UPDATE generated_records SET data = $1::jsonb, updated_at = NOW() WHERE application_id = $2 AND entity_name = $3 AND record_id = $4 RETURNING record_id, data", [JSON.stringify(validated.data), applicationId, entity.name, recordId]);
    if (!result.rows[0]) return Response.json({ error: "Record not found." }, { status: 404 });
    return Response.json({ record: toPublicRecord(result.rows[0]) });
  } catch (error) {
    console.error("Update generated record error:", error);
    return Response.json({ error: "Could not update record." }, { status: 500 });
  }
}

export const PATCH = update;
export const PUT = update;

export async function DELETE(request: Request, context: { params: Promise<{ recordId: string }> }) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return Response.json({ error: "Authentication is required." }, { status: 401 });
    const { recordId } = await context.params;
    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "Request body must be valid JSON." }, { status: 400 });
    }
    const { applicationId, entity: entityName } = body ?? {};
    if (!uuid.test(recordId) || !isApplicationId(applicationId) || typeof entityName !== "string") return Response.json({ error: "A valid applicationId, entity, and record ID are required." }, { status: 400 });
    const blueprint = await getApplicationBlueprint(applicationId, user.id);
    if (!blueprint) return Response.json({ error: "Application not found." }, { status: 404 });
    const entity = entityForBlueprint(blueprint, entityName);
    if (!entity) return Response.json({ error: "The entity is not available in this application." }, { status: 400 });
    const result = await getDatabase().query("DELETE FROM generated_records WHERE application_id = $1 AND entity_name = $2 AND record_id = $3 RETURNING record_id", [applicationId, entity.name, recordId]);
    if (!result.rows[0]) return Response.json({ error: "Record not found." }, { status: 404 });
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Delete generated record error:", error);
    return Response.json({ error: "Could not delete record." }, { status: 500 });
  }
}
