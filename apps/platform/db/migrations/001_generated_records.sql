CREATE TABLE generated_records (
  application_id TEXT NOT NULL,
  entity_name TEXT NOT NULL,
  record_id UUID PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT generated_records_application_entity_record_key UNIQUE (application_id, entity_name, record_id)
);

CREATE INDEX generated_records_application_entity_created_idx ON generated_records (application_id, entity_name, created_at DESC);
