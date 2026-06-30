import type { ActivityRow } from "@/lib/timeline";
import { findRelatedForGeoEvent } from "@/lib/timeline";
import type { GeoEvent, LocationPing, PresenceSession, RawDeviceEvent, UserTimeline } from "@/api/types";
import { formatCoord, formatDwell, formatTsLocal } from "@/lib/format";
import { actionLabel, placeTypeLabel, UI } from "@/lib/labels";
import {
  Box,
  DetailRow,
  DetailSection,
  JsonBlock,
  SideDrawer,
  StatusChip,
  TechnicalAccordion,
  Typography,
  mapActionToChip,
} from "@/ds";

interface RecordDetailDrawerProps {
  row: ActivityRow | null;
  timeline: UserTimeline | undefined;
  onClose: () => void;
}

export function RecordDetailDrawer({ row, timeline, onClose }: RecordDetailDrawerProps) {
  if (!row || !timeline) return null;

  return (
    <SideDrawer open={Boolean(row)} onClose={onClose} title={row.summary} subtitle={formatTsLocal(row.occurredAt)}>
      {row.kind === "geo_event" && <GeoEventDetail event={row.payload as GeoEvent} timeline={timeline} />}
      {row.kind === "ping" && <PingDetail ping={row.payload as LocationPing} timeline={timeline} />}
      {row.kind === "raw_event" && <RawEventDetail event={row.payload as RawDeviceEvent} timeline={timeline} />}
      {row.kind === "session" && <SessionDetail session={row.payload as PresenceSession} timeline={timeline} />}
    </SideDrawer>
  );
}

function GeoEventDetail({ event, timeline }: { event: GeoEvent; timeline: UserTimeline }) {
  const { sourcePing, entity, session } = findRelatedForGeoEvent(event, timeline);

  return (
    <>
      <DetailSection title="Visit">
        <DetailRow label="What" value={<StatusChip variant={mapActionToChip(event.action)} label={actionLabel(event.action)} />} />
        <DetailRow label="When" value={formatTsLocal(event.occurred_at)} />
        {entity && (
          <>
            <DetailRow label="Place" value={entity.name} />
            <DetailRow label="Type" value={placeTypeLabel(event.entity_type)} />
          </>
        )}
        {session && <DetailRow label="Time spent" value={formatDwell(session.dwell_seconds)} />}
      </DetailSection>

      {sourcePing && (
        <DetailSection title="Location update that triggered this">
          <DetailRow label="When" value={formatTsLocal(sourcePing.recorded_at)} />
          <DetailRow label="Accuracy" value={sourcePing.accuracy_meters != null ? `±${sourcePing.accuracy_meters} m` : null} />
        </DetailSection>
      )}

      <TechnicalAccordion title={UI.technicalDetails}>
        <DetailSection title="Debug">
          <DetailRow label="Event ID" value={event.id} mono />
          <DetailRow label="Source ping ID" value={event.source_ping_id} mono />
          <DetailRow label="Device ID" value={event.device_id} mono />
          <DetailRow label="Created" value={formatTsLocal(event.created_at)} />
          {event.latitude != null && event.longitude != null && (
            <DetailRow label="Coordinates" value={formatCoord(event.latitude, event.longitude)} mono />
          )}
        </DetailSection>
      </TechnicalAccordion>
    </>
  );
}

function PingDetail({ ping, timeline }: { ping: LocationPing; timeline: UserTimeline }) {
  const causedEvents = timeline.geo_events.filter((e) => e.source_ping_id === ping.id);

  return (
    <>
      <DetailSection title={UI.locationUpdates}>
        <DetailRow label="When" value={formatTsLocal(ping.recorded_at)} />
        <DetailRow label="Accuracy" value={ping.accuracy_meters != null ? `±${ping.accuracy_meters} m` : null} />
        <DetailRow label="Moving" value={ping.is_moving != null ? (ping.is_moving ? "Yes" : "No") : null} />
        <DetailRow label="Reason" value={ping.ping_reason} />
      </DetailSection>

      {causedEvents.length > 0 && (
        <DetailSection title={`Visits from this update (${causedEvents.length})`}>
          {causedEvents.map((e) => {
            const ent = timeline.entities.find((x) => x.id === e.entity_id);
            return (
              <Box key={e.id} sx={{ px: 2, py: 1.5, borderTop: 1, borderColor: "divider", display: "flex", gap: 1, alignItems: "center" }}>
                <StatusChip variant={mapActionToChip(e.action)} label={actionLabel(e.action)} />
                <Typography variant="body2">{ent?.name ?? e.entity_id}</Typography>
              </Box>
            );
          })}
        </DetailSection>
      )}

      <TechnicalAccordion title={UI.technicalDetails}>
        <DetailSection title="Full ping record">
          <DetailRow label="Ping ID" value={ping.id} mono />
          <DetailRow label="Client ping ID" value={ping.client_ping_id} mono />
          <DetailRow label="Received" value={formatTsLocal(ping.received_at)} />
          <DetailRow label="Coordinates" value={formatCoord(ping.latitude, ping.longitude)} mono />
          <DetailRow label="Device ID" value={ping.device_id} mono />
          {ping.context && (
            <Box sx={{ px: 2, py: 1.5, borderTop: 1, borderColor: "divider" }}>
              <JsonBlock data={ping.context} />
            </Box>
          )}
        </DetailSection>
      </TechnicalAccordion>
    </>
  );
}

function RawEventDetail({ event, timeline }: { event: RawDeviceEvent; timeline: UserTimeline }) {
  const entity = timeline.entities.find((e) => e.id === event.entity_id);

  return (
    <>
      <DetailSection title="Phone geofence signal">
        <DetailRow label="What" value={<StatusChip variant={mapActionToChip(event.action)} label={actionLabel(event.action)} />} />
        <DetailRow label="When" value={formatTsLocal(event.recorded_at)} />
        {entity && <DetailRow label="Place" value={entity.name} />}
      </DetailSection>

      <TechnicalAccordion title={UI.technicalDetails}>
        <DetailSection title="Debug">
          <DetailRow label="Event ID" value={event.id} mono />
          <DetailRow label="Client event ID" value={event.client_event_id} mono />
          <DetailRow label="Delivery mode" value={event.delivery_mode} />
          {event.extras && <Box sx={{ p: 2 }}><JsonBlock data={event.extras} /></Box>}
        </DetailSection>
      </TechnicalAccordion>
    </>
  );
}

function SessionDetail({ session, timeline }: { session: PresenceSession; timeline: UserTimeline }) {
  const entity = timeline.entities.find((e) => e.id === session.entity_id);

  return (
    <>
      <DetailSection title="Visit">
        {entity && <DetailRow label="Place" value={entity.name} />}
        <DetailRow label="Arrived" value={formatTsLocal(session.entered_at)} />
        <DetailRow label="Left" value={session.exited_at ? formatTsLocal(session.exited_at) : UI.stillThere} />
        <DetailRow label="Time spent" value={formatDwell(session.dwell_seconds)} />
      </DetailSection>

      <TechnicalAccordion title={UI.technicalDetails}>
        <DetailSection title="Session record">
          <DetailRow label="Session ID" value={session.id} mono />
          <DetailRow label="Entity ID" value={session.entity_id} mono />
          <DetailRow label="Enter event ID" value={session.enter_event_id} mono />
          <DetailRow label="Exit event ID" value={session.exit_event_id} mono />
        </DetailSection>
      </TechnicalAccordion>
    </>
  );
}
