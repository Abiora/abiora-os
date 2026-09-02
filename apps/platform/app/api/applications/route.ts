import { createApplication, validateBlueprint } from "@/lib/applications";
import { getAuthenticatedUser } from "@/lib/supabase/server";

export const runtime = "nodejs";

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

    const validated = validateBlueprint(body?.blueprint);
    if ("error" in validated) return Response.json(validated, { status: 400 });
    const applicationId = await createApplication(validated.blueprint, user.id);
    return Response.json({ applicationId }, { status: 201 });
  } catch (error) {
    console.error("Create application error:", error);
    return Response.json({ error: "Could not create the application." }, { status: 500 });
  }
}
