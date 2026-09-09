import OpenAI from "openai";
import { getAuthenticatedUser } from "@/lib/supabase/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return Response.json({ error: "Authentication is required." }, { status: 401 });

    const body = await request.json();

    if (!body?.architecture) {
      return Response.json(
        { error: "Architecture is required." },
        { status: 400 }
      );
    }

    const architecture = body.architecture;

    const response = await openai.responses.create({
      model: "gpt-5.6",
      input: [
        {
          role: "system",
          content: `
You are Abiora's software architect.

Turn the approved architecture into a concise MVP build plan.

The approved architecture is the source of truth.

IMPORTANT:
- Preserve the exact approved product name.
- The build plan MUST contain a "productName" field.
- "productName" MUST exactly equal the approved architecture's "productName".
- Never use an old example product name.
- Never use "CoachFlow" unless the approved architecture itself says "CoachFlow".
- Do not invent unrelated features.
- Keep the build plan focused on the approved MVP.

Return valid JSON only.

Use this structure:

{
  "productName": "string",
  "overview": "string",
  "scope": ["string"],
  "pages": ["string"],
  "features": ["string"],
  "dataModel": ["string"],
  "apiRoutes": ["string"],
  "actions": ["string"],
  "nextSteps": ["string"]
}

Return JSON only.
          `.trim(),
        },
        {
          role: "user",
          content: JSON.stringify(architecture),
        },
      ],
    });

    const text = response.output_text?.trim();

    if (!text) {
      return Response.json(
        { error: "AI returned an empty build plan." },
        { status: 500 }
      );
    }

    let buildPlan;

    try {
      buildPlan = JSON.parse(text);
    } catch {
      buildPlan = {
        overview: text,
      };
    }

    /*
     * The approved architecture is the source of truth.
     * Never allow the AI to change the product identity.
     */
    buildPlan.productName = architecture.productName;

    return Response.json({
      success: true,
      buildPlan,
    });
  } catch (error) {
    console.error("Generate build error:", error);

    return Response.json(
      { error: "Failed to generate the build plan." },
      { status: 500 }
    );
  }
}