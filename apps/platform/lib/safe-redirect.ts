/**
 * Validates a user-supplied "next" redirect target so it can only ever point
 * back into this app -- never off-site. Used everywhere a `?next=` query
 * param is read and then used as a post-login/post-confirmation redirect
 * target (login, signup, auth/confirm), to prevent open-redirect phishing
 * (e.g. a crafted /login?next=https://evil.example link that sends a victim
 * to an attacker page immediately after they genuinely authenticate).
 *
 * Only a same-origin path beginning with exactly one "/" is accepted:
 *  - "//evil.example" (protocol-relative) is rejected
 *  - "https://evil.example" (absolute) is rejected
 *  - "javascript:..." and any other scheme is rejected
 *  - malformed or empty values fall back to "/"
 * Legitimate internal paths with query strings/hashes (e.g.
 * "/generated?applicationId=123") are preserved exactly.
 */
export function safeNextPath(value: unknown, fallback = "/"): string {
  if (typeof value !== "string" || value.length === 0) return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;

  try {
    const resolved = new URL(value, "http://localhost");
    if (resolved.origin !== "http://localhost") return fallback;
    return `${resolved.pathname}${resolved.search}${resolved.hash}` || fallback;
  } catch {
    return fallback;
  }
}
