import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

type Session = { access_token: string; refresh_token: string };

/**
 * Signs in an existing test user, or signs up a fresh one if that email doesn't exist yet.
 * Tries sign-in first (no email sent) rather than sign-up first: when a project requires
 * email confirmation, signUp attempts an email send even for an already-registered address,
 * which needlessly burns the provider's per-hour send limit on every repeated test run.
 */
export async function signUpOrSignIn(url: string, key: string, email: string, password: string): Promise<Session> {
  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  const signIn = await supabase.auth.signInWithPassword({ email, password });
  if (signIn.data.session) return signIn.data.session;

  const signUp = await supabase.auth.signUp({ email, password });
  if (signUp.data.session) return signUp.data.session;
  if (signUp.error) {
    throw new Error(`Could not sign in (${signIn.error?.message ?? "no session"}) or sign up (${signUp.error.message}) test user.`);
  }
  throw new Error(`Sign-up for test user did not return a session and did not error (email confirmation likely required).`);
}

/** Builds the Cookie header @supabase/ssr's server client expects, using the library's own encoding logic. */
export async function cookieHeaderForSession(url: string, key: string, session: Session): Promise<string> {
  const jar = new Map<string, string>();
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => Array.from(jar.entries()).map(([name, value]) => ({ name, value })),
      setAll: (cookiesToSet) => cookiesToSet.forEach(({ name, value }) => jar.set(name, value)),
    },
  });

  const { error } = await supabase.auth.setSession(session);
  if (error) throw new Error(`Could not build a session cookie: ${error.message}`);

  return Array.from(jar.entries()).map(([name, value]) => `${name}=${value}`).join("; ");
}
