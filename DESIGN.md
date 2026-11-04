# GudDesk design notes (living — extend with /impeccable document after polish)

## Intent

Calm, sharp, product-led marketing. Dark-friendly pages are fine; avoid “AI beige”, pulsing dots, side-tab chrome, and italic serif decoration.

## Typography

Do not introduce Fraunces, Geist, Plus Jakarta Sans, or Space Grotesk as a “refresh”. If Inter remains the workhorse, treat it as temporary brand inertia; prefer one distinctive but readable face only when Tim/Kim approve a real brand pass.

Inter ignore (2026-11-02 polish): body copy still uses Inter via `next/font/google` in `assets/fonts/index.ts`. Headlines stay Satoshi and Cal Sans. Replacing Inter in this pass would be a brand type change Tim/Kim have not approved. Detector `overused-font` for Inter is waived in `.impeccable/config.json` for that reason, not because the face is distinctive.

## Color

No rainbow gradient text for headlines. Accents sparingly. Contrast ≥ WCAG AA for body and UI chrome.

## Layout

Flatten nested cards on marketing demos. Prefer spacing and type hierarchy over card-in-card. Icon-tile feature grids: reduce sameness; vary weight or drop decorative tiles where they add no information.

Inner marketing routes (features, use-cases, alternatives, integrations, roadmap, blog chrome, CMS pages) follow the same floor as home and pricing: no kickers, no gradient text, no colored icon tiles, body copy in `text-neutral-600` / `dark:text-neutral-300`, checks in `text-emerald-800` / `dark:text-emerald-300`, primary action "Create a free workspace".

## App shell (Operate)

Inbox, conversation, and settings chrome keep the incumbent product layout: list, thread, details. Brand shows up as type, contrast, and density, not decoration. Functional text stays at 12px or above. Secondary copy uses `text-neutral-600` / `dark:text-neutral-300` (or the bumped `--muted-foreground`) so chrome meets WCAG AA. Section titles after the page `h1` start at `h2`. Do not wrap the inbox work area in a rounded card around message bubbles.

## Motion

Subtle only; respect reduced-motion. No endless pulse on status dots for decoration.
