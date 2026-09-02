-- record_id is already the primary key on generated_records (globally
-- unique on its own), so the composite UNIQUE constraint originally defined
-- in migration 001 adds write overhead without adding a real guarantee.
--
-- IF EXISTS makes this safe across environments: on a database bootstrapped
-- from migrations 001-004 from scratch, the constraint exists and this
-- removes it. On this project's current dev database, verified directly
-- against the live schema before writing this migration, the constraint was
-- never actually created (historical drift from before migrations were
-- formalized), so this is a no-op there.
ALTER TABLE generated_records
  DROP CONSTRAINT IF EXISTS generated_records_application_entity_record_key;
