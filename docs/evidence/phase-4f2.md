# Phase 4F.2 evidence: demo wording removed

Branch `cursor/phase4f-copy-360f`, draft PR to `main`. Copy-only. No deploy, no console or platform writes, console key not used.

## Files changed
`index.html` (title, description, og tags), `src/components/{Hero,Landing,HelpPanel,Layout}.tsx`, `src/pages/{ApplyPage,OffersPage,DashboardPage}.tsx`, `src/state/fixtures.ts` (status label "Sample result ready" to "Result ready"), `src/state/store.ts` (corrupt-storage notice wording), `PHASE_LOG.md`, `BUILDER_HANDOFF.md` (IDLE), this file, screenshots in `docs/evidence/phase-4f2/`.

## Copy changes
- Standard disclosure in footer and Offers banner: "Rates, amounts, and offers shown are illustrative and are not an approval, quote, or commitment to lend." (a duplicate disclosure line at the bottom of Offers was removed).
- Hero disclaimer: "Illustrative options only. Not an approval, quote, or commitment to lend." Stat strip "On every option". Estimator hint and result drop "demo". Trust band: "Explore with confidence", "Estimates, clearly labeled"; quote caption "Illustrative quote." (quote kept; no "fictional"). Final CTA subline "Figures are illustrative."
- FAQ and Help: "real loan/application/offers" answers rewritten to estimates language ("Is this a formal application?", "Are the offers final?"); status topic no longer mentions a presenter; general topic no longer says demonstration; contact card is now "Need more help?" pointing to the dashboard status.
- Apply: `REASSURANCE` now "Your answers are saved on this device as you go." (element, gating, position unchanged). Consent label now "I confirm these details are correct and I'm ready to submit." (checkbox, id, validation unchanged). "Sample range/offer" reworded to "Range" / "Selected offer".
- Offers heading "Your offers"; dashboard result text "Result ready: ...".
- Footer link label "Demo controls" renamed "Presenter" (href and route unchanged); copyright "AmpliLoan".
- Unchanged: Presenter page text, diagnostics, identifiers, `hero_headline` and `cta_label` fallbacks.

## Verification
| Check | Result | Basis |
|---|---|---|
| `npm test` | 127 pass; no test needed changing (none asserted removed wording) | run |
| `npm run build` | pass | run, keys unset |
| Journeys, 3 loan types | "Last 20 business events" sequence identical to a `main` build (hex IDs normalized), no page errors | rendered, local mode |
| Rendered text scan (home incl. scrolled lazy content, Apply step 1, help panel, offers, submit step, confirmation, dashboard, image alt, document title) for demo, demonstration, synthetic, sample, mock, placeholder, fictional, "no real", "no one will reply" | 0 hits on new build; `main` had hits on every page | rendered |
| Screenshots 375 and 1280 | home, Apply step 1, help, offers, submit, dashboard in `docs/evidence/phase-4f2/` (home, apply, help, offers, submit, dashboard) | rendered |

Not rendered: the `index.html` meta tags (read from code), the corrupt-storage notice (read from code), the offers empty/error states.

## Correction (follow-up on PR #34)
The first push (8af2d2b) contained only docs. My source edits had been lost: a `git stash` I ran while setting up a baseline worktree swept them away and I then dropped the stash. The evidence above had been produced from those edits before the loss. I re-applied the identical edits and pushed them in `0662694` (`src/` and `index.html` now appear in `git diff --stat origin/main HEAD`). Re-run after the re-apply: `npm test` 127 pass, `npm run build` pass, and a fresh rendered scan of home, Apply step 1, help panel, offers, submit step, confirmation and dashboard for all three loan types found 0 demo-style words, 0 page errors, and 11 business events in each journey. The side-by-side event comparison with `main` was not repeated after the re-apply (it was done on the same copy-only edits earlier); the re-run only confirmed the event count.

## Remaining hits in pushed branch contents
Scanned with `git grep -inE "demo|demonstration|synthetic|mock|placeholder" origin/cursor/phase4f-copy-360f -- src index.html` (excluding `data-demo` attributes), at head `0662694`:
- `src/pages/PresenterPage.tsx` (7): presenter page, by instruction.
- `src/presenter/Diagnostics.tsx` (1), `preview.ts` (1, comment), `PreviewControls.tsx` (1, `placeholder` attribute): presenter only.
- `src/state/store.ts` (1): `startAsNewDemoUser` identifier.
- `src/identity/traits.ts` (2), `src/telemetry/telemetry.ts` (4), `src/telemetry/events.ts` (2): identifiers and event values (`demo_persona`, `live_demo`, `synthetic_population`, `demo_signin/up/out`).
- `src/components/Landing.tsx` (4): `DEMO_APR` variable name only.
- `src/components/HelpPanel.tsx` (1): `placeholder="Search help topics"` input attribute.
- Tests (`statsig.test.ts` 2, `store.test.ts` 1, `telemetry.test.ts` 4): `vi.mock` and identifiers.
`index.html` has no hits. A separate search for "no real", "fictional" and "sample" matched only `amplitude.ts` (`sampleRate`) and a telemetry test. No hit is user-visible outside `/presenter`.

## Deviations and questions
- `fixtures.ts` and `store.ts` strings were outside the Known places list but were user-visible, so they were reworded.
- `Illustrative`/`estimate` wording remains on figures by design. Presenter footer link: kept for now; the Planner will ask Erin.
