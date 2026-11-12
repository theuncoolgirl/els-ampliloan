# Builder handoff — Phase 3
Status: START
Phase: 3
Revision: 3.1 (offline fix: trait updates must not discard values for the same identity)
Owner: Planner
Builder ID/link: see PROJECT_PLAN.md (same Builder; resume it)
Repository / authorized branch: theuncoolgirl/els-ampliloan. Continue on `cursor/phase3-statsig-360f` (head `c44ed95`), same draft PR #15. Read this handoff from `cursor/planner-phase3-start-360f`. Revisions 2, 2.1, and 3 (git history there) apply except where this one changes them.

## Activation and permissions
Erin Shields, Cursor chat, 2026-11-12 3:00 PM ET ("Start phase 3") and 3:17 PM ET (entities and live Statsig traffic authorized). The console part of revision 3 is BLOCKED (SSO only) and stays blocked in this revision. Permissions unchanged: Commit Yes; Push Yes (own branch only); PR Yes (draft); Merge No; Deploy No. THIS REVISION IS OFFLINE: no live journeys, no vendor traffic of any kind (unset both client keys in every run), no console login attempt, no use of the bot credentials. The 2-journey live cap for revision 3 is already spent and is not reset by this revision.

## Acknowledged from your report
Cap overrun accepted as a recorded deviation (the SDK falls back from `featureassets.org` to `assetsconfigcdn.org`; record both hosts in docs/STATSIG_INVENTORY.md for future blocking tests). The `success:false` handling fix is accepted. Statsig default tier stays NOT VERIFIED.

## Planner decision on volatile traits
Keep all `user_properties` from `docs/custom-events.yml` in the Statsig user `custom` object. Change how updates are handled, not what is sent:
1. Two generations. The IDENTITY generation changes only when the stable ID or the known user ID changes (sign-in, sign-up, sign-out, new-user reset). Everything cached for an older identity generation is discarded and never returned. A TRAIT-only update (any other `custom` change) does not discard anything.
2. While a trait-only update is in flight, reads return the last value evaluated for the same identity (source `statsig`, plus a flag `stale_traits: true` in the presenter snapshot), never the default and never blocking the UI. When the update resolves successfully, newly evaluated values replace the snapshot, but they are applied to visible UI only at the next route change or step boundary, never mid-step. If it fails, keep the previous values and record reason `error`.
3. Coalesce: multiple trait changes inside one route transition produce one `updateUserAsync`, queued so at most one is in flight and only the latest trait set is sent next. An identity change cancels the queue and starts a fresh update with the new identity.
4. A value can only be served stale when the identity generation is the same; for a new identity before its first successful update completes, return defaults with reason `timeout` or `pending`, never another identity's values.
5. Before any exposure-relevant read of a layer-backed application parameter, `active_loan_type` must already be set in the user and that update must have resolved (this is the baseline-attribute rule from the brief); if it has not resolved within the 2000 ms bound, fall back to the default for that read and record the reason.

## Tasks
1. Implement 1–5 in `src/integrations/statsig.ts` (and the facade only if needed). Keep local mode, preview mode, and the 114+ existing tests passing.
2. Tests with the fake client (no network): trait-only change does not discard the cached value for the same identity and the read returns it with `stale_traits`; identity change discards everything and never returns the old identity's value; coalescing (three trait changes in one transition cause one update; an identity change cancels queued updates); a failed trait update keeps the previous values and records `error`; applying new values only at a route/step boundary; the `active_loan_type` baseline rule including the bounded-wait fallback; a read during an in-flight update does not block.
3. With both keys unset run `npm run typecheck`, `npm run build`, `npm test`, and the keyboard-only default smoke plus one preview smoke on the production build; capture network and show zero requests to any Statsig or Amplitude host.
4. Update docs/STATSIG_INVENTORY.md (hosts, behavior notes), docs/evidence/phase-3.md (a revision 3.1 section; keep earlier sections and the cap-overrun note), and `PHASE_LOG.md`. Commit, push the same branch, and stop. Do not change Status or start Phase 4. Never print secret values.

## Allowed paths
`src/**` (including tests), `docs/STATSIG_INVENTORY.md`, `docs/evidence/phase-3.md`, `PHASE_LOG.md`. Exclude everything else.

## Acceptance
P3.2 (identity and exposure tests with fakes) and the offline part of P3.4. Live binding (P3.1), real-SDK exposure behavior, and P3.3 stay open until the entities exist.
