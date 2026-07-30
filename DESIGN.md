---
name: BHINEKALED
description: Vehicle LED lighting & accessories e-commerce — bold, energetic, high-contrast red-on-white.
colors:
  primary: "#e6212a"
  primary-hover: "#bd1b22"
  ink: "#1a1a1a"
  surface: "#f5f5f4"
  background: "#ffffff"
  foreground: "#171717"
  border: "#e5e5e5"
  text-muted: "#737373"
  status-pending: "#b45309"
  status-success: "#15803d"
  status-progress: "#1d4ed8"
typography:
  display:
    fontFamily: "Poppins, Helvetica, Arial, sans-serif"
    fontSize: "clamp(2.25rem, 5vw, 3.75rem)"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "normal"
  headline:
    fontFamily: "Poppins, Helvetica, Arial, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "normal"
  body:
    fontFamily: "Inter, Helvetica, Arial, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Inter, Helvetica, Arial, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.02em"
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  full: "9999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  section: "48px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.full}"
    padding: "10px 24px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  input:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
  card:
    backgroundColor: "{colors.background}"
    rounded: "{rounded.lg}"
    padding: "16px"
---

# Design System: BHINEKALED

## Overview

**Creative North Star: "High Beam"**

BHINEKALED reads like a headlight cutting through the dark: high-contrast, direct, no ambiguity about where to look. Signal red is no longer rationed to a single accent — on shopping surfaces it fills the hero, carries promo tiles, and lifts product cards off the page with real, tactile shadow, the same confidence a premium retail storefront wears. Discipline still holds: it's one red, used boldly, never joined by a second hue.

The system draws directly from the logo: a bold rounded wordmark, a white outline holding red back from the edge, and a sunburst motif standing in for "menyala" — the sense of something switching on. Section accents (the short red bar above headings) are a deliberately small, controlled echo of that sunburst/bar device, not a decorative flourish invented from scratch.

**Key Characteristics:**
- Two elevation registers by mode: storefront (Persuade) surfaces are tactile — product/category cards carry real resting shadow and lift further on hover; admin (Operate) surfaces stay flat and bordered for scanability and density. Depth is a shopping-experience device, not a system-wide default.
- One brand red, used with confidence: large-scale hero/banner fills and promo tiles on the storefront, plus every CTA, price, and active state — still never diluted into a secondary accent color.
- Generous, consistent rounding (pill buttons, `rounded-lg`/`rounded-xl` cards) — sharp 90° corners are treated as off-brand, not just unstyled.
- A separate, semantic status-color layer (amber/green/blue) exists alongside the brand palette for order and payment states — those hues are functional, not brand accents, and must not be confused with or replace brand red.

## Colors

Two-color core (red + near-black-on-white) plus a light neutral secondary surface, with a distinct semantic layer for status communication.

### Primary
- **Signal Red** (`#e6212a`): the one brand accent, used confidently on storefront (Persuade) surfaces — full hero/banner fills, promo/sale tiles, category card accents — plus every CTA, price, and active nav/wishlist state everywhere. Admin (Operate) surfaces keep it restrained to actions and status accents only; density and scanability outrank expression there.
- **Signal Red, Pressed** (`#bd1b22`): hover/active state for anything filled with Signal Red. Always a darkened step of the same hue — never swap to a different red family (no stock `red-600`/`red-700`).

### Neutral
- **Ink Black** (`#1a1a1a`): dark-surface background (hero section, trust bar text-on-red context) and the highest-contrast text role.
- **Body Foreground** (`#171717`): default body text on white.
- **Warm Ash** (`#f5f5f4`): secondary/alternating section background and card fill — never pure white when a surface needs to sit "behind" primary content.
- **Hairline Border** (`#e5e5e5`, Tailwind `neutral-200`): default border for cards, inputs, table rows.
- **Muted Text** (`#737373`, Tailwind `neutral-500`): secondary/meta text — captions, helper text, disabled states.

### Status (semantic, not brand — do not treat as accent colors)
- **Pending Amber** (`#b45309` text / `amber-100` fill): awaiting action (order `menunggu_konfirmasi`, payment `pending`/`review`, archived product).
- **Success Green** (`#15803d` text / `green-100` fill): completed/active state (order `selesai`, payment `paid`, product `active`, fee active).
- **In-Progress Blue** (`#1d4ed8` text / `blue-100` fill): mid-flow state (order `diproses`).

