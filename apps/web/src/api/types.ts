/** API response types matching FastAPI ApiResponse envelope. */

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  error: { code: string; details?: string } | null;
}

export interface HealthStatus {
  status: string;
  version: string;
  timestamp: string;
  storage_backend: "memory" | "supabase";
  supabase_configured: boolean;
}

export interface UserSummary {
  user_id: string;
  user_name: string | null;
  user_email: string | null;
  ping_count: number;
  geo_event_count: number;
  session_count: number;
  open_session_count: number;
  entity_count: number;
  last_ping_at: string | null;
  last_event_at: string | null;
}

export interface DashboardSummary {
  period: { from: string; to: string };
  total_pings: number;
  unique_users: number;
  station_enters: number;
  amenity_enters: number;
  open_sessions: number;
  total_entities: number;
}

export interface LocationPing {
  id: string;
  user_id: string;
  device_id: string | null;
  client_ping_id: string;
  recorded_at: string;
  received_at: string;
  latitude: number;
  longitude: number;
  accuracy_meters: number | null;
  altitude: number | null;
  speed_mps: number | null;
  heading: number | null;
  is_moving: boolean | null;
  ping_reason: string | null;
  context: Record<string, unknown> | null;
}

export interface GeoEvent {
  id: string;
  user_id: string;
  device_id: string | null;
  entity_type: "station" | "amenity";
  entity_id: string;
  station_id: string | null;
  action: "ENTER" | "EXIT";
  occurred_at: string;
  source: string;
  source_ping_id: string | null;
  latitude: number | null;
  longitude: number | null;
  accuracy_meters: number | null;
  created_at: string;
}

export interface RawDeviceEvent {
  id: string;
  user_id: string;
  device_id: string | null;
  client_event_id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  recorded_at: string;
  latitude: number | null;
  longitude: number | null;
  accuracy_meters: number | null;
  delivery_mode: string | null;
  was_terminated: boolean;
  coordinates_adjusted: boolean;
  extras: Record<string, unknown> | null;
}

export interface PresenceSession {
  id: string;
  user_id: string;
  entity_type: "station" | "amenity";
  entity_id: string;
  station_id: string | null;
  entered_at: string;
  exited_at: string | null;
  dwell_seconds: number | null;
  enter_event_id: string | null;
  exit_event_id: string | null;
  created_at: string;
}

export interface Entity {
  id: string;
  user_id: string;
  entity_type: "station" | "amenity";
  parent_id: string | null;
  name: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  geometry_type: string;
  polygon: unknown[] | null;
  amenity_type: string | null;
  is_active: boolean;
  metadata: Record<string, unknown> | null;
}

export interface CurrentState {
  inside_station_ids: string[];
  inside_amenity_ids: string[];
  updated_at: string | null;
}

export interface UserTimeline {
  user_id: string;
  user_name: string | null;
  user_email: string | null;
  pings: LocationPing[];
  geo_events: GeoEvent[];
  raw_device_events: RawDeviceEvent[];
  presence_sessions: PresenceSession[];
  entities: Entity[];
  current_state: CurrentState;
}
