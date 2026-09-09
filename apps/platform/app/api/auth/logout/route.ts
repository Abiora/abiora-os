import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  // A redirect (rather than a JSON body) lets this endpoint double as a
  // plain HTML <form> submission target, so logout keeps working even if
  // client-side JS never attaches the fetch-based onClick handler.
  // Existing fetch() callers are unaffected: they don't read the response
  // body and fetch() follows redirects transparently by default.
  return Response.redirect(new URL("/login", request.url), 303);
}
