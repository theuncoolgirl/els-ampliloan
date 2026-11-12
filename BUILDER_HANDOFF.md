# Builder handoff — Phase 3
Status: START
Phase: 3
<<<<<<< HEAD
Revision: 2.1 (follow-up to revision 2; fixes found in Planner review)
Owner: Planner
Builder ID/link: see PROJECT_PLAN.md (same Builder; resume it)
Repository / authorized branch: theuncoolgirl/els-ampliloan. Continue on `cursor/phase3-statsig-360f` (head `6fa816a`), same draft PR #15. Revision 2 (git history at `3e9d9d3` on `cursor/planner-phase3-start-360f`) still applies except where this revision changes it.

## Activation and permissions
Erin Shields, Cursor chat, 3:00 PM ET: "Start phase 3". Permissions and limits are unchanged from revision 2: Commit Yes; Push Yes (own branch only); PR Yes (draft); Merge No; Deploy No. Still code-only: both vendor keys stay unset in every run, no Statsig console or API, no live telemetry to either vendor.

## Findings from Planner review
Your head `6fa816a` passed the Planner's keyless typecheck, build, and 111 tests. Planner decisions on your reported deviations:
1. Defaults were the Planner's mistake: revision 2 said the UI must be identical with defaults, but its table changed shipped copy. Corrected defaults (the entity table in docs/STATSIG_PROPOSAL.md now says the same): `hero_headline` = "A clearer path to the loan you need" (the shipped headline); `ampliloan_support_content`: `heading` = "Help" (the shipped heading), `body` = empty string and the body line renders only when non-empty, `max_items` = 5 (all current FAQs; clamp stays 1–5). All other defaults are unchanged. With defaults the home, help panel, and every page must match Phase 2 exactly.
2. `__configuration` internal field: not accepted as is. Keep using it only to tell `missing_binding` from `type_mismatch`, but wrap it so that if the field is absent, renamed, or not an object, the facade falls back to the reason `error` without throwing, and add a test for that. Note the dependency in docs/STATSIG_INVENTORY.md as a known fragility.
3. Environment tier unset: accepted. Statsig's default tier is recorded as NOT VERIFIED until a live revision.
4. The offers page using the shared Stepper: accepted, provided the default markup is unchanged and the tests or smoke show it.

## Tasks
1. Apply the corrected defaults in code, tests, and docs/STATSIG_INVENTORY.md; update any test that asserted the old values and add one that asserts the shipped copy is the default.
2. Wrap the `__configuration` read as described and add the test.
3. Run `npm run typecheck`, `npm run build`, `npm test` with both keys unset, then repeat the keyboard-only default smoke and one preview smoke on the production build with zero requests to any Statsig or Amplitude host, and confirm in the smoke that the home headline reads "A clearer path to the loan you need" and the help panel shows heading "Help" and 5 FAQs by default.
4. Update docs/evidence/phase-3.md and `PHASE_LOG.md` (supersede the deviation notes), commit, push the same branch, and stop. Do not change Status or start Phase 4. Never print secret values.

## Allowed paths
Same as revision 2.

## Acceptance
Same as revision 2 for P3.1 (offline), P3.2 (fake-client tests), and the offline part of P3.4. Merging PR #15 deploys the site with Statsig in local mode.
=======
Revision: 3 (console entities, live Statsig binding, live verification)
Owner: Planner
Builder ID/link: see PROJECT_PLAN.md (same Builder; resume it)
Repository / authorized branch: theuncoolgirl/els-ampliloan. Continue on `cursor/phase3-statsig-360f` (head `ac18949`), same draft PR #15. Read this handoff from `cursor/planner-phase3-start-360f`. Revisions 2 and 2.1 (git history there) still apply except where this one changes them.

## Activation
Erin Shields, Cursor chat, 2026-11-12 3:00 PM ET ("Start phase 3") and 3:17 PM ET: "Go ahead and create the Statsig entities. Try having the builder create them in the console with the bot login stored in my cursor secrets. And then yes, go ahead, give permission for live Statsig client traffic". START covers revision 3 only.