### Named Rules
**The One Red Rule.** Signal Red is the only red anywhere in the interface — destructive actions, CTA hovers, hero fills, promo tiles, and every red-adjacent state derive from `#e6212a`/`#bd1b22`, never from Tailwind's stock `red-*` scale or a second accent hue. Bold, page-scale use is welcome on storefront surfaces; what's never welcome is a second color trying to do the same job. If a screen needs a warning color, reach for Status Amber, not a second red.

## Typography

**Display/Heading Font:** Poppins (700/800), with Helvetica/Arial fallback
**Body Font:** Inter, with Helvetica/Arial fallback

**Character:** A geometric, rounded-terminal display face carrying all the personality (bold, confident, slightly "loud") paired with a neutral, highly-legible body face that gets out of the way. The pairing exists specifically to echo the logo's rounded, bold wordmark without making every line of body copy shout.

### Hierarchy
- **Display** (800, `clamp(2.25rem, 5vw, 3.75rem)`, 1.1 line-height): hero headline only (`<h1>`).
- **Headline** (700, 1.5rem/24px, 1.3 line-height): section headings (`<h2>`) — "Produk Terbaru", "Kategori Produk", admin page titles.
- **Body** (400, 0.875rem/14px, 1.5 line-height): default UI and content text; comfortable for dense admin tables and product descriptions alike.
- **Label** (600, 0.75rem/12px, 0.02em tracking): buttons, badges, form labels, table headers — always semibold, slightly tracked out for legibility at small size.

### Named Rules
**The Two-Family Rule.** Exactly two font families exist in the system (Poppins for headings, Inter for everything else). A third family is never introduced for "emphasis" — weight and the display/body split carry all the hierarchy the system needs.

## Layout

Mobile-first, single content column with a `max-w-6xl` centered container and `px-4` gutters throughout — the same container width is reused across storefront and admin rather than each surface defining its own.

Section rhythm on the storefront is generous vertical spacing (`py-12` between major sections) with tighter internal grouping (`gap-3`/`gap-4`) inside a section — space communicates hierarchy between unrelated blocks, not just aesthetic padding. Grids are responsive by content: product/category grids step from 2 columns on mobile to 3 (tablet) to 5 (desktop) rather than a fixed count.

Admin surfaces are denser than the storefront: tighter padding, smaller type scale, tables wrapped in `overflow-x-auto` so dense data never breaks the viewport on mobile rather than being hidden or truncated.

## Elevation & Depth

Split by mode. Storefront (Persuade) surfaces are tactile: product cards, category tiles, and promo panels carry a real resting-state shadow and lift further on hover — the shopping experience is meant to feel like handling something, not reading a spec sheet. Admin (Operate) surfaces stay flat and bordered, as before: dense tables and forms rely on hairline borders (`border-neutral-200`) and whitespace, not shadow, because scanability there outranks tactile feel.

### Shadow Vocabulary
- **Card rest** (`shadow-sm`): default elevation for product cards, category tiles, and promo panels on the storefront — always present, not a hover-only accent.
- **Card hover** (`shadow-lg`, paired with a small upward translate): the lift a storefront card gets on hover/focus — confirms interactivity with real physical weight, not just a border-color shift.
- **Panel** (`shadow-md`): occasional floating/overlay context (e.g. a filter panel) that needs to read as sitting above the page.

### Named Rules
**The Two-Register Rule.** Elevation follows mode, not screen-by-screen taste: every storefront card rests on `shadow-sm` and lifts to `shadow-lg` on hover; every admin panel stays flat and bordered at every state. Moving a component between modes without re-deciding its elevation is a defect, not a style choice.

## Shapes

