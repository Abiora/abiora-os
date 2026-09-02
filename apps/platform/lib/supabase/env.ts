/**
 * Validates an already-read env value and returns it, or throws a clear error naming
 * which variable is missing (never the value). Callers must pass a literal
 * `process.env.NEXT_PUBLIC_X` expression at each call site — Next.js only inlines
 * NEXT_PUBLIC_* variables into the browser bundle when it can statically find that
 * exact literal form; a dynamic `process.env[name]` lookup can't be inlined and
 * silently resolves to undefined client-side.
 */
export function requireSupabaseValue(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`${name} is not configured. Set it in your environment before starting the app.`);
  }
  return value;
}
