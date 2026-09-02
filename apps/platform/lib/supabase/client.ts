import { createBrowserClient } from "@supabase/ssr";
import { requireSupabaseValue } from "@/lib/supabase/env";

export function createClient() {
  const url = requireSupabaseValue("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);
  const publishableKey = requireSupabaseValue(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
  return createBrowserClient(url, publishableKey);
}
