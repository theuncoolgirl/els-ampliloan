
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
