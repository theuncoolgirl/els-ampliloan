# Phase 4C.4 evidence: rollup windows (one-time console write)

Branch `cursor/phase4c4-windows-360f` from `origin/main` (3e2f4de). Project `AmpliLoan [Cloud]` `6oe5DaLQIx5XnKfBrG0JnT`, base `https://statsigapi.net/console/v1`. The key came from the environment only, was sent only to `statsigapi.net`, and was never written to a file, command line or this document. The temporary scripts lived in `/tmp` and were deleted. No build was run, no repository code changed, nothing deployed. Note: the API returns a masked key prefix in `creatorName`; I did not copy it here.

## Calls (method, path, status)
| # | Call | Status |
|---|---|---|
| 1 | GET `/metrics/{submitted_users::event_user}` | 200 |
| 2 | GET `/metrics/{saved_users::event_user}` | 200 |
| 3 | GET `/metrics/{offer_selected_users::event_user}` | 200 |
| 4 | GET `/experiments/ampliloan_application_reassurance_v1` | 200 |
| 5 | GET `/metrics/{submitted_users::event_user}` (field check) | 200 |
| 6 | POST `/metrics/{submitted_users::event_user}` body `{rollupTimeWindow:"custom", customRollUpStart:0, customRollUpEnd:1}` | 201 "Metric updated successfully." |
| 7 | POST `/metrics/{saved_users::event_user}` same body | 201 |
| 8 | POST `/metrics/{offer_selected_users::event_user}` same body | 201 |
| 9-12 | GET `/metrics/{id}` for the three metrics and `ampliloan_validation_failed_count::event_count_custom` | 200 each |
| 13 | GET `/experiments/ampliloan_application_reassurance_v1` | 200 |
| 14 | GET `/metrics/list?limit=200` (extra read-only attempt to find the rollup fields) | 400 (not pursued) |
`::` was URL-encoded. The minimum body was accepted; no other fields were needed.

## Results
- Metrics: all three writes accepted (201). `ampliloan_validation_failed_count` was not modified: it is a count metric and the custom window applies to unit-count metrics.
- READ-BACK NOT POSSIBLE: the metric GET returns no `rollupTimeWindow`, `customRollUpStart` or `customRollUpEnd` field (before or after the write; fields returned are id, name, directionality, type, description, flags, tags, owner/lineage info, unitTypes, metricEvents). So the three values cannot be compared by API. The write acceptance (201) is recorded; the stored window needs a console check by Erin.
- Experiment: `defaultRollupWindow` already read `-1` (cumulative) in the first GET, so the PATCH was not sent (it would have been a no-op); this is a deviation from the handoff's step 3, taken to avoid a pointless write. Read after: `-1`.
- Experiment state after the last call (GET): `status` `setup`, `startTime` null, `launchedGroupID` null, idType `stableID`, layer `ampliloan_application_layer`, allocation 100, control and treatment 50/50 with parameter values `{show_reassurance:false, progress_style:"steps"}` and `{show_reassurance:true, progress_style:"steps"}`, primary `ampliloan_application_submitted_users`, secondary `ampliloan_application_saved_users`, `ampliloan_offer_selected_users`, `ampliloan_validation_failed_count`. All unchanged from the snapshot in the handoff.
- No other entity was touched. The write grant is spent.

## Docs updated
`docs/STATSIG_INVENTORY.md` (window written, read-back caveat, gate description corrected, new 4C.4 section), `docs/ASSET_INVENTORY.md` (gate text and disagreement 6 resolved, metric status), `docs/VERIFICATION.md` and `docs/CONSOLE_SETUP.md` (rollup wording).

## Open
Erin: confirm in the console that the three metrics show a custom 0 to 1 day window. If not, the grant needs a new revision; nothing else was tried.
