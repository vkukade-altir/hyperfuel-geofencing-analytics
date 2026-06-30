import {
  Box,
  DataTableContainer,
  EmptyState,
  KpiCard,
  KpiGrid,
  PageError,
  PageHeader,
  PageLoading,
  RefreshButton,
  SearchField,
  StatusChip,
  Surface,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  ToolbarRow,
  Typography,
} from "@/ds";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Refresh } from "@/icons";
import { ICON_PX } from "@/icons/constants";
import type { UserSummary } from "@/api/types";
import { formatRelative, formatTs, parseApiDate } from "@/lib/format";
import { UI } from "@/lib/labels";
import { userDisplayName } from "@/lib/users";
import { useDashboardSummary, useUsers } from "@/api/hooks";
import { StorageBanner } from "@/components/StorageBanner";

type SortKey = "name" | "ping_count" | "geo_event_count" | "last_ping_at";

export function UsersPage() {
  const { data: users, isLoading, error, refetch, isFetching } = useUsers();
  const { data: summary } = useDashboardSummary();

  return (
    <Box>
      <StorageBanner />
      <PageHeader
        title={UI.drivers}
        description="See who is using the app, where they are right now, and their visit history at stations and stores."
        action={
          <RefreshButton onClick={() => refetch()} disabled={isFetching} startIcon={<Refresh sx={{ fontSize: ICON_PX.control }} />}>
            {isFetching ? "Refreshing…" : "Refresh"}
          </RefreshButton>
        }
      />

      {summary && (
        <KpiGrid>
          <KpiCard label="Location updates" value={summary.total_pings} />
          <KpiCard label="App users" value={summary.unique_users} />
          <KpiCard label="Station visits" value={summary.station_enters} tone="positive" />
          <KpiCard label="Store visits" value={summary.amenity_enters} tone="positive" />
          <KpiCard label={UI.stillThere} value={summary.open_sessions} tone={summary.open_sessions > 0 ? "warning" : "default"} />
          <KpiCard label="Tracked places" value={summary.total_entities} />
        </KpiGrid>
      )}

      {isLoading && <PageLoading />}
      {error && <PageError message="Could not load users. Make sure the dashboard is connected and running." />}

      {users && users.length === 0 && !isLoading && (
        <Surface>
          <EmptyState message="No app users yet. Data appears after someone uses the Hyperfuel app with location tracking on." />
        </Surface>
      )}

      {users && users.length > 0 && <UsersTable users={users} />}
    </Box>
  );
}

function UsersTable({ users }: { users: UserSummary[] }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("last_ping_at");
  const [sortAsc, setSortAsc] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = users.filter((u) => {
      if (!q) return true;
      return `${u.user_name ?? ""} ${u.user_email ?? ""}`.toLowerCase().includes(q);
    });
    list = [...list].sort((a, b) => {
      if (sortKey === "name") {
        const an = userDisplayName(a).toLowerCase();
        const bn = userDisplayName(b).toLowerCase();
        return sortAsc ? an.localeCompare(bn) : bn.localeCompare(an);
      }
      if (sortKey === "last_ping_at") {
        const at = a.last_ping_at ? parseApiDate(a.last_ping_at).getTime() : 0;
        const bt = b.last_ping_at ? parseApiDate(b.last_ping_at).getTime() : 0;
        return sortAsc ? at - bt : bt - at;
      }
      return sortAsc ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey];
    });
    return list;
  }, [users, search, sortKey, sortAsc]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc((v) => !v);
    else { setSortKey(key); setSortAsc(false); }
  }

  return (
    <Surface>
      <ToolbarRow>
        <SearchField label={UI.searchByName} placeholder="Name or email…" value={search} onChange={setSearch} />
        <Typography variant="caption" color="text.secondary">
          {filtered.length} of {users.length} users
        </Typography>
      </ToolbarRow>
      <DataTableContainer maxHeight="calc(100vh - 320px)">
        <TableHead>
          <TableRow>
            <TableCell>
              <TableSortLabel active={sortKey === "name"} direction={sortAsc ? "asc" : "desc"} onClick={() => toggleSort("name")}>
                Name
              </TableSortLabel>
            </TableCell>
            <TableCell>Email</TableCell>
            <TableCell align="right">
              <TableSortLabel active={sortKey === "ping_count"} direction={sortAsc ? "asc" : "desc"} onClick={() => toggleSort("ping_count")}>
                Location updates
              </TableSortLabel>
            </TableCell>
            <TableCell align="right">
              <TableSortLabel active={sortKey === "geo_event_count"} direction={sortAsc ? "asc" : "desc"} onClick={() => toggleSort("geo_event_count")}>
                Visits
              </TableSortLabel>
            </TableCell>
            <TableCell>Status</TableCell>
            <TableCell>
              <TableSortLabel active={sortKey === "last_ping_at"} direction={sortAsc ? "asc" : "desc"} onClick={() => toggleSort("last_ping_at")}>
                Last seen
              </TableSortLabel>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filtered.map((user) => (
            <TableRow
              key={user.user_id}
              hover
              sx={{ cursor: "pointer" }}
              onClick={() => navigate(`/users/${encodeURIComponent(user.user_id)}`)}
            >
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{userDisplayName(user)}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 220 }}>
                  {user.user_email ?? "—"}
                </Typography>
              </TableCell>
              <TableCell align="right">{user.ping_count.toLocaleString()}</TableCell>
              <TableCell align="right">{user.geo_event_count.toLocaleString()}</TableCell>
              <TableCell>
                {user.open_session_count > 0 ? (
                  <StatusChip variant="open" label={UI.stillThere} />
                ) : (
                  <Typography variant="caption" color="text.secondary">Away</Typography>
                )}
              </TableCell>
              <TableCell>
                {user.last_ping_at ? (
                  <Typography variant="body2" color="text.secondary" title={formatTs(user.last_ping_at)}>
                    {formatRelative(user.last_ping_at)}
                  </Typography>
                ) : "—"}
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={6}>
                <EmptyState message="No users match your search." />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </DataTableContainer>
    </Surface>
  );
}
