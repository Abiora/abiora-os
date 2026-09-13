import OpenAI from "openai";
import type { ApplicationBlueprint } from "@/types/application";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import { rateLimitResponse } from "@/lib/rate-limit";
import { validateBuildPlan } from "@/lib/ai-validation";
import { GENERATE_APP_SYSTEM_PROMPT } from "@/lib/generation-prompts";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return Response.json({ error: "Authentication is required." }, { status: 401 });

    const limited = rateLimitResponse("generateApp", user.id);
    if (limited) return limited;

    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "Request body must be valid JSON." }, { status: 400 });
    }

    const validated = validateBuildPlan(body?.buildPlan);
    if ("error" in validated) return Response.json(validated, { status: 400 });
    const { buildPlan, json: buildPlanJson } = validated;

    const response = await openai.responses.create({
      model: "gpt-5.6",
      input: [
        {
          role: "system",
          content: GENERATE_APP_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: `
Generate the application blueprint from this approved build plan.

IMPORTANT:
- The approved build plan is the source of truth.
- Use the exact approved product name as "projectName".
- Do NOT use "CoachFlow" unless the approved build plan explicitly says CoachFlow.
- Do NOT reuse entities, pages, features, or terminology from previous applications.
- The application must be completely derived from the supplied build plan.

Approved build plan:

${buildPlanJson}
          `.trim(),
        },
      ],
    });

    const text = response.output_text?.trim();

    if (!text) {
      return Response.json(
        { error: "AI returned an empty application blueprint." },
        { status: 500 }
      );
    }

    let application: ApplicationBlueprint;

    try {
      application = JSON.parse(text) as ApplicationBlueprint;
    } catch {
      console.error("Generate application error: AI returned non-JSON output");
      return Response.json(
        { error: "Abiora could not generate a valid application. Please try again." },
        { status: 500 }
      );
    }

    /*
     * The approved build plan remains authoritative
     * for the product name.
     */
    if (application.projectName !== buildPlan.productName) {
      application.projectName = buildPlan.productName as string;
    }

    return Response.json({
      success: true,
      application,
    });
  } catch (error) {
    console.error("Generate application error:", error);

    return Response.json(
      { error: "Failed to generate the application." },
      { status: 500 }
    );
  }
}