import { useMemo, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import {
  Box,
  Link,
  PageError,
  PageHeader,
  PageLoading,
  RefreshButton,
  StatusChip,
  Stack,
  TabPills,
  Typography,
} from "@/ds";
import { Refresh } from "@/icons";
import { ICON_PX } from "@/icons/constants";
import { useUserTimeline } from "@/api/hooks";
import { GeoEventsTable } from "@/components/GeoEventsTable";
import { EntitiesTable } from "@/components/EntitiesTable";
import { EntityDetailDrawer } from "@/components/EntityDetailDrawer";
import { PingsTable } from "@/components/PingsTable";
import { RecordDetailDrawer } from "@/components/RecordDetailDrawer";
import type { ActivityRow } from "@/lib/timeline";
import type { Entity } from "@/api/types";
import { entityLabel, buildEntityMap } from "@/lib/entities";
import { formatRelative } from "@/lib/format";
import { actionLabel, UI } from "@/lib/labels";
import { userDisplayName } from "@/lib/users";

type UserTab = "pings" | "events" | "entities";

export function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const decodedUserId = userId ? decodeURIComponent(userId) : undefined;
  const { data, isLoading, error, refetch, isFetching } = useUserTimeline(decodedUserId);
  const [tab, setTab] = useState<UserTab>("events");
  const [selectedRow, setSelectedRow] = useState<ActivityRow | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);

  const entityMap = useMemo(() => buildEntityMap(data?.entities ?? []), [data?.entities]);

  const arriveCount = data?.geo_events.filter((e) => e.action === "ENTER").length ?? 0;
  const leaveCount = data?.geo_events.filter((e) => e.action === "EXIT").length ?? 0;
  const stationCount = data?.entities.filter((e) => e.entity_type === "station").length ?? 0;
  const amenityCount = data?.entities.filter((e) => e.entity_type === "amenity").length ?? 0;

  if (!decodedUserId) return <Typography color="text.secondary">User not found.</Typography>;

  return (
    <Box>
      <Link component={RouterLink} to="/users" variant="caption" color="text.secondary" sx={{ display: "inline-block", mb: 1 }}>
        All users
      </Link>

      <PageHeader
        title={data ? userDisplayName(data) : "Loading…"}
        description={data?.user_email ?? undefined}
        action={
          <RefreshButton onClick={() => refetch()} disabled={isFetching} startIcon={<Refresh sx={{ fontSize: ICON_PX.control }} />}>
            {isFetching ? "Refreshing…" : "Refresh"}
          </RefreshButton>
        }
      />

      {data && (
        <>
          <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1, mb: 2 }}>
            {data.current_state.inside_station_ids.map((id) => (
              <StatusChip key={id} variant="arrived" label={`${UI.atStation}: ${entityLabel(id, entityMap)}`} />
            ))}
            {data.current_state.inside_amenity_ids.map((id) => (
              <StatusChip key={id} variant="amenity" label={`${UI.atAmenity}: ${entityLabel(id, entityMap)}`} />
            ))}
            {data.current_state.inside_station_ids.length === 0 &&
              data.current_state.inside_amenity_ids.length === 0 && (
                <Typography variant="body2" color="text.secondary">{UI.notInsideAnywhere}</Typography>
              )}
            {data.current_state.updated_at && (
              <Typography variant="caption" color="text.disabled" sx={{ alignSelf: "center" }}>
                · updated {formatRelative(data.current_state.updated_at)}
              </Typography>
            )}
          </Stack>

          <TabPills
            active={tab}
            onChange={(id) => { setTab(id as UserTab); setSelectedRow(null); setSelectedEntity(null); }}
            tabs={[
              { id: "events", label: UI.visits, count: data.geo_events.length, sub: `${arriveCount} ${actionLabel("ENTER").toLowerCase()} · ${leaveCount} ${actionLabel("EXIT").toLowerCase()}` },
              { id: "pings", label: UI.locationUpdates, count: data.pings.length },
              { id: "entities", label: UI.places, count: data.entities.length, sub: `${stationCount} stations · ${amenityCount} stores` },
            ]}
          />
        </>
      )}

      {isLoading && <PageLoading />}
      {error && <PageError message="Could not load this user's activity." />}

      {data && tab === "pings" && (
        <PingsTable pings={data.pings} selectedId={selectedRow?.id ?? null} onSelect={setSelectedRow} />
      )}
      {data && tab === "events" && (
        <GeoEventsTable events={data.geo_events} entities={data.entities} selectedId={selectedRow?.id ?? null} onSelect={setSelectedRow} />
      )}
      {data && tab === "entities" && (
        <EntitiesTable
          entities={data.entities}
          currentInsideIds={[...data.current_state.inside_station_ids, ...data.current_state.inside_amenity_ids]}
          selectedId={selectedEntity?.id ?? null}
          onSelect={setSelectedEntity}
        />
      )}

      <RecordDetailDrawer row={selectedRow} timeline={data} onClose={() => setSelectedRow(null)} />
      <EntityDetailDrawer entity={selectedEntity} timeline={data} onClose={() => setSelectedEntity(null)} />
    </Box>
  );
}
