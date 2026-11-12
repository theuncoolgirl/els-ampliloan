# Builder handoff — Phase 4
Status: START
Phase: 4
Revision: 4C.3 (Cloud project: metrics and a draft experiment, not started)
Owner: Planner
Builder ID/link: see PROJECT_PLAN.md (same Builder; resume it)
Repository / branch: theuncoolgirl/els-ampliloan. Create `cursor/phase4c3-experiment-360f` from `origin/main`; draft PR; docs/evidence only. Read this handoff from `origin/cursor/planner-phase4c3-360f`.

## Activation
Erin Shields, Cursor chat, 2026-11-12 6:11 PM ET: "set up the experiment and metrics in the cloud project" (project `AmpliLoan [Cloud]`, ID `6oe5DaLQIx5XnKfBrG0JnT`). Starting the experiment is NOT authorized by this message; it needs a separate Erin approval.

## Permissions
Builder: Commit Yes; Push Yes (own branch only, never `main`); PR Yes (draft); Merge No; Deploy No. Planner: Merge No unless Erin posts a named Approve for one PR and head SHA.
Console API with `STATSIG_CONSOLE_API_KEY` (never print, echo, log, write, or commit it; script outside the repo; delete after; run every npm/vite command with it removed; send it only to `statsigapi.net`): authorized ONLY to
1. Create these metrics in the Cloud project (Statsig Cloud event-based metrics from SDK events; use the documented metric create endpoint; no warehouse or metric source): 
   - `ampliloan_application_submitted_users` (primary): unique users with event `Application Submitted`.
   - `ampliloan_application_saved_users` (secondary): unique users with `Application Saved`.
   - `ampliloan_offer_selected_users` (secondary): unique users with `Offer Selected`.
   - `ampliloan_validation_failed_count` (guardrail): event count of `Application Validation Failed` per user.
   Descriptions must state: unit = Stable ID, source = SDK business events, synthetic demo data, no revenue.
2. POST one experiment `ampliloan_application_reassurance_v1` in layer `ampliloan_application_layer`: Stable ID unit; groups `control` (`show_reassurance` false, `progress_style` "steps") and `treatment` (`show_reassurance` true, `progress_style` "steps"), 50/50 allocation declared; primary metric `ampliloan_application_submitted_users`, secondary and guardrail metrics as above; hypothesis text: "Showing a reassurance message on the application details step increases the share of exposed units that submit an application." The experiment must stay NOT STARTED (draft/setup).
3. GET to verify.
Not authorized: starting, launching, or ramping the experiment; changing the layer's live values; edits to other existing entities (gate, config, stores, layers); segments, holdouts, warehouse, project, key, or member endpoints; DELETE; writes to the old project; self-approving reviews. If a call would start something or needs review, stop and record it. If a metric cannot be created without prior events existing, record the exact message and stop that metric.

## Tasks
1. Verify the repo; fetch; create branch. Log yes or no only for `STATSIG_CONSOLE_API_KEY`. Missing or 401/403: record BLOCKED and stop.
2. Create and GET-verify the metrics, then the experiment. Record method, path, status, entity name and ID per call, never the key. Confirm the experiment status is not started and that no group is serving traffic. Record any behavior that differs from the documentation.
3. No live journey (the experiment is unstarted; nothing to observe). Confirm instead, by GET on the layer, that its parameter defaults are unchanged.
4. Update `docs/STATSIG_INVENTORY.md` (Cloud section: metrics and experiment with IDs/URLs/state), `docs/evidence/phase-4.md` (4C.3), and `PHASE_LOG.md`. Add stop/rollback and "how to start" notes for Erin (start in console; stop = stop the experiment in console and verify the layer default on a fresh Stable ID). Commit, push, open a draft PR, stop. Do not change Status. Never print secret values.

## Allowed paths
`docs/STATSIG_INVENTORY.md`, `docs/evidence/phase-4.md`, `PHASE_LOG.md`. No source changes.

## Acceptance
P4.1 (inventory with IDs/state), P4.2 (metric definitions: unit, window, source recorded), P4.4 (experiment visible in draft: variants, unit, target layer, allocation, primary and guardrail metrics, stop/rollback; separate approval required before start).
