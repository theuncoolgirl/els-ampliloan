# Builder handoff — Phase 0 follow-up
Status: IDLE
Phase: 0
Revision: 3 (closed; reviewed)
Review: PASS for the revision 3 diff against Builder head 585d99169a6c3fa0459d4b2c43b8e172d5cad7b9 (branch `cursor/pages-path-filter-360f`, draft PR #7). The live part of P0.5 stays pending until Erin approves the merges. Details in DECISIONS.md.
Owner: Planner
Builder ID/link: see PROJECT_PLAN.md (same Builder as revision 2; resume it, do not replace it)
Repository / authorized branch: theuncoolgirl/els-ampliloan. Read this handoff from branch `cursor/planner-pages-filter-360f` (`git fetch origin cursor/planner-pages-filter-360f`). Create your own branch `cursor/pages-path-filter-360f` from `origin/main`. Never commit to `main`.

## Activation
Erin Shields, Cursor chat, 2026-11-12 11:09 ET: limit the Pages deploy to changes under the site files, going forward. Revision 2 is closed and cannot rerun; this revision is a small, separately scoped follow-up. START covers revision 3 only. Phase order is unchanged and Phase 1 has not started.

## Permissions
Builder: Commit Yes; Push Yes (your own feature branch only, never `main`); PR Yes (draft only, base `main`); Merge No; Deploy No.
Planner: Commit Yes; Push Yes (planning branches only); PR Yes; Merge No unless Erin posts a named Approve in Cursor chat for one PR and head SHA; Deploy No.
Authorization source: Erin, Cursor chat, 2026-11-12 10:22 ET, 11:02 ET (push and PR rights for this and future phases), and 11:09 ET (this change). Recorded in DECISIONS.md. External-service actions: none. SDK traffic: none. Slack is retired; do not message Slack or Erin.

## Objective
Stop docs-only and planning-only merges to `main` from redeploying the site, without changing what the workflow builds or deploys. The cause: `.github/workflows/pages.yml` triggers on every push to `main`, so PR #5 (four planning files) redeployed an unchanged build.

## Read first
AGENTS.md → BUILDER.md → PROJECT_BRIEF.md → this handoff → `.github/workflows/pages.yml` → docs/SETUP.md.

## Numbered tasks
1. Verify the repository and working tree without mutation. Fetch `origin/main` and the planning branch. Create `cursor/pages-path-filter-360f` from `origin/main`. Log node and npm versions and whether a workflow linter (for example `actionlint`) is installed.
2. In `.github/workflows/pages.yml`, add a `paths:` filter under `on.push` next to `branches: [main]`. The list is exactly: `src/**`, `public/**`, `index.html`, `package.json`, `package-lock.json`, `tsconfig*.json`, `vite.config.*`, `.github/workflows/pages.yml`. Do not add `workflow_dispatch`, a pull-request trigger, secrets, or any other change. Keep permissions, concurrency, job steps, and action versions as they are. Add one short comment above the filter saying that docs and planning files do not redeploy.
3. Validate without deploying. Run a workflow linter if one is installed; otherwise parse the file as YAML and confirm `on.push.branches` is `[main]` and `on.push.paths` matches the list above. Run `npm run typecheck` and `npm run build`; both must still exit 0. Do not run or dispatch the workflow.
4. Update the "Pages workflow" section of docs/SETUP.md: the trigger is a push to `main` that changes one of the listed paths; docs, planning files, `.env.example`, and `PHASE_LOG.md` do not redeploy; changing a GitHub Actions secret or variable does not trigger a deploy, so a later phase needs a listed-path change to publish it.
5. Append a "Revision 3" section to docs/evidence/phase-0.md and a NEEDS_REVIEW entry to PHASE_LOG.md using the BUILDER.md template. Record what you ran and the results, not expectations.
6. Commit in logical steps, push your branch, open a draft PR with base `main`, log the head SHA, and stop. Do not change Status or start Phase 1.

## Allowed paths
`.github/workflows/pages.yml`, `docs/SETUP.md`, `docs/evidence/phase-0.md`, `PHASE_LOG.md`. Exclude every site file, agent spec, `PROJECT_BRIEF.md`, the plan, this handoff, decisions, `docs/` files other than those named, vendor SDKs, and console entities.

## Acceptance
P0.5 in PROJECT_PLAN.md. Builder gathers evidence; Planner verifies. Merging this PR changes `pages.yml`, which is in the filter, so it deploys exactly once; the approval request will say so. The live proof that a docs-only merge no longer deploys is the Planner's, after the approved merge, and stays pending until then. A COMPLETE, BLOCKED, or NEEDS_REVIEW revision cannot rerun from a stale START.
