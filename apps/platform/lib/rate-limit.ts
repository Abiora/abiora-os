/**
 * In-memory, fixed-window rate limiting for the AI generation endpoints
 * (/api/analyze, /api/generate-build, /api/generate-app).
 *
 * Why in-memory rather than a durable store: adding a rate-limit table would
 * mean a schema change/migration, and adding an external store (Redis/Vercel
 * KV/etc.) would mean a new infrastructure dependency -- both out of scope
 * for this pass. An in-memory counter needs neither, and turns "unlimited"
 * into "bounded" for the common case.
 *
 * Known limitation: state is per serverless instance. On Vercel this means
 * the effective ceiling for a determined, distributed abuser is the chosen
 * limit multiplied by however many instances happen to be warm concurrently,
 * and any limiter state resets on a cold start. This does not make the limit
 * meaningless -- it still caps runaway/scripted use on any single warm path,
 * and it costs nothing to add -- but it is not a precise global limit. A
 * durable, cross-instance store is the correct follow-up if usage data shows
 * this isn't tight enough.
 */

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

// Opportunistic cleanup so the map can't grow without bound across the
// lifetime of a warm instance. Cheap: only runs once the map has grown
// past a threshold, and only does a single pass.
const CLEANUP_THRESHOLD = 5000;
function sweepExpired(now: number) {
  if (buckets.size < CLEANUP_THRESHOLD) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

/** Pure fixed-window limiter: `limit` requests per `windowMs`, keyed by caller. */
export function checkRateLimit(key: string, limit: number, windowMs: number): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  sweepExpired(now);

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (existing.count >= limit) {
    return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)) };
  }

  existing.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

/**
 * Documented per-route limits. Each of these AI calls costs real OpenAI
 * spend, so limits are set to comfortably cover normal iterative use (a
 * single idea -> approved architecture -> build plan -> generated app
 * journey costs exactly one call per route) while firmly bounding runaway
 * or scripted use.
 */
export const RATE_LIMITS = {
  analyze: { limit: 10, windowMs: 15 * 60 * 1000 },
  generateBuild: { limit: 10, windowMs: 15 * 60 * 1000 },
  generateApp: { limit: 10, windowMs: 15 * 60 * 1000 },
} as const satisfies Record<string, { limit: number; windowMs: number }>;

export type RateLimitedRoute = keyof typeof RATE_LIMITS;

/** Returns a 429 Response if `userId` has exceeded the limit for `route`, otherwise null. */
export function rateLimitResponse(route: RateLimitedRoute, userId: string): Response | null {
  const { limit, windowMs } = RATE_LIMITS[route];
  const result = checkRateLimit(`${route}:${userId}`, limit, windowMs);
  if (result.allowed) return null;

  return Response.json(
    { error: "Too many requests. Please wait a few minutes and try again." },
    { status: 429, headers: { "Retry-After": String(result.retryAfterSeconds) } }
  );
}
