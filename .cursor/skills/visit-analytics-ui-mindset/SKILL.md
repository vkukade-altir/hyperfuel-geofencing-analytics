---
name: visit-analytics-ui-mindset
description: >-
  Defines the Hyperfuel Visit Analytics dashboard visual and product mindset—calm,
  minimal, typography-led, leadership-first station traffic vs engineer drill-down.
  Use when designing or building any screen, component, layout, or flow in apps/web,
  or when the user asks for UI that should match Visit Analytics look and feel.
---

# Visit Analytics UI mindset

Use this when you add or change anything the user sees. The goal is to get the **right feel in one pass**: confident, calm, and professional—not flashy, not generic “AI product,” not busy.

---

## What we are building

Hyperfuel **Visit Analytics** is a geofencing analytics dashboard: leadership sees **station and amenity foot traffic**, **time spent**, and **who visited** so they can decide where to place offers. Engineers debug ping processing, Arrived/Left correctness, and open visits via **technical details** behind collapsible sections.

Two audiences—never mix their primary paths on the same surface:

- **Leadership & product** — Stations first. Plain numbers, scannable tables, answers to: *Who visited? How often? How long? Are they still there?*
- **Engineers** — User drill-down, source pings, IDs, raw payloads—**behind** the human view, not in default columns or KPIs.

Before writing or changing UI, ask: *Who is reading this screen, and what decision are they trying to make?*

---

## The overall mood

Think **quiet office or studio**, not a loud marketing site.

- **Calm first.** If something shouts for attention, dial it back unless it is a real error or the one primary action on the screen.
- **Flat and honest.** The background is not a gradient poster. Surfaces sit next to each other with **spacing and light borders**, not heavy shadows or color washes everywhere.
- **Typography does the work.** Hierarchy comes from **size, weight, and spacing**—not from rainbow accents or extra boxes.
- **Color is sparse.** One accent family is enough for links and primary actions. Most of the screen is **neutral ink and paper**.
- **Hovers and selections stay neutral.** A row or chip should feel **slightly lifted or tinted gray**, not glowing brand color.

Light mode is the default canvas: **plain white or near-white** workspace, **bordered cards** that read as separate content blocks.

---

## Light mode: page vs cards

The **main workspace** (the big area behind content) should feel **clean and bright**—think **plain white or near-white**, not a gray “swimming pool” behind everything.

**Cards, sidebars, and raised panels** should still read as **separate objects**: usually a **clear edge or border** so they do not disappear into the page. You are separating **canvas** from **content blocks**, not painting the whole app gray.

---

## Layout and density

- **Stations first** — foot traffic and time spent per station/amenity is the leadership home for offer placement.
- **Let the eye rest.** Prefer **predictable columns**, comfortable line length for reading text, and **group related things** so users are not hunting.
- **Avoid dead air for no reason.** If a huge empty gap does not help scanning or reading, tighten it. If space **does** help (between sections), keep it **intentional**.
- **Toolbars and filters** feel like a **thin strip** above a list or table: flat, bordered, calm—not a second hero banner.

---

## User-facing copy (every surface)

**Any** text the product shows to a person—in **tables, KPIs, empty states, buttons, or confirmations**—should read like **product copy**, not API docs or internal notes.

| Avoid (engineering) | Use (human) |
|---------------------|-------------|
| ENTER / EXIT | Arrived / Left |
| Ping | Location update |
| Geo event | Visit recorded |
| Entity | Place (station or amenity) |
| Dwell | Time spent |
| Session | Visit |
| Open session | Still there |
| Unique visitors | People who visited |

- Prefer **names and emails** over UUIDs in main views. Hide `source_ping_id`, `client_ping_id`, `entity_id`, and `user_id` in **Technical details** drawers or collapsible sections.
- Reserve exact paths, field names, and technical identifiers for **engineer drill-down**—not for default labels or first-run explanations.

---

## Time and dates

Backend stores **UTC**. The UI **always** converts to the **viewer's local timezone**—never show raw ISO strings in tables or cards.

- Prefer **short, scannable dates** where space is tight (sidebars, tables, metadata).
- **“How long ago”** is nice in activity threads; pairing it with a **compact absolute time** is fine when staff need certainty.
- Avoid the longest possible month names and redundant phrasing unless the product truly needs legal-style precision everywhere.

---

## Modals and pickers

Pop-ups should **feel like they belong to the app**: same spacing rules, same type rhythm, same neutral chrome.

If the browser shows its **own** calendar or date UI, you cannot fully restyle it—but you can still **frame** the flow cleanly: clear sections, calm labels, presets grouped sensibly, and **no competing visual noise** around the fields.

---

## Top bar and navigation

The bar at the top should not feel like a **floating strip of nothing**. It can carry **light context** (product name, current section) without turning into a billboard. **Actions** can sit in a **small, grouped cluster** so the right side does not feel scattered.

Primary nav order: **Stations** → **Users** → technical/debug surfaces only when needed.

---

## What to avoid

- **Purple (or brand) everywhere**: on every hover, every border, every chip.
- **Gradients and glass** as the default personality.
- **Emoji or cute symbols** standing in for real icons where the app already has an icon set.
- **Schema-first UI** — column headers that mirror database fields (`source_ping_id`, `geometry_type`).
- **IDs as primary identifiers** — monospace UUIDs where a name, email, or place name exists.
- **Debug-first layout** — building the engineer drawer before the leadership summary works.
- **Dead-end numbers** — KPIs with no context (what does “42 Arrivals” mean to a PM?).
- **Developer-shaped copy** anywhere leadership reads it.

---

## How to check yourself

Before you call a screen done, ask:

1. Would a **busy product lead** understand this in a few seconds?
2. Does this look like **one product**, or like a **third-party widget** dropped in?
3. Is **color** doing **meaningful** work, or just decorating?
4. For this screen, **who** is the audience—and would the **other** audience be confused or burdened?
5. Are timestamps shown in **local time**, and are **IDs hidden** from the happy path?

If you follow this mindset, new work should **match what already landed**: Stations, Users, entity detail, and technical drill-down—not fight it.
