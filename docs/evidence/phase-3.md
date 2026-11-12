# Phase 3 evidence (revision 2, code-only)

This revision is code-only. No Statsig or Amplitude key was used, no console or Statsig API was touched, and no vendor traffic was sent.

## Environment (task 1)
- Repo and tree: `/agent/repos/els-ampliloan`, branch `cursor/phase3-statsig-360f` from `origin/main` (fe50425). Node v22.23.4, npm 10.9.9, Playwright-core driving system Google Chrome (`--no-sandbox`) for browser checks.
- `VITE_STATSIG_CLIENT_KEY` and `VITE_AMPLITUDE_API_KEY` are set by the Cursor environment. Every build, test, preview, and browser command here ran with both explicitly unset (`env -u` or `unset`). Unset for my runs: yes (both). Values were never read or printed.

## SDK findings (task 2): `@statsig/js-client` 3.33.8
- Client: `new StatsigClient(sdkKey, user, options)`; `initializeSync()` and `initializeAsync()` both exist; `updateUserAsync(user)` returns a promise.
- User: `userID`, `customIDs` (`stableID` supported), `custom` (string, number, boolean, string arrays), `privateAttributes`, `statsigEnvironment`. The app sets `userID` (signed in only), `customIDs.stableID`, and `custom`; it sets no privateAttributes.
- Parameter stores: `getParameterStore(name)` returns `{ name, details, get(key, fallback) }` plus an internal `__configuration` map of `{ param_type, ... }`. `get` returns the fallback for a missing or mismatched parameter without saying why, so the facade checks `__configuration` first to tell `missing_binding` from `type_mismatch`. Typed getters check the fallback's type against `param_type`. A store getter reads the mapped layer, gate, config, or experiment and logs exposure by default.
- `getFeatureGate`, `getDynamicConfig`, `getLayer`, `getParameterStore` accept `{ disableExposureLog: true }`. The app does not use it for real reads (exposure is the intended behavior); during Preview it makes no SDK read at all.
- `logEvent(eventOrName, value?, metadata?)`: metadata is `Record<string, string>`. The app passes no value.
- Environment tier: `options.environment.tier` exists. The app sets nothing. In `client-core` `_normalizeUser` only adds `statsigEnvironment` when an option or fallback is supplied, so the SDK sends no tier and Statsig applies its own default. Diagnostics show "SDK default (no tier set by the app)". What the server reports as the default tier is NOT VERIFIED (no network).

Discrepancies with `docs/INTEGRATION_NOTES.md` (file not edited)
1. Note 1 says "explicit environment tier"; the Phase 3 handoff fixes "tier not set (SDK default)". Followed the handoff.
2. Typed `get(key, fallback)` cannot report why a fallback was used; the facade reads the SDK's `__configuration` (an underscore-prefixed field) to classify failures. This relies on an internal field and may change with SDK upgrades.
3. A dynamic config with an unknown name is detected from `details.reason` starting with `Unrecognized`; this is by inspection of typings and source, not by a live check.

## Results
### UI (production build, keys unset, keyboard-only)
- Smoke: home, chooser, details, offers, review, submit, dashboard, then help panel, presenter status advance, and dashboard tasks. Output in `/tmp/smoke-output.txt` (30 checks, 0 failures, three consecutive passes). Each page's `data-demo` anchors appear exactly once (home-cta, application-step, offers-root, dashboard-root, dashboard-status).
- Preview run on a fresh draft: banner text exact on every page; home headline and CTA, reassurance line (details and review), progress bar with "Step 1 of 3: Details" and `aria-current`, contextual help hint (`data-demo="contextual-help-hint"`) opening the panel with the preview heading and 1 FAQ, offers hint, dashboard next steps hidden; presenter labels preview values; turning Preview off removes the banner and restores defaults.
- Default behavior differences from Phase 2 caused by the specified defaults (reported for the Planner): the hero headline is now "Your next chapter starts here" (was "A clearer path to the loan you need"), the help panel heading is "Help and answers" with the body "Browse common questions about your sample application." (was "Help" and "Local sample content for this demo."), and the panel shows 3 FAQs (was 5). The offers page progress now uses the shared `Stepper`, so `progress_style` applies to all three steps; markup with the default is unchanged.

