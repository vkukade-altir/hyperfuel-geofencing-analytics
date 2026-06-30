export interface EntityStatsSummary {
  entity_id: string;
  entity_type: string;
  name: string;
  parent_id: string | null;
  amenity_type: string | null;
  latitude: number | null;
  longitude: number | null;
  radius_meters: number | null;
  total_enters: number;
  total_exits: number;
  unique_visitors: number;
  completed_sessions: number;
  open_sessions: number;
  total_dwell_seconds: number;
  avg_dwell_seconds: number | null;
  median_dwell_seconds: number | null;
}

export interface StationWithAmenities {
  station: EntityStatsSummary;
  amenities: EntityStatsSummary[];
}

export interface StationsCatalog {
  stations: StationWithAmenities[];
  total_stations: number;
  total_amenities: number;
}

export interface UserVisitSessionRow {
  session_id: string;
  entered_at: string;
  exited_at: string | null;
  dwell_seconds: number | null;
  is_open: boolean;
}

export interface UserEntityVisitRow {
  user_id: string;
  user_name: string | null;
  user_email: string | null;
  enter_count: number;
  exit_count: number;
  completed_visits: number;
  open_visits: number;
  total_dwell_seconds: number;
  avg_dwell_seconds: number | null;
  sessions: UserVisitSessionRow[];
}

export interface EntityAnalyticsDetail extends EntityStatsSummary {
  user_visits: UserEntityVisitRow[];
  child_amenities: EntityStatsSummary[];
}
