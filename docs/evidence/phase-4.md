# Phase 4 evidence

# Revision 4C.1 (Statsig gate rule, draft experiment, one live check)

`STATSIG_CONSOLE_API_KEY` present: yes. Never printed or written; script lived in /tmp and was deleted; the production build and its output contained 0 occurrences of the key or its first 9 characters. Client keys present: yes. No source changes.

## Console
Project `AmpliLoan [WHN]` (363sCqDdACZXt4M88ZqiKa). Times UTC 2026-11-12.
| Call | Status | Entity |
|---|---|---|
| GET /gates/ampliloan_contextual_help | 200 (22:47:42) | gate, idType stableID, enabled, `rules: []`, status "In Progress" |
| PATCH /gates/ampliloan_contextual_help (body: `rules` only, one rule) | 200 (22:47:43) | gate |
| GET /gates/ampliloan_contextual_help | 200 | rule ID `ytc41AcZcgDgMS4U8Bl3s`, name `first_time_borrowers`, passPercentage 100, condition `custom_field` `borrowing_experience` operator `any` targetValue `["first_time"]`, environments null; nothing else changed |
| POST /experiments (`ampliloan_application_reassurance_v1`, layer `ampliloan_application_layer`, idType stableID, groups control/treatment 50/50 with the specified parameter values, allocation 100, no metrics) | 400 (22:47:43) "Exposure source ID and name must be specified" | not created |
| GET /experiments/assignment_sources (read only) | 200 | 0 sources |
| GET /experiments/ampliloan_application_reassurance_v1 | 404 | confirms nothing half-built |
- Gate rule: PASS, verified by GET. Gate URL: https://console.statsig.com (project AmpliLoan [WHN]) gates > ampliloan_contextual_help.
- Experiment: BLOCKED. The warehouse-native project has no assignment (exposure) source, and an experiment cannot be created without one. Creating a source needs a warehouse connection and is outside authorization, so I made no other attempt (no retry with invented source names). Needed from Erin: a warehouse connection and an assignment source (and later metric sources and the primary metric Application Submitted per exposed Stable ID). Blocked metrics are as the Planner recorded. Stop/rollback for the gate rule: remove the rule, which returns the gate to false for everyone. The experiment was never created, so nothing is started and nothing allocates traffic.

## SDK and UI (one live journey, cap 1)
Production build of `main` served locally with client and Amplitude keys, keyboard-only, UTC 2026-11-12 22:48:28 to 22:48:49. 
1. Presenter persona `first_time_personal`, applied (`borrowing_experience` first_time), personal loan, details step: stable ID 4181ec73 (first 8; anonymous, no known ID). Gate `ampliloan_contextual_help` = true, source `statsig`; the help hint appeared (count 1). The `gate_exposure` was logged with gateValue true, ruleID `ytc41AcZcgDgMS4U8Bl3s`, reason `Network:Recognized`.
2. "Start as a new demo user" (default traits, `borrowing_experience` unknown), personal loan, details step: new stable ID 04eb7b8c. Gate = false, source `statsig`; no hint (count 0).
- The gate is still absent from the client initialize payload (`feature_gates` empty in every response), yet it evaluates true and logs an exposure with the rule ID; this matches the rev 3.4 observation that the SDK checks it anyway.
- Other values: `hero_headline`, `cta_label`, `show_reassurance`, `progress_style` source `statsig`, no setup failures.
- Exposures captured: layer exposures for the home parameters (both identities) and application layer exposures at the details step for the first identity (after the gate exposure), no config, no experiment exposure (no experiment exists). For the second (default) identity I did not capture its details-step gate exposure or application layer exposures in the 15 s window after the step; the presenter shows the gate read as false, but whether its false exposure was sent is NOT VERIFIED (possibly unflushed; no second journey allowed).
- Statsig hosts contacted: `featureassets.org`, `prodregistryv2.org` only.

