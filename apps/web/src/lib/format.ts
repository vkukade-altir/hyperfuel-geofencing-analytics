import { format, formatDistanceToNow } from "date-fns";

/**
 * Parse API timestamps (stored as UTC) into a Date for local display.
 * Naive ISO strings (no Z or offset) are treated as UTC.
 */
export function parseApiDate(iso: string): Date {
  const s = iso.trim();
  const hasTz = /[zZ]$|[+-]\d{2}:\d{2}$/.test(s);
  return new Date(hasTz ? s : `${s}Z`);
}

/** Local date/time for tables and cards. Backend is always UTC. */
export function formatTs(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return format(parseApiDate(iso), "MMM d, yyyy h:mm a");
  } catch {
    return iso;
  }
}

/** Local date/time with timezone name — use in detail drawers. */
export function formatTsLocal(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    const d = parseApiDate(iso);
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return `${format(d, "MMM d, yyyy h:mm a")} (${tz})`;
  } catch {
    return iso;
  }
}

export function formatRelative(iso: string | null | undefined): string {
  if (!iso) return "never";
  try {
    return formatDistanceToNow(parseApiDate(iso), { addSuffix: true });
  } catch {
    return iso;
  }
}

/** Human-readable duration — "12 minutes", not "12m 0s". */
export function formatDwell(seconds: number | null | undefined): string {
  if (seconds == null) return "—";
  if (seconds < 60) {
    return seconds === 1 ? "1 second" : `${seconds} seconds`;
  }
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins < 60) {
    if (secs === 0) return mins === 1 ? "1 minute" : `${mins} minutes`;
    return `${mins} min ${secs} sec`;
  }
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  if (remMins === 0) return hrs === 1 ? "1 hour" : `${hrs} hours`;
  return `${hrs} hr ${remMins} min`;
}

export function formatCoord(lat: number, lng: number): string {
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

export function truncateId(id: string, len = 12): string {
  if (id.length <= len) return id;
  return `${id.slice(0, len)}…`;
}