## Permissions
Builder: Commit Yes; Push Yes (own branch only, never `main`); PR Yes (draft); Merge No; Deploy No.
Planner: Commit Yes; Push Yes (planning branches); PR Yes; Merge No unless Erin posts a named Approve for one PR and head SHA; Deploy No.
Console (Statsig project `AmpliLoan [WHN]`, ID `363sCqDdACZXt4M88ZqiKa`): authorized ONLY to create the entities listed in task 3, as drafts that serve the same values as the code defaults, using the bot login from the environment variables `STATSIG_CONSOLE_BOT_EMAIL` and `STATSIG_CONSOLE_BOT_PASSWORD`. Not authorized: starting, enabling, or activating any experiment (and no experiment is created in this phase); targeting rules, rollouts, or percentages that change any value for any user; creating, viewing, rotating, or copying SDK or API keys; changing project, warehouse, member, role, ID-type-sharing, or metric settings; approving a review request yourself. Telemetry: live Statsig client traffic is authorized with the Cursor secret `VITE_STATSIG_CLIENT_KEY` set. The Amplitude authorization from 2:10 PM ET applies, so `VITE_AMPLITUDE_API_KEY` may also be set for the live runs. Cap: at most 2 live journeys (task 6). No synthetic population, no bulk or looped sending. Slack is retired.

## Credential handling (strict)
Read the bot email and password only from the environment, never print, log, echo, screenshot, or write them to any file, shell history, evidence, PR text, or network capture. Use a throwaway browser profile and delete it afterwards. If the login needs MFA, SSO, a captcha, or an email code you cannot complete, stop console work and record BLOCKED (state only that it could not log in and why in one line); do not try other credentials or other routes. Never use or reveal the Statsig client key value in logs (redact it in captures).

## Objective
Statsig entities exist in the console with types and defaults identical to the code, the app binds to them through the existing facade, live Statsig traffic works for one consented synthetic journey, and every claim is recorded separately as UI, SDK, console, telemetry, or data readiness.

## Fixed decisions
- Names, types, and defaults are exactly those in `docs/STATSIG_PROPOSAL.md` (as corrected at head `7a32f91`): layers `ampliloan_home_layer`, `ampliloan_application_layer`, `ampliloan_offers_layer`, `ampliloan_dashboard_layer`; parameter stores `ampliloan_home`, `ampliloan_application`, `ampliloan_offers`, `ampliloan_dashboard`; gate `ampliloan_contextual_help`; dynamic config `ampliloan_support_content`. Parameters per the table in revision 2 and `src/integrations/pageParameters.ts` (hero_headline "A clearer path to the loan you need", cta_label "Check your rate"; show_reassurance false, progress_style "steps"; show_comparison_hint false; show_next_steps true; support content heading "Help", body empty string, max_items 5).
- Each store parameter maps to the matching layer parameter, with exact type parity. Layers use the Stable ID as their unit (custom ID type `stableID`); if the console requires creating or enabling that ID type first, do so only for this purpose and record it; if the warehouse-native project cannot create layers without a warehouse or unit setting you are not authorized to change, record BLOCKED for that entity and stop there instead of improvising.
- The gate is created with no rule that passes anyone (default false for everyone). The dynamic config serves the default values to everyone. No experiment, rollout, or targeting rule is created anywhere.
- Production environment changes may require review in this project. If a review or approval prompt appears, stop at the pending state and record it; Erin or the Planner will approve. Never approve your own change.
- No Statsig environment tier is set in code. Record from the live initialize payload what environment the SDK reports.

