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
