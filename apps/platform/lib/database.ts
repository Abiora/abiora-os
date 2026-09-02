import { Pool } from "pg";
import { SUPABASE_ROOT_CA } from "@/lib/supabase-ca";

declare global {
  var abioraDatabasePool: Pool | undefined;
}

export function getDatabase() {
  if (global.abioraDatabasePool) return global.abioraDatabasePool;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not configured.");
  const pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: true, ca: SUPABASE_ROOT_CA } : undefined,
    // Conservative for a single cached pool per app instance talking to the
    // Supabase Session Pooler: max mirrors pg's own default (bounds worst-case
    // connections per instance now that the pool is reused rather than
    // recreated per request); idleTimeoutMillis proactively recycles unused
    // connections well before the pooler's own idle timeout would, so we
    // never try to use one it has silently dropped; connectionTimeoutMillis
    // fails a hung connection attempt fast instead of hanging the request
    // until the platform's own timeout kills it.
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });
  pool.on("error", (error) => {
    console.error("Postgres pool error:", error);
  });
  global.abioraDatabasePool = pool;
  return pool;
}