### SDK
- Fake-client unit tests (no network): stable ID unchanged on sign-in and rotated on sign-out; update awaited before dependent evaluation; stale response ignored; events sent in order under the correct identity; unused parameters cause zero reads; diagnostics cause zero evaluations; setup failures recorded once; `progress_style` fallback; `max_items` clamp and integer check; preview makes no SDK read; local mode constructs no client and makes zero client calls; metadata mapping; hung initialization continues on defaults at the 2000 ms bound (fake timers) and the presenter shows fallback; a rejected initialization (blocked SDK host) shows fallback with reason `error`. Live blocked-host behavior was not exercised in a browser because no key was used.
- `npm test`: 111 passed (94 existing, 17 new). Typecheck and production build pass.

### Console
NOT VERIFIED. No console access was used. All entities are `not provisioned` (see `docs/STATSIG_INVENTORY.md`).

### Telemetry
- Network capture across both browser contexts for the whole session: 30 requests, all to the local preview host `127.0.0.1:4180`. Zero requests to any Statsig host and zero to any Amplitude host.
- Live Statsig and Amplitude telemetry: NOT STARTED. Statsig events in local mode were only counted as declined (12 in the first context); Preview suppressed events were counted, none sent.

### Data readiness
NOT STARTED. No exposures, events, or assignments exist in Statsig.

# Revision 2.1 (supersedes the revision 2 deviation notes)
Still code-only: both vendor keys unset in every command (`env -u` or `unset`), no console, no Statsig API, no live telemetry.

- Defaults corrected per the Planner: `hero_headline` is "A clearer path to the loan you need"; `ampliloan_support_content` defaults are heading "Help", body empty (the body line renders only when non-empty), `max_items` 5 (clamp 1 to 5; non-integers use 5). The "default behavior differences" and "defaults changed three Phase 2 values" notes in revision 2 no longer apply. One residual difference from Phase 2: the old static line "Local sample content for this demo." under the help heading is gone, because the corrected default body is empty.
- `__configuration` wrapped: the adapter reports `unavailable` if the field is absent, renamed, not an object, or its getter throws; the facade then returns the default with reason `error` and records no setup failure. Tests cover all four cases and the facade fallback. Known fragility recorded in `docs/STATSIG_INVENTORY.md`.
- Environment tier: unset; Statsig's default tier is NOT VERIFIED until a live revision.
- Offers page shared `Stepper`: with the default the rendered markup is identical to Phase 2 (asserted in the smoke: exact `<ol class="stepper" aria-label="Progress">` with "Step 2 of 3: Offers" as `aria-current`).
- Checks: typecheck exit 0; build exit 0; `npm test` 114 passed (3 new: shipped-defaults test, two `__configuration` tests; old-value assertions updated).
- Keyboard-only default smoke and preview smoke on the production build (two runs, 0 failures; output in `/tmp/smoke-output-2.1.txt`): home headline reads "A clearer path to the loan you need"; help panel heading "Help" with 5 FAQs and no body line; anchors once per page; preview overrides change the UI with the exact banner and send nothing; preview off restores the shipped copy.
- Network capture across both browser contexts: 29 requests, all to `127.0.0.1:4180`; zero to any Statsig or Amplitude host.
- Console, live telemetry, data readiness: unchanged, NOT VERIFIED or NOT STARTED.

# Revision 3 (console entities, live binding, live verification)
Credentials and keys were read only from the environment and never printed, logged, screenshotted, or written. Captures redact the client and Amplitude keys. Environment presence (yes/no only): bot email yes, bot password yes, `VITE_STATSIG_CLIENT_KEY` yes, `VITE_AMPLITUDE_API_KEY` yes.

## Console
- Login (task 2): BLOCKED. Using a throwaway browser context, the console email and password form accepted the bot credentials (the login callback returned 200), but opening project `363sCqDdACZXt4M88ZqiKa` redirected to the organization sign-in page, which offers only "Continue with SSO". The SSO flow cannot be completed with the bot email and password, so console work stopped there. No other credentials or routes were tried. The browser context and saved state were deleted.
- Task 3 (four layers, four parameter stores, gate, dynamic config): BLOCKED, none created. No entity IDs, creation times, or review states exist. Nothing else in the console was touched.
- Verification that the entities are absent comes only from the SDK: the live initialize response for the app's client key had empty `feature_gates`, `dynamic_configs`, and `layer_configs`. This is a statement about what the SDK received, not a console check.

