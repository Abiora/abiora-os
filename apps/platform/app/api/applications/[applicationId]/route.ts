import { getApplicationBlueprint } from "@/lib/applications";
import { isApplicationId } from "@/lib/records";
import { getAuthenticatedUser } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(request: Request, context: { params: Promise<{ applicationId: string }> }) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return Response.json({ error: "Authentication is required." }, { status: 401 });
    const { applicationId } = await context.params;
    if (!isApplicationId(applicationId)) return Response.json({ error: "A valid applicationId is required." }, { status: 400 });
    const application = await getApplicationBlueprint(applicationId, user.id);
    if (!application) return Response.json({ error: "Application not found." }, { status: 404 });
    return Response.json({ application });
  } catch (error) {
    console.error("Load application error:", error);
    return Response.json({ error: "Could not load this application." }, { status: 500 });
  }
}
