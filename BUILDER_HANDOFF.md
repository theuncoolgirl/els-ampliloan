# Builder handoff — Phase 0
Status: IDLE
Phase: 0
Revision: 1
Owner: Planner
Builder ID/link: unset
Repository / authorized branch: unset

## Activation
This is a reviewable first handoff, not a start signal. Erin requested planning. The Planner must first record Erin's implementation instruction, verify repository/branch and available tools, record the actual Builder ID, and issue revision 2 with Status: START. No Git or service permission follows merely from START. Reuse applicable explicit authorization; do not ask again for already covered actions. Missing authorization leaves that action disabled.

## Permissions
Builder: Commit No; Push No; PR No; Merge No; Deploy No.
Planner: Commit No; Push No; PR No; Merge No; Deploy No.
Authorization source: none. External-service actions: none. SDK traffic: none. Population generation: none.

## Objective
Create the static AmpliLoan shell and a reviewable GitHub Pages deployment configuration. No SDK installation or business workflow implementation in this phase.

## Read first
AGENTS.md → BUILDER.md → PROJECT_BRIEF.md → PROJECT_PLAN.md phase 0 → UX.md → this handoff. Consult docs/INTEGRATION_NOTES.md for deployment sources. Preserve existing unrelated code; inspect existing package tooling before selecting compatible pinned versions.

## Numbered tasks (after START)
1. Verify current branch and working tree without mutation. Log actual tools, package manager/Node versions, repository and existing changes. If repo or authorized branch differs, stop and log for Planner.
2. Create a React/TypeScript/Vite static scaffold using npm and a lockfile. Provide dev, build, preview and typecheck scripts. No backend or framework server runtime. Match supported installed package APIs; document actual versions.
3. Build a reusable header, main, footer, typography/color tokens and original restrained animated home hero. Include a prominent Check your rate CTA and concise demo disclaimer. Support reduced motion and visible keyboard focus.
4. Implement hash routes home, apply, offers, dashboard, presenter. Home CTA opens apply. Unimplemented routes show honest scaffold content. Route changes focus the main heading. Presenter is labeled demo controls; no real borrower features or tracking yet.
5. Add unique data-demo anchors home-cta, application-root, offers-root, dashboard-root, presenter-root on their respective surfaces. Add no fake forms or fake completed loans.
6. Prepare base-path-aware production assets and a GitHub Actions Pages workflow. Use the verified repo path for base (root only when actually hosted at root). Document trigger and permissions. Do not enable Pages, dispatch, push or deploy under this handoff's default permissions. Use minimal deployment permissions per official guidance; avoid secrets in configuration.
7. Add .env.example with names only for later AMPLITUDE API key/project region and STATSIG client key/environment, clearly public browser configuration. Never include server/management keys. Document that VITE-prefixed build values are public. No runtime SDK import now.
8. Run npm run typecheck and npm run build. Run the single focused home-to-apply smoke at 390×844 and 1440×900, including keyboard entry and reduced motion. Preview the production build under the configured base; directly load/refresh the hash dashboard URL. Capture textual outcomes; do not run broad screenshots/full browser suite yet.
9. Append evidence for P0.1–P0.3 to docs/evidence/phase-0.md and PHASE_LOG.md. P0.4 is pending approved deployment. Provide diff or saved patch and SHA-256 if Git actions remain unauthorized. Log NEEDS_REVIEW and stop. Do not alter Status or issue yourself the next phase.

## Allowed paths
package.json, package-lock.json, index.html, tsconfig*.json, vite.config.*, src/** for shell only, public/**, .github/workflows/** for Pages only, .gitignore, .env.example, docs/SETUP.md, docs/evidence/phase-0.md, PHASE_LOG.md. Exclude agent specs, brief, plan, handoff, decisions, event map, vendor SDKs and console entities. Existing unrelated files are not a license to rewrite them.

## Acceptance and stop behavior
Use P0.1–P0.4 in PROJECT_PLAN.md verbatim; Builder gathers evidence, Planner verifies. Expected local result is a buildable, navigable shell with zero vendor traffic. A workflow file is not evidence of a deployment. Missing repo/branch/tool access must be logged BLOCKED; continue only independent authorized work. Only Planner communicates blockers to Erin. COMPLETE/BLOCKED/NEEDS_REVIEW revision cannot rerun from stale START. Await a revised handoff through the recorded control channel.
