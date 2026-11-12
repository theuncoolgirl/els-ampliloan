# Builder handoff — Phase 4
Status: START
Phase: 4
Revision: 4C.1 (Statsig gate rule and draft experiment through the Console API; one live check)
Owner: Planner
Builder ID/link: see PROJECT_PLAN.md (same Builder; resume it)
Repository / branch: theuncoolgirl/els-ampliloan. Create `cursor/phase4c-statsig-360f` from `origin/main`; draft PR; commit evidence only. Read this handoff from `origin/cursor/planner-phase4c-360f`.

## Activation
Erin Shields, Cursor chat, 2026-11-12 5:46 PM ET: "go for slice 4c". Planner scope reading: only the writes listed below. Metrics are NOT included (see Blocked).

## Permissions
Builder: Commit Yes; Push Yes (own branch only, never `main`); PR Yes (draft); Merge No; Deploy No. Planner: Merge No unless Erin posts a named Approve for one PR and head SHA.
Console API, key from the environment variable `STATSIG_CONSOLE_API_KEY` (never print, echo, log, write, or commit it; script outside the repo, delete afterwards; run every npm/vite command with it removed): authorized ONLY to
1. PATCH gate `ampliloan_contextual_help` to add one rule named `first_time_borrowers`: pass 100% when custom field `borrowing_experience` equals `first_time`; otherwise the gate stays false. No other change to the gate.
2. POST one experiment `ampliloan_application_reassurance_v1` in layer `ampliloan_application_layer` (Stable ID unit), groups `control` (`show_reassurance` false, `progress_style` "steps") and `treatment` (`show_reassurance` true, `progress_style` "steps"), 50/50 allocation declared but the experiment NOT started. It stays in draft/setup status.
3. GET entities to verify.
Not authorized: starting, launching, or ramping any experiment or rule beyond the one above; creating metrics, metric sources, segments, holdouts; any warehouse, project, or key endpoint; DELETE; editing any other entity; self-approving a review. If a call needs review or would start something, stop and record it.

## Blocked (record only, do not work around)
Metrics: the project is warehouse-native and has no metric sources or metrics (Planner read, 5:48 PM ET). Metrics need a warehouse connection and event tables that only Erin can provide. The experiment's primary outcome (Application Submitted per exposed Stable ID) therefore cannot be attached yet; leave it unset and record that.

## Tasks
1. Verify the repo, fetch, create the branch. Log yes or no only for `STATSIG_CONSOLE_API_KEY` in your environment. If it is missing or a call returns 401/403, record BLOCKED (yes/no and HTTP status only) and stop.
2. Do writes 1 and 2 above. After each, GET and compare. Record method, path, status, entity name and ID for each call, never the key. Confirm the experiment is not started and shows no allocation traffic.
3. One live check (cap: exactly 1 journey, production site, client keys set): use presenter "first_time_personal" persona, go to the application details step, and record that the gate evaluates true and the help hint appears; then "Start as a new demo user" (default traits) and record that the gate is false and no hint appears. Record gate values, source, exposures, UTC window, stable IDs. Confirm no experiment exposure occurs (the experiment is not started).
4. Write `docs/evidence/phase-4.md` (4C section; entity IDs and URLs, API calls, readiness: console, SDK, telemetry, data) and update `docs/STATSIG_INVENTORY.md` and `PHASE_LOG.md`. Commit, push, open a draft PR, stop. Do not change Status. Never print secret values.

## Allowed paths
`docs/evidence/phase-4.md`, `docs/STATSIG_INVENTORY.md`, `PHASE_LOG.md`. No source changes.

## Acceptance
P4.1 (entity inventory with IDs/state, nothing started), P4.4 (experiment proposal visible in draft with variants, unit, target layer, allocation, no metric yet, stated stop/rollback: remove the rule or leave the experiment unstarted).
