# Phase 4F.1 evidence: site polish

Branch `cursor/phase4f-polish-360f`, draft PR to `main`. No deploy, no console or platform writes, no live service calls. The Statsig console key was not read, printed, or used.

## Files changed
- Source: `src/styles.css` (rewrite), `src/App.tsx` (default route renders `Landing`), `src/components/Landing.tsx` (new), `Rail.tsx` (new), `assets.ts` (new), `Hero.tsx`, `Layout.tsx`, `HelpPanel.tsx`, `src/pages/ApplyPage.tsx`, `OffersPage.tsx`, `DashboardPage.tsx`, `index.html` (title and meta only).
- Images added in `public/images/`: `cta-band.webp`, `apply-header.webp`, `offers-timeline.webp`, `dashboard-empty.webp`, `help-header.webp`, `og-image.png`. The 11 supplied images are untouched.
- Docs: this file, `docs/phase-4f/images/SOURCES.md`, `PHASE_LOG.md`, `BUILDER_HANDOFF.md` (IDLE), `docs/evidence/phase-4f/*.jpg`.

## New hooks and IDs (existing hooks kept)
data-demo: `landing-hero`, `landing-example-offer`, `landing-stats`, `landing-estimator`, `landing-trust`, `landing-final-cta`, `request-summary`, `dashboard-summary`, `dashboard-status`. Section ids: `landing-how`, `landing-uses`, `landing-rates`, `landing-why`, `landing-trust`, `landing-faq`, `landing-final-cta` (plus `*-title`), `help-search`, `help-title`.

## Behavior
- Landing page, sticky header (a "Check your rate" link appears on home only after the hero CTA leaves view), estimator (illustrative, fixed 9.9% APR, local math only), FAQ, final CTA, footer, Apply two-column layout with a request summary rail, Offers aside and "Best fit (illustrative)" pill, Dashboard summary cards, timeline and empty state, help slide-over.
- Hero headline and CTA label still render from the Statsig parameters with fallbacks. `show_reassurance` element exists and is off by default; no static reassurance text on Apply. `show_comparison_hint`, `show_next_steps`, `progress_style`, `ampliloan_contextual_help` and the help dynamic config are unchanged in wiring.
- New landing content fires no events: the estimator, FAQ, use cards (plain links to Apply), search input and help chips are all silent. No new events are needed.
- Image alt text is meaningful or empty for decoration. Placeholders are SVG-derived originals (see `SOURCES.md`).

## Verification
Recorded separately. "Rendered" means a real Chrome page (playwright-core, local mode with no vendor keys, so Statsig/Amplitude vendors were not contacted). "Code" means read only.

| Check | Result | Basis |
|---|---|---|
| `npm test` | 127 passed | run |
| `npm run build` (tsc + vite) | pass, 390 kB JS (115 kB gzip), dist 1.6 MB | run, with console and client keys unset |
| Console-key trace in dist | none: 0 files match `STATSIG_CONSOLE` or a `console-` token pattern. The key value itself was deliberately not read, so the check is by pattern, not by value | rendered build output |
| Event sequences, 3 loan types (personal, mortgage, small_business) | identical event names to a `main` build, dashboard reaches Submitted, no page errors | rendered, presenter "Last 20 business events" |
| Parameter diagnostics | identical to `main`: all 8 reads show `default (no_key)`, setup failures none. Live `source: statsig` was not re-checked (no live journey authorized); wiring is unchanged in code | rendered local mode |
| 375 / 768 / 1280 | no horizontal overflow, all images load, CTA in first screen, tap targets at least 44 px | rendered |
| Reduced motion | hero glow and card animations `none`, scroll behavior `auto` | rendered |
| Keyboard only (home, Apply step 1) | tab order reaches CTA, chooser, Next; focus ring visible; Next reaches Offers; help dialog traps focus, Esc closes and returns focus | rendered |
| Contrast (computed from tokens) | indigo/white 15.4; slate/white 6.3; slate/lavender 5.7; white/violet 5.4; violet-dark/white 7.2; indigo/mint 9.5; coral-text/white 6.5; all at least 4.5 | computed |
| Estimator and FAQ fire no events | confirmed | rendered |

Not verified: real-device Safari/Firefox, screen-reader output, live Statsig and Amplitude behavior with this UI, GitHub Pages deployment.

## Screenshots
`docs/evidence/phase-4f/`: home at 375/768/1280, apply chooser 1280, apply details 375/768/1280, offers 375/768/1280, confirmation, dashboard, help (all 1280 unless named).

## Deviations
- Images: stock photos not used (license unverifiable here); six placeholders are original SVG-derived art.
- `docs/phase-4f/images/SOURCES.md` is outside the listed allowed paths, but the handoff requires it.
- `og:image` uses the absolute Pages URL `https://theuncoolgirl.github.io/els-ampliloan/images/og-image.png`.
- `.button` and the help panel's visual search input are new UI only.

## Open questions
- Should the six placeholders be replaced with supplied art before launch (same file names)?
- Is the header link acceptable as home-only?
