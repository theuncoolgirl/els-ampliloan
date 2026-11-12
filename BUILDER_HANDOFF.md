# Builder handoff — Phase 0
Status: START
Phase: 0
Revision: 2
Owner: Planner
Builder ID/link: recorded by the Planner in PROJECT_PLAN.md after launch (kept out of this file so a running Builder is never disturbed by a link edit)
Repository / authorized branch: theuncoolgirl/els-ampliloan. Start from branch `cursor/planner-phase0-start-360f` (it carries this handoff; `main` still holds revision 1). Work on your own branch `cursor/<short-name>-360f`. Never commit to `main`.

## Activation
Erin Shields instructed the Planner in Cursor chat on 2026-11-12 10:22 ET to start one Builder on this handoff with Commit Yes and Merge No, and not to merge to `main` without her named Approve in Slack. Planner verified the repository, tools, and Slack channel and recorded them in PROJECT_PLAN.md. START covers Phase 0 revision 2 only. When you log COMPLETE, BLOCKED, or NEEDS_REVIEW, this revision cannot run again.

## Permissions
Builder: Commit Yes; Push Yes (your own feature branch only, never `main`); PR Yes (draft only; base is `cursor/planner-phase0-start-360f` until that branch merges); Merge No; Deploy No.
Planner: Commit Yes; Push Yes (planning branches only); PR Yes; Merge No unless Erin posts a named Approve (below); Deploy No.
Authorization source: Erin, Cursor chat, 2026-11-12 10:22 ET, "Commit: Yes, Merge: No" and "Do not merge to main without my named Approve in Slack." Push and draft-PR scope is the Planner's minimal reading needed to deliver a reviewable branch; Erin can narrow it in Slack. If a permission you need is missing, stop that action and log BLOCKED.
Named Approve: a top-level message in #els-ampliloan-build from Slack user U07RNCNMAP6 that mentions `@PLANNER` and names one PR number and head SHA. It applies to that PR and SHA only.
External-service actions: none. SDK traffic: none. Population generation: none. Slack: Planner only; the Builder never messages Slack or Erin.

## Objective
Create the static AmpliLoan shell and a reviewable GitHub Pages deployment configuration. No SDK installation or business workflow implementation in this phase.

## Read first
AGENTS.md → BUILDER.md → PROJECT_BRIEF.md → PROJECT_PLAN.md phase 0 → UX.md → this handoff. Consult docs/INTEGRATION_NOTES.md for deployment sources. Preserve existing unrelated files; the repository currently holds planning documents only, so there is no prior package tooling.

## Fixed facts
- Site URL: https://erinshields.dev/els-ampliloan/ (custom domain with a repository subpath). Vite `base` is `/els-ampliloan/`. Pages source is already GitHub Actions; no workflow exists yet.
- Product name: AmpliLoan. Amplitude region: US. Statsig environment: SDK default; do not set one in Phase 0.
- Browser-safe values exist as Cursor secrets named `VITE_AMPLITUDE_API_KEY` and `VITE_STATSIG_CLIENT_KEY`. Do not read, print, log, or commit their values. Phase 0 uses neither.

## Numbered tasks
1. Verify current branch and working tree without mutation. Log node, npm and OS versions, the repository, existing changes, and whether browser automation (for example Playwright) is installed. If the repository or branch differs from the above, stop and log BLOCKED.
2. Create a React/TypeScript/Vite static scaffold using npm and a committed lockfile. Provide `dev`, `build`, `preview`, and `typecheck` scripts. No backend or server runtime. Record the exact resolved versions of every direct dependency in the evidence file.
3. Build a reusable header, main, footer, typography/color tokens, and an original restrained animated home hero. Include a prominent "Check your rate" CTA visible on first screen at 390×844 and 1440×900, and this disclaimer: "Demo with synthetic data. No real loans, rates, or credit checks." Support reduced motion and visible keyboard focus. No borrowed assets.
4. Implement hash routes `/#/`, `/#/apply`, `/#/offers`, `/#/dashboard`, `/#/presenter`. The home CTA opens apply. Unimplemented routes say they are demo scaffold. Each route change moves focus to the page's `h1`. The presenter route is labeled demo controls. No real borrower features and no tracking.
5. Add unique `data-demo` anchors: `home-cta`, `application-root`, `offers-root`, `dashboard-root`, `presenter-root`, each only on its own surface. Add no fake forms and no fake completed loans.
6. Set Vite `base` to `/els-ampliloan/` and make all asset and route references base-aware. Add `.github/workflows/pages.yml`: trigger only on `push` to `main` (no `workflow_dispatch`, no pull-request trigger); permissions `contents: read`, `pages: write`, `id-token: write`; build with `npm ci` and `npm run build`; deploy with GitHub's official Pages actions at current major versions checked against official docs; no secrets. Document trigger and permissions in docs/SETUP.md. Do not enable Pages, dispatch, or deploy. Merging this workflow to `main` will trigger a deploy, which the Planner discloses in the approval request.
7. Add `.env.example` with names only: `VITE_AMPLITUDE_API_KEY`, `VITE_AMPLITUDE_SERVER_ZONE` (value `US`), `VITE_STATSIG_CLIENT_KEY`, `VITE_STATSIG_ENVIRONMENT` (left empty, meaning SDK default). Mark them public browser configuration; VITE-prefixed build values are public. Update `.gitignore` so `.env`, `.env.local`, and `.env.*.local` are ignored while `.env.example` is tracked. Never include server or management keys. No runtime SDK import.
8. Run `npm run typecheck` and `npm run build`. Run one focused home-to-apply smoke at 390×844 and 1440×900 covering keyboard entry (Tab to the CTA, Enter), focus on the apply `h1`, and reduced motion. Serve the production build with `npm run preview` under `/els-ampliloan/`, then load and refresh `/els-ampliloan/#/dashboard` directly. Record textual outcomes and console errors. If no browser automation is available, record the smoke as BLOCKED instead of substituting another check. No broad screenshots or full suite.
9. Append evidence for P0.1–P0.3 to docs/evidence/phase-0.md and PHASE_LOG.md using the BUILDER.md template. P0.4 stays pending approved deployment. Commit in logical steps, push your branch, and open a draft PR with base `cursor/planner-phase0-start-360f`. Log NEEDS_REVIEW with the branch and head SHA, then stop. Do not change Status or issue yourself the next phase.

## Allowed paths
package.json, package-lock.json, index.html, tsconfig*.json, vite.config.*, src/** for shell only, public/**, .github/workflows/pages.yml, .gitignore, .env.example, docs/SETUP.md, docs/evidence/phase-0.md, PHASE_LOG.md. Exclude agent specs, `PROJECT_BRIEF.md`, the plan, handoff, decisions, event map, vendor SDKs and console entities. Existing unrelated files are not a license to rewrite them.

## Acceptance and stop behavior
Use P0.1–P0.4 in PROJECT_PLAN.md verbatim; Builder gathers evidence, Planner verifies. Expected local result is a buildable, navigable shell with zero vendor traffic. A workflow file is not evidence of a deployment. Missing repo, branch, tool, or permission must be logged BLOCKED; continue only independent authorized work. Only the Planner communicates blockers to Erin. A COMPLETE, BLOCKED, or NEEDS_REVIEW revision cannot rerun from a stale START. Await a revised handoff.
