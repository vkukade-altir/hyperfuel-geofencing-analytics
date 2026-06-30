import { Link as RouterLink, Outlet, useLocation } from "react-router-dom";
import {
  AppBar,
  Box,
  Button,
  Stack,
  Toolbar,
  Typography,
} from "@/ds";
import { useDashboardSummary } from "@/api/hooks";
import { UI } from "@/lib/labels";
import { useThemeMode } from "@/theme/AppThemeProvider";
import { Building, Moon, Sun, Users } from "@/icons";
import { ICON_PX } from "@/icons/constants";

export function Layout() {
  const { data: summary } = useDashboardSummary();
  const location = useLocation();
  const { mode, toggleMode } = useThemeMode();

  const onStations = location.pathname.startsWith("/stations") || location.pathname.startsWith("/entities/");
  const onUsers = location.pathname.startsWith("/users");

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", bgcolor: "background.default" }}>
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "background.paper" }}
      >
        <Toolbar sx={{ gap: 3, minHeight: 56 }}>
          <Box
            component={RouterLink}
            to="/stations"
            sx={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "center", gap: 1.5 }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1.5,
                bgcolor: "primary.main",
                color: "primary.contrastText",
                display: "grid",
                placeItems: "center",
                fontSize: "0.7rem",
                fontWeight: 700,
              }}
            >
              HF
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Visit Analytics
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Hyperfuel
              </Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={0.5} sx={{ display: { xs: "none", sm: "flex" } }}>
            <NavButton to="/stations" active={onStations} icon={<Building sx={{ fontSize: ICON_PX.nav }} />}>
              {UI.stations}
            </NavButton>
            <NavButton to="/users" active={onUsers || location.pathname === "/users"} icon={<Users sx={{ fontSize: ICON_PX.nav }} />}>
              {UI.drivers}
            </NavButton>
          </Stack>

          <Box sx={{ flex: 1 }} />

          {summary && (
            <Stack direction="row" spacing={2.5} sx={{ display: { xs: "none", lg: "flex" } }}>
              <HeaderStat label="Location updates" value={summary.total_pings} />
              <HeaderStat label="App users" value={summary.unique_users} />
              <HeaderStat label="Station visits" value={summary.station_enters} highlight />
              <HeaderStat label={UI.stillThere} value={summary.open_sessions} warn={summary.open_sessions > 0} />
            </Stack>
          )}

          <Button
            variant="outlined"
            size="small"
            onClick={toggleMode}
            startIcon={mode === "light" ? <Moon sx={{ fontSize: ICON_PX.control }} /> : <Sun sx={{ fontSize: ICON_PX.control }} />}
            sx={{ borderColor: "divider", color: "text.secondary", minWidth: 0, px: 1.25 }}
          >
            <Box sx={{ display: { xs: "none", sm: "block" } }}>{mode === "light" ? "Dark" : "Light"}</Box>
          </Button>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ flex: 1, maxWidth: 1600, width: "100%", mx: "auto", px: { xs: 2, sm: 3 }, py: 3 }}>
        <Outlet />
      </Box>
    </Box>
  );
}

function NavButton({
  to,
  active,
  children,
  icon,
}: {
  to: string;
  active: boolean;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <Button
      component={RouterLink}
      to={to}
      size="small"
      startIcon={icon}
      variant={active ? "contained" : "text"}
      color={active ? "primary" : "inherit"}
      sx={active ? undefined : { color: "text.secondary" }}
    >
      {children}
    </Button>
  );
}

function HeaderStat({
  label,
  value,
  highlight,
  warn,
}: {
  label: string;
  value: number;
  highlight?: boolean;
  warn?: boolean;
}) {
  return (
    <Box sx={{ textAlign: "right" }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          fontVariantNumeric: "tabular-nums",
          fontWeight: 600,
          color: warn ? "warning.main" : highlight ? "success.main" : "text.primary",
        }}
      >
        {value.toLocaleString()}
      </Typography>
    </Box>
  );
}
