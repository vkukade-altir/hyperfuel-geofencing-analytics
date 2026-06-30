-- Per-user entities: composite PK (id, user_id) and user-scoped queries.
-- Order matters: parent_id FK references entities_pkey — drop FK before PK.

ALTER TABLE entities ADD COLUMN IF NOT EXISTS user_id text;

ALTER TABLE entities DROP CONSTRAINT IF EXISTS entities_parent_id_fkey;

ALTER TABLE entities DROP CONSTRAINT IF EXISTS entities_pkey;

-- Dev/test cleanup: remove legacy global rows before enforcing user_id.
DELETE FROM entities WHERE user_id IS NULL;

ALTER TABLE entities ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE entities ADD PRIMARY KEY (id, user_id);

CREATE INDEX IF NOT EXISTS idx_entities_user_active
  ON entities (user_id, entity_type, is_active);

-- parent_id FK not re-added: station/amenity pairs are per-user; enforced in app logic.
