import { useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
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
  StatusChip,
  Surface,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Stack,
} from "@/ds";
import { Refresh } from "@/icons";
import { ICON_PX } from "@/icons/constants";
import { useEntityAnalytics } from "@/api/hooks";
import type { UserEntityVisitRow } from "@/api/entityAnalyticsTypes";
import { EntityStatsCards, EntityStatsRow, ENTITY_STATS_HEADERS } from "@/components/EntityStatsTable";
import { formatDwell, formatTs } from "@/lib/format";
import { placeTypeLabel, UI } from "@/lib/labels";
import { userDisplayName } from "@/lib/users";

export function EntityAnalyticsPage() {
  const { entityId } = useParams<{ entityId: string }>();
  const navigate = useNavigate();
  const decodedId = entityId ? decodeURIComponent(entityId) : undefined;
  const { data, isLoading, error, refetch, isFetching } = useEntityAnalytics(decodedId);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  if (!decodedId) return <Typography color="text.secondary">Place not found.</Typography>;

  return (
    <Box>
      <Link component={RouterLink} to="/stations" variant="caption" color="text.secondary" sx={{ display: "inline-block", mb: 1 }}>
        All stations
      </Link>

      <PageHeader
        title={data?.name ?? "Place report"}
        description={data ? placeTypeLabel(data.entity_type) : undefined}
        action={
          <RefreshButton onClick={() => refetch()} disabled={isFetching} startIcon={<Refresh sx={{ fontSize: ICON_PX.control }} />}>
            {isFetching ? "Refreshing…" : "Refresh"}
          </RefreshButton>
        }
      />

      {isLoading && <PageLoading />}
      {error && <PageError message="Could not load this report." />}

      {data && (
        <Stack spacing={3}>
          <EntityStatsCards stats={data} />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <Surface sx={{ flex: 1, px: 2, py: 1.5 }}>
              <Typography variant="caption" color="text.secondary">{UI.medianTimeSpent}</Typography>
              <Typography variant="body1" sx={{ ml: 1, display: "inline", fontWeight: 500 }}>
                {formatDwell(data.median_dwell_seconds)}
              </Typography>
            </Surface>
            <Surface sx={{ flex: 1, px: 2, py: 1.5 }}>
              <Typography variant="caption" color="text.secondary">{UI.totalTimeSpent} (everyone)</Typography>
              <Typography variant="body1" sx={{ ml: 1, display: "inline", fontWeight: 500 }}>
                {formatDwell(data.total_dwell_seconds)}
              </Typography>
            </Surface>
          </Stack>

          {data.child_amenities.length > 0 && (
            <Box>
              <Typography variant="h2" sx={{ mb: 1.5 }}>Stores & amenities here</Typography>
              <Surface>
                <DataTableContainer>
                  <TableHead>{ENTITY_STATS_HEADERS}</TableHead>
                  <TableBody>
                    {data.child_amenities.map((a) => (
                      <EntityStatsRow
                        key={a.entity_id}
                        stats={a}
                        onClick={() => navigate(`/entities/${encodeURIComponent(a.entity_id)}`)}
                      />
                    ))}
                  </TableBody>
                </DataTableContainer>
              </Surface>
            </Box>
          )}

          <Box>
            <Typography variant="h2">{UI.peopleWhoVisited} ({data.user_visits.length})</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5, mt: 0.5 }}>
              Tap a person to see each visit — when they arrived, when they left, and how long they stayed.
            </Typography>
            <Surface>
              <DataTableContainer>
                <TableHead>
                  <TableRow>
                    <TableCell>Person</TableCell>
                    <TableCell align="right">Visits</TableCell>
                    <TableCell align="right">Completed</TableCell>
                    <TableCell>{UI.stillThere}</TableCell>
                    <TableCell>Total time</TableCell>
                    <TableCell>Avg time</TableCell>
                    <TableCell width={40} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.user_visits.map((visit) => (
                    <UserVisitRows
                      key={visit.user_id}
                      visit={visit}
                      expanded={expandedUser === visit.user_id}
                      onToggle={() => setExpandedUser((id) => (id === visit.user_id ? null : visit.user_id))}
                    />
                  ))}
                  {data.user_visits.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7}>
                        <EmptyState message="No one has visited this place yet." />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </DataTableContainer>
            </Surface>
          </Box>
        </Stack>
      )}
    </Box>
  );
}

function UserVisitRows({
  visit,
  expanded,
  onToggle,
}: {
  visit: UserEntityVisitRow;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <TableRow hover sx={{ cursor: "pointer" }} onClick={onToggle}>
        <TableCell>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>{userDisplayName(visit)}</Typography>
          {visit.user_email && (
            <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>{visit.user_email}</Typography>
          )}
        </TableCell>
        <TableCell align="right">{visit.enter_count}</TableCell>
        <TableCell align="right">{visit.completed_visits}</TableCell>
        <TableCell>
          {visit.open_visits > 0 ? <StatusChip variant="open" label={UI.stillThere} /> : "—"}
        </TableCell>
        <TableCell>{formatDwell(visit.total_dwell_seconds)}</TableCell>
        <TableCell>
          {visit.avg_dwell_seconds != null ? formatDwell(Math.round(visit.avg_dwell_seconds)) : "—"}
        </TableCell>
        <TableCell><ExpandIcon expanded={expanded} /></TableCell>
      </TableRow>
      {expanded &&
        visit.sessions.map((session, i) => (
          <TableRow key={session.session_id} sx={{ bgcolor: "action.hover" }}>
            <TableCell colSpan={2} sx={{ pl: 4 }}>
              <Typography variant="caption" color="text.secondary">Visit {i + 1}</Typography>
            </TableCell>
            <TableCell colSpan={2}>
              <Typography variant="body2">
                <Typography component="span" variant="caption" color="text.secondary">Arrived </Typography>
                {formatTs(session.entered_at)}
              </Typography>
            </TableCell>
            <TableCell colSpan={2}>
              {session.exited_at ? (
                <Typography variant="body2">
                  <Typography component="span" variant="caption" color="text.secondary">Left </Typography>
                  {formatTs(session.exited_at)}
                </Typography>
              ) : (
                <StatusChip variant="open" label={UI.stillThere} />
              )}
            </TableCell>
            <TableCell>
              {!session.is_open && formatDwell(session.dwell_seconds)}
            </TableCell>
          </TableRow>
        ))}
    </>
  );
}
