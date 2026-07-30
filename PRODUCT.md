# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Visitor/Customer (Guest):** general vehicle owners across Indonesia shopping for LED lighting and lighting accessories for their car or motorcycle. They browse the catalog, add to cart/wishlist, and check out without creating an account — identified only by a `guest_session_id` cookie. Cart/wishlist data is lost on device change or cookie clear; this is an accepted tradeoff, not a defect.
- **Admin/Owner + small team:** the store owner plus staff who manage the catalog and fulfil orders. Multiple admin accounts are expected (schema supports `admin`/`superadmin` roles), not a single-operator setup. They manage products, categories, additional fees, and order status entirely through the dashboard without developer involvement.

## Product Purpose

BHINEKALED is the store's own e-commerce website for vehicle lighting accessories (LED lights, connectors, and related parts), built as a second sales channel alongside an existing, active Shopee store. It exists to reduce dependence on a single marketplace, build an organically-discoverable brand presence (SEO), and give the business full control over customer data, catalog, and the buying experience — none of which Shopee allows.

Success in the current build phase means: customers can complete browse → cart/wishlist → checkout → pay end-to-end without error, and admins can run the whole catalog/order/fee operation themselves.

## Positioning

BHINEKALED's differentiation is channel ownership, not product niche: the same category of vehicle LED lighting/accessories a general Indonesian vehicle owner could buy on Shopee, but through a channel the business fully controls — its own SEO-discoverable storefront, its own customer data, and freedom from marketplace fees and rules. The target customer is broad (any car/motorcycle owner needing lighting accessories nationwide), not a narrow enthusiast niche.

## Operating Context

- The store also has a physical/offline presence — Syarat & Ketentuan pages must cover retur/tukar barang (returns/exchange) as a physical-goods retailer, not a purely digital product.
- Pre-payment-gateway era planning assumed customers would contact the store via WhatsApp to ask about order status or negotiate before paying; a floating WhatsApp contact button exists for this reason. This need is reduced now that Midtrans payment is integrated, but WA remains the general support channel.
- Admin fulfillment workflow: order arrives automatically at `menunggu_konfirmasi` with no manual confirmation step required; admin manually advances status (Baru → Diproses → Dikirim → Selesai) as they pack and ship.
- Admin is notified of every new order one-way via WhatsApp or email (webhook-based), so they don't have to keep the dashboard open to know an order came in. There is no customer-facing order-status notification yet (phase-1 scope).
- **Current status: pre-launch / staging.** The site is not yet open to real customers — development and testing are ongoing. Treat production-scale traffic, real customer support load, and live business metrics as not-yet-real; do not infer them as evidence.

## Capabilities and Constraints

