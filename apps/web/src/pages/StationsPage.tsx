import { useMemo, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Box,
  DataTableContainer,
  EmptyState,
  ExpandIcon,
  Link,
  PageError,
  PageHeader,
  PageLoading,
  RefreshButton,
  SearchField,
  StatusChip,
  Surface,
  Stack,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@/ds";
import { Refresh } from "@/icons";
import { ICON_PX } from "@/icons/constants";
import { useStationsCatalog } from "@/api/hooks";
import { EntityStatsRow, ENTITY_STATS_HEADERS } from "@/components/EntityStatsTable";
import { formatDwell } from "@/lib/format";
import { UI } from "@/lib/labels";

export function StationsPage() {
  const { data, isLoading, error, refetch, isFetching } = useStationsCatalog();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    if (!q) return data.stations;
    return data.stations.filter((row) => {
      const hay = `${row.station.name} ${row.amenities.map((a) => a.name).join(" ")}`.toLowerCase();
      return hay.includes(q);
    });
  }, [data, search]);

  function toggleExpanded(stationId: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(stationId)) next.delete(stationId);
      else next.add(stationId);
      return next;
    });
  }

  return (
    <Box>
      <PageHeader
        title="Stations & stores"
        description="Where people go while charging — how many visit, how long they stay, and who is still there."
        action={
          <RefreshButton onClick={() => refetch()} disabled={isFetching} startIcon={<Refresh sx={{ fontSize: ICON_PX.control }} />}>
            {isFetching ? "Refreshing…" : "Refresh"}
          </RefreshButton>
        }
      />

      {data && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          <strong>{data.total_stations}</strong> charging stations · <strong>{data.total_amenities}</strong> stores & amenities
        </Typography>
      )}

      <Surface sx={{ px: 2.5, py: 2, mb: 3 }}>
        <SearchField label={UI.searchStations} placeholder="Station or store name…" value={search} onChange={setSearch} />
      </Surface>

      {isLoading && <PageLoading />}
      {error && <PageError message="Could not load station data." />}

      <Stack spacing={2}>
        {filtered.map((row) => {
          const isOpen = expanded.has(row.station.entity_id);
          return (
            <Surface key={row.station.entity_id}>
              <Box
                component="button"
                type="button"
                onClick={() => toggleExpanded(row.station.entity_id)}
                sx={{
                  width: "100%",
                  textAlign: "left",
                  border: 0,
                  bgcolor: "transparent",
                  cursor: "pointer",
                  px: 2.5,
                  py: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 2,
                  alignItems: "center",
                  color: "inherit",
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
                    <Typography variant="h2">{row.station.name}</Typography>
                    {row.station.open_sessions > 0 && (
                      <StatusChip variant="open" label={`${row.station.open_sessions} ${UI.stillThere.toLowerCase()}`} />
                    )}
                  </Stack>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                    {row.amenities.length} {row.amenities.length === 1 ? "store" : "stores & amenities"}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={3} sx={{ alignItems: "center", flexShrink: 0 }}>
                  <MiniStat label="Visits" value={row.station.total_enters} />
                  <MiniStat label="People" value={row.station.unique_visitors} />
                  <MiniStat label="Avg time" value={formatDwell(row.station.avg_dwell_seconds != null ? Math.round(row.station.avg_dwell_seconds) : null)} />
                  <ExpandIcon expanded={isOpen} />
                </Stack>
              </Box>

              <Box sx={{ px: 2.5, pb: 2 }}>
                <Link component={RouterLink} to={`/entities/${encodeURIComponent(row.station.entity_id)}`} variant="body2">
                  View full report
                </Link>
              </Box>

              {isOpen && (
                <Box sx={{ borderTop: 1, borderColor: "divider" }}>
                  <DataTableContainer>
                    <TableHead>{ENTITY_STATS_HEADERS}</TableHead>
                    <TableBody>
                      <EntityStatsRow
                        stats={row.station}
                        onClick={() => navigate(`/entities/${encodeURIComponent(row.station.entity_id)}`)}
                      />
                      {row.amenities.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8}>
                            <EmptyState message="No stores or amenities tracked at this station yet." />
                          </TableCell>
                        </TableRow>
                      ) : (
                        row.amenities.map((amenity) => (
                          <EntityStatsRow
                            key={amenity.entity_id}
                            stats={amenity}
                            onClick={() => navigate(`/entities/${encodeURIComponent(amenity.entity_id)}`)}
                          />
                        ))
                      )}
                    </TableBody>
                  </DataTableContainer>
                </Box>
              )}
            </Surface>
          );
        })}
      </Stack>

      {data && filtered.length === 0 && (
        <Surface sx={{ mt: 2 }}>
          <EmptyState message="No stations match your search." />
        </Surface>
      )}
    </Box>
  );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <Box sx={{ textAlign: "right" }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>{value}</Typography>
    </Box>
  );
}
