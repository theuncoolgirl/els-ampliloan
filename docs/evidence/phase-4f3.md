# Phase 4F.3 evidence: Dashboard formatting, "simulated" wording, consistent header

Branch `cursor/phase4f-dashboard-fix-360f` off `origin/main` (e4f215c), draft PR to `main`. No deploy, no console writes, console key not used. No stash was used; the `main` baseline was built from a clean `git worktree` after the source commit.

## Changes
- Dashboard: "Your next steps" is a normal `card` with an `h2` (`role="group"`, `aria-labelledby="next-steps-title"`); checkboxes, labels, `show_next_steps` gating and `completeTask` unchanged. Loan details card has normal padding, an FAQ-style summary row (padding, +/- marker) and a 3 px focus ring with 2 px offset inside the card. "Earlier applications" is a card with rows (loan type, reference, status badge, amount), no bullets. Timeline: completed steps are a filled mint circle with a white check and mint connector, current step a violet ring, future steps a muted ring; `aria-current` and `aria-label` unchanged. Cards share padding, radius and a `var(--space-3)` gap; the right column is top-aligned.
- Copy: "Simulated, no files are uploaded." became "Mark these off as you go. No documents are needed here."; `under_review` text now "Complete the next steps below."; Help answer "Do I upload documents?" now "No. Documents are not needed here. Mark your next steps off as you go."
- Header: `Header` renders the same items on every route (brand, Home, Apply, Offers, Dashboard, Help). Removed Rates / How it works / FAQ from the header, the conditional header CTA and `useHeroOutOfView`. A small in-page link row (Rates, How it works, FAQ; scroll buttons, no events) now sits under the hero on the landing page only (`nav.page-jump`, aria-label "On this page"). Hero CTA and final CTA band kept. Footer still has "Presenter". `data-demo` hooks kept; no new hooks.

## Files changed
`src/components/Layout.tsx`, `src/components/Landing.tsx`, `src/components/HelpPanel.tsx`, `src/pages/DashboardPage.tsx`, `src/styles.css`, this file, `PHASE_LOG.md`, `BUILDER_HANDOFF.md`, screenshots in `docs/evidence/phase-4f3/`.

## Verification
| Check | Result | Basis |
|---|---|---|
| `npm test` / `npm run build` | 127 pass / pass | run, vendor keys unset |
| Header labels on every route | identical on all 18 route/viewport cases (below) | rendered, programmatic |
| Header overflow | no header item outside the viewport in any case; page-level horizontal overflow none except `/presenter` at 375 px (see below) | rendered |
| Event sequence, one journey (Help from header, save draft, submit, advance status twice, task checkbox, reset) | identical to a clean-worktree `main` build, IDs normalized | rendered local mode |
| `helpRequested('header')` | still fires: "Help Requested" appears in both sequences from the header Help button | rendered diagnostics |
| `rg -i "simulat\|demo\|synthetic\|sample" src/components src/pages index.html` excluding `data-demo` and `PresenterPage.tsx` | 0 hits | pushed tree scan |
| Dashboard rendered text contains "simulat" | no | rendered |

Header link labels, all of `["AmpliLoan","Home","Apply","Offers","Dashboard","Help"]`, sticky position everywhere:

| viewport and route | same as reference |
|---|---|
| 375: /, / scrolled, /apply chooser, /apply details, /offers, /apply review, /apply confirmation, /dashboard, /presenter | true (all 9) |
| 1280: the same 9 | true (all 9) |

On `main` the same comparison fails (landing had 9 labels including Rates, How it works, FAQ).

Dashboard states rendered at 1280 and 375 (`docs/evidence/phase-4f3/`): empty (`0-empty`, with `dashboard-empty.webp`), draft (`1-draft`), submitted (`2-submitted`), under review with next steps (`3-review`), result ready with a checked task (`4-result`), and earlier applications (`5-history`, a result-ready application in history with a new draft active). All were reachable. `focus-1280.jpg` was taken after scripted `focus()` on the Loan details summary; the focus ring is not visibly shown there (a scripted focus does not trigger `:focus-visible`), so the ring styling is read from code, not confirmed by screenshot.

Not verified: Safari/Firefox, a keyboard Tab pass of the Dashboard, live Statsig/Amplitude.

## Deviations and open items
- `/presenter` at 375 px has page-level horizontal overflow. It is the same on `main` (pre-existing, Presenter page content), and was left untouched as out of scope.
- "Simulated" text remains on the Presenter page and in a `store.ts` owner label (`Signed in (simulated)`), which is Presenter/identity data, not borrower copy.
