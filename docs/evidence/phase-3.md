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
