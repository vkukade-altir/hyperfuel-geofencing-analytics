# Copy from docs/geofencing-analytics-platform-spec.md Section 7.8

-- entities
CREATE TABLE entities (
  id text PRIMARY KEY,
  entity_type text NOT NULL CHECK (entity_type IN ('station', 'amenity')),
  parent_id text REFERENCES entities(id),
  name text NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  radius_meters integer NOT NULL DEFAULT 70,
  geometry_type text NOT NULL DEFAULT 'circle',
  polygon jsonb,
  amenity_type text,
  is_active boolean NOT NULL DEFAULT true,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (
    (entity_type = 'station' AND parent_id IS NULL) OR
    (entity_type = 'amenity' AND parent_id IS NOT NULL)
  )
);

CREATE INDEX idx_entities_type_active ON entities (entity_type, is_active);
CREATE INDEX idx_entities_parent ON entities (parent_id) WHERE parent_id IS NOT NULL;

-- location_pings
CREATE TABLE location_pings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  device_id text,
  client_ping_id text NOT NULL,
  recorded_at timestamptz NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  accuracy_meters double precision,
  altitude double precision,
  speed_mps double precision,
  heading double precision,
  is_moving boolean,
  ping_reason text,
  context jsonb,
  UNIQUE (user_id, client_ping_id)
);

CREATE INDEX idx_pings_user_recorded ON location_pings (user_id, recorded_at DESC);
CREATE INDEX idx_pings_recorded ON location_pings (recorded_at DESC);

-- geofence_events_raw
CREATE TABLE geofence_events_raw (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  device_id text,
  client_event_id text NOT NULL,
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  action text NOT NULL CHECK (action IN ('ENTER', 'EXIT')),
  recorded_at timestamptz NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  latitude double precision,
  longitude double precision,
  accuracy_meters double precision,
  delivery_mode text,
  was_terminated boolean DEFAULT false,
  coordinates_adjusted boolean DEFAULT false,
  extras jsonb,
  UNIQUE (user_id, client_event_id)
);

CREATE INDEX idx_raw_events_user ON geofence_events_raw (user_id, recorded_at DESC);
CREATE INDEX idx_raw_events_entity ON geofence_events_raw (entity_id, recorded_at DESC);

-- geo_events
CREATE TABLE geo_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  device_id text,
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  station_id text,
  action text NOT NULL CHECK (action IN ('ENTER', 'EXIT')),
  occurred_at timestamptz NOT NULL,
  source text NOT NULL DEFAULT 'server_ping',
  source_ping_id uuid REFERENCES location_pings(id),
  latitude double precision,
  longitude double precision,
  accuracy_meters double precision,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_geo_events_user_occurred ON geo_events (user_id, occurred_at DESC);
CREATE INDEX idx_geo_events_entity ON geo_events (entity_type, entity_id, occurred_at DESC);
CREATE INDEX idx_geo_events_station ON geo_events (station_id, occurred_at DESC);

-- user_geo_state
CREATE TABLE user_geo_state (
  user_id text PRIMARY KEY,
  inside_station_ids jsonb NOT NULL DEFAULT '[]',
  inside_amenity_ids jsonb NOT NULL DEFAULT '[]',
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- presence_sessions
CREATE TABLE presence_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  station_id text,
  entered_at timestamptz NOT NULL,
  exited_at timestamptz,
  dwell_seconds integer,
  enter_event_id uuid REFERENCES geo_events(id),
  exit_event_id uuid REFERENCES geo_events(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_sessions_entity ON presence_sessions (entity_type, entity_id, entered_at DESC);
CREATE INDEX idx_sessions_user ON presence_sessions (user_id, entered_at DESC);
CREATE INDEX idx_sessions_open ON presence_sessions (user_id) WHERE exited_at IS NULL;