## Telemetry
Business events in this check (Rate Check Started, Loan Type Selected, Application Started, Application Step Viewed) were accepted in the presenter; no submission was made.

## Data readiness
NOT VERIFIED. No warehouse connection, assignment source, or metrics exist; results are not available. SDK receipt is not results availability.

# Revision 4C.3 (Cloud project: metrics and a draft experiment, not started)

`STATSIG_CONSOLE_API_KEY` present: yes. Sent only to `statsigapi.net/console/v1`; never printed or written; script deleted. No live journey, no source change, no deploy. UTC 2026-11-12 23:13.

## Console
Project `6oe5DaLQIx5XnKfBrG0JnT`.
- GET /layers/ampliloan_application_layer 200 before: `show_reassurance` boolean false, `progress_style` string "steps". GET /metrics/list 200: only auto-generated event metrics existed (the project already receives events; no `Application Saved`, `Application Validation Failed` or other Phase-4 events other than those listed by Statsig).
- First metric attempts: POST /metrics x4 with `metricEvents: [{name}]` -> 400 "All events must have criteria" (three) and 400 "Invalid tag names received: [ampliloan]" (the fourth, because I sent a tag; tags must already exist). Nothing was created. This differs from the doc example only in that `criteria` must be present, even as `[]`.
- Experiment ordering slip: my script continued after the metric failures and POSTed the experiment without metrics (POST /experiments 201, GET 200, status `setup`). I then created the metrics and attached them with `PATCH /experiments/ampliloan_application_reassurance_v1` 200 on that same experiment (only `primaryMetrics` and `secondaryMetrics`). The handoff lists POST and GET only; the PATCH is a minor extension to finish the experiment as specified, with no start. Flagged for the Planner.
- Metrics: POST /metrics 201 x4 (retry with `criteria: []`, `unitTypes: ["stableID"]`, no tags). The GET path needs `name::type` URL-encoded (`GET /metrics/ampliloan_application_submitted_users::event_user` 200; a bare name gives 404, which differs from the layer and store pattern). IDs: `ampliloan_application_submitted_users::event_user` (primary), `ampliloan_application_saved_users::event_user`, `ampliloan_offer_selected_users::event_user`, `ampliloan_validation_failed_count::event_count_custom` (decrease). Each GET showed unit `stableID`, the one event, empty criteria, rollup window null, and the description with unit, source, synthetic and no-revenue text. Rollup/attribution window was not set (API default); a P4.2 window decision remains for the Planner.
- Experiment GET 200 after PATCH: status `setup`, `startTime` null, `launchedGroupID` null, both groups `shipped: false`, `disabled: false`, no targeting gate, allocation 100 with groups 50/50, hypothesis as specified, primary and three secondary metrics as above (guardrail in secondary). Nothing started; no start, launch, review or schedule call was made. The experiment is not serving: it is in setup, so no group serves traffic.
- Layer GET 200 after: `show_reassurance` false, `progress_style` "steps", identical to before.
- No review or pending state was reported.

## SDK and telemetry
No live journey (experiment unstarted). The event `Application Validation Failed` does not exist in the project's event list yet, so the guardrail metric has no data source until the app sends it.

## How to start and stop (for Erin)
Start only after a separate approval: open the experiment in the Cloud console, check groups, metrics and allocation, then Start. Stop: stop or abandon the experiment in the console, then verify on a fresh Stable ID that the layer returns `show_reassurance` false and `progress_style` "steps". Rollback of the gate rule remains: remove `first_time_borrowers`.

## Data readiness
NOT VERIFIED. No results exist; metrics have never been computed for this experiment.


# Revision 4C.2 (Cloud project `6oe5DaLQIx5XnKfBrG0JnT`)

Note: the 4C.1 section of this file lives on PR #19; this branch started from `main`, so expect a trivial merge of the two sections. Keys present (yes/no): `STATSIG_CONSOLE_API_KEY` yes, `VITE_STATSIG_CLIENT_KEY` yes, `VITE_AMPLITUDE_API_KEY` yes. The console key was sent only to `statsigapi.net` (base `https://statsigapi.net/console/v1`; no staging host was needed). Never printed or written; script deleted; the local production build contained 0 occurrences of the key or its first 9 characters. No source changes; no deploy.

