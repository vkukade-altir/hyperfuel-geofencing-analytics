import type { Entity, UserTimeline } from "@/api/types";
import { buildEntityMap } from "@/lib/entities";
import { formatDwell, formatTsLocal } from "@/lib/format";
import { actionLabel, placeTypeLabel, UI } from "@/lib/labels";
import {
  DetailRow,
  DetailSection,
  JsonBlock,
  SideDrawer,
  StatusChip,
  TechnicalAccordion,
  Typography,
  Box,
  mapActionToChip,
} from "@/ds";

interface EntityDetailDrawerProps {
  entity: Entity | null;
  timeline: UserTimeline | undefined;
  onClose: () => void;
}

export function EntityDetailDrawer({ entity, timeline, onClose }: EntityDetailDrawerProps) {
  if (!entity || !timeline) return null;

  const entityMap = buildEntityMap(timeline.entities);
  const parent = entity.parent_id ? entityMap.get(entity.parent_id) : undefined;
  const childAmenities =
    entity.entity_type === "station"
      ? timeline.entities.filter((e) => e.parent_id === entity.id && e.entity_type === "amenity")
      : [];
  const geoEvents = timeline.geo_events.filter((e) => e.entity_id === entity.id);
  const sessions = timeline.presence_sessions.filter((s) => s.entity_id === entity.id);
  const isInside =
    timeline.current_state.inside_station_ids.includes(entity.id) ||
    timeline.current_state.inside_amenity_ids.includes(entity.id);

  return (
    <SideDrawer open={Boolean(entity)} onClose={onClose} title={entity.name} subtitle={placeTypeLabel(entity.entity_type)}>
      <DetailSection title="Overview">
        <DetailRow label="Type" value={placeTypeLabel(entity.entity_type)} />
        {entity.amenity_type && <DetailRow label="Category" value={entity.amenity_type} />}
        {parent && <DetailRow label="At station" value={parent.name} />}
        <DetailRow
          label="Right now"
          value={isInside ? <StatusChip variant="arrived" label={UI.insideNow} /> : "Not here"}
        />
        <DetailRow label="Visits recorded" value={geoEvents.length} />
        <DetailRow
          label="Time spent (total)"
          value={formatDwell(sessions.reduce((sum, s) => sum + (s.dwell_seconds ?? 0), 0) || null)}
        />
      </DetailSection>

      {childAmenities.length > 0 && (
        <DetailSection title={`Stores here (${childAmenities.length})`}>
          {childAmenities.map((a) => (
            <Box key={a.id} sx={{ px: 2, py: 1.5, borderTop: 1, borderColor: "divider" }}>
              <Typography variant="body2">{a.name}</Typography>
              {a.amenity_type && (
                <Typography variant="caption" color="text.secondary">{a.amenity_type}</Typography>
              )}
            </Box>
          ))}
        </DetailSection>
      )}

      <DetailSection title="Visit history">
        {geoEvents.length === 0 ? (
          <Box sx={{ px: 2, py: 1.5 }}><Typography variant="body2" color="text.secondary">No visits at this place yet.</Typography></Box>
        ) : (
          geoEvents.slice(0, 20).map((e) => (
            <Box key={e.id} sx={{ px: 2, py: 1.5, borderTop: 1, borderColor: "divider", display: "flex", gap: 1, alignItems: "center" }}>
              <StatusChip variant={mapActionToChip(e.action)} label={actionLabel(e.action)} />
              <Typography variant="body2" color="text.secondary">{formatTsLocal(e.occurred_at)}</Typography>
            </Box>
          ))
        )}
      </DetailSection>

      <DetailSection title="Time spent per visit">
        {sessions.length === 0 ? (
          <Box sx={{ px: 2, py: 1.5 }}><Typography variant="body2" color="text.secondary">No completed visits yet.</Typography></Box>
        ) : (
          sessions.slice(0, 15).map((s) => (
            <Box key={s.id} sx={{ px: 2, py: 1.5, borderTop: 1, borderColor: "divider" }}>
              <Typography variant="body2" color="text.secondary">
                {formatTsLocal(s.entered_at)} → {s.exited_at ? formatTsLocal(s.exited_at) : UI.stillThere}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {formatDwell(s.dwell_seconds)}
                {!s.exited_at && <StatusChip variant="open" label={UI.stillThere} />}
              </Typography>
            </Box>
          ))
        )}
      </DetailSection>

      <TechnicalAccordion title={UI.technicalDetails}>
        <DetailSection title="IDs & config">
          <DetailRow label="Place ID" value={entity.id} mono />
          <DetailRow label="User ID" value={entity.user_id} mono />
          <DetailRow label="Radius" value={`${entity.radius_meters} m`} />
          <DetailRow label="Geometry" value={entity.geometry_type} />
          <DetailRow label="Active" value={entity.is_active ? "Yes" : "No"} />
          {entity.polygon && entity.polygon.length > 0 && (
            <Box sx={{ px: 2, py: 1.5, borderTop: 1, borderColor: "divider" }}>
              <JsonBlock data={entity.polygon} />
            </Box>
          )}
          {entity.metadata && (
            <Box sx={{ px: 2, py: 1.5, borderTop: 1, borderColor: "divider" }}>
              <JsonBlock data={entity.metadata} />
            </Box>
          )}
        </DetailSection>
      </TechnicalAccordion>
    </SideDrawer>
  );
}
