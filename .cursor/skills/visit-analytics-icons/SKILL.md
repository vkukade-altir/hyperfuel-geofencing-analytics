---
name: visit-analytics-icons
description: >-
  Enforces Visit Analytics icon sourcing from apps/web/src/icons, semantic naming,
  ICON_PX sizes, and the external kebab-case SVG library fallback. Use when adding
  or changing icons in UI, replacing Unicode arrows or emoji, auditing icon usage,
  or creating new SvgIcon components.
---

# Visit Analytics icons (application UI)

## Source of truth

- **All icons in application UI** come from **`@/icons`** (`apps/web/src/icons/`). Never put raw SVG markup in pages, components, or `src/ds` except inside `src/icons/**`.
- Do **not** use `@mui/icons-material`, ad-hoc `.svg` imports in feature code, or emoji as stand-ins for icons.
- Reuse **`ICON_PX`** from [`apps/web/src/icons/constants.ts`](apps/web/src/icons/constants.ts) when choosing sizes so spacing stays consistent.

## Choosing an icon (order of operations)

1. **Search `src/icons`** — grep or read [`apps/web/src/icons/index.ts`](apps/web/src/icons/index.ts) and individual modules for a **semantically correct** name (e.g. delete → `Trash`, not a random X; settings → `Gear`; refresh data → `Refresh`).
2. **If nothing fits the meaning** — open the external library at **`/Users/vkukade/Documents/Icons/output`** (flat `kebab-case.svg` files, same line style as the rest of the set). Pick the file that **best matches the user-facing action or object**, not “something that looks cool.”
3. **Add a new component** — create `src/icons/PascalCase.tsx` from that SVG (`viewBox` + paths, `currentColor`, MUI `SvgIcon` + `SvgIconProps`), export it from [`apps/web/src/icons/index.ts`](apps/web/src/icons/index.ts), then **`import { … } from "@/icons"`** in the feature.

## Semantic fit for analytics (non-negotiable)

The icon must **read correctly at a glance** for leadership and engineer audiences. Prefer these mappings when they exist in `src/icons`:

| Concept | Prefer |
|---------|--------|
| Station / place | `LocationPin`, `Building`, `Pin` |
| People / visitors | `Users`, `User`, `UserCircle` |
| Visit / session | `Visit`, `VisitCompleted`, `VisitScheduled` |
| Time spent / duration | `Clock`, `Timer` |
| Refresh / reload data | `Refresh` |
| Search / filter | `Search`, `FilterIcon` |
| Trends / metrics | `BarChart`, `Metric`, `TrendUp`, `TrendingDown` |
| Navigation | `ChevronLeft`, `ChevronRight`, `ChevronDown`, `ChevronUp` |
| Overflow menu | `MoreHorizIcon`, `MoreVert` |
| External link | `ExternalLink`, `OpenInNewTab` |

- **Do not** substitute unrelated metaphors (e.g. a star for “delete,” or a heart for “station”) unless the product copy explicitly frames it that way.
- Prefer **one canonical icon per concept** across the app so the UI feels intentional, not random.

## Restraint

- Add icons where they **aid recognition** (primary actions, empty states, nav, KPI affordances). Avoid iconifying every row, label, and caption — dense analytics screens stay mostly text + clear hierarchy.

## Unicode and typography

- **Do not** use Unicode symbols as stand-ins for icons in UI: e.g. `←` `→` `▲` `···` for navigation, status, or overflow menus — use the matching component from **`@/icons`** (`ChevronLeft`, `ChevronRight`, `ChevronUp`, `MoreHorizIcon`, etc.) with **`ICON_PX`**.
- **OK to keep** the middle dot **`·`** (or similar) as a **text separator** between inline metadata (e.g. “Name · time”) when it is pure typography, not an actionable affordance.

## Enforcement

- When ESLint restricts inline `<svg>` and `@mui/icons-material` outside the icon layer, keep new code compatible with the project's eslint config.
- **`SvgIcon` from `@mui/material`** is allowed **only** inside `src/icons/**` when building icon components.