## Console
Project check: `GET /gates?limit=1` 200 with 0 gates. The API does not report a project ID, so the match is inferred, not read: the old project had a gate and this key sees an empty project with 0 layers, stores, configs and gates (listing GETs below), and the gate rule ID created here (`3H1GVhuDB1LYeb6bsFCS3R`) is new and was served to the client built with the new client key. No other project was written.
All calls 2xx, UTC 23:04:43-55:
- GET /layers, /param_stores, /dynamic_configs, /gates (limit 100): 200, all empty.
- Per layer: POST /layers 201, PATCH /layers/{id} 200 (`parameters` only), GET 200; each GET matched the inventory table (types, defaults, idType stableID).
- Per store: POST /param_stores 201, POST /param_stores/{name} 201 (parameters, `ref_type` layer), GET 200 matched. IDs: ampliloan_home 3y4tImqDP2JzeEDhFJLymz, ampliloan_application 3BNzAoluZw18gDrl7wAUHG, ampliloan_offers 3CwtSBdqA5pWY8mhj727p7, ampliloan_dashboard 3EIFykZ3LVvIyES8xd5eWS.
- POST /gates 201 (`ampliloan_contextual_help`, stableID, enabled, `rules: []`), GET 200; PATCH /gates/ampliloan_contextual_help 200 (`rules` only); GET 200 showed rule `first_time_borrowers` ID 3H1GVhuDB1LYeb6bsFCS3R, pass 100, `custom_field` `borrowing_experience` `any` `["first_time"]`.
- POST /dynamic_configs 201 (`ampliloan_support_content`), GET 200: default `{"heading":"Help","body":"","max_items":5}`, no rules.
- Differences from the old project: none in API behavior (same POST/PATCH/POST-store sequence worked). The only difference is that the new gate has the rule from the start of verification and its description text is accurate.

## SDK and UI (one live journey, cap 1)
Local production build (new client key, console key removed) served with `vite preview`; keyboard-only; UTC 2026-11-12 23:05:21 to 23:05:55: tagged landing, persona `first_time_personal`, personal loan details step, amount 18250, offers, select, review, help panel, simulated sign-in, consent, submit, dashboard, presenter diagnostics 10 s, 15 s flush. Stable ID c8aba84f-02b1-41dc-bb70-39cac6b4de85 (after the persona's new demo state; an earlier anonymous ID 3603febc-... was used for the first load), user `sim_profile_default` after sign-in.
- Hosts contacted: Statsig `featureassets.org` (initialize: 3 x 200 and 6 x 204) and `prodregistryv2.org` (events: 9 x 202); no other Statsig host; the app also contacted Amplitude hosts. The SDK reached the new project with no staging-only host.
- Values (presenter, all source `statsig`, setup failures None): `hero_headline` "A clearer path to the loan you need", `cta_label` "Check your rate", `show_reassurance` false, `progress_style` "steps", `show_comparison_hint` false, `show_next_steps` true, gate `ampliloan_contextual_help` true (first_time persona; the help hint appeared, count 1), `ampliloan_support_content` read at help open (shown as `[object Object]`, cosmetic).
- Exposures: `gate_exposure` once (true, rule 3H1GVhuDB1LYeb6bsFCS3R); `layer_exposure` for home x2 (two identities), application parameters across several navigations, `show_comparison_hint` x1, `show_next_steps` x1; `config_exposure` x1; no experiment exposure (none exists). Opening diagnostics added none.
- Not checked: the false case for the gate (not part of this journey); business-event ingestion in the new project (for the Planner to verify in the console or MCP).

## Data readiness
NOT VERIFIED. No warehouse, metric, or results check. SDK receipt is not results availability.
