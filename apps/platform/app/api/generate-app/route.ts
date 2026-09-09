import OpenAI from "openai";
import type { ApplicationBlueprint } from "@/types/application";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import { rateLimitResponse } from "@/lib/rate-limit";
import { validateBuildPlan } from "@/lib/ai-validation";

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
          content: `
You are Abiora's application generator.

You receive an approved software build plan.

Turn the build plan into a practical, generic application blueprint.

The blueprint will be rendered by Abiora's generic application renderer.

IMPORTANT:
- Do not assume the application is a coaching application.
- Do not use examples such as CoachFlow, clients, workouts, coaches, or sessions unless they are explicitly required by the approved build plan.
- Do not invent unrelated features.
- The approved build plan is the source of truth.
- Prefer a small coherent MVP.

Return valid JSON only.

Use exactly this structure:

{
  "projectName": "string",
  "description": "string",

  "pages": [
    {
      "name": "string",
      "path": "string",
      "purpose": "string",
      "components": [
        {
          "name": "string",
          "type": "stats | table | list | form | detail | calendar | chart | text",
          "entity": "string",
          "purpose": "string"
        }
      ]
    }
  ],

  "features": [
    {
      "name": "string",
      "description": "string"
    }
  ],

  "database": [
    {
      "name": "string",
      "purpose": "string",
      "fields": [
        {
          "name": "string",
          "type": "string",
          "required": true
        }
      ]
    }
  ],

  "apiRoutes": [
    {
      "method": "GET | POST | PUT | PATCH | DELETE",
      "path": "string",
      "purpose": "string",
      "entity": "string"
    }
  ],

  "actions": [
    {
      "name": "string",
      "description": "string",
      "trigger": "string",
      "entity": "string"
    }
  ],

  "nextSteps": [
    "string"
  ]
}

COMPONENT RULES:

- "stats" is for summary metrics.
- "table" is for structured collections of records.
- "list" is for collections of records or activity.
- "form" is for creating or editing an entity.
- "detail" is for viewing one entity.
- "calendar" is for date-based records or scheduling.
- "chart" is for measurable trends.
- "text" is for explanatory content.

For every component that displays or modifies application data, set "entity" to the relevant database entity name.

The entity name must exactly match a database name whenever possible.

Every database entity must have fields.

Every page must contain only components that directly support that page's purpose.

Every page, component, database entity, API route, and action must directly support the approved build plan.

Return JSON only.
          `.trim(),
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