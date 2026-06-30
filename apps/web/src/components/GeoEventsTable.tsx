import { useMemo, useState } from "react";
import {
  DataTableContainer,
  EmptyState,
  MenuItem,
  SearchField,
  StatusChip,
  Surface,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  ToolbarRow,
  Typography,
  mapActionToChip,
} from "@/ds";
import type { Entity, GeoEvent } from "@/api/types";
import { buildEntityMap, entityLabel } from "@/lib/entities";
import { formatTs, parseApiDate } from "@/lib/format";
import { actionLabel, placeTypeLabel, UI } from "@/lib/labels";
import type { ActivityRow } from "@/lib/timeline";

interface GeoEventsTableProps {
  events: GeoEvent[];
  entities: Entity[];
  selectedId: string | null;
  onSelect: (row: ActivityRow) => void;
}

export function geoEventToRow(event: GeoEvent, entityMap: Map<string, Entity>): ActivityRow {
  const entity = entityMap.get(event.entity_id);
  const place = entity?.name ?? event.entity_id;
  return {
    id: `geo-${event.id}`,
    kind: "geo_event",
    occurredAt: event.occurred_at,
    typeLabel: UI.visitRecorded,
    action: event.action,
    entityName: place,
    entityId: event.entity_id,
    entityType: event.entity_type,
    summary: `${actionLabel(event.action)} — ${place}`,
    payload: event,
  };
}

export function GeoEventsTable({ events, entities, selectedId, onSelect }: GeoEventsTableProps) {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<"all" | "ENTER" | "EXIT">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "station" | "amenity">("all");
  const entityMap = useMemo(() => buildEntityMap(entities), [entities]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...events]
      .sort((a, b) => parseApiDate(b.occurred_at).getTime() - parseApiDate(a.occurred_at).getTime())
      .filter((e) => {
        if (actionFilter !== "all" && e.action !== actionFilter) return false;
        if (typeFilter !== "all" && e.entity_type !== typeFilter) return false;
        if (q) {
          const name = entityLabel(e.entity_id, entityMap).toLowerCase();
          if (!name.includes(q) && !actionLabel(e.action).toLowerCase().includes(q)) return false;
        }
        return true;
      });
  }, [events, search, actionFilter, typeFilter, entityMap]);

  return (
    <Surface>
      <ToolbarRow>
        <SearchField label={UI.searchPlaces} placeholder="Place name…" value={search} onChange={setSearch} />
        <TextField select size="small" label="What happened" value={actionFilter} onChange={(e) => setActionFilter(e.target.value as typeof actionFilter)} sx={{ minWidth: 140 }}>
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="ENTER">{actionLabel("ENTER")}</MenuItem>
          <MenuItem value="EXIT">{actionLabel("EXIT")}</MenuItem>
        </TextField>
        <TextField select size="small" label="Place type" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)} sx={{ minWidth: 140 }}>
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="station">Station</MenuItem>
          <MenuItem value="amenity">Store / amenity</MenuItem>
        </TextField>
      </ToolbarRow>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", px: 2.5, pb: 1.5 }}>
        {filtered.length} visits · tap a row for details
      </Typography>
      <DataTableContainer maxHeight="calc(100vh - 380px)">
        <TableHead>
          <TableRow>
            <TableCell>When</TableCell>
            <TableCell>What</TableCell>
            <TableCell>Place</TableCell>
            <TableCell>Type</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filtered.map((event) => {
            const rowId = `geo-${event.id}`;
            return (
              <TableRow
                key={event.id}
                hover
                selected={selectedId === rowId}
                sx={{ cursor: "pointer" }}
                onClick={() => onSelect(geoEventToRow(event, entityMap))}
              >
                <TableCell>{formatTs(event.occurred_at)}</TableCell>
                <TableCell>
                  <StatusChip variant={mapActionToChip(event.action)} label={actionLabel(event.action)} />
                </TableCell>
                <TableCell>{entityLabel(event.entity_id, entityMap)}</TableCell>
                <TableCell>{placeTypeLabel(event.entity_type)}</TableCell>
              </TableRow>
            );
          })}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={4}>
                <EmptyState message={events.length === 0 ? "No visits recorded for this user yet." : "No matches."} />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </DataTableContainer>
    </Surface>
  );
}
