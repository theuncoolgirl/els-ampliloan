# Builder handoff — Phase 4C revision 4C.4 (rollup windows, console write)
Status: IDLE
Phase: 4C, Statsig Cloud console write (windows only)
Revision: 4C.4

Authority: Erin, Cursor chat, 12:04 PM ET Nov 25, 2026: "Just have the builder do it" (apply the 1 day rollup window). Decision recorded in `DECISIONS.md` 10:38 AM ET Nov 25. This is a one-time console write grant for exactly the calls below; it is spent when this revision closes.

## Permissions
Builder Commit Yes; Push Yes (own branch `cursor/phase4c4-windows-360f` only); PR Yes (draft); Merge No; Deploy No. Console writes: ONLY the calls listed below, against project `AmpliLoan [Cloud]` ID `6oe5DaLQIx5XnKfBrG0JnT`, base `https://statsigapi.net/console/v1`. No `git stash`.

## Key handling (strict)
Use `STATSIG_CONSOLE_API_KEY` from the environment only. Never print, echo, log, write to a file, or pass it on a command line that is recorded; keep it out of every npm/vite command; send it only to `statsigapi.net`; delete any temporary script afterward. No repository code changes are needed, so no build is required; if you run one, prove the output contains no trace of the key.

## Allowed calls
Read each object first (GET), write, then read back (GET) and compare. If any call is rejected or a field is not accepted, stop, record the exact status and message, and do not improvise a different field or call.
1. For each of `ampliloan_application_submitted_users::event_user`, `ampliloan_application_saved_users::event_user`, `ampliloan_offer_selected_users::event_user` (URL-encode `::`): POST `/metrics/{id}` setting only `rollupTimeWindow: "custom"`, `customRollUpStart: 0`, `customRollUpEnd: 1` (days since exposure; do not set `customRollupMeasureInMinutes`). Send the minimum body the API accepts; if the update endpoint requires other fields (such as `name` or `type`), echo back the existing values from the GET unchanged.
2. Do NOT modify `ampliloan_validation_failed_count::event_count_custom` (a count metric; the custom window applies to unit-count metrics). Record that you left it alone and why.
3. Experiment `ampliloan_application_reassurance_v1`: set only `defaultRollupWindow` to `-1` (cumulative) via the endpoint that previously worked for this experiment (PATCH `/experiments/{id}`), then GET to confirm. If `-1` is rejected, try nothing else; report.
4. Do NOT start, launch, or change the status of the experiment; do not change groups, allocation, metrics lists, layers, parameters, gates, or any other entity. Status must read `setup` with no start time after your last call.

## Verification
Read back and record for each metric: `rollupTimeWindow`, `customRollUpStart`, `customRollUpEnd`; for the experiment: `status`, `startTime`, `defaultRollupWindow`, and confirm groups, allocation, layer, and metric lists are unchanged from this snapshot: status `setup`, idType `stableID`, layer `ampliloan_application_layer`, control/treatment 50/50, allocation 100, primary `ampliloan_application_submitted_users`, secondary saved, offer-selected, and `ampliloan_validation_failed_count`. Record every call as method, path, status code (no secrets, no key prefix).

## Result
`docs/evidence/phase-4c4.md`, update `docs/STATSIG_INVENTORY.md` (windows now set; also correct the stale "No rules" gate description) and `docs/ASSET_INVENTORY.md` (same correction), `PHASE_LOG.md` entry, draft PR to `main`, set this file to `Status: IDLE` on your branch. Confirm with `git diff --stat origin/main HEAD` that docs are included. Stop; the grant is spent.
