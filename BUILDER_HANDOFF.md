# Builder handoff — IDLE
Status: IDLE
Phase: none active
Revision: 3.4 closed (Phase 3 reviewed and merged)
Owner: Planner

No active task. Phase 3 is COMPLETE: Builder head `21f81cc` merged via PR #15 (merge commit `a1572ff`); Pages deploy run 43312541289 succeeded. Phase 4 is not started and needs Erin's instruction ("Start phase 4") plus separate authorization for each console action. A stale START in an old revision must not be rerun.

Standing permissions (unchanged): Builder Commit Yes; Push Yes (own feature branch only, never `main`); PR Yes (draft); Merge No; Deploy No. Planner Commit Yes; Push Yes (planning branches); PR Yes; Merge No unless Erin posts a named Approve in Cursor chat for one PR and head SHA; Deploy No. Telemetry authorization covers real demo events to Amplitude project 905260 and Statsig project `363sCqDdACZXt4M88ZqiKa`. Statsig Console API writes are NOT currently authorized: the Phase 3 authorization (create the 10 entities, set their parameters) is spent. The console secret is now named `STATSIG_CONSOLE_API_KEY`; the old name `VITE_STATSIG_CONSOLE_KEY` is retired.
