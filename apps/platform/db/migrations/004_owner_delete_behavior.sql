-- Replace the owner_id -> auth.users foreign key with one that clears
-- owner_id (ON DELETE SET NULL) instead of blocking the deletion (the
-- default NO ACTION behavior from migration 003). Deleting a Supabase Auth
-- user no longer fails just because they own applications; their
-- applications survive with owner_id cleared instead of being deleted.
--
-- Existing NULL owner_id rows (applications created before ownership
-- existed) are unaffected either way: NULL already satisfies any foreign
-- key constraint, so this change makes no difference to them.
--
-- Idempotent: if the constraint has already been migrated to ON DELETE SET
-- NULL (confdeltype = 'n'), this is a no-op.
DO $$
DECLARE
  existing_constraint text;
BEGIN
  SELECT conname INTO existing_constraint
  FROM pg_constraint
  WHERE conrelid = 'applications'::regclass
    AND confrelid = 'auth.users'::regclass
    AND contype = 'f';

  IF existing_constraint IS NOT NULL AND EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = existing_constraint AND confdeltype = 'n'
  ) THEN
    RETURN;
  END IF;

  IF existing_constraint IS NOT NULL THEN
    EXECUTE format('ALTER TABLE applications DROP CONSTRAINT %I', existing_constraint);
  END IF;

  ALTER TABLE applications
    ADD CONSTRAINT applications_owner_id_fkey
    FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE SET NULL;
END $$;
