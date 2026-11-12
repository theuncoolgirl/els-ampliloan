# Phase 2 evidence (revision 2)

No secret value appears in this file. Network captures were redacted (the API key appears only as `[REDACTED]`; it was never printed).

## Environment (task 1, 2)
node v22.23.4, npm 10.9.9, Linux. Branch `cursor/phase2-amplitude-360f` from `origin/main`. Browser automation: `playwright-core` installed outside the repo (`/tmp/pw`) driving system Google Chrome 157.0.8103.50. `VITE_AMPLITUDE_API_KEY` set in the shell: yes (value never read into output). `@amplitude/unified` 1.2.2 (only new dependency; includes analytics-browser, session-replay, engagement-browser, experiment plugin).

### Typings checked against docs/INTEGRATION_NOTES.md (discrepancies, notes file not edited)
- `initAll(apiKey, { serverZone, analytics, sessionReplay, experiment, engagement })` returned a Promise and was awaited directly: matches the notes.
- Identity: `deviceId`/`userId` exist as `analytics` init options and as `setDeviceId`, `setUserId`; `track` accepts a BaseEvent with `insert_id`, `device_id`, `user_id`, `time`; `identify(new Identify().set/setOnce)` exists. Matches.
- Autocapture options exist as used: `sessions`, `pageViews`, `elementInteractions`, `frustrationInteractions`, `formInteractions`, `fileDownloads`, `networkTracking`, `webVitals`, `attribution`.
- DISCREPANCY: the notes say to set Engagement allowed origins "where the typings expose it". `@amplitude/engagement-browser` `InitOptions` has no allowed-origins option (only `serverZone`, `serverUrl`, `chatUrl`, `mediaUrl`, `integrations`, `autoRefreshIntervalSeconds`, ...). Allowed origins must be set in the Amplitude console; not done (out of scope).
- NOTE: `initAll` always adds the Experiment plugin; there is no option to omit it. No Experiment or flag request was observed in the capture below.
- Replay privacy is `privacyConfig` (`defaultMaskLevel`, `maskSelector`), configured as `medium` plus `input, select, textarea, [type=checkbox], [type=radio]`.
- Contract note: `implementation_location` values differ from the real file names (advisory per handoff).

## P2.1 PASS
`npm run typecheck` exit 0; `npm run build` exit 0; `npm test` exit 0 (94 tests, 2 files). Only `src/integrations/amplitude.ts` imports `@amplitude/unified`; `initAll` is called from one module-level promise (`ensureStarted`). No `@statsig/*`, no Experiment calls. The production bundle contains the key as a build-time value in one chunk (checked with a fixed-string match; the value was not printed). The literal `Application Step Completed` appears only in the negative test.

## P2.3 PASS (unit tests, fake adapters, no network)
`src/telemetry/telemetry.test.ts`: all 17 event names validate; every required property missing, null, or invalid enum is rejected for every event; `Application Step Completed` and unknown properties are rejected; `loan_type unknown` only where the contract allows; one `Application Submitted` per application ID with rapid double submit and a second store on shared storage; invalid review emits no Submitted; profile identify is recorded before the dependent track; Signed Out is sent under the old device and user IDs and the next event carries a new device ID and no user ID; new-user reset clears known ID, application and attribution; application reset keeps identity and attribution with a new application ID; invalid events are dropped and counted and Statsig declines are counted; personas (fixed-profile persona emits only `Signed In`, anonymous personas emit nothing); no URL or free text in properties; attribution allowlist maps unknown to `unknown`; first touch survives reload and sign-in, session touch and app session ID reset after 30 minutes; local adapter sends nothing (vendor mock never called).

