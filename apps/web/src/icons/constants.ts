/** Default pixel sizes for SvgIcon via `sx={{ fontSize: ICON_PX.* }}` — keep icon scale consistent. */
export const ICON_PX = {
  inline: 16,
  list: 18,
  control: 20,
  /** Sidebar / compact nav rows */
  nav: 18,
  /** Small chip adornment */
  chip: 14,
  /** Large empty-state hero (e.g. no posts, no boards) */
  emptyState: 48,
  emptyStateCompact: 40,
} as const;
