import { useMemo, useState } from "react";
import {
  DataTableContainer,
  EmptyState,
  SearchField,
  Surface,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  ToolbarRow,
  Typography,
} from "@/ds";
import type { LocationPing } from "@/api/types";
import { formatTs, parseApiDate } from "@/lib/format";
import { UI } from "@/lib/labels";
import type { ActivityRow } from "@/lib/timeline";

interface PingsTableProps {
  pings: LocationPing[];
  selectedId: string | null;
  onSelect: (row: ActivityRow) => void;
}

export function pingToRow(ping: LocationPing): ActivityRow {
  return {
    id: `ping-${ping.id}`,
    kind: "ping",
    occurredAt: ping.recorded_at,
    typeLabel: UI.locationUpdates,
    action: null,
    entityName: "—",
    entityId: null,
    entityType: null,
    summary: "Location update",
    payload: ping,
  };
}

export function PingsTable({ pings, selectedId, onSelect }: PingsTableProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const sorted = [...pings].sort(
      (a, b) => parseApiDate(b.recorded_at).getTime() - parseApiDate(a.recorded_at).getTime(),
    );
    if (!q) return sorted;
    return sorted.filter((p) => `${p.ping_reason ?? ""} ${formatTs(p.recorded_at)}`.toLowerCase().includes(q));
  }, [pings, search]);

  return (
    <Surface>
      <ToolbarRow>
        <SearchField label="Search" placeholder="Time or reason…" value={search} onChange={setSearch} />
        <Typography variant="caption" color="text.secondary">
          {filtered.length} updates · tap a row for details
        </Typography>
      </ToolbarRow>
      <DataTableContainer maxHeight="calc(100vh - 340px)">
        <TableHead>
          <TableRow>
            <TableCell>When</TableCell>
            <TableCell>Accuracy</TableCell>
            <TableCell>Moving</TableCell>
            <TableCell>Reason</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filtered.map((ping) => {
            const rowId = `ping-${ping.id}`;
            return (
              <TableRow
                key={ping.id}
                hover
                selected={selectedId === rowId}
                sx={{ cursor: "pointer" }}
                onClick={() => onSelect(pingToRow(ping))}
              >
                <TableCell>{formatTs(ping.recorded_at)}</TableCell>
                <TableCell>{ping.accuracy_meters != null ? `±${ping.accuracy_meters} m` : "—"}</TableCell>
                <TableCell>{ping.is_moving == null ? "—" : ping.is_moving ? "Yes" : "No"}</TableCell>
                <TableCell>{ping.ping_reason ?? "—"}</TableCell>
              </TableRow>
            );
          })}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={4}>
                <EmptyState message={pings.length === 0 ? "No location updates for this user." : "No matches."} />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </DataTableContainer>
    </Surface>
  );
}
