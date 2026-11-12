# Builder handoff — Phase 3
Status: START
Phase: 3
Revision: 2.1 (follow-up to revision 2; fixes found in Planner review)
Owner: Planner
Builder ID/link: see PROJECT_PLAN.md (same Builder; resume it)
Repository / authorized branch: theuncoolgirl/els-ampliloan. Continue on `cursor/phase3-statsig-360f` (head `6fa816a`), same draft PR #15. Revision 2 (git history at `3e9d9d3` on `cursor/planner-phase3-start-360f`) still applies except where this revision changes it.

## Activation and permissions
Erin Shields, Cursor chat, 3:00 PM ET: "Start phase 3". Permissions and limits are unchanged from revision 2: Commit Yes; Push Yes (own branch only); PR Yes (draft); Merge No; Deploy No. Still code-only: both vendor keys stay unset in every run, no Statsig console or API, no live telemetry to either vendor.

## Findings from Planner review
Your head `6fa816a` passed the Planner's keyless typecheck, build, and 111 tests. Planner decisions on your reported deviations:
1. Defaults were the Planner's mistake: revision 2 said the UI must be identical with defaults, but its table changed shipped copy. Corrected defaults (the entity table in docs/STATSIG_PROPOSAL.md now says the same): `hero_headline` = "A clearer path to the loan you need" (the shipped headline); `ampliloan_support_content`: `heading` = "Help" (the shipped heading), `body` = empty string and the body line renders only when non-empty, `max_items` = 5 (all current FAQs; clamp stays 1–5). All other defaults are unchanged. With defaults the home, help panel, and every page must match Phase 2 exactly.
2. `__configuration` internal field: not accepted as is. Keep using it only to tell `missing_binding` from `type_mismatch`, but wrap it so that if the field is absent, renamed, or not an object, the facade falls back to the reason `error` without throwing, and add a test for that. Note the dependency in docs/STATSIG_INVENTORY.md as a known fragility.
3. Environment tier unset: accepted. Statsig's default tier is recorded as NOT VERIFIED until a live revision.
4. The offers page using the shared Stepper: accepted, provided the default markup is unchanged and the tests or smoke show it.

## Tasks
1. Apply the corrected defaults in code, tests, and docs/STATSIG_INVENTORY.md; update any test that asserted the old values and add one that asserts the shipped copy is the default.
2. Wrap the `__configuration` read as described and add the test.
3. Run `npm run typecheck`, `npm run build`, `npm test` with both keys unset, then repeat the keyboard-only default smoke and one preview smoke on the production build with zero requests to any Statsig or Amplitude host, and confirm in the smoke that the home headline reads "A clearer path to the loan you need" and the help panel shows heading "Help" and 5 FAQs by default.
4. Update docs/evidence/phase-3.md and `PHASE_LOG.md` (supersede the deviation notes), commit, push the same branch, and stop. Do not change Status or start Phase 4. Never print secret values.

## Allowed paths
Same as revision 2.

## Acceptance
Same as revision 2 for P3.1 (offline), P3.2 (fake-client tests), and the offline part of P3.4. Merging PR #15 deploys the site with Statsig in local mode.
