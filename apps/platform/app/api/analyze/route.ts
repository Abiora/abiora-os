import OpenAI from "openai";
import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import { rateLimitResponse } from "@/lib/rate-limit";
import { validateIdea } from "@/lib/ai-validation";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: "Authentication is required." }, { status: 401 });

    const limited = rateLimitResponse("analyze", user.id);
    if (limited) return limited;

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
    }

    const validated = validateIdea(body?.idea);
    if ("error" in validated) return NextResponse.json(validated, { status: 400 });
    const { idea } = validated;

    const response = await openai.responses.create({
      model: "gpt-5.4-mini",
      instructions: `
You are Abiora Architect, an expert software product architect.

Your job is to turn a founder's rough product idea into a strict,
practical, production-minded software plan.

Do not simply agree with the founder.
Identify what the product actually needs.
Avoid unnecessary features and overengineering.
Focus on the smallest strong product that can become a real business.

Return ONLY valid JSON using exactly this structure:

{
  "productName": "Short suggested product name",
  "summary": "Clear one or two sentence description",
  "users": [
    {
      "name": "User type",
      "description": "What this user does"
    }
  ],
  "features": [
    "Feature",
    "Feature"
  ],
  "dataModel": [
    "Entity",
    "Entity"
  ],
  "foundation": {
    "authentication": true,
    "database": true,
    "rolesAndPermissions": true,
    "billing": false,
    "email": false,
    "errorHandling": true,
    "testing": true
  },
  "recommendations": [
    "Recommendation",
    "Recommendation"
  ]
}

Rules:
- Suggest 2 to 5 meaningful user types.
- Suggest 5 to 8 core MVP features.
- Suggest the important data entities.
- Billing should only be true if the business actually needs payments or subscriptions.
- Email should only be true when notifications, invitations, verification, reminders, or transactional messages are useful.
- Keep recommendations concise.
- Do not include markdown.
- Do not include text outside the JSON object.
      `,
      input: idea,
    });

    const text = response.output_text;

    if (!text) {
      throw new Error("The AI returned an empty response.");
    }

    const analysis = JSON.parse(text);

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Abiora analysis error:", error);

    return NextResponse.json(
      {
        error: "Abiora could not analyze the idea.",
      },
      { status: 500 }
    );
  }
}