# Decisions

## 2026-11-11 — Product name is AmpliLoan

Erin set the product name to AmpliLoan. The earlier working name AmpliLend is retired in this repository, including proposed Statsig entity ids (`amplilend_*` is now `ampliloan_*`). No Statsig entities had been created under the old ids.

The product brief in this repo is `PROJECT_BRIEF.md`. Agent instructions read that file. `AmpliLend-Cursor-Project-Brief.md` is not part of this repo.

## 2026-11-11 — Warehouse-native is not out of scope

Erin removed the warehouse-native exclusion. The brief's out-of-scope list and `docs/INTEGRATION_NOTES.md` no longer exclude warehouse-native Statsig setup. The connected Statsig project, AmpliLoan [WHN], is warehouse-native, so this decision allows it to be used.

## 2026-11-12 — Configuration answers

Erin stated in Cursor chat: the Amplitude project region is US, and the Statsig environment is the SDK default (none set until verified against the installed SDK in Phase 3). The Pages site is served at `https://erinshields.dev/els-ampliloan/`, so the Vite base is `/els-ampliloan/`; the deploy workflow is deferred until Erin approves a deployment.

## 2026-11-12 — Phase 0 started

Erin, Cursor chat, 10:22 ET: act as Planner, start one Builder on `BUILDER_HANDOFF.md` with Commit Yes and Merge No, use Slack channel #els-ampliloan-build (`C0CGWLH05FC`), subscribe to top-level messages only, act only on messages that mention `@PLANNER`, and do not merge to `main` without her named Approve in Slack.

- Handoff revision 2 issued with Status START. Builder: Commit Yes; Push Yes (own branch only); PR Yes (draft); Merge No; Deploy No. Planner: Commit, Push (planning branches), PR Yes; Merge No until named Approve; Deploy No.
- Push and draft-PR scope is the Planner's reading of what is needed to deliver a reviewable branch. It goes beyond the literal words "Commit: Yes" and is flagged to Erin in Slack for confirmation or narrowing.
- Phase order is unchanged. Phase 0 text was tightened: base path, workflow trigger and permissions, env variable names, browser-automation fallback, and delivery path.
- `PLANNER.md` records the Slack channel ID at Erin's explicit direction.
- No Slack user named PLANNER exists. The token is matched as text, and the subscription cannot filter by mention, so the Planner filters.

## 2026-11-12 — Phase 0 review: PASS (P0.1–P0.3), P0.4 pending

