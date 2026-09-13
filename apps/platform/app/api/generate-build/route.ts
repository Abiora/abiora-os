import OpenAI from "openai";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import { rateLimitResponse } from "@/lib/rate-limit";
import { validateArchitecture } from "@/lib/ai-validation";
import { GENERATE_BUILD_SYSTEM_PROMPT } from "@/lib/generation-prompts";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return Response.json({ error: "Authentication is required." }, { status: 401 });

    const limited = rateLimitResponse("generateBuild", user.id);
    if (limited) return limited;

    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "Request body must be valid JSON." }, { status: 400 });
    }

    const validated = validateArchitecture(body?.architecture);
    if ("error" in validated) return Response.json(validated, { status: 400 });
    const { architecture, json: architectureJson } = validated;

    const response = await openai.responses.create({
      model: "gpt-5.6",
      input: [
        {
          role: "system",
          content: GENERATE_BUILD_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: architectureJson,
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
      console.error("Generate build error: AI returned non-JSON output");
      return Response.json(
        { error: "Abiora could not generate a valid build plan. Please try again." },
        { status: 500 }
      );
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