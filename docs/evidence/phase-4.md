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
