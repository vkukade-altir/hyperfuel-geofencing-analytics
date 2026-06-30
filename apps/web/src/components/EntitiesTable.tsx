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
} from "@/ds";
import type { Entity } from "@/api/types";
import { buildEntityMap } from "@/lib/entities";
import { placeTypeLabel, UI } from "@/lib/labels";

interface EntitiesTableProps {
  entities: Entity[];
  currentInsideIds: string[];
  selectedId: string | null;
  onSelect: (entity: Entity) => void;
}

export function EntitiesTable({ entities, currentInsideIds, selectedId, onSelect }: EntitiesTableProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "station" | "amenity">("all");
  const entityMap = useMemo(() => buildEntityMap(entities), [entities]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...entities]
      .sort((a, b) => {
        if (a.entity_type !== b.entity_type) return a.entity_type === "station" ? -1 : 1;
        return a.name.localeCompare(b.name);
      })
      .filter((e) => {
        if (typeFilter !== "all" && e.entity_type !== typeFilter) return false;
        if (q) {
          const parentName = e.parent_id ? entityMap.get(e.parent_id)?.name ?? "" : "";
          if (!`${e.name} ${e.amenity_type ?? ""} ${parentName}`.toLowerCase().includes(q)) return false;
        }
        return true;
      });
  }, [entities, search, typeFilter, entityMap]);

  return (
    <Surface>
      <ToolbarRow>
        <SearchField label={UI.searchPlaces} placeholder="Station or store name…" value={search} onChange={setSearch} />
        <TextField select size="small" label="Type" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)} sx={{ minWidth: 140 }}>
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="station">Station</MenuItem>
          <MenuItem value="amenity">Store / amenity</MenuItem>
        </TextField>
      </ToolbarRow>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", px: 2.5, pb: 1.5 }}>
        {filtered.length} places · tap a row for details
      </Typography>
      <DataTableContainer maxHeight="calc(100vh - 380px)">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>At station</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filtered.map((entity) => {
            const isInside = currentInsideIds.includes(entity.id);
            const parent = entity.parent_id ? entityMap.get(entity.parent_id) : undefined;
            return (
              <TableRow
                key={entity.id}
                hover
                selected={selectedId === entity.id}
                sx={{ cursor: "pointer" }}
                onClick={() => onSelect(entity)}
              >
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{entity.name}</Typography>
                  {entity.amenity_type && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>{entity.amenity_type}</Typography>
                  )}
                </TableCell>
                <TableCell>{placeTypeLabel(entity.entity_type)}</TableCell>
                <TableCell>{parent ? parent.name : "—"}</TableCell>
                <TableCell>
                  {isInside ? (
                    <StatusChip variant="arrived" label={UI.insideNow} />
                  ) : entity.is_active ? (
                    <Typography variant="caption" color="text.secondary">Tracked</Typography>
                  ) : (
                    <Typography variant="caption" color="text.disabled">Inactive</Typography>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={4}>
                <EmptyState message={entities.length === 0 ? "No places synced for this user yet." : "No matches."} />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </DataTableContainer>
    </Surface>
  );
}
