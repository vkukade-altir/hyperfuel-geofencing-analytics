import type {
  GeoEvent,
  LocationPing,
  PresenceSession,
  RawDeviceEvent,
  UserTimeline,
} from "../api/types";

export type ActivityKind = "geo_event" | "ping" | "raw_event" | "session";

export interface ActivityRow {
  id: string;
  kind: ActivityKind;
  occurredAt: string;
  typeLabel: string;
  action: string | null;
  entityName: string;
  entityId: string | null;
  entityType: string | null;
  summary: string;
  payload: GeoEvent | LocationPing | RawDeviceEvent | PresenceSession;
}

export function buildActivityRows(timeline: UserTimeline): ActivityRow[] {
  const entityMap = new Map(timeline.entities.map((e) => [e.id, e]));
  const rows: ActivityRow[] = [];

  for (const event of timeline.geo_events) {
    const entity = entityMap.get(event.entity_id);
    rows.push({
      id: `geo-${event.id}`,
      kind: "geo_event",
      occurredAt: event.occurred_at,
      typeLabel: "Server Event",
      action: event.action,
      entityName: entity?.name ?? event.entity_id,
      entityId: event.entity_id,
      entityType: event.entity_type,
      summary: `${event.action} ${event.entity_type} · ${entity?.name ?? event.entity_id}`,
      payload: event,
    });
  }

  for (const ping of timeline.pings) {
    rows.push({
      id: `ping-${ping.id}`,
      kind: "ping",
      occurredAt: ping.recorded_at,
      typeLabel: "Location Ping",
      action: null,
      entityName: "—",
      entityId: null,
      entityType: null,
      summary: `GPS ${ping.latitude.toFixed(5)}, ${ping.longitude.toFixed(5)}`,
      payload: ping,
    });
  }

  for (const raw of timeline.raw_device_events) {
    const entity = entityMap.get(raw.entity_id);
    rows.push({
      id: `raw-${raw.id}`,
      kind: "raw_event",
      occurredAt: raw.recorded_at,
      typeLabel: "OS Geofence",
      action: raw.action,
      entityName: entity?.name ?? raw.entity_id,
      entityId: raw.entity_id,
      entityType: raw.entity_type,
      summary: `Device ${raw.action} · ${entity?.name ?? raw.entity_id}`,
      payload: raw,
    });
  }

  for (const session of timeline.presence_sessions) {
    const entity = entityMap.get(session.entity_id);
    const label = session.exited_at ? "Session Closed" : "Session Open";
    rows.push({
      id: `session-${session.id}`,
      kind: "session",
      occurredAt: session.exited_at ?? session.entered_at,
      typeLabel: "Presence Session",
      action: session.exited_at ? "CLOSED" : "OPEN",
      entityName: entity?.name ?? session.entity_id,
      entityId: session.entity_id,
      entityType: session.entity_type,
      summary: `${label} · ${entity?.name ?? session.entity_id}`,
      payload: session,
    });
  }

  rows.sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
  );
  return rows;
}

export function findRelatedForGeoEvent(
  event: GeoEvent,
  timeline: UserTimeline,
) {
  const sourcePing = event.source_ping_id
    ? timeline.pings.find((p) => p.id === event.source_ping_id) ?? null
    : null;
  const entity = timeline.entities.find((e) => e.id === event.entity_id) ?? null;
  const session = timeline.presence_sessions.find(
    (s) => s.enter_event_id === event.id || s.exit_event_id === event.id,
  ) ?? null;
  const rawNearby = timeline.raw_device_events.filter(
    (r) =>
      r.entity_id === event.entity_id &&
      Math.abs(
        new Date(r.recorded_at).getTime() - new Date(event.occurred_at).getTime(),
      ) < 120_000,
  );
  return { sourcePing, entity, session, rawNearby };
}