- **Catalog:** products carry `vehicle_compatibility` (tag-based, which vehicles a part fits) and `specifications` (technical specs like watt/lumen/light color) as first-class structured data — this is domain-specific to the lighting/accessories category, not a generic product schema.
- **Cart/Wishlist:** guest-session only (cookie-based `guest_session_id`), no customer accounts, no login. This was an explicit, confirmed decision — not a gap to fill.
- **Checkout/Orders:** orders are inserted immediately at `menunggu_konfirmasi` status with no manual admin confirmation gate. `order_items` snapshot product data at order time so later product edits never rewrite order history.
- **Payment:** Midtrans Snap (Redirect mode) is integrated and has been tested successfully in Sandbox in a prior session — payment status updates automatically via webhook notification when Midtrans confirms payment (no manual "recheck" step needed by admin anymore). Production Midtrans keys have not been requested/activated yet (site is pre-launch).
- **Shipping cost:** real-time courier rate lookup via RajaOngkir API is implemented at checkout — this supersedes the original PRD's "flat rate placeholder" plan; ongkir is no longer a placeholder in the current build.
- **Additional fees:** admin can define custom fees (free-text label, flat or percentage type, active/inactive) that auto-apply to every order total when active; each fee's value is snapshotted per-order (`order_fees`) so later config changes don't rewrite historical orders.
- **Admin dashboard:** Supabase Auth email/password login; CRUD for products (incl. multi-image, variants), categories, and additional fees; order list/detail with manual status updates; Shopee product import (CSV/Excel — exact source format still needs to be checked against Shopee Seller Center's actual export).
- **Explicitly not in scope yet:** customer accounts/login/order history, promo/voucher/discount automation, customer-facing order-status notifications (email/WA), multi-currency/multi-language.
- **Language constraint:** all customer-facing and admin dashboard UI text is Bahasa Indonesia — binding, not a default to reconsider.
- **RLS:** Supabase Row Level Security is active on all tables; public can only read `active` products and active `additional_fees`, and can only insert orders/order_fees — all other writes are admin-only.
- **Environments:** staging and production Supabase/hosting are meant to be kept separate so development never touches real customer/order data — hosting provider is not yet finalized (PO will provide hosting; deployment strategy TBD once known).

## Brand Commitments

- Name: **BHINEKALED**. Logo is an existing asset: bold rounded wordmark with a white outline over red, plus a sunburst/rays element (energetic, "menyala/glowing" association with "LED").
- Palette (locked, do not introduce other reds): Primary Red `#E6212A`, Outline White `#FFFFFF`, Ink Black `#1A1A1A`, Neutral Background `#F5F5F4`.
- Typography direction: bold, geometric, rounded-corner character matching the logo — Poppins ExtraBold/Montserrat Black for headings, Inter for body (already wired via `next/font/google` in `app/layout.tsx`).
- Visual motifs from the logo the guideline calls out as reusable: sunburst/rays (hero backgrounds, promo badges, dividers) and thick bars (adapted as section dividers/accents) — see `docs/BRAND_GUIDELINE.md`.
- Rounded corners are a deliberate brand trait (buttons, product cards, badges) — avoid sharp 90° corners, which the guideline calls out as contradicting the logo's character.
- Tone of voice: energetic and confident, but approachable rather than aggressive — copy should be short and direct without being pushy. (Guideline marks this as an initial proposal, not fully locked.)

## Evidence on Hand

- `docs/BRAND_GUIDELINE.md` — full color/type/tone guideline derived from the real logo asset.
- `docs/schema.sql` — the authoritative, already-applied Supabase schema (categories, products, product_images, product_variants, cart_items, wishlist_items, orders, order_items, additional_fees, order_fees, admin_profiles), including RLS policies.
- `docs/PRD.md` and `docs/EPICS.md` — original phase-1 scope and epic breakdown. Note: these documents describe payment and real-time shipping as deferred/out-of-scope, but the codebase has since moved past that — Midtrans (Epic 13) and RajaOngkir (Epic 12) are both implemented. Treat PRD/EPICS as historical scope-of-record for phase 1's original foundation work, not as a live description of current capabilities.
- No real product photography, testimonials, press, or case studies are confirmed on hand beyond the logo and existing schema — do not fabricate any.

## Product Principles

1. **Channel independence over marketplace convenience** — every capability decision should reduce, not deepen, dependence on Shopee (own data, own SEO, own customer relationship).
2. **Guest-first, frictionless commerce** — do not reintroduce login/account requirements into the core buy flow; guest session is a deliberate simplicity choice, not a stopgap to "fix."
3. **Admin self-sufficiency** — the dashboard must let the owner/team run the store (catalog, orders, fees) without ever needing a developer for routine operations.
4. **Historical order integrity** — order-time data (prices, fees, shipping) is always snapshotted; later catalog/config edits must never silently rewrite what a past customer actually paid.
5. **Bahasa Indonesia, mobile-first** — the majority of Indonesian e-commerce traffic is mobile; UI and copy decisions should default to mobile-first, Indonesian-language framing, not be retrofitted from a desktop/English-first mental model.

## Accessibility & Inclusion

No formal accessibility standard has been mandated by the business. In prior work this session, WCAG 2.2 AA was used as the working bar (contrast, focus visibility, 44px touch targets, aria-labels) and should continue to be the default target absent a different instruction.
