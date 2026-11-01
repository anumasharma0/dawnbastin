# Dawbastion Landing Page — Design System

Visual reference: the "Liberty — Cybersecurity Landing Page" Dribbble shot (a dark,
enterprise B2B security SaaS marketing site). This governs the **public marketing
surface only** — `app/page.tsx` and everything in `components/landing/`. It is a
deliberately different visual language from the authenticated app's dashboard
(`frontend/DESIGN.md`, the ANY.RUN-referenced `--ar-*` system used by `/dashboard`,
`/reports`, etc.) — real companies routinely run a different identity for their
marketing site than their product UI, and the Liberty reference is a different
aesthetic entirely (near-black + teal, hairline grids, pill CTAs) from the
dashboard's navy card/rail system.

**Honesty note:** built from two screenshots of the Dribbble shot (a cropped
close-up, then the full page top-to-bottom), not the live interactive page — so
spacing/hover states/animation are not observed, only the static layout. Hex
values below are close estimates to tune against the real shot, not pixel-exact
extraction. The hero's binary-digit texture, the light-streak effect, and the
footer's giant wordmark watermark are described as visual devices to *recreate*
(e.g. via SVG/canvas/CSS), not assets to copy from someone else's shot.

## Colour tokens (`--lp-*` — separate from the dashboard's `--ar-*`)

| Token | Value | Used for |
| --- | --- | --- |
| `--lp-bg` | `#0A0B0D` | Base page background — near-black, not pure black |
| `--lp-bg-alt` | `#0E1116` | Alternating panel tint (testimonial block, badge grid cells) |
| `--lp-nav-bg` | `rgba(8,9,11,0.85)` | Sticky nav, blurred |
| `--lp-ink` | `#FFFFFF` | Headings, stat numbers |
| `--lp-ink-dim` | `#9BA7B4` | Body copy, nav links |
| `--lp-ink-faint` | `#6B7684` | Eyebrow labels, captions, fine print |
| `--lp-accent` | `#38D6E8` | The signature teal/cyan — gradient bars, badges, links on hover |
| `--lp-accent-dim` | `#1A6B78` | Accent at low intensity (icon strokes, subtle glows) |
| `--lp-hero-grad-start` | `#0C4A58` | Hero banner gradient, top-left |
| `--lp-hero-grad-end` | `#070B10` | Hero banner gradient, fading to page bg |
| `--lp-border` | `rgba(255,255,255,0.08)` | Hairline dividers everywhere — stat columns, badge grid, nav bottom edge |
| `--lp-cta-bg` | `#F2F4F6` | Primary button fill (light pill, inverted from the dark page) |
| `--lp-cta-ink` | `#0A0B0D` | Primary button text |

No light mode. This reference commits to one dark visual world end to end — don't
add a light-mode variant.

## Typography

- Headings: **Manrope**, bold (700–800), tight tracking (`-0.01em` to `-0.02em`).
  A grotesk, not the dashboard's Roboto — the marketing site gets its own voice.