## Numbered tasks
1. Verify the repository and tree without mutation, fetch both branches, continue on your branch. Log, as yes or no only, whether the bot credentials and `VITE_STATSIG_CLIENT_KEY` exist in the environment.
2. Log in to the Statsig console with the bot account in a throwaway profile and open the project by its ID. Record only success or BLOCKED.
3. Create, in this order, and record for each its exact name, type, parameter list with types and defaults, console URL or ID, creation time, and any review state: (a) the four layers; (b) the four parameter stores mapped to those layers; (c) the gate; (d) the dynamic config. Re-open each entity once and confirm it saved with the intended values. Do not create anything else.
4. Pages workflow, narrow change allowed: in `.github/workflows/pages.yml` add only `VITE_STATSIG_CLIENT_KEY: ${{ secrets.VITE_STATSIG_CLIENT_KEY }}` to the existing build-step `env` (next to the two Amplitude entries). No other workflow change. Add the name to docs/SETUP.md. Do not put any value in a file.
5. Code in live mode: run the app with the real client key set and fix only what live mode needs (typings or SDK behavior differences, binding status shown in the presenter, setup-failure logic now that bindings exist). Keep defaults and local mode unchanged. Update `docs/STATSIG_INVENTORY.md` statuses with the real entity IDs and `provisioned` or `blocked`.
6. Live verification, at most 2 journeys on the production build (`npm run preview`) with both client keys set, fresh browser contexts, key values redacted in captures:
   - Run A, one consented synthetic journey: tagged landing (`?utm_source=google&utm_medium=cpc&utm_campaign=spring_rates#/`) → personal loan → typed amount → offers → select → review → save → resume → simulated sign-in → consent → submit → dashboard → open the presenter diagnostics panel and stay 10 s. Capture Statsig and Amplitude requests. Record: the Statsig initialize payload fields (stable ID, user ID, `custom` keys, environment as sent), the values returned for each bound parameter, the gate, and the config (source `statsig` vs fallback), the number and type of exposure events and whether repeated renders of the same parameter add exposures, that opening the diagnostics panel adds zero evaluations or exposures, the Statsig `logEvent` names and flat-string metadata and the Amplitude payload for `Application Submitted` side by side (same `business_event_id`, name, application ID, loan type, stable ID unit, no value field in Statsig, numbers as strings in Statsig and numbers in Amplitude), and that the stable ID did not change at sign-in.
   - Run B, fallback: a fresh context with every Statsig host blocked at the browser level (all other traffic allowed, no Amplitude keys needed). Record that the UI is usable within the 2000 ms bound on defaults, the presenter shows the fallback and reason, and no value from an earlier identity appears after sign-out and sign-in.
   Record device, stable, and session IDs and the UTC window for each run.
7. Write the revision 3 section of docs/evidence/phase-3.md with separate headings for UI, SDK, console, telemetry, and data readiness. Warehouse-native: record that SDK receipt is not the same as results availability and that no warehouse or results check was made. Update `PHASE_LOG.md` (BUILDER.md template). Commit in logical steps, push the same branch, and stop. Do not change Status or start Phase 4. Never print secret values.

## Allowed paths
`src/**` (including tests), `docs/STATSIG_INVENTORY.md`, `docs/SETUP.md`, `docs/evidence/phase-3.md`, `PHASE_LOG.md`, `.env.example` (names only), `.github/workflows/pages.yml` (only the build-step env line in task 4), `package.json`/`package-lock.json` only if a live-mode defect requires it. Exclude `docs/custom-events.yml`, `docs/STATSIG_PROPOSAL.md`, `docs/INTEGRATION_NOTES.md`, every other planning file, and any console action not listed in task 3.

## Acceptance
P3.1 (live binding), P3.2 (documented real-SDK exposure behavior), P3.3 (payload comparison, Planner verifies against Amplitude and the Statsig log stream), and P3.4 (blocked SDK, bounded wait, no cross-identity cache) in PROJECT_PLAN.md. The Planner verifies the console entities through the read-only Statsig MCP. Merging PR #15 deploys the site with live Statsig traffic on for all visitors; the approval request will say so. On missing tools, permissions, or unclear scope, log BLOCKED and stop that part.
>>>>>>> 249c2e5 (Planner: Phase 3 revision 3 handoff (console entities, live Statsig))
