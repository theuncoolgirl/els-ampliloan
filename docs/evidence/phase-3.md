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
