CREATE TABLE applications (
  id TEXT PRIMARY KEY,
  blueprint JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
