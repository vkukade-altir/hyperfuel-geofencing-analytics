import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  AppBar,
  Box,
  Button,
  Chip,
  Container,
  Drawer,
  IconButton,
  Link,
  Paper,
  Stack,
  Table,
  Toolbar,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  type ButtonProps,
  type ChipProps,
  type SxProps,
  type Theme,
  MenuItem,
} from "@mui/material";
import type { ReactNode } from "react";
import { ChevronDown, CloseIcon, ICON_PX } from "@/icons";

export {
  AppBar,
  Box,
  Stack,
  Toolbar,
  Typography,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  CircularProgress,
  Alert,
  Button,
  Chip,
  Paper,
  MenuItem,
};

export function AppShell({
  header,
  children,
}: {
  header: ReactNode;
  children: ReactNode;
}) {
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", bgcolor: "background.default" }}>
      {header}
      <Container maxWidth="xl" sx={{ flex: 1, py: 3 }}>
        {children}
      </Container>
    </Box>
  );
}

export function PageHeader({
  title,
  description,
  action,
  breadcrumb,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  breadcrumb?: ReactNode;
}) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      sx={{ mb: 3, justifyContent: "space-between", alignItems: { sm: "flex-end" }, gap: 2 }}
    >
      <Box>
        {breadcrumb}
        <Typography variant="h1" sx={{ mt: breadcrumb ? 1 : 0 }}>
          {title}
        </Typography>
        {description && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, maxWidth: 640 }}>
            {description}
          </Typography>
        )}
      </Box>
      {action}
    </Stack>
  );
}

export function Surface({ children, sx }: { children: ReactNode; sx?: SxProps<Theme> }) {
  return (
    <Paper sx={{ overflow: "hidden", ...sx }}>
      {children}
    </Paper>
  );
}

export function KpiGrid({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)", lg: "repeat(6, 1fr)" },
        gap: 1.5,
        mb: 3,
      }}
    >
      {children}
    </Box>
  );
}

export function KpiCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone?: "default" | "positive" | "warning";
}) {
  const color =
    tone === "positive" ? "success.main" : tone === "warning" ? "warning.main" : "text.primary";
  return (
    <Paper sx={{ px: 2, py: 1.75 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
        {label}
      </Typography>
      <Typography variant="h2" sx={{ mt: 0.25, color, fontVariantNumeric: "tabular-nums" }}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </Typography>
    </Paper>
  );
}

export function RefreshButton(props: ButtonProps) {
  return <Button variant="outlined" size="small" {...props} />;
}

export function SearchField({
  label,
  placeholder,
  value,
  onChange,
}: {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <TextField
      size="small"
      fullWidth
      label={label}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      slotProps={{ input: { type: "search" } }}
      sx={{ maxWidth: 400 }}
    />
  );
}

export function ToolbarRow({ children }: { children: ReactNode }) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      sx={{
        px: 2.5,
        py: 2,
        borderBottom: 1,
        borderColor: "divider",
        alignItems: { sm: "flex-end" },
        justifyContent: "space-between",
        gap: 2,
      }}
    >
      {children}
    </Stack>
  );
}

export function DataTableContainer({ children, maxHeight }: { children: ReactNode; maxHeight?: string | number }) {
  return (
    <TableContainer sx={{ maxHeight }}>
      <Table size="small" stickyHeader>
        {children}
      </Table>
    </TableContainer>
  );
}

type StatusVariant = "arrived" | "left" | "open" | "station" | "amenity" | "default";

const chipColor: Record<StatusVariant, ChipProps["color"]> = {
  arrived: "success",
  left: "default",
  open: "warning",
  station: "primary",
  amenity: "default",
  default: "default",
};

export function StatusChip({
  variant = "default",
  label,
}: {
  variant?: StatusVariant | string;
  label: ReactNode;
}) {
  const key = (variant in chipColor ? variant : "default") as StatusVariant;
  return <Chip size="small" label={label} color={chipColor[key]} variant="outlined" />;
}

export function mapActionToChip(action: string): StatusVariant {
  if (action === "ENTER") return "arrived";
  if (action === "EXIT") return "left";
  if (action === "OPEN") return "open";
  if (action === "station") return "station";
  if (action === "amenity") return "amenity";
  return "default";
}

