import type { EntityStatsSummary } from "@/api/entityAnalyticsTypes";
import { formatDwell } from "@/lib/format";
import { placeTypeLabel, UI } from "@/lib/labels";
import {
  KpiCard,
  KpiGrid,
  mapActionToChip,
  StatusChip,
  TableCell,
  TableRow,
  Typography,
} from "@/ds";

export function EntityStatsCards({ stats }: { stats: EntityStatsSummary }) {
  return (
    <KpiGrid>
      <KpiCard label={UI.totalVisits} value={stats.total_enters} tone="positive" />
      <KpiCard label={UI.timesLeft} value={stats.total_exits} />
      <KpiCard label={UI.peopleWhoVisited} value={stats.unique_visitors} />
      <KpiCard label={UI.completedVisits} value={stats.completed_sessions} />
      <KpiCard label={UI.avgTimeSpent} value={formatDwell(stats.avg_dwell_seconds != null ? Math.round(stats.avg_dwell_seconds) : null)} />
      <KpiCard label={UI.stillThere} value={stats.open_sessions} tone={stats.open_sessions > 0 ? "warning" : "default"} />
    </KpiGrid>
  );
}

export function EntityStatsRow({ stats, onClick }: { stats: EntityStatsSummary; onClick?: () => void }) {
  return (
    <TableRow hover={Boolean(onClick)} sx={onClick ? { cursor: "pointer" } : undefined} onClick={onClick}>
      <TableCell>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>{stats.name}</Typography>
        {stats.amenity_type && (
          <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>{stats.amenity_type}</Typography>
        )}
      </TableCell>
      <TableCell>
        <StatusChip variant={mapActionToChip(stats.entity_type)} label={placeTypeLabel(stats.entity_type)} />
      </TableCell>
      <TableCell align="right">{stats.total_enters}</TableCell>
      <TableCell align="right">{stats.unique_visitors}</TableCell>
      <TableCell align="right">{stats.completed_sessions}</TableCell>
      <TableCell>{formatDwell(stats.avg_dwell_seconds != null ? Math.round(stats.avg_dwell_seconds) : null)}</TableCell>
      <TableCell>{formatDwell(stats.total_dwell_seconds)}</TableCell>
      <TableCell>
        {stats.open_sessions > 0 ? (
          <StatusChip variant="open" label={String(stats.open_sessions)} />
        ) : (
          <Typography variant="caption" color="text.disabled">—</Typography>
        )}
      </TableCell>
    </TableRow>
  );
}

export const ENTITY_STATS_HEADERS = (
  <TableRow>
    <TableCell>Place</TableCell>
    <TableCell>Type</TableCell>
    <TableCell align="right">Visits</TableCell>
    <TableCell align="right">People</TableCell>
    <TableCell align="right">Completed</TableCell>
    <TableCell>Avg time</TableCell>
    <TableCell>Total time</TableCell>
    <TableCell>{UI.stillThere}</TableCell>
  </TableRow>
);