## UI
- Production build with both client keys set: the app ran in Statsig live mode and Amplitude live mode, UI usable on defaults throughout. Because no entities exist, every parameter shows its default with reason `missing_binding` (four application and home parameters; the offers and dashboard parameters and the gate showed `timeout`, see SDK findings). No setup-failure logic changed for bindings, since none exist.
- Pages workflow (task 4): `VITE_STATSIG_CLIENT_KEY: ${{ secrets.VITE_STATSIG_CLIENT_KEY }}` added to the build-step env only; name added to `docs/SETUP.md`; no value in any file. Merging PR #15 would turn on live Statsig traffic for all visitors (the repository secret must exist).

## SDK
Run A (one consented synthetic journey, production build, both keys set, fresh context, keyboard-only), UTC window 2026-11-12 20:23:12 to 20:23:41, tagged landing `?utm_source=google&utm_medium=cpc&utm_campaign=spring_rates#/`, personal loan, typed amount 18250, offers, select, review, save, resume, simulated sign-in, consent, submit, dashboard, presenter diagnostics held 10 s then 15 s flush.
- IDs: stable ID (Statsig `customIDs.stableID`, Amplitude `device_id`) `a109bc66-5915-4a1e-9398-7ba8b6a96d59`, unchanged through sign-in; known user `sim_profile_default`; app session `6f6d3f3c-9e47-42e9-afad-7b3620a114e9`; Amplitude session 1794514992286; Statsig session `b47f9390-2495-4d64-954f-494672d2df52`.
- Initialize request (decoded body): `user.customIDs.stableID`, `user.custom` with 20 keys (acquisition_channel_first_touch, active_application_status, active_loan_type, applications_submitted_count, borrowing_experience, customer_relationship, demo_persona, employment_type, first_touch_campaign/channel/medium/source, has_saved_application, journey_stage, preferred_language, session_touch_campaign/channel/medium/source, traffic_type), no `userID` before sign-in and `userID=sim_profile_default` after, no `privateAttributes`, no `statsigEnvironment` (SDK default; the app sets no tier). `statsigMetadata`: SDK 3.33.8, `javascript-client`. The initialize response does not report an environment tier; the default tier remains NOT VERIFIED.
- Initialize response: `feature_gates`, `dynamic_configs`, `layer_configs` all empty, `has_updates: true`. Bounded wait: initialized in 126 ms.
- Values for each bound parameter, the gate and the config: no value came from Statsig (source `default` for all). Sources and reasons shown in the presenter: `missing_binding` for hero_headline, cta_label, show_reassurance, progress_style; `timeout` for the gate, show_comparison_hint, show_next_steps. The `timeout` reasons are a real live-mode finding: the Statsig user object includes traits that change with application state and page (journey_stage, active_loan_type, ...), so most page transitions start a new `updateUserAsync` (8 initialize calls in the journey) and a read made while that update is still pending returns the default. With provisioned entities, a gate or parameter read right after a state change would fall back until the next route. Recommended Planner decision: keep volatile state traits out of the evaluation user, or accept the lag. Not changed in this revision.
- Exposure events: zero exposure events (`statsig::*_exposure`) were sent because no entity exists; only `statsig::non_exposed_checks` (store reads for `ampliloan_home` and `ampliloan_application`). Whether repeated renders add exposures with real entities: NOT VERIFIED. The app reads each parameter once per navigation, from a cache.
- Opening the presenter diagnostics panel: no gate, config, or layer evaluation and no exposure or non-exposed-check event followed. One identity update (initialize request, `journey_stage` trait change on the presenter page) and one `statsig::diagnostics` event occurred; these are user-object updates, not evaluations.
- Defect found and fixed in live mode: the SDK reports a failed initialization or update by resolving with `success: false`, not by rejecting. The facade treated every resolution as ready. It now reads `success`, shows fallback with reason `error`, and keeps the timed-out wait message. Unit tests added (116 total).

## Telemetry
Statsig `logEvent` calls in Run A: 13 business events, each with the exact event name, no `value` field, flat string metadata including `business_event_id`, under the correct identity (events before sign-in carry no `userID`; `Signed In` and later carry `sim_profile_default`). Names: Rate Check Started, Loan Type Selected, Application Started, Application Step Viewed (5), Offers Viewed, Offer Selected, Application Saved, Application Resumed, Signed In, Application Submitted, Application Status Viewed.

`Application Submitted`, side by side (same `business_event_id` `8ec220d4-503f-4cf4-9fda-901a9cd153b2`):