## P2.2 evidence: real project 905260, US, `traffic_type=live_demo` (3 runs: A, B, C in one browser context)
Production build with the key, served by `npm run preview` on localhost, headless Chrome, keyboard driven. UTC windows: A 19:21:58-19:22:09, B 19:22:09-19:22:12, C 19:22:12-19:22:17 on 2026-11-12.
- Amplitude `session_id` (SDK-owned): 1794511318959 for all runs. App-owned session ID (event property `session_id`): 85a9b6ad-9ea0-44d2-a1aa-06048f3f54d9. Known ID (synthetic): `sim_profile_default`.
- Device IDs: ebed5497-020b-43cc-bdc2-062c81e50996 (first 2 events of A only, see defect), 1a02072e-4a3e-4cac-974c-24e7c741bd1b (rest of A, B, and the old identity in C), fccdc6c7-61a6-4f0d-bab7-9c0da793ff59 (after sign-out in C).
- Business events captured from request bodies (name, insert_id equals `business_event_id` in every case):
  - A: Rate Check Started, Loan Type Selected (device ebed5497), Application Started, Application Step Viewed (details), Application Step Viewed (offers), Offers Viewed, Offer Selected, Application Step Viewed (review), Application Saved, Application Step Viewed (review, after reload), Application Resumed, Application Step Viewed (review), Signed In, Application Step Viewed (review), Application Submitted (status `submitted`, personal_standard_36, 36 months, amount 15000, band `under_25k`, elapsed 4 s), Application Status Viewed.
  - B (reload after sign-in): Application Status Viewed with the same first touch.
  - C: Signed Out (old device and user), Rate Check Started (new device, no user ID, `loan_type unknown`).
  - 19 business events in total; each carries `schema_version` 1.0, `traffic_type` live_demo, correct `page_id`, and first/session touch fields (first touch `google/cpc/spring_rates/paid_search` throughout; session touch channel `paid_search`).
- Identify payloads: traits sent before the dependent event; `acquisition_channel_first_touch` via `$setOnce` (`paid_search`, kept after sign-in, reload, and sign-out); `journey_stage`, `active_loan_type`, `active_application_status`, `has_saved_application`, `applications_submitted_count` (0 then 1 after submit), `demo_persona` `unassigned`, `traffic_type` `live_demo`.
- Hosts contacted: `api2.amplitude.com` (9 POSTs to `/2/httpapi`), `api-sr.amplitude.com` (3 replay POSTs, plus `sr-client-cfg.amplitude.com` config GETs), `cdn.amplitude.com` and `gs.amplitude.com` (engagement/guides SDK load, config, decide, state). No request to any Experiment or flag host (no `lab.amplitude.com` host in the capture).
- Queue acceptance versus ingestion: the captured requests prove the browser SDK sent these events to Amplitude's HTTP endpoint. The presenter list shows `accepted` only when the SDK's own callback reports a success code. Neither proves the events are ingested and queryable in the project; that is for the Planner to confirm by device ID and time window. I did not query Amplitude.
- Replay: replay upload requests were sent and masking is configured, but I did not play back a replay, so playback and masking are NOT VERIFIED here (P2.4 is the Planner's).
- Console errors during the three runs: none.

### Defect found in this capture, fixed after it
The first two events (Rate Check Started, Loan Type Selected) carry device ID ebed5497, the rest carry 1a02072e. Cause: the Phase 1 store generated a new random anonymous ID on every read until the first write, so the stable ID changed when the first application was created. Fix (commit "Persist the anonymous ID on first read..."): the fresh state is persisted on first read; unit test added; local-mode browser check shows the same ID before and after the first write. The live capture predates the fix and was NOT repeated because the handoff caps real journeys at three and those three were used. A clean live re-run needs the Planner's authorization.

## Regression and anchors (task 11)
Local-mode (no key, zero vendor requests) keyboard run after the fix: home, chooser, details, offers, review, save, reload, resume, sign-in, submit, dashboard all completed; no console errors; anchors exactly once per page: home `home-cta`; details `application-root` + `application-step`; offers `offers-root`; review also `submit-application`; dashboard `dashboard-root` + `dashboard-status`; `help-entry` on every page.

## Readiness (separately)
- UI: local flow verified; diagnostics panel added to the presenter page (mode, init state, last 20 events with short IDs and delivery state, Statsig "disabled, not evaluated", dropped and declined counts).
- SDK: Unified initialized with one `initAll`; autocapture and replay configured; engagement loaded; Experiment plugin present but unused.
- Console: no console changes made; Guides/Surveys content not published; allowed origins not set (no SDK option).
- Telemetry: events sent to project 905260 from three runs; ingestion not confirmed by me; one stable-ID defect in the capture (fixed afterwards).
- Data: three scripted journeys only, no population.

## Deviations and limitations
- Sign-in now moves an anonymous draft to a profile that has no active application (needed for the specified journey sign-in then submit); covered by a unit test.
- `Application Started` is also emitted for presenter "Reset current application" (entry point `persona_control`).
- Offer Selected, Offers Viewed need a requested amount; if absent the event is dropped and counted rather than invented.
- Autocapture technical events (page view, element clicks) were captured but not inspected for URL contents.
- Local mode shows delivery state `local`, not `queued/accepted/failed`.
