---
version: alpha
name: Sim Alfida
description: Desain sistem informasi manajemen Yayasan Alfida
colors:
  primary: "#454545"
  secondary: "#06bfa2"
  tertiary: "#0f7f6d"
  neutral: "#F7F8F8"
  surface: "#FFFFFF"
  on-tertiary: "#F7F8F8"
  border: "#E3E8E7"
typography:
  h1:
    fontFamily: Roboto
    fontSize: 3rem
    fontWeight: 700
  body-md:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: 400
  label-caps:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: 600
rounded:
  sm: 4px
  md: 8px
spacing:
  sm: 8px
  md: 16px
  lg: 24px
components:
  button-primary:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.on-tertiary}"
    rounded: "{rounded.sm}"
    padding: "12px 20px"
  button-secondary:
    backgroundColor: transparent
    textColor: "{colors.tertiary}"
    rounded: "{rounded.sm}"
    padding: "12px 20px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: 20px
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    rounded: "{rounded.sm}"
    padding: "10px 14px"
---

# Sim Alfida

## Overview

Desain sistem informasi manajemen Yayasan Alfida

## Colors

The palette is rooted in semantic tokens. Use the role (e.g. `{colors.primary}`) — never the hex literal — when authoring components.

- **primary (#454545)**
- **secondary (#06bfa2)**
- **tertiary (#0f7f6d)**
- **neutral (#F7F8F8)**
- **surface (#FFFFFF)**
- **on-tertiary (#F7F8F8)**
- **border (#E3E8E7)**

## Typography

| Token | Font | Size | Weight |
| --- | --- | --- | --- |
| `h1` | Roboto | 3rem | 700 |
| `body-md` | Inter | 1rem | 400 |
| `label-caps` | Inter | 0.75rem | 600 |

## Layout

Spacing scale (use the named scale; avoid arbitrary values):

- `spacing.sm` — 8px
- `spacing.md` — 16px
- `spacing.lg` — 24px

## Elevation & Depth

Depth is conveyed through tonal layering and subtle borders rather than drop shadows. Cards lift from the warm neutral background through pure-white surfaces and a single hairline border.

## Shapes

Corner radius scale:

- `rounded.sm` — 4px
- `rounded.md` — 8px

## Components

### button-primary
- backgroundColor: `{colors.tertiary}`
- textColor: `{colors.on-tertiary}`
- rounded: `{rounded.sm}`
- padding: `12px 20px`

### button-secondary
- backgroundColor: `transparent`
- textColor: `{colors.tertiary}`
- rounded: `{rounded.sm}`
- padding: `12px 20px`

### card
- backgroundColor: `{colors.surface}`
- textColor: `{colors.primary}`
- rounded: `{rounded.md}`
- padding: `20px`

### input
- backgroundColor: `{colors.surface}`
- textColor: `{colors.primary}`
- rounded: `{rounded.sm}`
- padding: `10px 14px`

## Workspace & Component Architecture

Seluruh aset UI (komponen, halaman, *design tokens*) berada di dalam workspace `apps/web/`. Backend (`apps/api/`) tidak memiliki kode UI sama sekali.

- Komponen reusable berada di `apps/web/src/components/ui/`
- Komponen domain-specific berada di `apps/web/src/components/features/`
- Jika ke depan diperlukan *shared UI library*, komponen dapat dipromosikan ke `packages/ui/`

## Do's and Don'ts

- Do use the tertiary color sparingly — only for the highest-emphasis action.
- Don't combine more than two type families on a single screen.
- Don't use full-width images without a generous bottom margin.
- Do default to the warm neutral background; reserve pure white for cards.
- Do use Material UI Icons (Google) for all iconography.
- Don't use emojis for icons in the UI.
- Do keep all UI components exclusively in `apps/web/`. Never place React components in `apps/api/`.
- Don't import Prisma or database logic in `apps/web/`. All data fetching goes through the NestJS API.
