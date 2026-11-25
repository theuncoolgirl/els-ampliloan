# Builder handoff — Phase 4F (site polish)
Status: START
Phase: 4F, visual and content polish of the demo site
Revision: 4F.1

Authority: Erin, Cursor chat, 6:54 PM ET Nov 12, 2026: "update the aesthetics of the site right now." Record in `DECISIONS.md` already done.

## Read first
`docs/phase-4f/DESIGN_BRIEF.md` (page-by-page spec and acceptance criteria) and `docs/phase-4f/IMAGE_PROMPTS.md`. Where this handoff and the brief differ, this handoff wins. Erin's requested scope now includes Apply, Offers, Dashboard, and the Help panel (no new Help route). Use placeholders at the listed aspect ratios until real images are dropped into `public/images/`.

## Goal
Make the site feel like a credible, marketing-oriented lending brand without changing behavior. Home becomes a real landing page; the rest of the journey gets matching visual polish.

## Permissions
Builder Commit Yes; Push Yes (own feature branch `cursor/phase4f-polish-360f` only, never `main`); PR Yes (draft); Merge No; Deploy No. No console or platform writes. Do not read, print, or use `STATSIG_CONSOLE_API_KEY`; keep it out of every build command and prove the final build contains no trace of it.

## Tasks
1. Landing page (home route): hero, "how it works" (3 steps), loan types (personal, mortgage, small business, all entering the same single flow), trust and reassurance band (illustrative copy only), rates/example-offer teaser clearly labeled illustrative, FAQ, footer. Keep the primary CTA visible on first desktop and mobile screens.
2. Visual system: tokens in `src/styles.css` (color palette, type scale, spacing, radii, shadows), responsive layout, restrained motion with a `prefers-reduced-motion` alternative. Original AmpliLoan branding; no copied assets, logos, or layouts.
3. Apply a consistent polish pass to Apply, Offers, and Dashboard (spacing, cards, buttons, form fields, empty and success states). Presenter page stays functional and visually separate from borrower pages.
4. Accessibility: contrast, focus states, labels, keyboard use, semantic headings.
5. Copy: realistic mock amounts; no implication of real approval, funding, or credit checks; no implementation jargon on borrower pages.

## Must not change (protected)
- The journey, routes, state machine, persistence, and loan types (`personal`, `mortgage`, `small_business`); one application journey.
- Event names, event properties, and the places events fire; `loan_type` on loan events; `Application Submitted` stays the final event.
- Amplitude and Statsig initialization, identity, replay, masking, and attribution code.
- Statsig bindings: parameter reads in `src/integrations/pageParameters.ts` (`hero_headline`, `cta_label`, `show_reassurance`, `progress_style`, `show_comparison_hint`, `show_next_steps`), the gate `ampliloan_contextual_help`, and the dynamic config. Hero headline and CTA label must still render from the parameters with the existing fallbacks. The reassurance element controlled by `show_reassurance` must still exist and stay off by default; do not add static reassurance text on the Apply page that would contaminate the experiment.
- Existing stable guide target IDs and test hooks; add new ones only for new landing sections and list them.
- New landing-page content must not fire new business events. If you think one is needed, list it in the result for the Planner.

## Allowed paths
`src/components/`, `src/pages/`, `src/App.tsx` (layout wiring only), `src/styles.css`, `public/` (original assets only), `index.html` (title and meta only), `docs/evidence/phase-4f.md`, `PHASE_LOG.md`, `public/images/`.

## Verification (record each separately in the result)
- `npm run build` and any existing lint or tests pass; production build contains no console key trace.
- Run the app locally; walk personal, mortgage, and small-business journeys end to end and confirm unchanged behavior and unchanged event sequence (compare with a pre-change capture from `main`).
- UI at 375, 768, and 1280 px widths; reduced-motion on; keyboard-only pass of the home page and Apply step 1.
- State plainly what was inspected in a rendered page versus read from code. Do not claim live service behavior from mock data.
- Confirm parameter diagnostics still read `source: statsig` or fallback exactly as before.

## Result
Write `docs/evidence/phase-4f.md` (files changed, new IDs, screenshots saved under `docs/evidence/` if captured, deviations, open questions). Open a draft PR to `main`, then set this file to `Status: IDLE` in the same branch. Stop and wait for the Planner.
