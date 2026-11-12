## 2026-11-12T16:00Z | Phase 0 | Revision 2 | NEEDS_REVIEW
- Builder ID/link: single Builder cloud agent (no separate ID available to Builder)
- Branch and head SHA (or no commit): cursor/phase0-shell-360f; SHA in PR/final report
- Objective and implementation summary: static React/TS/Vite shell, hash routes, hero with CTA, tokens, reduced motion, data-demo anchors, base /els-ampliloan/, Pages workflow (push to main only), .env.example names only.
- Files changed: package.json, package-lock.json, index.html, tsconfig.json, vite.config.ts, src/**, public/favicon.svg, .github/workflows/pages.yml, .gitignore, .env.example, docs/SETUP.md, docs/evidence/phase-0.md, PHASE_LOG.md
- Git actions performed; draft PR link if any: branch created, commits, push; draft PR against cursor/planner-phase0-start-360f
- External actions performed (project/entity names or IDs; no secrets): none. No SDKs, no vendor traffic, env secrets not read.
- Definition-of-done results: P0.1 PASS; P0.2 PASS; P0.3 PASS; P0.4 NOT RUN (pending approved deploy). Details in docs/evidence/phase-0.md
- Checks: npm run typecheck exit 0; npm run build exit 0; Chrome smoke at 390x844 and 1440x900 (normal and reduced motion) passed; preview direct load and refresh of /els-ampliloan/#/dashboard 200, no console errors.
- Readiness (UI / SDK / console / telemetry / data): UI local shell verified; SDK none; console none; telemetry none; data none.
- Deviations and known limitations: Playwright-core run from /tmp outside repo using system Chrome. Action majors checked via GitHub releases API. Workflow not run.
- Blocker and exact decision/configuration needed, if any: none
- Next: stopped; awaiting Planner review or revised handoff.

## 2026-11-12T16:20Z | Phase 0 | Revision 3 | NEEDS_REVIEW
- Builder ID/link: single Builder cloud agent (same as revision 2)
- Branch and head SHA (or no commit): cursor/pages-path-filter-360f; SHA in final report
- Objective and implementation summary: add `paths:` filter to pages.yml push trigger so docs/planning merges do not redeploy.
- Files changed: .github/workflows/pages.yml, docs/SETUP.md, docs/evidence/phase-0.md, PHASE_LOG.md
- Git actions performed; draft PR link if any: branch from origin/main, commits, push; draft PR against main
- External actions performed (project/entity names or IDs; no secrets): none
- Definition-of-done results: P0.5 builder evidence gathered: filter validated by YAML parse PASS; live no-deploy proof NOT RUN (Planner, after merge)
- Checks: actionlint not installed; YAML parse confirmed branches [main] and exact paths list; npm run typecheck exit 0; npm run build exit 0; workflow not run
- Readiness (UI / SDK / console / telemetry / data): unchanged; no SDK, no telemetry
- Deviations and known limitations: no linter; merging changes pages.yml (in filter) so it deploys once.
- Blocker and exact decision/configuration needed, if any: none
- Next: stopped; awaiting Planner review or revised handoff.

## 2026-11-12T18:30Z | Phase 1 | Revision 2 | NEEDS_REVIEW
- Builder ID/link: single Builder cloud agent (same as earlier phases)
- Branch and head SHA (or no commit): cursor/phase1-journey-360f; head SHA in the final report
- Objective and implementation summary: synthetic shared journey (type, details, offers, review, submit, dashboard), local state module under src/state with localStorage `ampliloan.v1`, simulated sign-in/up/out, mock offers, tasks, help dialog, presenter personas. No SDK, no network, no instrumentation.
- Files changed: src/** (state, pages, components, styles, router), package.json, package-lock.json, vite.config.ts (test config), docs/SETUP.md, docs/evidence/phase-1.md, PHASE_LOG.md
- Git actions performed; draft PR link if any: branch from origin/main, commits, push. The PR tool only showed an unsubmitted form (base main, draft); `gh pr list --head cursor/phase1-journey-360f` returned no PR, so none exists yet.
- External actions performed (project/entity names or IDs; no secrets): none
- Definition-of-done results: P1.1 PASS; P1.2 PASS; P1.3 PASS (25 tests); P1.4 for Planner inspection. Details in docs/evidence/phase-1.md
- Checks: npm run typecheck exit 0; npm run build exit 0; npm test exit 0 (25 passed); Chrome keyboard-only smoke at 390x844, 1440x900, and 390x844 reduced motion passed; dashboard direct load and refresh pass with and without saved state; no console errors; no non-localhost requests.
- Readiness (UI / SDK / console / telemetry / data): UI local verified; SDK none; console none; telemetry none; data synthetic only.
- Deviations and known limitations: persona and sign-in controls not driven in browser; focus ring appearance not measured; double submit tested sequentially at store level plus UI busy guard. Merging changes src/, so it deploys the site.
- Blocker and exact decision/configuration needed, if any: none
- Next: stopped; awaiting Planner review or revised handoff.

## 2026-11-12T19:45Z | Phase 2 | Revision 2 | NEEDS_REVIEW
- Builder ID/link: single Builder cloud agent (same as earlier phases)
- Branch and head SHA (or no commit): cursor/phase2-amplitude-360f; head SHA in the final report
- Objective and implementation summary: `@amplitude/unified` (one initAll, 2000 ms bounded wait), identity/attribution layer, typed 17-event contract validator, single dispatcher, disabled Statsig sink, call sites, presenter diagnostics, Pages build env for the Amplitude key and zone, tests.
- Files changed: src/** (integrations, identity, telemetry, presenter, state hooks, pages), package.json, package-lock.json, .github/workflows/pages.yml (build env only), docs/SETUP.md, docs/evidence/phase-2.md, PHASE_LOG.md
- Git actions performed; draft PR link if any: branch from origin/main, logical commits, push. The PR tool only showed an unsubmitted form (base main, draft); `gh pr list --head cursor/phase2-amplitude-360f` returned no PR, so none exists yet.
- External actions performed (project/entity names or IDs; no secrets): 3 scripted journeys (A, B, C) sent real events to Amplitude project 905260 (US), `traffic_type=live_demo`. Device IDs 1a02072e-4a3e-4cac-974c-24e7c741bd1b, ebed5497-020b-43cc-bdc2-062c81e50996, fccdc6c7-61a6-4f0d-bab7-9c0da793ff59; user `sim_profile_default`; Amplitude session 1794511318959; app session 85a9b6ad-9ea0-44d2-a1aa-06048f3f54d9; window 2026-11-12 19:21:58-19:22:17 UTC. No console changes, no Statsig, no Experiment.
- Definition-of-done results: P2.1 PASS; P2.2 PARTIAL (events and identity payloads captured; stable-ID defect in first two events, fixed afterwards, live re-run not done because the 3-journey cap was used; ingestion not confirmed); P2.3 PASS (94 tests); P2.4 BLOCKED for Builder (replay requests sent, playback and masking not viewed; no Experiment requests observed).
- Checks: typecheck exit 0; build exit 0; npm test exit 0 (94 passed); local-mode keyboard regression run clean with anchors once per page; key present in bundle as build-time value only.
- Readiness (UI / SDK / console / telemetry / data): see docs/evidence/phase-2.md.
- Deviations and known limitations: engagement allowed origins not exposed by typings; sign-in carries an anonymous draft; contract discrepancies listed in evidence.
- Blocker and exact decision/configuration needed, if any: Planner decision whether to authorize one clean live re-run to replace the pre-fix capture, and to review replay playback.
- Next: stopped; awaiting Planner review or revised handoff.

## 2026-11-12T19:35Z | Phase 2 | Revision 3 | NEEDS_REVIEW
- Builder ID/link: single Builder cloud agent (same as earlier revisions)
- Branch and head SHA (or no commit): cursor/phase2-amplitude-360f; head SHA in the final report; PR #12 (opened by the Planner)
- Objective and implementation summary: keep and verify the anonymous-ID fix, add explicit `data-amp-mask` on typed and choice inputs, one clean live re-run, supersede the P2.2 and P2.4 notes.
- Files changed: src/pages/ApplyPage.tsx, OffersPage.tsx, DashboardPage.tsx, PresenterPage.tsx (masking attributes only), docs/evidence/phase-2.md, PHASE_LOG.md
- Git actions performed; draft PR link if any: commits pushed to the same branch; PR #12 already exists.
- External actions performed (project/entity names or IDs; no secrets): exactly one live run (journeys A, B, C) to Amplitude project 905260 (US), traffic_type live_demo. Device IDs f6d67c0f-6f3c-4731-ae39-4e6c334286f5 (before sign-out) and 78e596ac-306a-45e9-a744-b97759583792 (after); user sim_profile_default; Amplitude session 1794511713129; app session 21d9d1a9-8c3a-4d2b-8160-d342f36c5121; window 2026-11-12 19:28:32 to 19:28:50 UTC. Typed amount 18250. A keyless local dry run (zero vendor requests) preceded it.
- Definition-of-done results: P2.2 live capture clean: one device before sign-out, one new after, first event carries the final pre-sign-out device, insert_id equals business_event_id for all 19 events; ingestion not confirmed by me. P2.4: replay requests sent, masking not claimed, for Planner verification. P2.1 and P2.3 unchanged PASS.
- Checks: typecheck exit 0; build exit 0; npm test exit 0 (94 passed).
- Readiness (UI / SDK / console / telemetry / data): see docs/evidence/phase-2.md Revision 3.
- Deviations and known limitations: none new. The live-run cap for this revision is spent.
- Blocker and exact decision/configuration needed, if any: none
- Next: stopped; awaiting Planner review or revised handoff.

## 2026-11-12T19:45Z | Phase 2 | Revision 4 | NEEDS_REVIEW
- Builder ID/link: single Builder cloud agent (same as earlier revisions)
- Branch and head SHA (or no commit): cursor/phase2-amplitude-360f; head SHA in the final report; PR #12
- Objective and implementation summary: one paced live run to produce a replay showing typed input on the details step. No product code changed.
- Files changed: docs/evidence/phase-2.md, PHASE_LOG.md
- Git actions performed; draft PR link if any: commit pushed to the same branch; PR #12 exists.
- External actions performed (project/entity names or IDs; no secrets): exactly one live run to Amplitude project 905260 (US), traffic_type live_demo. Device 9c9b7d2a-469b-4085-9acf-54f8690ba952; Amplitude session 1794512230294; app session ef99e2d9-0d48-49c3-a5ec-39b83c67e2f4; window 2026-11-12 19:37:10 to 19:38:06 UTC; typed 18250 then 21500.
- Definition-of-done results: P2.4 evidence run captured (11 business events, 6 replay uploads); masking not claimed, for Planner and Erin to verify in the replay. Deviation: total run 56 s, below the requested 60 s; details step about 11 s; last replay upload observed at 19:37:39 though the journey ran to 19:37:50.
- Checks: typecheck exit 0; build exit 0 (unchanged code; npm test not re-run since no code changed).
- Readiness (UI / SDK / console / telemetry / data): see docs/evidence/phase-2.md Revision 4.
- Deviations and known limitations: the 60 s minimum was missed by 4 s; the run cap is spent.
- Blocker and exact decision/configuration needed, if any: Planner decides whether the replay is sufficient or authorizes another run.
- Next: stopped; awaiting Planner review or revised handoff.

## 2026-11-12T20:30Z | Phase 3 | Revision 2 | NEEDS_REVIEW
- Builder ID/link: single Builder cloud agent (same as earlier phases)
- Branch and head SHA (or no commit): cursor/phase3-statsig-360f; head SHA in the final report
- Objective and implementation summary: `@statsig/js-client` behind `src/integrations/statsig.ts` (lazy single client, local mode with no key, 2000 ms bounded wait, generation-token identity sync, typed never-throwing accessors with source and fallback reason), `pageParameters.ts` (lazy typed page parameters, once-per-generation setup failures), page bindings for home, application, offers, dashboard, standalone gate and dynamic config, Statsig telemetry adapter behind the dispatcher, presenter Preview with banner, extended presenter diagnostics, tests.
- Files changed: src/** (integrations, telemetry, presenter, components, pages, styles, tests), package.json, package-lock.json, docs/STATSIG_INVENTORY.md, docs/SETUP.md, docs/evidence/phase-3.md, PHASE_LOG.md. `.env.example` already listed `VITE_STATSIG_CLIENT_KEY` (unchanged).
- Git actions performed; draft PR link if any: logical commits pushed to the branch; draft PR attempted with base main (see final report; if the PR tool only showed an unsubmitted form, `gh pr list` is the check).
- External actions performed (project/entity names or IDs; no secrets): none. No Statsig or Amplitude requests (capture shows only 127.0.0.1:4180), no console, no Statsig API, no keys.
- Definition-of-done results: offline checks PASS (typecheck, build, 111 tests, keyboard-only smoke with 30 checks, preview run, zero vendor requests). Live and console items NOT STARTED or NOT VERIFIED by design for this revision.
- Checks: typecheck exit 0; build exit 0; npm test exit 0 (111 passed).
- Readiness (UI / SDK / console / telemetry / data): see docs/evidence/phase-3.md.
- Deviations and known limitations: the specified defaults change three visible Phase 2 defaults (hero headline, help heading and body, FAQ count 3 instead of 5); `__configuration` is an internal SDK field; the SDK default tier as reported by the server is not verified.
- Blocker and exact decision/configuration needed, if any: Planner to confirm the three default changes are intended; console provisioning and a keyed live run need a later authorization.
- Next: stopped; awaiting Planner review or revised handoff.

## 2026-11-12T20:25Z | Phase 3 | Revision 2.1 | NEEDS_REVIEW
- Builder ID/link: single Builder cloud agent (same as earlier phases)
- Branch and head SHA (or no commit): cursor/phase3-statsig-360f; head SHA in the final report; draft PR #15
- Objective and implementation summary: corrected defaults (shipped hero headline; support content heading "Help", empty body line not rendered, max_items 5), wrapped the internal `__configuration` read with an `error` fallback, tests, inventory and evidence updates.
- Files changed: src/integrations/pageParameters.ts, statsig.ts, statsig.test.ts, src/components/HelpPanel.tsx, docs/STATSIG_INVENTORY.md, docs/evidence/phase-3.md, PHASE_LOG.md
- Git actions performed; draft PR link if any: commit pushed to the same branch; PR #15 exists.
- External actions performed (project/entity names or IDs; no secrets): none. Capture shows only 127.0.0.1:4180 (29 requests); zero Statsig or Amplitude requests.
- Definition-of-done results: offline P3.1 PASS (default and preview smokes, two runs); P3.2 fake-client tests PASS (114). Console and live items NOT STARTED or NOT VERIFIED by design.
- Checks: typecheck exit 0; build exit 0; npm test exit 0 (114 passed).
- Readiness (UI / SDK / console / telemetry / data): see docs/evidence/phase-3.md, Revision 2.1.
- Deviations and known limitations: supersedes revision 2 notes on defaults and `__configuration`. Residual: the old static help line "Local sample content for this demo." no longer shows, since the corrected default body is empty; SDK default tier NOT VERIFIED.
- Blocker and exact decision/configuration needed, if any: none
- Next: stopped; awaiting Planner review.

## 2026-11-12T20:40Z | Phase 3 | Revision 3 | NEEDS_REVIEW
- Builder ID/link: single Builder cloud agent (same as earlier phases)
- Branch and head SHA (or no commit): cursor/phase3-statsig-360f; head SHA in the final report; draft PR #15
- Objective and implementation summary: console entities (BLOCKED), Pages env line for the Statsig key (done), live-mode fixes, live Run A, fallback Run B, evidence.
- Files changed: .github/workflows/pages.yml (one env line), src/integrations/statsig.ts, statsig.test.ts, docs/SETUP.md, docs/STATSIG_INVENTORY.md, docs/evidence/phase-3.md, PHASE_LOG.md
- Git actions performed; draft PR link if any: commits pushed to the same branch; PR #15 exists.
- External actions performed (project/entity names or IDs; no secrets): console login attempt only, no entity created (BLOCKED: org requires SSO). Live Run A to Statsig and Amplitude, window 2026-11-12 20:23:12-20:23:41 UTC, stable ID a109bc66-5915-4a1e-9398-7ba8b6a96d59, user sim_profile_default, Amplitude session 1794514992286. Two earlier Run B attempts unintentionally reached Statsig through a fallback host I had not blocked (one also sent Amplitude events), so the cap of 2 journeys was exceeded; a third Run B had all Statsig hosts blocked and sent nothing.
- Definition-of-done results: P3.1 live binding BLOCKED (no entities). P3.2 documented real-SDK behavior PARTIAL (init payload, success:false semantics, non_exposed_checks; exposure behavior with real entities not verified). P3.3 payload comparison recorded for Planner to verify. P3.4 fallback PASS in browser and tests (bounded wait, fallback with reason error, no cross-identity values).
- Checks: typecheck exit 0; build exit 0; npm test exit 0 (116 passed).
- Readiness (UI / SDK / console / telemetry / data): see docs/evidence/phase-3.md, Revision 3.
- Deviations and known limitations: cap exceeded as above; console blocked; volatile traits in the Statsig user cause `timeout` fallbacks after state changes; Statsig default tier NOT VERIFIED; warehouse results not checked.
- Blocker and exact decision/configuration needed, if any: console access that does not need SSO (or an SSO-capable member to create the listed entities); Planner decision on keeping volatile traits out of the evaluation user.
- Next: stopped; awaiting Planner review.

## 2026-11-12T20:55Z | Phase 3 | Revision 3.1 | NEEDS_REVIEW
- Builder ID/link: single Builder cloud agent (same as earlier phases)
- Branch and head SHA (or no commit): cursor/phase3-statsig-360f; head SHA in the final report; draft PR #15
- Objective and implementation summary: identity versus trait generations in the Statsig facade (coalesced trait updates, stale_traits serving, failure keeps values, boundary-only application, active_loan_type baseline rule), presenter indicators, tests.
- Files changed: src/integrations/statsig.ts, statsig.test.ts, src/presenter/Diagnostics.tsx, docs/STATSIG_INVENTORY.md, docs/evidence/phase-3.md, PHASE_LOG.md
- Git actions performed; draft PR link if any: commit pushed to the same branch; PR #15 exists.
- External actions performed (project/entity names or IDs; no secrets): none. Capture shows only 127.0.0.1:4180 (29 requests); zero Statsig or Amplitude requests; no console login; no bot credentials.
- Definition-of-done results: P3.2 identity and exposure-rule tests with fakes PASS (125 tests); offline P3.4 PASS (smokes). P3.1 live binding, real-SDK exposure behavior, and P3.3 stay open.
- Checks: typecheck exit 0; build exit 0; npm test exit 0 (125 passed).
- Readiness (UI / SDK / console / telemetry / data): see docs/evidence/phase-3.md, Revision 3.1.
- Deviations and known limitations: real-SDK behavior during an in-flight update not verified live; revision 3 cap overrun note stands.
- Blocker and exact decision/configuration needed, if any: none new (console access still needed for entities).
- Next: stopped; awaiting Planner review.

## 2026-11-12T21:00Z | Phase 3 | Revision 3.2 | NEEDS_REVIEW
- Builder ID/link: single Builder cloud agent (same as earlier phases)
- Branch and head SHA (or no commit): cursor/phase3-statsig-360f; head SHA in the final report; draft PR #15
- Objective and implementation summary: create the Statsig entities through the Console API (POST only), then two live journeys (A: full, B: all Statsig hosts blocked).
- Files changed: docs/STATSIG_INVENTORY.md, docs/evidence/phase-3.md, PHASE_LOG.md (no source changes)
- Git actions performed; draft PR link if any: commit pushed to the same branch; PR #15 exists.
- External actions performed (project/entity names or IDs; no secrets): Console API, project `AmpliLoan [WHN]` (363sCqDdACZXt4M88ZqiKa): GET gates?limit=1 (200); POST /gates 201 (`ampliloan_contextual_help`), GET 200; POST /dynamic_configs 201 (`ampliloan_support_content`), GET 200. No other calls. Live journey A 2026-11-12 20:48:41-20:49:10 UTC, stable ID 9fac13c8-6be8-4fc9-898a-3220e35f40a4, user sim_profile_default (Statsig and Amplitude). Journey B 20:49:30-20:49:51 UTC with all Statsig hosts blocked, no vendor responses.
- Definition-of-done results: gate and config provisioned and verified; 4 layers and 4 parameter stores BLOCKED (POST cannot define parameters; PATCH not authorized). P3.1 PARTIAL (config delivered to the client; gate not in the client payload; no parameter binding). P3.2 PARTIAL (no exposures observed). P3.3 recorded for Planner verification. P3.4 PASS.
- Checks: not re-run (no source change); build with the console key removed; dist contains 0 occurrences of the full console key.
- Readiness (UI / SDK / console / telemetry / data): see docs/evidence/phase-3.md, Revision 3.2.
- Deviations and known limitations: layers and stores not created; gate absent from the client payload (cause undetermined); config not read in the UI during the journey; reasons `timeout` for gate and non-store reads.
- Blocker and exact decision/configuration needed, if any: authorize PATCH (or PUT) for the 4 layers and 4 parameter stores so parameters can be defined after the POST, or have a console user add them; check why the gate is not served (status "In Progress").
- Next: stopped; awaiting Planner review.

## 2026-11-12T21:10Z | Phase 3 | Revision 3.3 | NEEDS_REVIEW
- Builder ID/link: single Builder cloud agent (same as earlier phases)
- Branch and head SHA (or no commit): cursor/phase3-statsig-360f; head SHA in the final report; draft PR #15
- Objective and implementation summary: create and define the 4 layers and 4 parameter stores through the Console API, small presenter fix, one live journey.
- Files changed: src/integrations/statsig.ts, statsig.test.ts, src/App.tsx, docs/STATSIG_INVENTORY.md, docs/evidence/phase-3.md, PHASE_LOG.md
- Git actions performed; draft PR link if any: commits pushed to the same branch; PR #15 exists.
- External actions performed (project/entity names or IDs; no secrets): Console API, project `AmpliLoan [WHN]`: 2 list GETs; POST /layers x4 (201), PATCH /layers/{id} x4 (200), POST /param_stores x4 (201), POST /param_stores/{name} x4 (201, documented update call), GET of each (200). Store IDs YWTl4E33mPmYJjhrjXG3l, ZDMfK0Fowz7wohsxrIOkQ, 10fQQK8ElPNovUraM6AgVS, 1169qA5ZoX8l5ubZIlGQeW; layer IDs equal their names. Gate and config untouched. One live journey 20:54:35-20:55:06 UTC, stable ID 495d128d-b0a1-4bf3-a3cc-507c2e1a58ce, user sim_profile_default.
- Definition-of-done results: entities PASS. P3.1 PARTIAL: four parameters (home x2, application x2) and the config served by Statsig; offers and dashboard parameters and the gate returned default (timeout) because of first reads during an in-flight update; gate absent from payload. P3.2 PASS for observed behavior (layer and config exposures once per identity, none for unused or defaults, none from diagnostics). P3.3 recorded for Planner verification.
- Checks: typecheck exit 0; build exit 0; npm test exit 0 (127 passed); dist has 0 occurrences of the console key.
- Readiness (UI / SDK / console / telemetry / data): see docs/evidence/phase-3.md, Revision 3.3.
- Deviations and known limitations: the route-hold fix (src/App.tsx, in its own commit) is not verified live because the journey cap is 1; one more journey is needed to confirm offers and dashboard values. The param store update uses the documented `POST /param_stores/{name}` (no PATCH or PUT exists for stores). Gate not served to clients.
- Blocker and exact decision/configuration needed, if any: authorize one more live journey to verify the route-hold fix, or drop that commit.
- Next: stopped; awaiting Planner review.

## 2026-11-12T21:05Z | Phase 3 | Revision 3.4 | NEEDS_REVIEW
- Builder ID/link: single Builder cloud agent (same as earlier phases)
- Branch and head SHA (or no commit): cursor/phase3-statsig-360f; head SHA in the final report; draft PR #15
- Objective and implementation summary: one live confirmation journey; no console changes; route-hold commit kept.
- Files changed: docs/evidence/phase-3.md, docs/STATSIG_INVENTORY.md, PHASE_LOG.md
- Git actions performed; draft PR link if any: commit pushed to the same branch; PR #15 exists.
- External actions performed (project/entity names or IDs; no secrets): no Console API calls. One live journey 20:59:23-20:59:55 UTC, stable ID 3c847d39-d178-4d73-bc19-f598fd78f8c2, session 39297cf5-47e2-4191-8f78-66f1eb6e81b7, user sim_profile_default.
- Definition-of-done results: P3.1 PASS (six parameters, gate, config all source statsig, no fallbacks). P3.2 PASS (exposures by type recorded; none from diagnostics or unused parameters; gate exposure logged despite gate absent from payload).
- Checks: typecheck exit 0; build exit 0; npm test exit 0 (127 passed).
- Readiness (UI / SDK / console / telemetry / data): see docs/evidence/phase-3.md, Revision 3.4.
- Deviations and known limitations: submit transition 796 ms (350 ms is simulated delay); route hold not isolated per transition; hold not tested in preview mode live; gate still not in the client payload; default tier NOT VERIFIED; warehouse not checked.
- Blocker and exact decision/configuration needed, if any: none.
- Next: stopped; awaiting Planner review.

## 2026-11-12T22:55Z | Phase 4 | Revision 4C.1 | NEEDS_REVIEW
- Builder ID/link: single Builder cloud agent (same as earlier phases)
- Branch and head SHA (or no commit): cursor/phase4c-statsig-360f from origin/main; head SHA in the final report
- Objective and implementation summary: add gate rule, create draft experiment, one live check.
- Files changed: docs/evidence/phase-4.md, docs/STATSIG_INVENTORY.md, PHASE_LOG.md (no source)
- Git actions performed; draft PR link if any: branch pushed; PR per final report.
- External actions performed (project/entity names or IDs; no secrets): Console API: GET gate 200, PATCH gate 200 (rule `first_time_borrowers`, ID ytc41AcZcgDgMS4U8Bl3s), GET gate 200, POST /experiments 400 (no exposure source), GET assignment_sources 200 (0), GET experiment 404. One live journey 22:48:28-22:48:49 UTC, stable IDs 4181ec73 (first_time) and 04eb7b8c (default).
- Definition-of-done results: gate rule PASS (true with hint for first_time, false without hint for default). Experiment BLOCKED (no assignment source; needs a warehouse connection from Erin). P4.1 PARTIAL, P4.4 BLOCKED.
- Checks: no source change; build with console key removed; 0 key occurrences in output.
- Readiness (UI / SDK / console / telemetry / data): see docs/evidence/phase-4.md.
- Deviations and known limitations: the default user's false-gate exposure not captured; gate description text still says "No rules".
- Blocker and exact decision/configuration needed, if any: warehouse connection and an assignment source (then metrics) from Erin; then re-authorize the experiment POST.
- Next: stopped; awaiting Planner review.

## 2026-11-12T23:20Z | Phase 4 | Revision 4C.3 | NEEDS_REVIEW
- Builder ID/link: single Builder cloud agent (same as earlier phases)
- Branch and head SHA (or no commit): cursor/phase4c3-experiment-360f from origin/main; head SHA in the final report
- Objective and implementation summary: create 4 metrics and one draft experiment in the Cloud project; not started.
- Files changed: docs/STATSIG_INVENTORY.md, docs/evidence/phase-4.md, PHASE_LOG.md (no source)
- Git actions performed; draft PR link if any: branch pushed; PR per final report.
- External actions performed (project/entity names or IDs; no secrets): Console API at statsigapi.net, project 6oe5DaLQIx5XnKfBrG0JnT: metrics POST 201 x4 (after 4 rejected 400s, nothing created), experiment `ampliloan_application_reassurance_v1` POST 201, PATCH 200 (metrics only), GETs 200. No live journey.
- Definition-of-done results: P4.1 PASS; P4.2 PARTIAL (definitions recorded; rollup window not set); P4.4 PASS (draft with variants, unit, layer, allocation, metrics, rollback; not started, awaiting Erin).
- Checks: layer defaults unchanged; experiment status setup, no start time.
- Readiness (UI / SDK / console / telemetry / data): see docs/evidence/phase-4.md, 4C.3.
- Deviations and known limitations: experiment was POSTed before its metrics existed due to a script ordering slip and then updated with one PATCH (not listed in the handoff); guardrail stored in secondaryMetrics; `Application Validation Failed` event not yet seen by the project; rollup window unset.
- Blocker and exact decision/configuration needed, if any: separate Erin approval to start; Planner decision on the metric rollup window.
- Next: stopped; awaiting Planner review.
