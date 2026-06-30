-- User profile metadata sent by HF mobile on ingest (name + email for analytics UI).

CREATE TABLE geo_users (
  user_id text PRIMARY KEY,
  user_name text,
  user_email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_geo_users_email ON geo_users (user_email) WHERE user_email IS NOT NULL;
CREATE INDEX idx_geo_users_name ON geo_users (user_name) WHERE user_name IS NOT NULL;
