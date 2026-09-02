import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

type Session = { access_token: string; refresh_token: string };

/** Signs up a fresh test user, or signs in if that email is already registered (repeatable across test runs). */
export async function signUpOrSignIn(url: string, key: string, email: string, password: string): Promise<Session> {
  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  const signUp = await supabase.auth.signUp({ email, password });
  if (signUp.data.session) return signUp.data.session;
  if (signUp.error && !/registered|exists/i.test(signUp.error.message)) {
    throw new Error(`Could not sign up test user: ${signUp.error.message}`);
  }

  const signIn = await supabase.auth.signInWithPassword({ email, password });
  if (signIn.error || !signIn.data.session) {
    throw new Error(`Could not sign in test user: ${signIn.error?.message ?? "no session returned"}`);
  }
  return signIn.data.session;
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
