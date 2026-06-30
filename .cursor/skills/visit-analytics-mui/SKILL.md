---
name: visit-analytics-mui
description: >-
  Material UI import boundaries and theme conventions for the Hyperfuel Visit Analytics
  web app. Use when adding MUI components, customizing theme tokens, or deciding where
  MUI imports are allowed in apps/web.
---

# Visit Analytics + Material UI (MUI)

## Import boundary

- **Allowed:** `@mui/material` and `@emotion/*` under `apps/web/src/ds/` and `apps/web/src/theme/`; `@mui/material` (e.g. `SvgIcon`) under `apps/web/src/icons/` for icon components only.
- **Icons:** Import from `@/icons` only — not `@mui/icons-material`.
- **App code:** Import UI from `@/ds` (primitives + layout re-exports). Do not import MUI directly in pages, hooks, or services.

Paths are relative to `apps/web/`:

| Layer | Path |
|-------|------|
| Design system re-exports | `src/ds/` |
| Theme tokens & overrides | `src/theme/` |
| Icon components | `src/icons/` |

## Documentation index

| Topic | URL |
|-------|-----|
| Material UI home | https://mui.com/material-ui/ |
| Getting started | https://mui.com/material-ui/getting-started/ |
| Installation | https://mui.com/material-ui/getting-started/installation/ |
| Usage | https://mui.com/material-ui/getting-started/usage/ |
| How to customize | https://mui.com/customization/how-to-customize |
| Theming | https://mui.com/material-ui/customization/theming/ |
| Dark mode | https://mui.com/material-ui/customization/dark-mode/ |
| CSS theme variables | https://mui.com/material-ui/customization/css-theme-variables/configuration/ |
| Integrations (Vite) | https://mui.com/material-ui/integrations/ |
| Upgrade to v7 | https://mui.com/material-ui/migration/upgrade-to-v7/ |
| Components (nav) | https://mui.com/material-ui/all-components/ |
| Component API | https://mui.com/material-ui/api/ |

## Theme

- Tokens live in `apps/web/src/theme/` (`createAppTheme`, palette, typography, component overrides).
- Color mode storage key: `apps/web/src/theme/color-mode-storage.ts` (when implemented).
- Match the Visit Analytics UI mindset: calm, minimal, white canvas light mode, bordered cards, sparse accent color, neutral hovers.
