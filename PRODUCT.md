# GudDesk (hosted — cavewebs/flowchat → guddesk.com)

## Users
Founders and support leads at small SaaS/teams who want shared inbox, live chat, help center, and light AI answers without Intercom pricing. They often evaluate on a laptop between meetings, then check the marketing site again on a phone.

## Product purpose
Customer support infrastructure that is a fair-priced Intercom alternative: shared inbox, chat widget, help center, tickets, automations, optional GudBot (Anthropic, default OFF), and Intercom file importer. Open-source core at gudlab/guddesk-core; this repo is the commercial hosted product.

## Positioning that must stay true
- Free plan $0; Pro $29 (do not invent other prices).
- GudBot is optional and default OFF — never market as always-on AI or “AI-first” glow.
- Soft on Cloud inbound email until MX is fully live; do not claim inbound is receiving if it is not.
- Design-partner still Tim/Gudlab; launch posts and directories still HOLD until Kim says go.

## Constraints future design must preserve
- No AI tell-tale visuals or copy: no decorative display/serif-italic fonts for “AI vibe”, no gradient-glow “AI” looks, no Claude-isms (em dashes as style, “not X but Y”, seamless/elevate/unlock/delve/game-changer, triplet lists, “Here’s the thing”, emoji bullets).
- Prefer plain, specific, human copy and a sober product UI that reads like a real support tool.
- Keep sharp, calm marketing — Persuade mode on landing/pricing; do not turn the site into a gradient playground.
- Accessibility: meet WCAG AA contrast; fix undersized UI text and skipped heading levels when polishing.
- Detector baseline (2026-11-02 live www): Inter overuse, low-contrast gray on near-black, gradient text, icon-tile stacks, nested cards, undersized UI text — polish should clear these without inventing a new brand overnight. If Inter stays brand, document the ignore with reason.

## Surfaces (marketing first)
Priority polish order: `app/(marketing)/page.tsx` + `components/sections/*` (home), then `pricing`, then features/alternatives/use-cases. App (Operate) UI later.

## Platform
web
