"use strict";

// Project refs are not secrets -- they're the public identifier segment of a
// Supabase project's URL/hostname, already visible in every deployed client
// bundle and public API endpoint. Only the password/full connection string
// must never be logged, and nothing here ever does that.
const PROJECT_REFS = {
  staging: "uqxaafevwnvdhbfloonz",
  production: "gzspwksffcpjvzfauqyd",
};

/**
 * Extracts the Supabase project ref from a Postgres connection string,
 * without ever returning (or needing to inspect) the password. Supports both
 * connection string shapes Supabase issues:
 *   - Session Pooler: postgresql://postgres.<ref>:...@aws-...pooler.supabase.com/...
 *   - Direct:         postgresql://postgres:...@db.<ref>.supabase.co/...
 */
function extractProjectRef(databaseUrl) {
  if (!databaseUrl) return null;
  const pooler = databaseUrl.match(/:\/\/postgres\.([a-z0-9]+):/i);
  if (pooler) return pooler[1];
  const direct = databaseUrl.match(/@db\.([a-z0-9]+)\.supabase\.co/i);
  if (direct) return direct[1];
  return null;
}

/**
 * Throws a clear, credential-free error unless `target` is a known
 * environment name and the DATABASE_URL's project ref matches what that
 * name is supposed to point at. Never includes the connection string or any
 * password in the thrown message -- only the (non-secret) project ref.
 */
function assertEnvironmentMatches(target, databaseUrl) {
  const knownTargets = Object.keys(PROJECT_REFS);
  if (!target || !Object.prototype.hasOwnProperty.call(PROJECT_REFS, target)) {
    throw new Error(`A valid --target is required. Pass one of: ${knownTargets.join(", ")}.`);
  }

  const actualRef = extractProjectRef(databaseUrl);
  if (!actualRef) {
    throw new Error("Could not determine the Supabase project ref from DATABASE_URL.");
  }

  const expectedRef = PROJECT_REFS[target];
  if (actualRef !== expectedRef) {
    throw new Error(
      `Refusing to run: --target=${target} expects project ref "${expectedRef}", but DATABASE_URL targets "${actualRef}".`
    );
  }
}

module.exports = { PROJECT_REFS, extractProjectRef, assertEnvironmentMatches };
