# Dawbastion Design System

Visual reference: the ANY.RUN analysis dashboard. Every page in this app follows it:
the icon rail, the large accent page title, the world-map background, and the
dark-blue card and list styling. Dawbastion branding is used throughout.

Colours are defined once in `app/globals.css` under `:root` as `--ar-*` tokens. Tune a
value there and every page follows. The values were estimated by eye from the reference
screenshots, so adjust them after a side-by-side check in the browser.

## Colour tokens

| Token | Value | Used for |
| --- | --- | --- |
| `--ar-bg` | `#0A3A60` | Page background (behind the world map) |
| `--ar-bg-deep` | `#062C4A` | Scrollbar track, status bar, deepest surfaces |
| `--ar-sidebar` | `#0A3558` | Icon rail |
| `--ar-card` | `#0D4775` | Cards, panels, list container, inputs |
| `--ar-card-2` | `#0A3D66` | Secondary panels, pagination bar, tag chips |
| `--ar-active` | `#0F4A7A` | Active rail item |
| `--ar-border` | `#1B5A8A` | Dividers, panel borders |
| `--ar-border-strong` | `#2A6FA6` | Input and dropdown outlines |
| `--ar-primary` | `#17A2E8` | New analysis button, primary buttons, rail logo, filter button |
| `--ar-primary-soft` | `#1A6FAE` | Selected folder row |
| `--ar-accent` | `#4FC3FF` | Page titles, icons, links, card subtitles |
| `--ar-cyan` | `#1FB8F0` | Card outlines, "No threats detected" badge |
| `--ar-warn` | `#F2C94C` | "beta" badge |
| `--ar-muted` | `#9CC4E4` | Body and secondary text, inactive rail items |
| `--ar-muted-2` | `#6FA3C9` | Captions, placeholders, section labels |

Semantic severity colours (`#ef4444` critical, `#f97316` high, `#eab308` medium,
`#34d399` low, `#00bcd4` info) stay as they are. They must remain distinct from the
accent palette, so do not use them for decoration.

## Typography

- Family: Roboto, fallback Inter, system-ui, sans-serif. Monospace for file names,
  hashes, paths and tags: JetBrains Mono.
- Page title: 36px (`text-4xl`), regular weight, `--ar-accent`, slight negative tracking.
  Used on every page, including Reports ("Reports") and Home ("Start your analysis").
- Subtitle under a title: 14px, `--ar-muted`.
- Section heading: 14px, semibold, white (e.g. "Deep interactive investigation in full environment").
- Card title: 18px, bold, white. Card subtitle: 14px, `--ar-accent`, centred, up to 3 lines.
- Rail label: 11px, `--ar-muted`. Active label: white.
- List row title: 14px, semibold, white. List row meta: 12px, `--ar-muted`.

## Layout

### Icon rail (every page)
- Fixed 72px wide, full height, `--ar-sidebar`, right border `--ar-border`.
- Top to bottom: logo tile (36px, `--ar-primary`), then the New analysis button
  (full rail width, `--ar-primary`, two-line label "New / analysis" with a plus icon),
  then the main group: Reports, Teamwork, History, TI.
- Below a divider: save-destination folder button, then Alerts, Profile, Pricing,
  Contacts, FAQ, and Log out.
- Each item is an 18px line icon above an 11px label, centred. The active item has an
  `--ar-active` background and white text.
- The rail never shows text labels beside icons. Do not revert to a wide sidebar.

### Main area
- Scrolls vertically. Left padding 32px on wide screens, 40px in the home column.
- Title block first, then toolbar (search, dropdown, filter button) aligned right on the
  same baseline as the title, then content.
- The world map sits behind the content at `inset-0`, `pointer-events: none`.
  Every main-area page shows it.

### Status bar (home)
- Fixed bottom, `left: 72px` (the rail width), right 0, `--ar-bg-deep` at 92% opacity,
  top border `--ar-border`.
- Reads: "Your current status" · status badge (`--ar-primary`, "Guest") · "Access Period:" · value · thumbs-up icon.

## Components

### Cards (home)
- Background `--ar-card`, 1px `--ar-cyan` border, radius 12px, min height 280px, centred content.
- Icon: 48px line icon in `--ar-accent`, no tinted box behind it.
- Hover: brightness up, slight press scale. No layout shift.

### Search and dropdown (toolbar)
- Input: `--ar-card` background, 1px `--ar-border-strong`, radius 6px, search icon in `--ar-muted`, placeholder `--ar-muted-2`.
- Select: same surface, chevron icon, no native appearance.
- Filter button: square, `--ar-primary`, white line icon.

### List rows (Reports)
- Container: `--ar-card`, 1px `--ar-border`, radius 8px, scrolls inside its own box.
- Rows alternate between two translucent accent tints (`rgba(79,195,255,0.10)` and `0.04`)
  with a 1px `--ar-border` divider.
- Column grid: OS and time (170px) · status tick (28px) · verdict, name and tags
  (flexible) · hashes (260–400px).
- Verdict badge: 11px, medium weight, white text on the tone colour:
  `ok` → `--ar-cyan`, `warn` → `#f97316`, `neutral` → `--ar-card-2` with muted text.
- Tags: 10px monospace chips on `--ar-card-2` with a `--ar-border` outline and `--ar-accent` text.
- Hashes: 11px monospace. Label in `--ar-muted`, value in white, copy button on the right.
- Pagination bar: `--ar-card-2` strip at the bottom of the container, prev/next buttons, and a
  "N OF M" monospace pill.

### Buttons
- Primary: `--ar-primary` background, white text, radius 6–8px.
- Secondary: transparent with `--ar-border` outline and `--ar-muted` text.
- Disabled: 40% opacity, no hover effect.

### Badges
- `beta`: `--ar-warn` background, `--ar-bg-deep` text, 10px bold, radius 4px.
- Status (rail, home): `--ar-primary` background, white bold text.

## Rules

- Use tokens, never hex literals, in components. Inline `style` values must be `var(--ar-...)`.
- Every page uses the rail and the large accent title. Do not add a page with a different header style.
- Do not add tinted icon boxes on cards or list rows. Icons stand on the background.
- Show the world map on every main-area page.
- Keep text labels out of the rail. Use the `title` attribute for tooltips.
- Use semantic severity colours only for severity. Do not repurpose them for decoration.
- Placeholder pages (`/teamwork`, `/history`, `/ti`, `/notifications`, `/profile`, `/pricing`, `/faq`) use the shared `AppPage` shell and its "Nothing here yet." empty state until they have data.