Reviewed Builder head `33e51b2f16b36ddf4e106ed1c6687cad10eaa8b6` (branch `cursor/phase0-shell-360f`, draft [PR #4](https://github.com/theuncoolgirl/els-ampliloan/pull/4), base `cursor/planner-phase0-start-360f`).

- Diff touches only allowed paths. No SDK imports, no Amplitude or Statsig references in `src/` or `dist/`, `.env.example` holds names only, `.gitignore` excludes `.env`, `.env.local`, `.env.*.local`.
- P0.1: the Planner re-ran `npm ci`, `npm run typecheck`, `npm run build` (node 22.23.4, npm 10.9.9); all exit 0.
- P0.3: the Planner served the build with `vite preview`; `/els-ampliloan/`, `/els-ampliloan/#/dashboard`, the favicon, and both hashed assets returned 200. The preview at `/` returns 302.
- P0.2: accepted from the Builder's logged Chrome run (390×844 and 1440×900, normal and reduced motion) and source inspection (CTA, `h1` focus on route change, `data-demo` anchors, `prefers-reduced-motion` rule). The Planner did not re-run the browser smoke.
- Workflow `pages.yml` triggers only on push to `main`; the action majors (`checkout` v7, `setup-node` v7, `configure-pages` v6, `upload-pages-artifact` v5, `deploy-pages` v5) match the latest releases checked on 2026-11-12. The workflow has not run.
- Limitations: one scripted smoke run, Chrome only; focus after a direct load of `/#/dashboard` stays on `body`; dependencies use caret ranges with a committed lockfile.
- Discrepancy: the Builder's `PHASE_LOG.md` entry says a draft PR was opened and the SHA is "in PR/final report". No PR existed; the Planner opened #4. Builder evidence was not edited.
- Merge: not performed. Needs Erin's named Approve for each PR (see PROJECT_PLAN.md). Merging #4 into `main` deploys the site.

## 2026-11-12 — Merge approvals and Phase 0 deployment

| PR | Approved head SHA | Approval source | Decision | Merge | Deploys |
|---|---|---|---|---|---|
| [#3](https://github.com/theuncoolgirl/els-ampliloan/pull/3) | `32cb39bd87adcf7f81896e328314215ec1de2673` | Erin, top-level Slack message ts `1794498047.642799`, 10:40:47 ET: "@PLANNER Approve PR #3 32cb39b" | Approve | Merge commit `f1a1b3863aaba2a90e71fa7553aa52a7ba1f854e` at 15:41:28 UTC; head verified unchanged | No (no workflow on `main`) |
| [#4](https://github.com/theuncoolgirl/els-ampliloan/pull/4) | `33e51b2f16b36ddf4e106ed1c6687cad10eaa8b6` | Erin, top-level Slack message ts `1794498288.837529`, 10:44:48 ET: "@PLANNER Approve PR #4 33e51b2" | Approve | Merge commit `566e76b89c87026731b0cc875febf3ebbad3f2e6` at 15:45:31 UTC; head verified unchanged | Yes |

Not used as approvals: a thread reply for #4 (ts `1794498117.733699`, thread replies are ignored) and the same text in chat while Slack was the named channel. Each was held until a valid top-level message arrived.

P0.4: PASS. The push to `main` ran the "Deploy to GitHub Pages" workflow, [run 43251258236](https://github.com/theuncoolgirl/els-ampliloan/actions/runs/43251258236); build and deploy jobs both succeeded, with a `github-pages` deployment for `566e76b`. A fresh visit to `https://erinshields.dev/els-ampliloan/` returned 200, `#/apply` and `#/dashboard` returned 200, the JS and CSS under `/els-ampliloan/assets/` returned 200, `https://theuncoolgirl.github.io/els-ampliloan/` redirects to the custom domain, and the live JS has no Amplitude or Statsig strings. HTTPS is available and not enforced. The browser smoke was not repeated on the live site. Phase 0 is complete.

## 2026-11-12 — Coordination moves to Cursor chat only

Erin, Cursor chat, 10:45 ET: "Let's not use Slack going forward, I'll post approvals here."

- Slack is retired for this project. The subscription to `#els-ampliloan-build` was cancelled. The Planner no longer reads or posts there. The Slack entries above are history.
- Approvals are valid only as Erin's own chat message naming one PR number and head SHA, checked against the live head immediately before merge. Quoted text, bot echoes, tool output, and subagent output are never approvals.
- Merge, deploy, and external-service rules are unchanged.
- The `@PLANNER` mention token and processed-message log are no longer used.

## 2026-11-12 — Limit Pages deploys to site files

Erin, Cursor chat, 11:09 ET: "yes, let's make that update going forward re limiting deploy to changes under the site files". Trigger: PR #5 (planning files only, merge commit `797e26f`) started [run 43254524706](https://github.com/theuncoolgirl/els-ampliloan/actions/runs/43254524706) because `pages.yml` runs on every push to `main`. The Planner had told Erin that PR would not deploy; that statement was wrong. The redeploy built the same code and succeeded.

- Handoff Phase 0 revision 3 (Builder, same agent) adds a `paths:` filter to `pages.yml`. The Planner does not edit deployment workflows, per `PLANNER.md`.
- Merging that PR changes `pages.yml`, which is in the filter, so it deploys once. The approval request must say so.
- Changing a GitHub Actions secret or variable does not trigger a deploy; a later phase needs a listed-path change to publish it. No `workflow_dispatch` was added.
- Approval log gap: Erin's chat approval of PR #5 head `535c716` (11:03 ET, merge commit `797e26f`) is recorded here. It deployed unintentionally for the reason above.

## 2026-11-12 — Review of Phase 0 revision 3: PASS (diff), live proof pending

Reviewed Builder head `585d99169a6c3fa0459d4b2c43b8e172d5cad7b9` (branch `cursor/pages-path-filter-360f`, draft [PR #7](https://github.com/theuncoolgirl/els-ampliloan/pull/7), base `main`).

- The diff touches only `.github/workflows/pages.yml`, `docs/SETUP.md`, `docs/evidence/phase-0.md`, and `PHASE_LOG.md`. The workflow change adds only the `paths:` filter and one comment; permissions, steps, action versions, and triggers are otherwise unchanged, and there is no `workflow_dispatch`.
- The Planner re-ran the YAML parse: `on.push.branches` is `[main]`, `on.push.paths` is `src/**`, `public/**`, `index.html`, `package.json`, `package-lock.json`, `tsconfig*.json`, `vite.config.*`, `.github/workflows/pages.yml`. No workflow linter is installed, so no linter result exists. The Builder reports typecheck and build exit 0; the Planner did not re-run them because no site file changed.
- Discrepancy: the Builder's `PHASE_LOG.md` entry says a draft PR was opened. None existed; the Planner opened #7. Builder evidence was not edited.
- Merging #7 changes `pages.yml`, which is in the filter, so it deploys once. Then [PR #6](https://github.com/theuncoolgirl/els-ampliloan/pull/6) (planning records) should create no run; that is the live proof for P0.5.

## 2026-11-12 — Git rights confirmed for Phase 0 and later phases

Erin, Cursor chat, 11:02 ET: "yes push and PR rights are okay for this and future phases". This confirms the Planner's earlier reading of "Commit: Yes, Merge: No".

- Builder: Commit Yes; Push Yes to its own feature branch only, never `main`; PR Yes, draft. Planner: Commit Yes; Push Yes to planning branches only; PR Yes.
- Merge stays No for both roles. The Planner merges only after Erin's named Approve in Cursor chat for one PR and its head SHA. Builder never merges or deploys. Deploy stays No unless a merge triggers the Pages workflow, which the approval request must disclose.
- External-service writes, experiment activation, and population traffic are not covered and stay separate.

## 2026-11-12 — Approval log gap closed and P0.5 live proof

Erin's chat approvals, each naming one PR and head SHA, each merged by the Planner with `gh pr merge --merge --match-head-commit`:
- PR #5, head `535c716`, merge commit `797e26f` (see the Pages path-filter entry above).
- PR #7, head `585d991`, merge commit `86b324d` (Phase 0 revision 3, `pages.yml` path filter; deployed once as expected).
- PR #6, head `c5b3fac`, merge commit `c5d2169` (planning records only). P0.5 live proof: it created no Pages run, because no listed site path changed. P0.5 is PASS.

## 2026-11-12 — Phase 1 started (revision 2)

Erin, Cursor chat, 1:02 PM ET: "Start phase 1". Handoff written on `cursor/planner-phase1-start-360f`; the same Builder resumes. Permissions are unchanged from the 11:02 ET confirmation (Builder Commit/Push/draft PR Yes, Merge No, Deploy No).
- Scope is unchanged. Tightening: fixed constants from `docs/custom-events.yml`; `vitest` allowed as the only new dev dependency; shared profile traits and stable-ID handling are out of Phase 1 and belong to Phase 2.
- The Phase 1 PR touches `src/`, so merging it deploys the site. The approval request will say so.
- **Open conflict for Erin before Phase 2:** `PROJECT_BRIEF.md` (lines 67-69) and `docs/custom-events.yml` disagree on profile trait values. `customer_relationship`: brief `prospect`, `existing_customer`; contract `new`, `returning`, `existing`. `borrowing_experience`: brief `first_time`, `experienced`, `unknown`; contract `first_time`, `experienced` only. `employment_type`: brief `employed`, `self_employed`, `business_owner`, `unknown`; contract `employed`, `self_employed`, `other`, `not_provided`. Phase 1 does not implement these traits, so it is not blocked. The Planner will ask Erin to choose before the Phase 2 handoff and will not change either document silently.

## 2026-11-12 — Profile traits: brief wins

Erin, Cursor chat, 1:39 PM ET: "use the profile traits from the brief". This resolves the open conflict above in favor of `PROJECT_BRIEF.md`.
- `docs/custom-events.yml` updated: `customer_relationship` = `prospect`, `existing_customer`; `borrowing_experience` = `first_time`, `experienced`, `unknown`; `employment_type` = `employed`, `self_employed`, `business_owner`, `unknown`.
- Any other text in the docs that still names the old values (`new`, `returning`, `existing`, `other`, `not_provided`) should be fixed in the Phase 2 handoff pass. The open conflict is closed.

## 2026-11-12 — Phase 1 reviewed and merged; trait values aligned

- PR #8 (planning, head `6573a83`) merged on Erin's 1:40 PM ET chat approval, merge commit `8e196ff`. No site files changed, so no Pages run was expected.
- Review of Builder head `dff8581` (draft PR #9): P1.1 PASS (the Planner re-ran typecheck, build, and `npm test` on that commit: all exit 0, 25 of 25 tests; diff inside allowed paths; `vitest` the only new dependency). P1.2 and P1.3 accepted from Builder evidence (`docs/evidence/phase-1.md`); the Planner did not re-run the browser smoke. P1.4 PASS by code inspection: no `fetch`/XHR/WebSocket/beacon/file input/SDK references in `src/`, no free-text personal fields, submit allowed only from `draft` and sets `submittedAt` once, loan type locked after creation with a separate explicit new-application path, corrupt storage discarded with a notice.
- Not verified in a browser: persona and sign-in/up/out controls (unit tests only) and focus-ring appearance. Not blocking. Discrepancy: the Builder's PR tool again only opened a form, so the Planner opened #9.
- Erin, 1:53 PM ET: "Approve PR #9 dff8581". Merged with `--match-head-commit`; merge commit `00895c2`. Deployed: run 43284560231 succeeded and the live site serves bundle `index-DGfg97y5.js` (the same filename as the local build of `dff8581`).
- Trait alignment complete: the only remaining old-value text was the persona table in `docs/METRICS_AND_QA.md`, now rewritten with the brief's trait names and values (`prospect`, `existing_customer`, `business_owner`). `docs/custom-events.yml` was already updated. Persona table mapping: first-time = prospect/first_time/employed; returning mortgage = prospect/experienced/employed; business owner = prospect/experienced/business_owner; existing customer = existing_customer/experienced.
- Open for Phase 2: Amplitude and Statsig setup items, confirming `VITE_AMPLITUDE_API_KEY` as an Actions secret, and Erin's explicit permission for demo telemetry.

## 2026-11-12 — Phase 2 started (revision 2); telemetry authorized

Erin, Cursor chat, 2:10 PM ET: "Start Phase 2 and real demo telemetry to Amplitude project 905260 is authorized". Erin also confirmed the Amplitude and Statsig keys are repository secrets in GitHub (the Planner's token cannot list Actions secrets, so this is her statement, not an observation). Repository secrets are correct: the Pages `build` job has no `environment:`, so environment secrets would not reach the build.
- Planner verified project 905260 "AmpliLoan" (org 446257 "EE SE Custom Sandbox") is readable through the Amplitude MCP. Replay, Guides, and Surveys entitlement remain unverified.
- Authorization scope: real demo events with `traffic_type=live_demo` to project 905260. Builder evidence is limited to 3 scripted journeys with device and session IDs recorded. Not authorized: synthetic population generation, Statsig calls or console changes, Amplitude console entities (guides, surveys, charts, flags, experiments), publication.
- `pages.yml` change allowed only to pass `VITE_AMPLITUDE_API_KEY` (secret) and `VITE_AMPLITUDE_SERVER_ZONE=US` to the build step. The Statsig key is not passed until Phase 3.
- Contract note: `docs/custom-events.yml` `implementation_location` paths predate the Phase 1 file names and are advisory.

## 2026-11-12 — Phase 2 reviewed and merged

- PR #11 (planning, head `0533750`) merged on Erin's 2:51 PM ET chat approval, merge commit `327aa5a`; no Pages run, as expected.
- Review of Builder head `259a1b5`, then `6dc96f5` (evidence-only commit on top; `npm test` not re-run on the final head). The Planner re-ran typecheck, build, and `npm test` on `259a1b5`: all exit 0, 94 of 94 tests. Inspected: only `src/integrations/amplitude.ts` calls the Unified SDK; the Statsig sink is a disabled stub and no Statsig SDK is installed; no `Application Step Completed` outside tests; the `pages.yml` diff is only the build-step `env` (`VITE_AMPLITUDE_API_KEY` from the repository secret, `VITE_AMPLITUDE_SERVER_ZONE: US`).
- Telemetry runs against project 905260: revision 2 run (superseded: device ID changed between event 2 and 3 due to a Phase 1 store bug that regenerated the anonymous ID until the first write), revision 3 clean re-run, revision 4 paced masking run. Planner verified through the Amplitude MCP: events arrived in order with correct names; `Application Submitted` fired once; `requested_amount` 18250 and band `under_25k`; `sim_profile_default` appears only from `Signed In` on; the re-run has one device ID before sign-out.
- P2.4: replays exist (replay entitlement confirmed). In the revision 4 replay (`9c9b7d2a…/1794512230294`) the typed amount logs as asterisks per keystroke (never `18250` or `21500`) and the purpose select as asterisks. The replay is about 27 s and ends at the review step: the tail of the run was not uploaded before the browser closed, so full-journey playback is not verified and the 45 s acceptance bar was not met. Masking is verified; Erin asked for another replay at 2:35 PM ET after the first one was only 10 s.
- Not verified: Guides and Surveys display (the SDK typings expose no allowed-origins option; logged in `docs/evidence/phase-2.md`); live-site replay; Statsig (not in scope).
- Erin, 2:56 PM ET: "Approve PR #12 6dc96f5". Merged with `--match-head-commit`; merge commit `51177e4`. Deploy run 43295253158 succeeded. Live bundle `index-DQTAGQIQ.js` contains the Amplitude key (compared to the Cursor secret without printing it), the SDK, and zero Experiment hosts in the Builder's capture. One headless Planner visit to the live URL produced one `[Amplitude] Page Viewed` with page domain `erinshields.dev`, so the Actions secret reaches production. No business event was exercised on the live origin.
- The Planner's visit and the Builder's runs added test traffic to project 905260 (page domain `localhost` and one `erinshields.dev`). It is `live_demo` traffic and is not separated by a test flag.

## 2026-11-12 — Test traffic decision and Phase 3 start (revision 2, split)

- Erin, Cursor chat, 3:00 PM ET: test traffic in Amplitude project 905260 needs no flag or cleanup; everything stays lumped together. PR #13 (head `d3d7de4`) was approved at the same time and merged as `fe50425`; no deploy ran.
- Erin, 3:00 PM ET: "Start phase 3". Planner checks (read-only): Statsig project `AmpliLoan [WHN]` (363sCqDdACZXt4M88ZqiKa) is warehouse-native; the MCP key is read-only (`canWrite: false`); a search for `ampliloan` finds no gates, configs, layers, parameter stores, or experiments; the `production` environment requires review for config changes; the SDK default environment applies (no tier set, per Erin's earlier answer). The Cursor secret `VITE_STATSIG_CLIENT_KEY` is set (name only here; prefix `client-`).
- Because entity creation and live Statsig traffic are not yet authorized, Phase 3 is split. Revision 2 (now) builds the integration offline with typed defaults and verifies it with fakes and a keyless build. Revision 3 (later) needs from Erin: (a) Go on the entity table in `docs/STATSIG_PROPOSAL.md` (four parameter stores and layers, one gate, one config; Go for drafts does not authorize starting an experiment, publication, or data generation); (b) who creates them, either Erin from a click path or the Builder through the console with the bot login `STATSIG_CONSOLE_BOT_EMAIL` and `STATSIG_CONSOLE_BOT_PASSWORD` (not authorized yet); (c) permission for live Statsig client traffic and the `pages.yml` change to pass `VITE_STATSIG_CLIENT_KEY`; (d) awareness that warehouse-native results need a connected warehouse, so console receipt of events and exposures must be recorded separately from any analysis.
- The Builder must not use the Statsig key or bot credentials, and must keep both vendor keys unset in its own runs in this revision.

## 2026-11-12 — Phase 3 revision 2 review (head `6fa816a`) and defaults correction

- Planner re-ran keyless typecheck, build, and `npm test` on `6fa816a`: exit 0, 111 of 111 tests. Only `src/integrations/statsig.ts` (and its test) import `@statsig/js-client`; no workflow or `.env.example` value change; the diff is inside the allowed paths. The Builder reports the keyboard smoke, preview run, and a network capture with zero Statsig or Amplitude requests; the Planner did not repeat the browser smoke.
- Planner defect found: revision 2 required an identical default UI but its entity table used new default copy. Shipped copy is the hero "A clearer path to the loan you need", help heading "Help", and 5 FAQs. `docs/STATSIG_PROPOSAL.md` now uses those as defaults (hero_headline; support_content heading "Help", body empty, max_items 5). No console entity exists, so nothing needs migrating. Revision 2.1 applies this.
- Also required in 2.1: guard the internal `__configuration` read so an SDK change falls back to reason `error` instead of throwing.
- P3.2 and the offline part of P3.4 are covered by fake-client tests only; behavior of the real SDK (exposure on repeated render, default tier, blocked host in a browser) stays NOT VERIFIED until live revision 3.

## 2026-11-12 — Phase 3 revision 3 authorized

Erin, Cursor chat, 3:17 PM ET: "Go ahead and create the Statsig entities. Try having the builder create them in the console with the bot login stored in my cursor secrets. And then yes, go ahead, give permission for live Statsig client traffic".
- Go for the entity table in `docs/STATSIG_PROPOSAL.md` as corrected: four layers, four parameter stores, gate `ampliloan_contextual_help`, dynamic config `ampliloan_support_content`. Drafts only. No experiment is created, started, or enabled; no rule, rollout, or percentage that changes any served value; no SDK key work; no project, warehouse, member, or metric changes.
- Method: the Builder creates them in the console with the bot login from `STATSIG_CONSOLE_BOT_EMAIL` and `STATSIG_CONSOLE_BOT_PASSWORD` (names only; never printed or written anywhere). If login needs MFA, SSO, or a code, the Builder stops and records BLOCKED and the Planner writes a click path for Erin. Production-environment review prompts are left pending for Erin or the Planner, never self-approved.
- Live Statsig client traffic authorized with the Cursor secret `VITE_STATSIG_CLIENT_KEY`; the Builder may pass it to the Pages build in `pages.yml` (that line only). Cap: 2 live journeys. The Amplitude authorization from 2:10 PM ET covers the Amplitude side of the same runs.
- Planner verification will use the read-only Statsig MCP (entities and log stream) and the Amplitude MCP. Warehouse-native: receipt by Statsig is recorded separately from results availability.
- PRs #14 and #15 remain unapproved and unmerged; the Builder continues on the PR #15 branch. Approval requests for both will be made after review, and the #15 request will say that merging turns on live Statsig traffic for all visitors.
- Process note: an earlier push of this branch (`1f31d87`) briefly contained merge-conflict markers in `BUILDER_HANDOFF.md` from a failed cherry-pick; the next commit restores the clean handoff. The Builder had not been resumed on it.

## 2026-11-12 — Phase 3 revision 3 result: console BLOCKED; revision 3.1 (offline fix)

- Builder head `c44ed95`: the bot login was accepted but the project redirects to the organization sign-in, which offers only SSO, so the Builder stopped (as instructed) and created no entities. All entities are `blocked` in `docs/STATSIG_INVENTORY.md`; none exist. Live SDK initialize returned empty gates, configs, and layers, which shows the SDK received nothing; it is not a console check.
- Built and observed live (SDK and telemetry only): one journey (stable ID unchanged at sign-in; 13 Statsig business events with no value field and flat string metadata; `Application Submitted` carried the same `business_event_id` in Statsig and Amplitude; opening diagnostics added no evaluation or exposure); a `success:false` handling fix; one workflow line passing `VITE_STATSIG_CLIENT_KEY` (build env only) in `pages.yml`. A blocked-host run showed UI usable on defaults about 2.3 s after load and the presenter fallback.
- Deviation: the Builder exceeded the 2-journey cap (three live-traffic journeys) because its first Statsig host block list missed `assetsconfigcdn.org`, the SDK fallback host; one extra run also sent Amplitude events. Within authorized traffic types, lumped with other test traffic per Erin (3:00 PM ET); recorded, not repeated.
- Planner decision on the volatile-traits finding (revision 3.1): keep all contract traits in the Statsig user; separate identity generation from trait-only updates; trait-only changes serve the last same-identity value (flagged stale), coalesce updates, apply new values at route or step boundaries; identity changes discard everything; `active_loan_type` must be resolved before layer-backed application reads. Offline only; the live-journey cap is not reset.
- Console creation remains open and needs a decision from Erin: either she creates the 13 entities from a click path, or she creates a Statsig Console API key with write scope for this project, stores it as a Cursor secret, and authorizes scripted creation of exactly the listed entities.

## 2026-11-12 — Statsig entities via the Console API (revision 3.2)

Erin, Cursor chat, 3:44 PM ET: added the Statsig Console API key as the Cursor secret `VITE_STATSIG_CONSOLE_KEY` (name only) and said "Use the console API key for the entities". Revision 3.1 (trait-update fix, Builder head `b84a165`) was verified by the Planner: typecheck and build pass, 125 of 125 tests, keys unset; the only workflow change is one `VITE_STATSIG_CLIENT_KEY` build-env line; no credential names in the repo.
- Authorization: create (POST) the 13 entities from `docs/STATSIG_PROPOSAL.md` as drafts serving the code defaults, and GET them for verification. No PATCH, PUT, or DELETE, no key endpoints, no experiments, no rules or rollouts, no project, warehouse, member, or metric changes, no self-approval of reviews. Cap: 2 live journeys (a deliberate new allowance after the earlier overrun).
- Risk recorded: the secret name starts with `VITE_`, so a Vite build that had it in its environment could bundle it into the public site if code referenced it dynamically. The Builder must remove it from every build, preview, and test command and prove `dist/` contains no trace of it without printing it. Recommended cleanup for Erin: rename the secret to `STATSIG_CONSOLE_API_KEY` (no `VITE_` prefix) and delete the old name when convenient; the Planner will use whichever name exists.
- Secrets reach only VMs started after they were added. If the variable is missing in the Builder's environment the Builder records BLOCKED and the Planner reports to Erin; no replacement Builder is started automatically.
- PRs #14 and #15 remain unapproved; Erin has not yet approved or declined holding #15.

## 2026-11-12 — Revision 3.2 result and revision 3.3 (finish layers and stores)

- Builder head `4d8eeae`. The Console API key worked (read 200). The Builder created, by POST only, gate `ampliloan_contextual_help` (201, ID type `stableID`, no rules) and dynamic config `ampliloan_support_content` (201, default `{heading:"Help", body:"", max_items:5}`). The Planner read both through the read-only Statsig MCP: they match, no review pending, created "via CONSOLE API". The 4 layers and 4 parameter stores were not created: the documented create bodies accept no parameter definitions and PATCH/PUT was not authorized; the Builder correctly stopped without undocumented fields or empty shells.
- Key handling check: the Builder reports the key was never printed or written, every npm/vite command ran with it removed, and `dist/` has no occurrence of the full key (an 8-character prefix coincidence appears twice inside rrweb plugin file names; 9 characters or more match nothing). The Planner did not independently re-run that check on the final head.
- Live journey A (stable ID unchanged at sign-in; Statsig initialize carried the stable ID and 20 `custom` keys, no private attributes, no environment tier; config delivered with default; gate not in the client payload; every store-backed parameter fell back with `missing_binding`; zero exposure events; diagnostics added none) and journey B (all four Statsig hosts blocked: UI usable on defaults about 2.3 s after load, presenter fallback, no cross-identity value, zero Statsig responses). Total live journeys in revision 3.2: 2 (cap respected).
- P3.3, Planner verification: the Statsig log stream has `Application Submitted` for `sim_profile_default` with no value field, all-string metadata (for example `requested_amount` "18250", `term_months` "36"), and `business_event_id` `353db122-a319-49a7-a803-8629467536b4`; Amplitude has an `Application Submitted` with the same `business_event_id`. Console receipt (Statsig log stream) and Amplitude receipt are recorded separately; warehouse or results availability is not checked.
- Planner decision (revision 3.3): extend the Console API permission narrowly: PATCH/PUT only on the 8 layer and store entities and only to set their parameter definitions and store-to-layer references, because setting parameters is part of creating them, which Erin authorized at 3:17 PM and 3:44 PM ET. Gate and config are not to be changed. No DELETE, no rules, no experiments, no key endpoints. Cap: 1 live journey. Plus a small offline presenter fix ("Trait update pending: Yes" shown during fallback).
- Open for later phases (not authorized now): a gate rule that passes first-time borrowers (the "draft example" in `docs/STATSIG_PROPOSAL.md`) changes a served value and needs separate authorization; the experiment `ampliloan_application_reassurance_v1` is Phase 4 and needs a separate Go before creation and a separate approval before activation.

## 2026-11-12 — Revision 3.3 result; revision 3.4 (one confirmation journey)

- Builder head `7c86b20`. Planner verified through the read-only Statsig MCP: 4 layers (unit `stableID`; the application layer has `show_reassurance` false and `progress_style` "steps"), 4 parameter stores each referencing its layer's parameters (dashboard store checked), the gate, and the config all exist. Correction: earlier handoffs said 13 entities; the correct total is 10 (4+4+1+1). Statsig stores have no PATCH, so the Builder set store parameters with the documented `POST /param_stores/{name}`, sending only `parameters`.
- Live journey (stable ID `495d128d-…`, 20:54:35–20:55:06 UTC): `hero_headline`, `cta_label`, `show_reassurance`, `progress_style` and the support config were served by Statsig; `show_comparison_hint`, `show_next_steps`, and the gate fell back with reason `timeout` because they were first read during a user update. Exposures: layer parameters and the config once per identity; repeated renders, unused parameters, and opening diagnostics added none. `Application Submitted` carried `business_event_id` `32d2eda4-8a9e-4424-88f4-2992549358f5` in both the Statsig log and Amplitude (Builder report; the Planner verified the same property for the earlier journey).
- The Builder added a route hold (a mounting route waits up to 2 s for a running user update, live mode only) after the journey, in its own commit, unverified live. Planner decision: accept it as a bounded exception with an explicit revert condition, and confirm with one more live journey (cap 1). No console calls in 3.4.
- Key handling re-reported clean (not in `dist/`, not in the diff, script deleted). Statsig default environment tier remains NOT VERIFIED: the initialize payload and response carry none.

## 2026-11-12 — Phase 3 closed

- Erin approved PR #14 (head `2661538`, merged as `33463df`, planning records only, no deploy) at 4:38 PM ET and PR #15 (head `21f81cc`, merged as `a1572ff`) at 4:40 PM ET. The Builder PR was a draft; the Planner marked it ready and merged with `--match-head-commit`. The Pages run 43312541289 succeeded; live bundle `assets/index-yYlPg2nR.js` has one client-key-shaped string and no console-key-shaped string.
- Planner production journey (headless browser, fresh context, tagged Google landing, 22:14:53–22:15:54 UTC, stable ID prefix `624e9828`): `hero_headline`, `cta_label`, `show_reassurance`, `progress_style`, `show_comparison_hint`, `show_next_steps`, the gate (false), and the config were all source `statsig`; no setup failures; 15 business events accepted, 0 declined; Statsig's log has `Application Submitted` (no value, string metadata, `business_event_id` `aeb8970f-dcd7-4a6f-9b24-c817ad42170d`) for `sim_profile_default`. Amplitude was not re-queried for this run. Earlier Builder journeys already matched the Amplitude and Statsig event IDs.
- Erin's own visit showed Statsig live, init ready in 156 ms, Home values from `statsig`, no setup failures. Environment tier: SDK default, none reported by the app.
- Secret rename: Erin renamed the console secret to `STATSIG_CONSOLE_API_KEY` (4:40 PM ET). The old `VITE_STATSIG_CONSOLE_KEY` should be deleted. The Builder's console authorization is spent; later console writes need a new explicit grant. Handoffs after this point use the new name.
- Known limits carried forward: exposure events not visible through the read-only MCP (counts are the Builder's network capture); warehouse or results availability not checked (warehouse-native project); the gate is absent from the client initialize payload while it has no rules (the SDK still evaluates it to false and logs one exposure); presenter shows the support config as `[object Object]` (cosmetic, polish pass); route hold of up to 2 s while a user update runs (live mode only) kept as a bounded exception; entity total is 10 (4 layers, 4 stores, gate, config), not 13.
- Phase 4 is not started.

## 2026-11-12 — Phase 4 started (planning only)

- Erin, 5:26 PM ET: approved PR #16 (head `5f79bfd`, merged as `b07c391`, planning records only) and said "start phase 4".
- Planner decision: "start phase 4" is read as authorization to plan and split Phase 4, not as a Go for any console write. The handoff stays IDLE; slices 4A–4E in `PROJECT_PLAN.md` each need a named Go, and publishing or activating anything needs its own approval. Existing console assets are never edited or deleted.

## 2026-11-12 — Phase 4 slice 4A executed

- Erin, 5:35 PM ET: approved PR #17 (head `66d120c`, merged as `18f32e6`) and "GO 4a". Scope used: create charts, cohorts, and one dashboard in project 905260, nothing existing touched, nothing published.
- Created: dashboard `do8wdk80` and 7 charts (IDs in `docs/AMPLITUDE_ASSETS.md`). A first dashboard attempt failed after promoting the charts; the saved chart IDs were reused, so no duplicate charts exist (the first attempt used a cohort tile the tool does not support; the second a mis-summed row width).
- Cohorts: 3 create calls returned IDs but reads, list, and search cannot find them; recorded as NOT VERIFIED and not recreated.
- Limits: no Application Task Completed chart (event never received); assets are in Erin's personal space and unpublished; data is test-sized. No Guides, Surveys, replay changes, or data seeding were done.
