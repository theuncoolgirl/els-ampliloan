# Builder handoff — Phase 3
Status: START
Phase: 3
Revision: 3.4 (one live confirmation journey; no console changes)
Owner: Planner
Builder ID/link: see PROJECT_PLAN.md (same Builder; resume it)
Repository / authorized branch: theuncoolgirl/els-ampliloan. Continue on `cursor/phase3-statsig-360f` (head `7c86b20`), same draft PR #15. Read this handoff from `cursor/planner-phase3-start-360f`. Earlier revisions apply except where this one changes them.

## Activation
Erin Shields, Cursor chat, 2026-11-12 3:17 PM ET and 3:44 PM ET (entities and live Statsig traffic authorized). Planner verified revision 3.3 through the read-only MCP: all 10 entities exist (4 layers with parameters and defaults, 4 parameter stores referencing their layers, the gate, and the config). Note: the total is 10, not 13 as earlier handoffs said.

## Permissions
Builder: Commit Yes; Push Yes (own branch only); PR Yes (draft); Merge No; Deploy No. Planner: Merge No unless Erin posts a named Approve for one PR and head SHA.
Console: NO Console API calls in this revision (do not use `VITE_STATSIG_CONSOLE_KEY` at all; run every command with `env -u VITE_STATSIG_CONSOLE_KEY`). Live Statsig and Amplitude client traffic stays authorized: exactly 1 live journey. No synthetic population. Slack is retired.

## Planner decision on the route hold
Accepted as a bounded exception, not a precedent: a route that mounts while a user update is running may wait up to 2000 ms (the same bound as initialization) for it to settle, only in live mode, never in local or preview mode, and never mid-step. Keep it in its own commit. If the confirmation journey shows it delays any route transition by more than about 500 ms in the normal case, or does not fix the two defaults and the gate, revert that commit and record what you saw instead of trying a new design.

## Tasks
1. Verify the repository and tree, fetch both branches, continue on your branch, and log yes or no for the presence of the two client keys (not the console key's value).
2. Run `npm run typecheck`, `npm run build`, `npm test` with the console key removed, then one live journey on the production build with both client keys set, key values redacted: tagged landing (`?utm_source=google&utm_medium=cpc&utm_campaign=spring_rates#/`) → personal loan → application details step (the gate evaluates) → typed amount → offers → select → review → save → resume → simulated sign-in → open the help panel (the config reads) → consent → submit → dashboard → open presenter diagnostics for 10 s. Record, for all six store-backed parameters, the gate, and the config, the returned value and its source (`statsig` or fallback with reason); the exposure events by type and count (repeated renders, unused parameters, and diagnostics must add none); the time each route transition waited on a user update (from your timing) and whether any exceeded 500 ms; the stable ID unchanged at sign-in; device, stable, and session IDs; and the UTC window. The gate is expected to evaluate false (no rules) even when reachable: record whether it appears in the initialize payload now and whether a gate check or exposure is logged.
3. Update docs/evidence/phase-3.md (revision 3.4 section), docs/STATSIG_INVENTORY.md if anything changed, and `PHASE_LOG.md`. Commit, push the same branch, and stop. Do not change Status or start Phase 4. Never print secret values.

## Allowed paths
`docs/evidence/phase-3.md`, `docs/STATSIG_INVENTORY.md`, `PHASE_LOG.md`; `src/**` only to revert the route-hold commit as described above.

## Acceptance
P3.1 (live binding of all stores, gate, config) and P3.2 (documented real-SDK exposure behavior). Merging PR #15 deploys the site with live Statsig traffic for all visitors; the approval request will say so.