export function SideDrawer({
  open,
  onClose,
  title,
  subtitle,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: { width: { xs: "100%", sm: 480, md: 560 } } } }}
    >
      <Stack sx={{ height: "100%" }}>
        <Stack
          direction="row"
          sx={{
            px: 3,
            py: 2.5,
            borderBottom: 1,
            borderColor: "divider",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h2" noWrap>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }} noWrap>
                {subtitle}
              </Typography>
            )}
          </Box>
          <IconButton aria-label="Close" onClick={onClose} size="small">
            <CloseIcon sx={{ fontSize: ICON_PX.control }} />
          </IconButton>
        </Stack>
        <Box sx={{ flex: 1, overflow: "auto", px: 3, py: 2.5 }}>
          <Stack spacing={3}>{children}</Stack>
        </Box>
      </Stack>
    </Drawer>
  );
}

export function TechnicalAccordion({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Accordion disableGutters elevation={0} sx={{ bgcolor: "action.hover", "&:before": { display: "none" } }}>
      <AccordionSummary expandIcon={<ChevronDown sx={{ fontSize: ICON_PX.control }} />}>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ pt: 0 }}>{children}</AccordionDetails>
    </Accordion>
  );
}

export function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Box>
      <Typography variant="subtitle1" sx={{ mb: 1.25 }}>
        {title}
      </Typography>
      <Paper sx={{ "& > * + *": { borderTop: 1, borderColor: "divider" } }}>{children}</Paper>
    </Box>
  );
}

export function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: ReactNode;
  mono?: boolean;
}) {
  return (
    <Stack direction={{ xs: "column", sm: "row" }} sx={{ px: 2, py: 1.5, gap: { xs: 0.25, sm: 2 } }}>
      <Typography variant="caption" color="text.secondary" sx={{ minWidth: 120, flexShrink: 0 }}>
        {label}
      </Typography>
      <Typography
        variant="body2"
        component="div"
        sx={{
          wordBreak: "break-word",
          ...(mono ? { fontFamily: '"IBM Plex Mono", monospace', fontSize: "0.75rem" } : {}),
        }}
      >
        {value ?? "—"}
      </Typography>
    </Stack>
  );
}

export function JsonBlock({ data }: { data: unknown }) {
  if (data == null) return <Typography variant="body2" color="text.secondary">—</Typography>;
  return (
    <Box
      component="pre"
      sx={{
        m: 0,
        p: 1.5,
        fontFamily: '"IBM Plex Mono", monospace',
        fontSize: "0.75rem",
        overflow: "auto",
        bgcolor: "action.hover",
        borderRadius: 1,
      }}
    >
      {JSON.stringify(data, null, 2)}
    </Box>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <Box sx={{ py: 8, textAlign: "center" }}>
      <Typography color="text.secondary">{message}</Typography>
    </Box>
  );
}

export function PageLoading({ message = "Loading…" }: { message?: string }) {
  return (
    <Surface>
      <Stack sx={{ py: 8, alignItems: "center", justifyContent: "center", gap: 2 }}>
        <CircularProgress size={28} />
        <Typography color="text.secondary">{message}</Typography>
      </Stack>
    </Surface>
  );
}

export function PageError({ message }: { message: string }) {
  return <Alert severity="error">{message}</Alert>;
}

export function TabPills({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: string; label: string; count: number; sub?: string }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <Stack direction="row" sx={{ mb: 2, flexWrap: "wrap", gap: 1 }}>
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <Button
            key={tab.id}
            variant={isActive ? "contained" : "outlined"}
            color={isActive ? "primary" : "inherit"}
            onClick={() => onChange(tab.id)}
            sx={{
              textAlign: "left",
              alignItems: "flex-start",
              flexDirection: "column",
              py: 1.25,
              px: 2,
              borderColor: "divider",
              ...(isActive ? {} : { color: "text.secondary" }),
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {tab.label}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {tab.count.toLocaleString()}
              {tab.sub ? ` · ${tab.sub}` : ""}
            </Typography>
          </Button>
        );
      })}
    </Stack>
  );
}

export function ExpandIcon({ expanded }: { expanded: boolean }) {
  return (
    <ChevronDown
      sx={{
        fontSize: ICON_PX.control,
        color: "text.secondary",
        transform: expanded ? "rotate(180deg)" : "rotate(-90deg)",
        transition: "transform 0.15s",
      }}
    />
  );
}

export function BreadcrumbLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link href={to} underline="hover" color="text.secondary" variant="caption" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
      {children}
    </Link>
  );
}