| Field | Statsig (metadata, strings) | Amplitude (event properties) |
|---|---|---|
| name | `Application Submitted` | `Application Submitted`, `insert_id` = business_event_id |
| loan_type | `personal` | `personal` |
| application_id | `40328d98-2506-4be0-b6a3-97dd2f2ae810` | same |
| application_status | `submitted` | `submitted` |
| offer_id | `personal_standard_36` | same |
| term_months | `"36"` | `36` (number) |
| requested_amount | `"18250"` | `18250` (number) |
| amount_band | `under_25k` | `under_25k` |
| elapsed_seconds | `"2"` | `2` (number) |
| identity unit | `customIDs.stableID` a109bc66-5915-4a1e-9398-7ba8b6a96d59, `userID` sim_profile_default | `device_id` same, `user_id` sim_profile_default |
| value | none | not applicable |

Planner should verify these in the Statsig log stream and Amplitude. Ingestion was not confirmed by me.

Run B (fallback): the first two attempts did not block every Statsig host. The SDK falls back from `featureassets.org` to `assetsconfigcdn.org` (found through a `cloudflare-dns.com` TXT lookup) and `beyondwickedmapping.org`, and my block list missed `assetsconfigcdn.org`, so those attempts reached Statsig (live initialize and event traffic, including one with the Amplitude key set). They are therefore not valid fallback evidence, and together with Run A they exceed the 2-journey cap; this is a deviation I am reporting. The third attempt blocked `featureassets.org`, `prodregistryv2.org`, `beyondwickedmapping.org`, `assetsconfigcdn.org`, and every host matching statsig or featuregates, with the Amplitude key unset: zero responses from any Statsig host, no Amplitude requests, so no vendor received anything. Window 2026-11-12 20:27:53 to 20:28:14 UTC. Results (measured before the final small fix to the wait message): the home page was visible and usable 2.3 s after load (the 2000 ms bounded wait plus rendering); the presenter showed "Statsig mode: Fallback (defaults in use)", "Statsig init: failed", every read as `default (error)`, and no setup failures; after Sign out and Simulated sign-in the home page still read "A clearer path to the loan you need" / "Check your rate" and all values stayed defaults; the stable ID changed at sign-out (80346ac6 to a new ID). After the wait-message fix the unit test asserts "timed out after 2000 ms".

## Data readiness
NOT VERIFIED. SDK receipt is not the same as results availability. This project is warehouse-native; no warehouse, metric, exposure, or results check was made, and no entities exist, so there are no assignments or exposures.

# Revision 3.1 (offline: trait updates must not discard same-identity values)
Offline: both client keys unset in every command, no live traffic, no console login, no bot credentials. The earlier sections, including the revision 3 cap-overrun note (two Run B attempts reached Statsig through the unblocked fallback host `assetsconfigcdn.org`), are unchanged. The 2-journey cap from revision 3 is spent and was not reset.

