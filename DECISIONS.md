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
- Merge, deploy, and external-service rules are unchanged. Push and draft-PR scope for Phase 0 stays as recorded; Erin never answered the request to narrow it.
- The `@PLANNER` mention token and processed-message log are no longer used.
