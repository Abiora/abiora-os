-- owner_id is nullable so this migration does not fail on applications
-- created before ownership existed (Phase 1). New applications are always
-- created with an owner_id at the application layer (see lib/applications.ts);
-- this column does not enforce NOT NULL to avoid breaking existing rows.
ALTER TABLE applications
  ADD COLUMN owner_id UUID REFERENCES auth.users(id);

CREATE INDEX applications_owner_id_idx ON applications (owner_id);