Rounded, consistently and deliberately — this is a direct, explicit brand commitment (`docs/BRAND_GUIDELINE.md` calls out avoiding "sharp 90° corners" as contradicting the logo's rounded character), not an incidental framework default.

- **Pills** (`rounded-full`): primary/secondary buttons, badges, status chips, the small brand-accent bar above section headings — anything meant to read as an action or a status.
- **Cards / panels** (`rounded-lg`–`rounded-xl`, 12px): product cards, category tiles, dialogs.
- **Form controls** (`rounded-md`, 8px): inputs, selects, small buttons — slightly tighter than card radius so dense forms don't feel oversized.

## Components

Confident and tactile: bold fills, decisive color, generous rounding — never a flat gray-on-gray utilitarian default. Every interactive element commits to either the brand fill or a clear bordered-outline state; there is no ambiguous "ghost" middle ground.

### Buttons
- **Shape:** pill (`rounded-full`, primary/secondary) or `rounded-md` (compact admin actions).
- **Primary:** `bg-brand-red` fill, white text, `font-semibold`, `px-4 py-2`–`py-3` depending on prominence.
- **Hover / Focus:** background steps to Signal Red Pressed (`#bd1b22`) on hover; focus state is always `focus:ring-1 focus:ring-brand-red` paired with the border color shift — outline is never removed without a ring replacing it.
- **Secondary / Outline:** bordered `border-neutral-300`, neutral text, hover shifts border/text to Signal Red rather than filling the background.
- **Destructive:** same Signal Red family as primary (`bg-brand-red` / `hover:bg-brand-red-hover`) — destructive intent is carried by the confirm-dialog copy and context, not a second red.

### Badges / Status Chips
- **Style:** `rounded-full`, `text-xs font-semibold`, light-100 background with matching-700 text from the Status palette (amber/green/blue) — never the brand red family, which is reserved for actions.
- **State:** one badge per status enum value (order status, payment status, product/fee active state); color mapping is fixed per status name across every table that shows it, not re-decided per screen.

### Cards / Containers
- **Corner Style:** `rounded-lg`–`rounded-xl` (8–12px).
- **Background:** white on neutral page background, or Warm Ash (`#f5f5f4`) when the card itself needs to recede against a white section.
- **Shadow Strategy (storefront/Persuade):** `shadow-sm` at rest, `shadow-lg` + slight lift on hover — see Elevation & Depth's Two-Register Rule.
- **Shadow Strategy (admin/Operate):** none — flat and bordered at every state.
- **Border:** `border-neutral-200` hairline on storefront cards (paired with the shadow, not replacing it); the sole separation device on admin panels.
- **Internal Padding:** `p-3`–`p-6` depending on density (admin denser, storefront more generous).

### Inputs / Fields
- **Style:** `rounded-md`, `border-neutral-300`, white background, `text-sm`.
- **Focus:** border shifts to Signal Red (`focus:border-brand-red`) paired with `focus:ring-1 focus:ring-brand-red` — the ring is mandatory, not optional; outline-none alone is never acceptable (this was a fixed defect, not a stylistic choice to preserve).
- **Error / Disabled:** disabled state drops to `opacity-40`–`opacity-60`; validation error text uses standard red-600 (semantic, not brand-red) below the field.

### Navigation
- **Style:** sticky top header, white background, hairline bottom border. Logo is the real brand asset (`/bhinekaled-logo.webp`, wordmark + sunburst) rendered directly — it has no alpha channel, so per `BRAND_GUIDELINE.md` it only ever sits on white or near-white; on dark surfaces (e.g. the footer) it's wrapped in a small white rounded box rather than placed on the raw background.
- **States:** nav links use `hover:text-brand-red` (no fill change); wishlist/cart icon links carry a 44×44px tap target with the icon centered and a small red count badge overlaid top-right.
- **Mobile:** the same header persists, search input reflows to full width and reorders below the logo row on narrow viewports rather than collapsing behind a menu.

## Do's and Don'ts

### Do:
- **Do** use Signal Red (`#e6212a`) as the only red in the interface, including hover and destructive states — always via the `brand-red`/`brand-red-hover` tokens, never a raw hex or stock Tailwind red.
- **Do** give storefront cards a resting `shadow-sm` that lifts to `shadow-lg` on hover — depth is a tactile shopping cue there, not an occasional accent.
- **Do** keep admin surfaces flat and bordered at every state — the Two-Register Rule applies in both directions.
- **Do** keep every focusable control's `focus:outline-none` paired with `focus:ring-1 focus:ring-brand-red` — never strip the outline without replacing it.
- **Do** use the amber/green/blue status palette exclusively for order/payment/active-state communication, kept visually distinct from brand red so "urgent action" and "current status" are never confused.
- **Do** round generously and consistently (pill for actions/status, `rounded-lg`+ for containers, `rounded-md` for form controls) — this is a brand commitment from the logo, not a default to soften later.

### Don't:
- **Don't** introduce a second accent color "just for variety" — the system's confidence comes from one brand hue used boldly, not from adding hues.
- **Don't** add resting shadows to admin panels, badges, or buttons — the tactile register is a storefront-only device.
- **Don't** use sharp, unrounded corners anywhere a rounded equivalent is available — this directly contradicts the logo's rounded, bold character.
- **Don't** introduce a third font family. Poppins carries all display/heading weight; Inter carries everything else.
