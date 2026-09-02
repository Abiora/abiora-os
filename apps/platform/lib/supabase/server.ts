import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { requireSupabaseValue } from "@/lib/supabase/env";

export async function createClient() {
  const cookieStore = await cookies();
  const url = requireSupabaseValue("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);
  const publishableKey = requireSupabaseValue(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
  return createServerClient(
    url,
    publishableKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Called from a Server Component render, which cannot set cookies.
            // The proxy (apps/platform/proxy.ts) refreshes the session instead.
          }
        },
      },
    }
  );
}

/** Verifies the request's session against the Supabase Auth server and returns the user, or null if unauthenticated. */
export async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
