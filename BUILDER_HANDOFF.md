# Builder handoff — Phase 4D (demo script and console setup docs)
Status: IDLE
Phase: 4D, docs only
Revision: 4D.1

Authority: Erin, Cursor chat, Nov 25 2026: continue to 4D after verification (10:08 AM ET). Docs only: no product code, no console or platform writes, no deploy.

## Permissions
Builder Commit Yes; Push Yes (own branch `cursor/phase4d-docs-360f` only); PR Yes (draft); Merge No; Deploy No. Do not read, print, or use any secret value. Read docs, code, and the live public site only. Do not run live journeys.

## Deliverables
1. `docs/DEMO_SCRIPT.md`: a talk track for a presenter, with timing, exact clicks, what appears on screen, and what to say. Story per the brief: a campaign brings in a borrower, they hit friction, Amplitude shows where and for whom conversion drops, Replay and feedback explain why, targeted help (Statsig gate) and a Statsig-controlled improvement (experiment) follow. Cover personal, mortgage, and small business using the one journey. Use the personas and Presenter controls as built. Mark clearly which parts are live today and which are not yet built or not yet started (experiment not started, Guides and Surveys not provisioned, no synthetic runner).
2. `docs/CONSOLE_SETUP.md`: exact setup steps and configuration names, no secret values. Sections: keys and where each lives (names only: `VITE_AMPLITUDE_API_KEY`, `VITE_AMPLITUDE_SERVER_ZONE`, `VITE_STATSIG_CLIENT_KEY`, `STATSIG_CONSOLE_API_KEY`; client versus console), GitHub Actions secrets and the Pages deploy, Statsig Cloud entity map (project `AmpliLoan [Cloud]` ID `6oe5DaLQIx5XnKfBrG0JnT`; layers, stores, parameters and defaults, gate and rule, config, metrics, experiment), Amplitude assets (project, dashboard, charts, cohorts, from `docs/AMPLITUDE_ASSETS.md`), how to start and stop the experiment (separate named approval by Erin required; after stopping, verify a fresh Stable ID gets layer defaults), and the Amplitude and Statsig integration options (below).
3. Asset inventory table (one file or a section): every Amplitude and Statsig entity with ID, name, purpose, status, where it is documented. Reconcile with `docs/AMPLITUDE_ASSETS.md` and `docs/STATSIG_INVENTORY.md`; flag any disagreement instead of silently picking one.
4. `docs/VERIFICATION.md`: step-by-step checks Erin ran or can repeat, with the exact UI expected. Include these verified facts and steps:
   - Presenter URL `#/presenter` (page titled "Demo controls"). Check Preview is Off.
   - Persona order matters: click "Start as a new demo user" first (it wipes persona and identity), confirm, then "Apply persona", then walk the journey. Applying the persona first and then starting a new user discards the persona. Same when switching personas mid-demo.
   - Gate check: with persona First-time personal borrower, the Apply details step shows a "Need help with this step?" link under the helper sentence, and the Presenter shows `ampliloan_contextual_help = true statsig`. Other personas do not get it.
   - "Statsig values read this session" is in memory per browser tab; a second tab starts empty. Application state and Stable ID are shared across tabs. A cross-tab monitor was considered and declined for now (Erin, 9:47 AM ET).
   - Statsig console checks: live event stream shows business events; exposures for the gate appear; the four built-in metrics (`mau_28d`, `new_mau_28d`, `l14`, `l28`) populate immediately and are not ours; our four `ampliloan_*` metrics roll up daily and need a full journey including one `Application Validation Failed` (blank required field on details).
   - Results recorded by Erin on Nov 25 2026: parameters served by Statsig, setup failures none, gate true for first-time persona, events and exposures visible in the Statsig console, Cloud entities and metrics present.
5. Limitations section: Statsig MCP used by the Planner is bound to the old warehouse-native project (Erin is investigating re-pointing it; the Cloud project console URL is on the staging host); old project `363sCqDdACZXt4M88ZqiKa` is superseded and untouched; metric rollup window undecided (Planner will state the API default at experiment finalization); gate description in the console still says "No rules"; Statsig Cloud metrics have daily rollups; Guides and Surveys (4B) and the synthetic runner (4E) not built.

## Amplitude as Statsig's analytics engine (Erin chose yes, 9:33 AM ET)
Document these options with prerequisites, from Statsig and Amplitude docs (re-check the cited pages and cite URLs): Amplitude events as a metric source (Amplitude to Statsig, Cloud, early access); Amplitude cohort sync (generally available; needs a Statsig Console API key added in Amplitude; syncs user IDs as ID List segments); Amplitude Native (Statsig exposures and custom events to Amplitude; early access; needs org link and enablement); legacy event streaming (do not use). Include the two cautions: Native forwarding of Statsig custom events would duplicate events the app already sends to Amplitude directly, so do not enable it for custom events; cohort sync matches user IDs while the gate and experiment use Stable ID, so cohort targeting needs a user-ID-based gate or attribute. Mark every step as Erin's console work, not done, with current status "not configured".

## Rules
- Plain, accurate statements. Mark anything not verified. Never describe mock behavior as verified service behavior. No secret values.
- Use today's site wording (no demo or synthetic wording appears on borrower pages; the Presenter page is the only place that says "Demo controls").
- Do not touch `src/`, workflows, or any file outside `docs/`, `BUILDER_HANDOFF.md`, `PHASE_LOG.md`.

## Result
Draft PR to `main`, `PHASE_LOG.md` entry, set this file to `Status: IDLE` on your branch, list in the PR body anything you could not verify, and stop. Before reporting, run `git diff --stat origin/main HEAD` on the pushed branch and confirm all four docs are included. Never use `git stash`.
