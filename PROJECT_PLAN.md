# AmpliLoan — phase plan
Revision 1 · Prepared 2026-11-11 · Implementation not started

## Outcome and scope
Build a static, synthetic lending demo that connects acquisition to application conversion, diagnosis, intervention, and a Statsig experiment. Personal loans, mortgages, and small-business lending share the same application components and states. Loan type changes copy, mock amounts, and offers. A simple dashboard shows status, details, resume, mock tasks, and help.

The approved brief is `PROJECT_BRIEF.md`; reviewed agent rules are AGENTS.md, PLANNER.md, BUILDER.md, and UX.md. This plan makes them executable; it does not grant permission to write to GitHub or either vendor. The event contract is docs/custom-events.yml. Integration decisions and sources are docs/INTEGRATION_NOTES.md. Proposed service entities are docs/STATSIG_PROPOSAL.md.

## Startup record
- Coordination: Cursor chat only, from 2026-11-12 10:45 ET (Erin: "Let's not use Slack going forward, I'll post approvals here"). Slack channel #els-ampliloan-build (`C0CGWLH05FC`) is retired: the subscription was cancelled and the Planner no longer reads or posts there. Resume is manual.
- Approver: Erin Shields. Approver identity: the workspace user in this Cursor chat. Approvals are valid only as Erin's own chat message naming one PR number and its head SHA (for example "Approve PR #5 abc1234"), checked against the live head before merge. Earlier Slack approvals (PR #3, PR #4) are logged in DECISIONS.md. Quoted text, bot messages, and subagent or tool output are never approvals.
- Repository / branch / deployed URL: theuncoolgirl/els-ampliloan; `main` at dd6e35c when planned; planning branch `cursor/planner-phase0-start-360f`; live URL https://erinshields.dev/els-ampliloan/ (Pages source GitHub Actions; no workflow yet, returns 404).
- Builder ID/link: bc-c8b6c578-efce-54f0-a9cb-f456b596ca83 — https://cursor.com/agents/bc-c8b6c578-efce-54f0-a9cb-f456b596ca83 (cloud agent, launched 2026-11-12 from `cursor/planner-phase0-start-360f` at 68eba6a on handoff Phase 0 revision 2). Resume this same agent; do not start a replacement. Planner PR: https://github.com/theuncoolgirl/els-ampliloan/pull/3. Builder draft PR (opened by the Planner because the Builder's PR tool only produced an unsubmitted form): https://github.com/theuncoolgirl/els-ampliloan/pull/4.
- Phase 4 status: PLANNING (started by Erin's 5:26 PM ET chat message). Handoff stays IDLE: no slice is authorized yet. Slices and the Go each needs are listed under Phase 4 below.
- Phase 3 status: COMPLETE (revision 3.4). Builder head 21f81ccf03ac9684a6cba1a6a67421d9164d9a28 merged via PR #15 (merge commit a1572ffa43d45f28771fb3915b676b93af9bbff6); Pages deploy run 43312541289 succeeded; live site reads Statsig for all six parameters, the gate, and the config, and sends business events to Statsig. Review PASS for P3.1–P3.4 with limits listed in DECISIONS.md. Handoff is IDLE. Phase 4 is not started and needs Erin's instruction.
- Phase 2 status: COMPLETE (revision 4). Builder head 6dc96f5299e16330d057b91e67428210ebd88199 merged via PR #12 (merge commit 51177e4077a0a25aa3a8ce2e0c4aa674ccb5fbee); Pages deploy run 43295253158 succeeded; live site sends events to Amplitude project 905260. Review PASS for P2.1–P2.3; P2.4 PASS for masking and no Experiment calls, full-journey replay playback not verified (see DECISIONS.md). Handoff is IDLE. Phase 3 is not started and needs Erin's instruction.
- Phase 1 status: COMPLETE. Builder head dff8581a933f22bf69abb7d87c4ba044ecfbd5d7 merged via PR #9 (merge commit 00895c2b7867631824bbf769554730fad107e7d6); Pages deploy run 43284560231 succeeded. Review PASS for P1.1–P1.4 (see DECISIONS.md). Handoff is IDLE. Phase 2 is not started and needs Erin's instruction.
- Phase 0 status: COMPLETE. Builder head 33e51b2f16b36ddf4e106ed1c6687cad10eaa8b6 merged via PR #4 (merge commit 566e76b89c87026731b0cc875febf3ebbad3f2e6). Review PASS for P0.1–P0.3 and P0.4 PASS (see DECISIONS.md). Handoff is IDLE. Phase 1 is not started and needs Erin's instruction. Revision 3 (Pages path filter) is reviewed PASS at Builder head 585d99169a6c3fa0459d4b2c43b8e172d5cad7b9 (draft PR #7); live proof pending approved merges.
- Capabilities checked 2026-11-12: GitHub MCP reads work and merge through it is denied (403), the `gh` CLI can merge; Amplitude MCP reads; Statsig MCP is read-only; Slack MCP reads and posts; cloud subagent launch via Cursor Task. Browser QA automation: unverified; the Builder logs what is installed.
- Amplitude organization: EE sandbox 446257; project AmpliLoan 905260; region US (Erin, 2026-11-12). API key is the Cursor secret `VITE_AMPLITUDE_API_KEY`. Replay and engagement entitlement unverified; project timezone blank.
- Statsig project: AmpliLoan [WHN] 363sCqDdACZXt4M88ZqiKa (warehouse-native; allowed by DECISIONS.md). Client key is the Cursor secret `VITE_STATSIG_CLIENT_KEY`; the Console API key is the Cursor secret `STATSIG_CONSOLE_API_KEY` (renamed 2026-11-12; never given a `VITE_` prefix). Environment: SDK default (Erin, 2026-11-12); verify against the installed SDK in P3. The MCP connection cannot write.
- Desired readiness: before Thanksgiving, November 26, 2026. Proposed checkpoints: P0 Nov 12; P1 Nov 16; P2 Nov 18; P3 Nov 20; P4 Nov 23; P5 Nov 24; Nov 25 buffer. These are planning targets, not historical confirmations of Becca's deadline or scheduled work.

## Permissions — applies separately to every phase
| Role | Commit | Push | PR | Merge | Deploy |
|---|---|---|---|---|---|
| Builder (Phase 0 and later) | Yes | Yes, own feature branch only | Yes, draft | No | No |
| Planner (Phase 0 and later) | Yes | Yes, planning branches only | Yes | No, until named Approve | No |
Authorization source: Erin, Cursor chat, 2026-11-12 10:22 ET ("Commit: Yes, Merge: No"; no merge to `main` without her named Approve), and 11:02 ET ("yes push and PR rights are okay for this and future phases"), which confirms Push to feature branches and PRs for Phase 0 and all later phases. This does not cover Merge, Deploy, external-service writes, experiment activation, or population traffic; those stay separate and default to No. Each later handoff cites this entry as its source. Named Approve: during Phase 0 this was a top-level Slack message from Erin; since 2026-11-12 10:45 ET it is Erin's own Cursor chat message naming one PR number and head SHA. Revise the applicable handoff with the actual source of any permission; do not infer it from this plan. Builder never merges or deploys. Existing scoped authorization may be reused; no repetitive approval requests.

External categories are separate: local implementation; draft entity creation; publication/experiment activation; population traffic. Each defaults to none. A local simulator is not a remote SDK success. Planner review PASS is not human merge approval. Record exact PR/head SHA and whether the approved merge also deploys. If no Git rights, review the saved patch + SHA-256; a live criterion remains pending.

## Evidence and checks
Builder implements and records evidence; Planner verifies it and accepts/rejects. Each ordinary phase runs `npm run typecheck`, `npm run build`, and its one focused smoke below. Add only the named targeted correctness checks. Save concise results in PHASE_LOG.md and detailed evidence in docs/evidence/phase-N.md. Future commands are requirements for Builder to implement, not claims they exist or passed today. No full suite/screenshots until P5.

Shared UI acceptance, applied to the changed surface in each focused smoke: 390×844 and 1440×900; no horizontal overflow; Tab/Shift+Tab/Enter/Space can complete that surface with visible focus; reduced-motion preference removes nonessential animated movement. Stable `data-demo` attributes are unique per rendered page. Hash routes under the verified Pages base support direct load and refresh; route list is below. Record observed results, not merely a checklist.

## Phase 0 · revision 2 · static scaffold and Pages path
**Objective:** an accessible application shell that builds and can be served from GitHub Pages. Depends on repo/branch/capability discovery and implementation instruction.
**Allowed:** package/lock/config files, index.html, src shell, public assets, .github/workflows Pages workflow, .gitignore, .env.example, docs/SETUP.md, docs/evidence/phase-0.md, PHASE_LOG.md. Exclude SDKs, real credentials, loan state logic, console entities, and other planning files.
**Steps:** follow BUILDER_HANDOFF.md. React + TypeScript + Vite; npm lockfile; hash routing for static refresh safety. Routes `/`, `/apply`, `/offers`, `/dashboard`, `/presenter` rendered as `/#/...` under the base `/els-ampliloan/`. Home Check your rate enters `/apply`; other surfaces explicitly say demo scaffold until implemented. Original visual shell and reduced-motion hero; no borrowed assets. The Pages workflow triggers only on push to `main`.
**Risks:** wrong repository base, unavailable Pages permission, hidden workflow deployment (merging the workflow to `main` deploys; disclose it in the approval request), speculative package APIs, no browser automation available for the smoke (log BLOCKED).
| ID | Verifier / steps | Expected result / evidence |
|---|---|---|
| P0.1 | Builder runs typecheck + production build; Planner reads exits | Both exit 0; resolved tool versions and lockfile in phase-0 evidence |
| P0.2 | Builder runs focused home → apply smoke with shared UI checks; Planner inspects log | CTA navigates, keyboard focus moves to route heading, reduced motion respected, unique home-cta/application-root anchors; no SDK network traffic |
| P0.3 | Builder previews production build at configured base and directly loads/refreshed hash dashboard URL | Assets and shell render without 404; route/base URLs and console results recorded |
| P0.4 | Planner after separately approved merge/deploy observes Actions and fresh live home/apply visit | Real deployment run + URL recorded, fresh visit works. Pending until authorized; local P0.1–3 can pass without this |

**Phase 0 · revision 3 · limit Pages deploys to site files** (maintenance follow-up; Phase 0 stays complete, Phase 1 not started). Erin, 11:09 ET: stop docs-only merges from redeploying. Builder adds a `paths:` filter to `pages.yml` (`src/**`, `public/**`, `index.html`, `package.json`, `package-lock.json`, `tsconfig*.json`, `vite.config.*`, and the workflow file itself), documents it in docs/SETUP.md, and logs evidence. Allowed: `.github/workflows/pages.yml`, `docs/SETUP.md`, `docs/evidence/phase-0.md`, `PHASE_LOG.md`. The Planner does not edit deployment workflows.
| ID | Verifier / steps | Expected result / evidence |
|---|---|---|
| P0.5 | Builder validates the workflow and runs typecheck and build; Planner inspects the diff; after Erin's approved merge the Planner merges one docs-only change | Diff touches only the four allowed paths and only adds the `paths:` filter and a comment; YAML parses with `on.push.branches=[main]` and the listed paths; typecheck and build exit 0. Live: merging the workflow PR creates exactly one run, and a later docs-only merge creates none. Live part pending approved merges |

## Phase 1 · revision 2 · shared journey and dashboard
**Objective:** functional synthetic borrower experience. Phase 0 is complete; Erin started Phase 1 at 1:02 PM ET on 2026-11-12. Revision 2 tightens revision 1 without changing scope: it fixes step IDs, offer IDs, amount bands, task IDs, and persona IDs to the `docs/custom-events.yml` constants, defers the shared profile traits to Phase 2, and permits `vitest` for state tests. Details are in BUILDER_HANDOFF.md.
**Allowed:** `src/**` including tests, `package.json`/`package-lock.json` (only `vitest` and a `test` script), `vite.config.ts` (test config only), `docs/evidence/phase-1.md`, `docs/SETUP.md`, `PHASE_LOG.md`. Exclude vendor SDKs, tracking map changes, `.github/**`, `.env.example`.
**Steps:** one state machine: type → details → offers → review → submitted; dashboard draft/submitted/under_review/decision_ready. Use mock amount bands/offers, review validation, local save/resume, simulated sign-in, and mock document-task toggles. Dashboard statuses advance only through labeled presenter scenarios. No real loan eligibility or file upload. Reserve instrumentation call sites/guide anchors; no invented completion events.
**Risks:** three diverging flows, accidental real financial inputs, double submission, fixture loss after reload.
| ID | Verifier / steps | Expected result / evidence |
|---|---|---|
| P1.1 | Builder typecheck/build; Planner reviews | Exit 0 and bounded diff |
| P1.2 | Builder focused personal-loan application → save/reload/resume → submit → dashboard smoke on the production build at 390×844 and 1440×900, keyboard only, shared UI checks | Same application ID survives reload; valid submission advances once; status/details/task/help controls work; application-step/offers-root/submit-application/dashboard-status/help-entry anchors stable |
| P1.3 | Builder targeted state-machine checks (`npm test`) for all 3 loan fixtures, rapid double-submit, amount-band boundaries, and corrupt-storage recovery | One shared state graph; valid fixtures complete; one transition and one submission record per ID; invalid review cannot submit |
| P1.4 | Planner inspects fixture/persistence and changed code | Synthetic-only fields; clear reset controls; no remote auth/upload/credit requests; loan type locked after application creation, changing it requires explicit new application |

## Phase 2 · revision 2 · Amplitude and shared telemetry
**Objective:** real analytics, identity, marketing context, replay, engagement readiness. P1 is complete; Amplitude project 905260 (org 446257, US) was verified readable by the Planner on 2026-11-12 and Erin authorized real demo telemetry at 2:10 PM ET. Revision 2 adds: reuse of the Phase 1 anonymous ID as the stable ID, a fixed attribution allowlist, at most 3 evidence journeys against the real project, a small presenter diagnostics panel, and a narrow `pages.yml` build-env change for `VITE_AMPLITUDE_API_KEY`. Details are in BUILDER_HANDOFF.md.
**Allowed:** src/integrations, src/telemetry, src/identity, src/presenter, mapped call sites in state/pages/components, package/lock (only `@amplitude/unified`), .env.example, `.github/workflows/pages.yml` (build-step env only), targeted telemetry tests, docs/SETUP.md, docs/evidence/phase-2.md, PHASE_LOG.md. No Statsig console changes or Amplitude Experiment calls.
**Steps:** implement YAML contract; single Unified initializer; identity before events; bounded attribution; typed properties; replay with synthetic input masking; anchor readiness for Guides/Surveys. Statsig sink is explicitly disabled until P3, not silently mocked as delivered.
**Risks:** duplicate initialization/page capture, wrong identity, unmasked inputs, ambiguous delivery vs queue acceptance, project entitlement absent.
| ID | Verifier / steps | Expected result / evidence |
|---|---|---|
| P2.1 | Builder typecheck/build; Planner reviews | Exit 0; one Unified entry point, no standalone duplicate browser SDK initialization |
| P2.2 | Builder focused tagged landing → anonymous start → mock sign-in → submission; Planner verifies payload evidence | First-touch survives login/reload, current session attribution documented, shared profile updated before business event; Amplitude project receives named events with correct IDs/types |
| P2.3 | Builder targeted event/identity tests | All 17 names validate; submission transition produces one event; no Step Completed; missing IDs/invalid enum rejected; signed-out/new user cannot inherit known identity |
| P2.4 | Planner reviews one actual replay plus SDK network inspection | Synthetic journey playback available and fields masked; no Amplitude Experiment fetch/evaluation activity. Entitlement/delivery unavailable = BLOCKED, not pass |

## Phase 3 · revision 2 · Statsig technical implementation (split)
**Objective:** gated/configured/parameterized UI with correct assignment and outcomes. Revision 2 (started by Erin at 3:00 PM ET on 2026-11-12; follow-up 2.1 corrects defaults to the shipped copy) is code only: typed defaults, no live Statsig traffic, no console changes, no key in the build. A later revision 3 covers live binding and outcome verification and needs Erin's Go on the entity table in docs/STATSIG_PROPOSAL.md (and a choice of who creates the entities, since the Statsig MCP is read-only) plus her explicit permission for live Statsig client traffic. Details are in BUILDER_HANDOFF.md.
**Allowed:** src/integrations/statsig, src/telemetry Statsig adapter, page parameter bindings, presenter diagnostics, package/lock (only `@statsig/js-client`), `.env.example` (name only), targeted exposure tests, docs/STATSIG_INVENTORY.md, docs/SETUP.md, docs/evidence/phase-3.md, PHASE_LOG.md. Revision 3 may also allow the `pages.yml` build-step env for `VITE_STATSIG_CLIENT_KEY`. Console actions only enumerated in activated handoff; no experiment starts.
**Steps:** verify installed client APIs; one client; shared stable ID; await profile updates; per-page lazy parameters; standalone support gate/config; typed fallbacks; separate preview overrides. Create approved store/layer/gate/config drafts only if actually authorized; record exact IDs and environment.
**Risks:** exposure caused by hidden reads/diagnostics, changed assignment on login, stale profile async race, absent parameter bindings, confusing overrides with randomized evidence.
| ID | Verifier / steps | Expected result / evidence |
|---|---|---|
| P3.1 | Builder typecheck/build and focused live-config application smoke; Planner verifies | Typed defaults render; real evaluated values visible only with actual verified bindings; no experiment activation |
| P3.2 | Builder targeted identity/exposure tests | Stable unit unchanged on login; profile changes awaited; stale async response ignored; opening diagnostics adds zero evaluations; unused page parameter adds zero exposure; repeated render behavior documented from actual SDK |
| P3.3 | Planner compares one consented synthetic submission across vendor payloads | Same event ID/name/application/loan/unit; Amp typed values vs Statsig string metadata; numeric Statsig value correctly mapped; console receipt recorded separately |
| P3.4 | Builder simulates blocked SDK and invalid/missing parameters; Planner reviews | UI usable with defaults, bounded initialization wait, visibly fallback in presenter; no cached value for a different identity; preview sends neither business outcomes nor exposure calls |

## Phase 4 · revision 1 · console assets and demo scenarios
**Objective:** demonstrate attribution → conversion friction → targeted assistance → Statsig experiment configuration. Depends on P2/P3 and individually authorized console drafts/publication/activation/data actions.
**Allowed:** console assets listed in revised handoff; docs/DEMO_SCRIPT.md, docs/CONSOLE_SETUP.md, bounded fixture runner if separately authorized, docs/evidence/phase-4.md, PHASE_LOG.md. No implicit production changes.
**Steps:** create acquisition/funnel/segmentation/retention views; replay links; draft anchored help guide, friction survey, dashboard resource center. Configure Statsig exposure-unit metrics and one application-layer experiment in draft. Prepare 4 synthetic personas and separate preview/live-demo/population modes. Treat heatmaps as conditional until enabled with sufficient real browser capture.
**Risks:** permissions/entitlements, cohort latency, survey changes during a test, fabricated significance, synthetic traffic contaminating a live demo.
| ID | Verifier / steps | Expected result / evidence |
|---|---|---|
| P4.1 | Builder typecheck/build if code changed; otherwise record N/A; Planner reviews concrete entity inventory | IDs/URLs/project/state of every created asset; no undocumented publications or starts |
| P4.2 | Planner verifies funnel and metric definitions against docs/METRICS_AND_QA.md | Same outcome, unit, exposure/eligibility, window/timezone and traffic filter recorded; no claim dashboards must numerically match without reconciliation |
| P4.3 | Builder focused targeted-guide/survey scenario if publication authorized; Planner verifies | Correct synthetic persona sees anchored content; excluded persona does not; response visible remotely. Draft preview alone labeled draft, publication criterion pending |
| P4.4 | Planner inspects proposed experiment and bounded data-run recipe before activation | Variant values, unit, target, allocation, metrics, stop/rollback, max users/events and environment stated; separate Erin approval recorded before activation/traffic; no significance claims from scripted data |

### Phase 4 split (Planner, 2026-11-12)
Each slice needs Erin's explicit Go in chat naming the slice; nothing is created, published, or activated without it. Console assets get the name prefix `AmpliLoan` and are never edited or deleted if they already exist under another name.
| Slice | Content | Who | Go needed for | Not included |
|---|---|---|---|---|
| 4A (created 2026-11-12; see docs/AMPLITUDE_ASSETS.md; cohorts unverified) | Amplitude analysis assets in project 905260: acquisition by channel/campaign and loan type; funnel Rate Check Started → Offers Viewed → Offer Selected → Application Submitted (constant `application_id`); save/resume and help-usage views; cohorts (started not submitted, viewed offers not selected, returned to a saved application); one dashboard | Planner via Amplitude MCP | Creating charts, cohorts, one dashboard | Guides, Surveys, replay config changes, data seeding |
| 4B | Engagement drafts: first-time-borrower guide, dashboard welcome, resume guide, hesitation survey, post-submission survey, Resource Center | Planner checks availability first; drafts only | Creating drafts; publishing is a separate Go per experience | Publishing; any claim of delivery before a remote-visible check |
| 4C (gate rule done 2026-11-12; experiment and metrics BLOCKED on a warehouse connection) | Statsig metrics, gate targeting rule for first-time borrowers, and the draft experiment `ampliloan_application_reassurance_v1` | Builder or Planner with `STATSIG_CONSOLE_API_KEY` | New Console API grant naming each write; separate approval before the experiment is started | Starting the experiment; any significance claim |
| 4D | `docs/DEMO_SCRIPT.md`, `docs/CONSOLE_SETUP.md`, asset inventory | Builder (docs only) | Handoff after 4A–4C land | Product code |
| 4E | Bounded synthetic persona runner and any seeded data | Builder | Separate Go with caps and labels | Anything presented as organic data |
Recommended order: 4A, then 4C drafts, then 4D, then 4B; 4E only if Erin wants volume for the demo.

## Phase 5 · revision 1 · final verification and handoff
**Objective:** prove readiness and document exact limitations. Depends on P0–P4 required live criteria and approved demo configuration; blocked optional heatmaps may remain explicit limitation, core replay/engagement/Statsig cannot silently be waived.
**Allowed:** focused repairs to implemented paths, final tests, docs/evidence/phase-5.md, docs/DEMO_SCRIPT.md, docs/SETUP.md, PHASE_LOG.md. Each service action still needs recorded authority.
**Risks:** local success mistaken for live, consented traffic mixing with previews, reset/multi-tab races, remote configuration drift.
| ID | Verifier / steps | Expected result / evidence |
|---|---|---|
| P5.1 | Builder runs typecheck/build + full matrix in docs/METRICS_AND_QA.md; Planner reviews each actual result | Every required row PASS with evidence or explicit FAIL/BLOCKED; real screenshots allowed here for synthetic UI only |
| P5.2 | Planner inspects deployed build/SDK versions/config inventory and exact reviewed head | Live URL and run recorded; no management secrets or unused Amp Experiment activity; each readiness area separately marked |
| P5.3 | Planner performs demo script from fresh identity | Complete business narrative and technical source walkthrough; links to charts/replay/configs; distinguish assigned vs preview and scripted vs observed data |
| P5.4 | Planner presents final limitations and operating instructions to Erin | Reset/run/stop/reconfigure instructions, asset owner/project, current experiment state, known blockers and rollback path; no unfinished must-show labeled complete |