## SDK (fake-client tests only)
- Two generations implemented in `src/integrations/statsig.ts`: identity generation (stable ID or known user ID) discards everything for the old identity; trait-only updates are coalesced (one tick, one `updateUserAsync`; at most one in flight; only the latest trait set queued; an identity change cancels the queue) and keep same-identity values, served with `stale_traits` and never blocking. A failed trait update keeps previous values with reason `error`. New values are visible only at the next boundary. Application-store reads require the resolved `active_loan_type` to match, with a 2000 ms bounded `settled()` and default `timeout` fallback.
- New tests (9): stale same-identity value with `stale_traits`, no block, no extra SDK read; default `timeout` for a key never evaluated in flight; apply only at boundary; identity change discards and never returns the old value; coalescing in one tick; latest-only follow-up and identity cancel of the queue; failed trait update keeps values with `error`; `active_loan_type` baseline with bounded fallback. The stale-response test was updated for concurrent identity updates. `npm test`: 125 passed. Typecheck and build pass.
- Not verified: how the real SDK behaves for reads during `updateUserAsync` (it clears values while an update is in flight, which is why reads are served from the app's snapshot), and exposure behavior with real entities. No live check was made.

## UI
Keyboard-only default smoke and one preview smoke on the production build (two runs, 0 failures; same checks as revision 2.1, plus "Trait update pending: No" in diagnostics). The presenter shows `stale_traits: true` on affected snapshot entries and a trait-update-pending row.

## Telemetry
Network capture across both browser contexts: 29 requests, all to `127.0.0.1:4180`. Zero requests to any Statsig host (featureassets, prodregistryv2, beyondwickedmapping, assetsconfigcdn, statsig) and zero to any Amplitude host. No live telemetry.

## Console and data readiness
Unchanged: BLOCKED (SSO) and NOT VERIFIED.

# Revision 3.2 (Console API entities, live verification)
Console key handling: read only from the environment inside the API-calling script (kept in `/tmp`, deleted afterwards); never printed or written. Every npm, vite, build, preview, and test command ran with `VITE_STATSIG_CONSOLE_KEY` removed. Proof for the production build: `dist` output (built with the console key removed) contains 0 occurrences of the full key. An 8-character prefix check found 2 matches, both inside the rrweb plugin's file-name strings (`rrweb-plugin-...-record`); that fragment is generic text, and a 9-character or longer prefix matched 0 times. The key is not in `.github/workflows/pages.yml`, `.env.example`, or any source file. Environment presence (yes/no): console key yes, client key yes, Amplitude key yes.

## Console
- Auth check: `GET /console/v1/gates?limit=1` returned 200.
- Created with POST only, then re-read with GET, project `AmpliLoan [WHN]`:
  - `POST /console/v1/gates` 201 at 20:47:54Z, then `GET /console/v1/gates/ampliloan_contextual_help` 200. ID `ampliloan_contextual_help`, ID type `stableID`, type PERMANENT, enabled, `rules: []` (false for everyone), review not required, status "In Progress".
  - `POST /console/v1/dynamic_configs` 201 at 20:47:55Z, then `GET /console/v1/dynamic_configs/ampliloan_support_content` 200. ID `ampliloan_support_content`, ID type `stableID`, enabled, `rules: []`, `defaultValue` `{"heading":"Help","body":"","max_items":5}`, status "Enabled". No review or pending state was reported.
- NOT created (BLOCKED): the four layers and four parameter stores. The documented POST bodies are `name`, `description`, `idType`, `targetApps`, `team` for layers, and `name`, `description`, `displayName`, `targetAppIDs`, `tags`, `team` for parameter stores. Neither accepts parameter definitions; parameters are added by update calls (PATCH/PUT), which this revision did not authorize. I did not send undocumented fields and did not create empty shells, because shells could not be completed or removed within my authorization. No other call was made; no PATCH, PUT, or DELETE; no key, experiment, segment, or setting endpoint.

## UI
Both journeys ran on the production build with defaults visible: home reads "A clearer path to the loan you need" / "Check your rate"; the contextual help hint did not appear (gate read fell back, see SDK).

## SDK
Journey A (live, keys set, fresh context, keyboard-only), UTC 2026-11-12 20:48:41 to 20:49:10, tagged landing `?utm_source=google&utm_medium=cpc&utm_campaign=spring_rates#/`, full journey to submit and dashboard, presenter diagnostics held 10 s then 15 s flush. Stable ID `9fac13c8-6be8-4fc9-898a-3220e35f40a4` (Statsig `customIDs.stableID`, Amplitude `device_id`), unchanged through sign-in; user `sim_profile_default`.
- Initialize payload as sent: `user.customIDs.stableID`, 20 `custom` keys (unchanged from revision 3), `userID` only after sign-in, no `privateAttributes`, no `statsigEnvironment`; the app sets no tier and the response reports none. Default tier remains NOT VERIFIED. 8 initialize requests in the journey (trait and identity updates); all 8 got responses from `featureassets.org`.
- Initialize response: `dynamic_configs` contains `ampliloan_support_content` (hashed key) with value `{"heading":"Help","body":"","max_items":5}`, rule `default`, ID type `stableID`; `feature_gates` and `layer_configs` are empty. So the config is delivered; the gate is not in the client payload (cause not determined; the gate shows status "In Progress" with no rule, possibly not yet served to clients).
- Values and sources (presenter): `hero_headline`, `cta_label`, `show_reassurance`, `progress_style`: default, `missing_binding` (no store). `ampliloan_contextual_help`, `show_comparison_hint`, `show_next_steps`: default, reason `timeout` (read while the identity or trait update was still pending). `ampliloan_support_content` was not read, because the help panel was not opened in this journey (by design it is read only on open), so its served value was not exercised in the UI.
- Exposure events: zero `statsig::*_exposure` events. Only 3 `statsig::non_exposed_checks` (store reads of `ampliloan_home` and `ampliloan_application`). Whether repeated renders of the same parameter add exposures: NOT VERIFIED (nothing was exposed).
- Diagnostics panel: opening it triggered no gate, config, or layer evaluation and no exposure or non-exposed-check event; its own user update and a `statsig::diagnostics` event are not evaluations. At open it showed "Trait update pending: Yes"; 10 seconds later it showed "No" (stale flag is brief).
- Trait-only change versus values for the same identity: not demonstrable live because no value had come from Statsig for the reads; covered by the fake-client tests from revision 3.1.

## Telemetry
Statsig business events in journey A: same 13 events as revision 3, exact names, no `value` field, flat string metadata with `business_event_id`, correct identity per event (no `userID` before sign-in; `sim_profile_default` from `Signed In`). `Application Submitted` side by side:

| Field | Statsig (metadata strings) | Amplitude |
|---|---|---|
| business_event_id | see Planner log-stream check; same value in both (Amplitude `insert_id` equals it) | same |
| loan_type, application_id, application_status | `personal`, same ID, `submitted` | same |
| term_months, requested_amount, elapsed_seconds | strings (e.g. `"36"`, `"18250"`) | numbers |
| stable ID unit | `customIDs.stableID` 9fac13c8-6be8-4fc9-898a-3220e35f40a4 | `device_id` same |
| value | none | n/a |

Journey B (blocked hosts, Amplitude key unset), UTC 2026-11-12 20:49:30 to 20:49:51: blocked `featureassets.org`, `prodregistryv2.org`, `beyondwickedmapping.org`, `assetsconfigcdn.org` and every host matching statsig or featuregates. No new Statsig host appeared beyond these four; `cloudflare-dns.com` (not Statsig) was contacted twice for the fallback lookup. Zero responses from any Statsig host and zero Amplitude requests. The home page was usable 2.3 s after load (the 2000 ms bound plus rendering); the presenter showed "Fallback (defaults in use)", init failed, "timed out after 2000 ms; UI continued on defaults", every read as `default (error)` or `timeout`; after Sign out and Simulated sign-in the page still read the shipped copy with all values default, and the stable ID changed at sign-out (51a026d6 to a new ID). While in fallback the presenter keeps showing "Trait update pending: Yes" because the failed update never applies; this is cosmetic.

## Data readiness
NOT VERIFIED. SDK receipt is not the same as results availability. This project is warehouse-native; no warehouse, metric, exposure, or results check was made. No experiment exists.

# Revision 3.3

Keys present (yes/no only): `VITE_STATSIG_CONSOLE_KEY` yes, `VITE_STATSIG_CLIENT_KEY` yes, `VITE_AMPLITUDE_API_KEY` yes. Every npm, vite, build, preview and test command ran with the console key removed. After the final builds, `dist/` and the live build output contained 0 files with the full console key and 0 files with its first 9 characters.

## Console
Project `AmpliLoan [WHN]` (363sCqDdACZXt4M88ZqiKa). All calls returned 2xx; times are 2026-11-12 UTC 20:53:32 to 20:53:37. Gate and config were not touched. No DELETE, rules, experiments, or key endpoints.
- `GET /layers?limit=100` 200 and `GET /param_stores?limit=100` 200: none of the 8 existed.
- For each layer: `POST /layers` 201, `PATCH /layers/{id}` 200 (body: `parameters` with `name`, `type`, `defaultValue` only), `GET /layers/{id}` 200. `ampliloan_home_layer` (hero_headline string, cta_label string), `ampliloan_application_layer` (show_reassurance boolean false, progress_style string "steps"), `ampliloan_offers_layer` (show_comparison_hint boolean false), `ampliloan_dashboard_layer` (show_next_steps boolean true). Each GET showed `idType` `stableID`, `isImplicitLayer` false, and the table's names, types, and defaults. The layer ID equals its name.
- For each store: `POST /param_stores` 201 (name, displayName, description), `POST /param_stores/{name}` 201 ("Param Store updated successfully"; the documented update call for stores is a POST, with `parameters` entries `ref_type` `layer`, `name`, `param_type`, `layer_name`, `param_name`), `GET /param_stores/{name}` 200. IDs: `ampliloan_home` YWTl4E33mPmYJjhrjXG3l, `ampliloan_application` ZDMfK0Fowz7wohsxrIOkQ, `ampliloan_offers` 10fQQK8ElPNovUraM6AgVS, `ampliloan_dashboard` 1169qA5ZoX8l5ubZIlGQeW. Every GET matched the table, each parameter referencing the same-named layer parameter.
- No review or pending state was reported for any entity. The script lived in /tmp and was deleted.

## SDK
One live journey (cap 1), production build with client and Amplitude keys, console key removed, keyboard-only, UTC 2026-11-12 20:54:35 to 20:55:06. Tagged landing, personal loan, help panel opened once on the details step, typed amount 18250, offers, select, review, save, resume, simulated sign-in, consent, submit, dashboard, presenter diagnostics held 10 s, 15 s flush. Stable ID 495d128d-b0a1-4bf3-a3cc-507c2e1a58ce (Amplitude `device_id`), Statsig session caaa0060-4d4e-4291-a443-c9d8b80b0eb6, Amplitude session 1794516875594, user `sim_profile_default` after sign-in. The stable ID was unchanged at sign-in; `userID` appeared only from sign-in. Initialize payload: `customIDs.stableID`, 20 `custom` keys, no `statsigEnvironment` (the app sets no tier, none reported; default tier remains NOT VERIFIED). 8 initialize requests, all answered 200 by `featureassets.org`; 8 event posts to `prodregistryv2.org`, all 204. No other Statsig host.
- Initialize response: `layer_configs` 4 entries, `param_stores` 4 entries, `dynamic_configs` 1 (the support config); `feature_gates` empty (the gate is still absent from the client payload; known and accepted by the Planner, not changed).
- Values and sources (presenter, end of journey): `hero_headline` and `cta_label` `statsig` with the shipped values; `show_reassurance` false and `progress_style` "steps" `statsig`; `ampliloan_support_content` read when the panel opened (`statsig`; the panel showed the heading "Help"); `show_comparison_hint` `default (timeout)`; `show_next_steps` `default (timeout)`; `ampliloan_contextual_help` `default (timeout)`. No `missing_binding` anywhere. The three `timeout` values were each first read while a trait update (loan type, amount, or submission) was still in flight, and the per-navigation cache then kept the default for the whole page. The gate, being read on the details step straight after the loan type change, hit the same condition; whether the gate is served at all is not established, because it is not in the payload.
- Exposures (Statsig log): `layer_exposure` for `hero_headline` and `cta_label` (once each, rule `default`, empty allocated experiment); `config_exposure` for `ampliloan_support_content` once; `layer_exposure` for `show_reassurance` and `progress_style` twice each (once at resume, once after sign-in, which is a new identity). No exposure for `show_comparison_hint`, `show_next_steps`, or the gate (defaults served, only `non_exposed_checks`). Repeated renders of the same parameter within one navigation added none. Parameters not rendered produced none. Opening presenter diagnostics added only `statsig::diagnostics` events, no exposure or non-exposed check.
- Trait-only change versus values for the same identity: diagnostics showed "Trait update pending: Yes (same-identity values served as stale_traits)" at open and "No" 10 s later; the home values never reverted to defaults across trait updates.

## UI
Home showed "A clearer path to the loan you need" and "Check your rate" from Statsig. The help panel opened and rendered. No visible variation exists (layers serve defaults), so UI cannot distinguish defaults from Statsig; the presenter's source column does. Minor: the diagnostics snapshot for the config shows `[object Object]` instead of its value (cosmetic, not changed).

## Offline changes (revision 3.3, offline-tested only)
- Presenter fix: `traitUpdatePending` now reports only a running or queued update, so fallback and failed updates no longer show "Pending: Yes". Test added. 
- Binding fix: a route that mounts while a user update is running is held (blank main area, bounded at 2000 ms) until the update settles, so first reads of offers, dashboard, and gate values are not pinned to defaults. Added `updating()` and a test. This fix was written after the single allowed journey, so it has NOT been verified live; verifying it needs one more journey.
- Checks: typecheck exit 0, build exit 0, npm test exit 0 (127 passed).

## Telemetry
`Application Submitted` business_event_id 32d2eda4-8a9e-4424-88f4-2992549358f5 is present in both the Statsig log batch (all-string metadata, no value) and the Amplitude `/2/httpapi` payload (`loan_type` personal, `device_id` equals the stable ID, `user_id` sim_profile_default). Ingestion is for the Planner to confirm through the read-only MCPs.

## Data readiness
NOT VERIFIED. SDK receipt is not results availability. This project is warehouse-native; no warehouse, metric, exposure, or results check was made. No experiment exists.
