# Builder handoff — Phase 4
Status: START
Phase: 4
Revision: 4C.2 (re-create the Statsig entities in the new Cloud project; one local live check)
Owner: Planner
Builder ID/link: see PROJECT_PLAN.md (same Builder; resume it)
Repository / branch: theuncoolgirl/els-ampliloan. Create `cursor/phase4c2-statsig-cloud-360f` from `origin/main`; draft PR; docs/evidence only. Read this handoff from `origin/cursor/planner-gaps-and-cloud-360f`.

## Activation
Erin Shields, Cursor chat, 2026-11-12 6:03 PM ET: project `AmpliLoan [Cloud]`, ID `6oe5DaLQIx5XnKfBrG0JnT` (opened at https://staging.console.statsig.com/6oe5DaLQIx5XnKfBrG0JnT/settings), "go ahead and create the 10 entities". Erin replaced `STATSIG_CONSOLE_API_KEY` and `VITE_STATSIG_CLIENT_KEY` in Cursor secrets for the new project (she also needs to update the GitHub Actions secret, not your task). The old project `363sCqDdACZXt4M88ZqiKa` is left untouched; do not write to it.

## Permissions
Builder: Commit Yes; Push Yes (own branch only, never `main`); PR Yes (draft); Merge No; Deploy No. Planner: Merge No unless Erin posts a named Approve for one PR and head SHA.
Console API with `STATSIG_CONSOLE_API_KEY` (never print, echo, log, write, or commit it; script outside the repo; delete after; run every npm/vite command with it removed): authorized ONLY, in project `6oe5DaLQIx5XnKfBrG0JnT`, to
1. POST the 4 layers, then set their parameters (PATCH/PUT only on those layers); POST the 4 parameter stores and set their parameters (the documented `POST /param_stores/{name}` as before); POST gate `ampliloan_contextual_help`; POST dynamic config `ampliloan_support_content`; names, types, defaults, and store-to-layer references exactly as in `docs/STATSIG_INVENTORY.md` (the previous project's provisioned state).
2. PATCH only that new gate to add the same single rule as before (`first_time_borrowers`: pass 100% when custom field `borrowing_experience` equals `first_time`), reproducing the state Erin approved for the old project.
3. GET entities to verify.
Host rule: the console URL is a staging host, so the Console API base may differ from `https://statsigapi.net/console/v1`. Use only the base documented for this project's console; the only hosts you may send the key to are `statsigapi.net` and `staging.statsigapi.net` (or a host the official docs name for this console, recorded in evidence). First make one read (`GET /gates?limit=1`) to confirm the key authenticates and the project matches (the project ID must be `6oe5DaLQIx5XnKfBrG0JnT`; if the API reports a different project, STOP).
Not authorized: any experiment, metric, metric source, segment, holdout, warehouse, assignment source, project, key, or member endpoint; DELETE; writes to the old project; self-approving reviews. If a call needs review or would start something, stop and record it.

## Tasks
1. Verify repo; fetch; create branch. Log yes or no only for `STATSIG_CONSOLE_API_KEY` and `VITE_STATSIG_CLIENT_KEY` in your environment. Missing or 401/403: record BLOCKED (yes/no and status only) and stop.
2. Confirm the project via the read call. Create and verify the 10 entities and the one gate rule. Record method, path, status, entity name, and ID for each call. List any difference from the old project's behavior (for example, layer creation or store parameter APIs).
3. One live check, no deploy: build locally with `VITE_STATSIG_CLIENT_KEY` set (the new project's) and the console key removed; serve with `npm run preview`; run exactly 1 journey (tagged landing, first_time_personal persona to the details step for the gate rule, help panel, offers, review, sign-in, consent, submit, dashboard, presenter diagnostics 10 s). Record, per parameter, the gate, and the config, value and source (`statsig` or fallback with reason), setup failures, hosts contacted, initialize status, and exposures. If the SDK cannot reach the new project (for example staging-only API hosts), record exactly what failed and STOP; do not change source code without a new handoff. Verify `dist/` has no trace of the console key.
4. Update `docs/STATSIG_INVENTORY.md` (add a Cloud project section with IDs and URLs; keep the old project section marked superseded), `docs/evidence/phase-4.md` (4C.2), `PHASE_LOG.md`. Commit, push, open a draft PR, stop. Do not change Status. Never print secret values.

## Allowed paths
`docs/STATSIG_INVENTORY.md`, `docs/evidence/phase-4.md`, `PHASE_LOG.md`. No source changes.

## Acceptance
10 entities plus the gate rule exist in the Cloud project, verified by GET; live check shows each value from `statsig` or a recorded, explained fallback. The live site is not redeployed by this revision.
