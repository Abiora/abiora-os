import { getDatabase } from "@/lib/database";

export const runtime = "nodejs";

export async function GET() {
  try {
    await getDatabase().query("SELECT 1");
    return Response.json({ status: "ok" });
  } catch (error) {
    console.error("Health check failed:", error);
    return Response.json({ status: "error" }, { status: 503 });
  }
}