- Body / nav / captions: **Inter**, regular/medium.
- Numerals (stats): Manrope bold, `font-variant-numeric: tabular-nums`.
- Eyebrow label (above every section heading): 11px, uppercase, `letter-spacing:
  0.14em`, `--lp-ink-faint`, centered above centered sections, left-aligned above
  left-aligned ones. Every section in the reference has one — treat it as mandatory,
  not optional, structure (it's literally labeling what kind of section follows:
  "ENTERPRISE SECURITY", "SECURITY STANDARDS", "CORE FEATURES", "RECOGNIZED BY
  INDUSTRY", "CUSTOMER STORIES").
- Section heading: 32–40px, white, centered by default; left-aligned only in a
  two-column section that has a graphic on the other side (see "Core Features" below).
- Body paragraph under a heading: 15–16px, `--lp-ink-dim`, centered, max ~60ch.

## The signature motif: the gradient signal bar

The one visual device that repeats across the whole page and ties it together —
treat it as a real reusable component, not a one-off:

```css
.lp-signal-bar {
  height: 3px;
  border-radius: 999px;
  background: linear-gradient(90deg, transparent, var(--lp-accent), #fff);
}
```

Four places it appears, confirmed against the full-page reference:
1. **Hero stat readout** — "THREAT MONITORING · 100%" sits above a wide version of
   this bar acting as a filled progress/loading indicator.
2. **Section divider** — a near-full-width version of the bar sits directly above a
   centered section heading, in place of a plain `<hr>`. It's wide, not a short
   centered accent — treat it as a full divider rule, not a small flourish.
3. **Equalizer graphic** — next to the "Core Features" copy block, a stack of
   horizontal bars, each the same teal→white gradient, growing longer from the
   top row to the bottom row (shortest at top-left, longest at bottom-right) — an
   abstract stand-in for "signal," not a real chart.
4. **Closing-CTA → footer transition** — the same full-width gradient bar reappears
   once more directly above the footer, marking the page's final section break.

## Layout

### Nav
Sticky, full-bleed, `--lp-nav-bg` with backdrop blur, bottom hairline
(`--lp-border`). Logo mark + wordmark on the left, centered link group (Products,
Solutions, Pricing, Resources, Contact Us) with dropdown chevrons on two of them,
solid `--lp-cta-bg` pill button ("Schedule a Demo") on the right. No ghost sign-in
link visible in the reference — unlike the dashboard nav, the marketing nav commits
fully to one CTA.

### Hero
Full-bleed banner directly under the nav, **not** a rounded/inset card — gradient
background (`--lp-hero-grad-start` → `--lp-hero-grad-end`, radial or diagonal),
overlaid with a faint binary-digit texture (`0`/`1` characters, monospace,
`--lp-ink` at ~6–10% opacity, scattered in loose columns) and one diagonal
light-streak accent in `--lp-accent` at low opacity suggesting motion. Content:
- Small pill badge ("NEW" tag + one-line announcement), `--lp-border` outline.
- Two-line bold headline, max ~20 characters per line.
- One-paragraph subhead, `--lp-ink-dim`, max ~55ch.
- Two buttons: solid `--lp-cta-bg` pill (primary) + outlined ghost button with a
  play-icon circle (secondary, "How It Works").
- A small stat readout anchored to one side (see signal bar above). **Deviation from
  the reference:** this slot currently holds a full live product-preview card
  (`SandboxPlanCard` with `autoPlay`, from `components/SandboxPlanCard.tsx`) instead
  — the actual plan-review accordion from the authenticated app, scripted to play
  itself on a loop. It's the one deliberately light surface on an otherwise
  dark-only page: treated as an embedded screenshot of the real (light-themed)
  product UI, not a light-mode variant of the marketing page's own components, and
  it reuses the testimonial panel's "accent glow behind an elevated surface" device
  rather than introducing a new one.

### Logo strip
Directly on `--lp-bg` (not inside the hero gradient). "TRUSTED BY" eyebrow label on
the far left, then 5 grayscale/white wordmarks at reduced opacity (~55–70%),
separated by `--lp-border` vertical hairlines, evenly distributed across the row.

### Stat row
No cards. Plain columns on `--lp-bg`, separated by `--lp-border` vertical hairlines.
Each column: big bold white number (tabular nums) + small caption below in
`--lp-ink-faint`. A `.lp-signal-bar` sits above the whole row as a section divider.

### Compliance / badge grid
A 2-column (2×2 or 2×N) lattice: each cell separated by `--lp-border` hairlines,
alternating cell background between `--lp-bg` and `--lp-bg-alt` (a checkerboard
effect), with a soft `--lp-accent-dim` gradient wash bleeding in from one edge of
the panel. Each cell: a circular badge (thin white-stroke outline icon, no fill) +
bold title + one-line `--lp-ink-dim` description.

### Two-column feature section ("Core Features")
Left-aligned heading + body + a short checklist (small square bullet marks, not
circles — `--lp-accent` fill, 4px square) on one side; the equalizer-bar graphic
(signal motif) on the other. This is the one section that breaks the
centered-content rule — reserve left-alignment for exactly this "copy beside a
graphic" shape.

### Award/recognition strip
A plain row of small award badges under a centered "RECOGNIZED BY INDUSTRY"
eyebrow — visually lighter than the compliance grid (no cell borders, just a loose
row). Mixed badge shapes, confirmed from the full page: circular medallions and
shield/ribbon-style award badges side by side, all grayscale/outline, no fill —
this is the one spot on the page where badge shape varies; don't force every badge
into the same circular mold here the way the compliance grid does.

### Testimonial panel
Two testimonials, stacked full-width (not side-by-side columns), each: a quote
(18–20px, `--lp-ink`, regular weight, not italic) + a rounded-square headshot photo
with a soft `--lp-accent` radial glow bleeding behind it + name, title, and a small
company wordmark underneath. A single `--lp-border` hairline separates the two. The
panel sits on roughly the same tone as the page background — this is *not* a
strongly elevated card the way a typical SaaS testimonial block is; the glow behind
each photo is what gives the section its visual weight, not a card surface.

### Closing CTA
A second "hero-like" moment right before the footer: centered eyebrow ("SECURE YOUR
BUSINESS"), a two-line bold heading, one-line subhead, and the exact same two-button
pair as the hero (solid pill + outlined "How It Works") — reusing the hero's button
styling verbatim signals that this is the page's second and final conversion point,
not a new pattern.

### Footer
Four columns on `--lp-bg`: brand (logo mark + wordmark + a one-line tagline), then
three link lists ("Use Cases", "Resource", "Company"), each with a small uppercase
label and 5–7 plain `--lp-ink-dim` links. Below that, a thin `--lp-border` rule and
a copyright line. Then the signature device: a giant, low-opacity wordmark of the
brand name ("Liberty" in the reference) set in a huge display size and cropped at
the bottom edge of the viewport — purely decorative, never fully readable, sitting
behind/below the real content. Recreate this as the product's own name at
~15–20% opacity in `--lp-ink`, sized so only its top half is visible before the
page ends.

## Components

### Buttons
- **Primary**: `--lp-cta-bg` fill, `--lp-cta-ink` text, fully rounded (`border-radius:
  999px`), bold 14–15px, horizontal padding ~24px. This is the only button that
  inverts light-on-dark — reserve it for the one primary action per view.
- **Secondary / ghost**: transparent, 1px `--lp-border`, white text, radius 8–10px
  (not a pill — this distinguishes it from primary at a glance), optional leading
  icon in a small circular outline.

### Badges
- **Announcement pill** (hero "NEW" tag): `--lp-border` outline, `--lp-ink-dim`
  text, small uppercase "NEW" chip in `--lp-accent` at the front.
- **Compliance seal**: circular, thin white stroke, no fill, centered icon glyph,
  title + description below, used only in the compliance grid.
- **Award medallion**: smaller circular badge, outline style, used only in the
  recognition strip — visually distinct from the compliance seal (no description
  text under it, just the icon).

## Rules

- Commit to dark only. No light-mode variant for the marketing site.
- Every section gets an eyebrow label. Centered sections get a centered heading;
  the one copy-beside-graphic section gets left alignment — don't mix those two
  patterns within the same section.
- The gradient signal bar is the one recurring decorative device. Don't introduce a
  second, competing decorative motif (no separate icon style, no second gradient
  direction) — reuse this one everywhere a divider or data-viz accent is needed.
- Hairline borders (`--lp-border`) are the only separators. No drop shadows, no
  heavy card borders — the one exception is the single testimonial panel, which is
  the page's only true "elevated card."
- Logos and award badges stay monochrome/outline — color is reserved for the accent
  teal and the primary CTA, never spent on third-party logo marks.

## Relationship to the already-scaffolded components

`components/landing/{Nav,Hero,Features,HowItWorks,ClosingCta}.tsx` already exist but
currently borrow the dashboard's `--ar-*` tokens, Roboto-adjacent type, and the
world-map background — none of that matches this system yet. This document
describes the target; re-theming those components to it is a separate, not-yet-done
step.
