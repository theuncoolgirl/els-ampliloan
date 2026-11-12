# Builder handoff — Phase 1
Status: START
Phase: 1
Revision: 2
Owner: Planner
Builder ID/link: see PROJECT_PLAN.md (same Builder as Phase 0; resume it, do not replace it)
Repository / authorized branch: theuncoolgirl/els-ampliloan. Read this handoff from branch `cursor/planner-phase1-start-360f` (`git fetch origin cursor/planner-phase1-start-360f`). Create your own branch `cursor/phase1-journey-360f` from `origin/main`. Never commit to `main`.

## Activation
Erin Shields, Cursor chat, 2026-11-12 1:02 PM ET: "Start phase 1". Phase 0 is complete and deployed. START covers Phase 1 revision 2 only. When you log COMPLETE, BLOCKED, or NEEDS_REVIEW, this revision cannot run again.

## Permissions
Builder: Commit Yes; Push Yes (your own feature branch only, never `main`); PR Yes (draft only, base `main`); Merge No; Deploy No.
Planner: Commit Yes; Push Yes (planning branches only); PR Yes; Merge No unless Erin posts a named Approve in Cursor chat for one PR and head SHA; Deploy No.
Authorization source: Erin, Cursor chat, 2026-11-12 10:22 ET, 11:02 ET (push and PR rights for this and future phases), and 1:02 PM ET (start Phase 1). Recorded in DECISIONS.md. External-service actions: none. SDK traffic: none. Population generation: none. Slack is retired; do not message Slack or Erin.

## Objective
A functional, fully synthetic borrower experience on one shared journey for `personal`, `mortgage`, and `small_business`: loan type → details → offers → review and submit → dashboard, with local save and resume, simulated sign-in, mock offers, mock next-step tasks, a help panel, and presenter fixtures. No vendor SDK, no network request, no instrumentation, no shared profile.

## Read first
AGENTS.md → BUILDER.md → PROJECT_BRIEF.md (sections 2, 3, 7) → PROJECT_PLAN.md Phase 1 → UX.md → docs/custom-events.yml (only the `properties` section, to reuse its constants) → this handoff. The existing shell is in `src/`; extend it, keep the five hash routes, header, and tokens.

## Fixed constants (use these exact values so Phase 2 needs no renaming)
- Loan types: `personal`, `mortgage`, `small_business`.
- Status: `draft` → `submitted` → `under_review` → `decision_ready`. Forward only.
- Step IDs and one-based indexes: `loan_details`=1, `offers`=2, `review`=3. Choosing a loan type happens before step 1 and is not a step.
- Validation error codes (internal constants only, never shown as raw codes and never sent anywhere): `required_field`, `invalid_amount`, `missing_offer`, `missing_consent`.
- Amount bands for `requested_amount` (USD): `under_25k` (below 25,000), `25k_to_under_100k` (25,000 up to below 100,000), `100k_to_under_500k` (100,000 up to below 500,000), `500k_plus` (500,000 and above).
- Task IDs: `verify_details`, `review_documents`, `confirm_next_steps`. Help topics: `application`, `offers`, `status`, `general`.
- Persona IDs: `first_time_personal`, `returning_mortgage`, `business_owner`, `existing_customer`.
- Offer IDs (allowlisted fixtures): personal `personal_standard_36`, `personal_low_payment_60`, `personal_fast_24`; mortgage `mortgage_30yr_fixed`, `mortgage_15yr_fixed`, `mortgage_7_1_arm`; small business `small_business_term_24`, `small_business_term_48`, `small_business_term_60`.
- Mock amounts: personal 1,000–50,000 (default 15,000); mortgage 100,000–1,000,000 (default 350,000); small business 5,000–500,000 (default 75,000).

## Numbered tasks
1. Verify the repository and tree without mutation. Fetch `origin/main` and the planning branch, create your branch from `origin/main`, log node and npm versions and the browser automation you will use. Stop with BLOCKED if the repo or branch differs.
2. State module `src/state/` (pure TypeScript, no React inside the transition logic):
   - An application record: opaque `applicationId` (`crypto.randomUUID()`), `loanType`, `status`, `createdAt` and `updatedAt` (ISO), `submittedAt` (set once), details (`requestedAmount`, `purposeId` from a per-loan-type list), `selectedOfferId`, `lastStepId`, `tasks` (map of task ID to boolean). No names, emails, addresses, income, SSN, bank, or free text anywhere.
   - One active application per owner plus a list of the owner's earlier submitted applications. An owner is a synthetic profile (`profileId`) or the anonymous browser (`anonymousId`, a persisted UUID).
   - Actions, the only way UI changes state: create application (locks `loanType`), save draft, resume, select offer, submit, advance status (presenter only), complete task, reset application, start as new demo user, simulated sign-in, sign-up, sign-out. Page components call only these actions. This is the seam Phase 2 will hook; add no event names and no placeholder tracking code.
   - `submit` is idempotent: valid review on `draft` moves to `submitted` once and sets `submittedAt`; any later call returns an "already submitted" result and changes nothing. Persist the new state before the UI shows the confirmation. Before writing, re-read storage so two tabs cannot both submit.
   - `loanType` cannot change after creation. Choosing a different type later requires an explicit "Start a new application" confirmation that creates a new `applicationId`.
   - "Reset current application" creates a new `applicationId` for the same owner. "Start as a new demo user" clears all AmpliLoan storage keys and creates a new `anonymousId`. They are separate controls.
   - Sign-out switches to a fresh anonymous owner with a new `anonymousId` and no active application. Sign-in loads that profile's stored applications.
   - Persistence in `localStorage` under one key `ampliloan.v1` with a `schemaVersion`. Corrupt or unknown-version data is discarded with a visible, dismissible notice, never a crash.
3. Apply page `/#/apply`:
   - Loan type chooser first: three labelled options in one radio group. Continue creates the draft application and shows step 1. With an existing draft, show "Resume your application" first, and start nothing automatically.
   - Step container per step with `data-demo="application-step"` and `data-step-id`; `data-demo="application-root"` stays on the page section. Progress indicator "Step N of 3" with `aria-current="step"`, plus Back and Next. Step 1 `loan_details` collects `requestedAmount` (number input with range hint) and `purposeId` (select). Show the amount band as helper text. Offers is step 2 on `/#/offers`; review is step 3 back on `/#/apply`.
   - Validation: block Next on failure, show an error summary that receives focus plus inline messages linked with `aria-describedby`. Literal messages: "Enter an amount between $X and $Y." (`invalid_amount`), "Choose a purpose." (`required_field`), "Choose an offer to continue." (`missing_offer`), "Confirm to submit." (`missing_consent`).
   - Per loan type provide distinct headline, helper text, and purpose lists (for example personal: debt consolidation, home improvement, major purchase; mortgage: purchase, refinance; small business: equipment, working capital, expansion) in one fixtures file. Same components for all three.
4. Offers page `/#/offers`: `data-demo="offers-root"`. Three comparable offer cards per loan type from fixtures with term (months), illustrative APR, and estimated monthly payment computed from the requested amount by standard amortization, rounded to cents. Banner on the page: "Illustrative offers from sample data. Not an approval, rate quote, or commitment." Select-an-offer control per card (radio semantics), selection persists. Direct visit with no draft shows an empty state "Start your application first" linking to apply. Continue goes to review.
5. Review and submit on `/#/apply` step 3: read-only summary with Edit links back to steps 1 and 2, a consent checkbox "I understand this is a demo with synthetic data.", and a Submit button `data-demo="submit-application"` that becomes disabled with `aria-busy` while submitting. Confirmation shows a short application reference (last 8 characters of the ID), the status, and a link to the dashboard.
6. Dashboard `/#/dashboard` (`data-demo="dashboard-root"`):
   - Main application card with status badge `data-demo="dashboard-status"` and the next action by status: `draft` → Resume your application; `submitted` → status timeline and View details; `under_review` → timeline and tasks; `decision_ready` → "Sample result: an illustrative offer is ready to review" (never wording that implies real approval or funding). Collapsible loan details (type, amount, band, selected offer, term, illustrative payment).
   - Mock tasks for `submitted` and `under_review`: `verify_details`, `review_documents` as toggles with simulated completion ("Simulated, no files are uploaded"). `confirm_next_steps` appears only at `decision_ready`. No file input anywhere.
   - No application: empty state with a Check your rate link. Earlier submitted applications listed read-only.
   - Persistent help control `data-demo="help-entry"` in the header opens a help panel (disclosure or dialog with focus management and Escape to close) with five glossary terms, five application FAQs, and the four topics. Static local content, clearly not Amplitude's Resource Center.
7. Presenter `/#/presenter` (`data-demo="presenter-root"`), labeled "Demo controls. Not part of the borrower experience.": select one of the four persona fixtures with fixed IDs and deterministic content: `first_time_personal` (no application), `returning_mortgage` (saved mortgage draft at the offers step), `business_owner` (no application, small business preselected as intent), `existing_customer` (personal application at `under_review`). Controls: advance status one step with the label "Simulated status change. No underwriting backend.", reset current application, start as a new demo user (with confirmation), simulated sign-in, sign-up, sign-out, and a plain read-only summary of current owner, application ID, status, and step. No event inspector and no configuration display yet. Selecting a persona never reads or sets traffic or experiment values.
8. Tests: add `vitest` as the only new dependency (dev) with a `test` script (`vitest run`), config only in `vite.config.ts`. Unit tests for the state module covering: the full flow to `submitted` for each of the three loan types through the same transition graph; rapid double submit yields one transition and one `submittedAt`; invalid review cannot submit and returns the right code; loan type lock and explicit new-application path; status moves forward only; amount-band boundaries (24,999.99, 25,000, 99,999.99, 100,000, 499,999.99, 500,000); corrupt storage recovery; two owners cannot see each other's applications; reset application keeps the owner, new-user reset clears it.
9. Run `npm run typecheck`, `npm run build`, `npm test`. Then one focused smoke on the production build via `npm run preview` under `/els-ampliloan/` at 390×844 and 1440×900, with reduced motion at least once: fresh start → choose personal → details → offers → select → review → save → reload → resume → submit → dashboard, using the keyboard only (Tab, Shift+Tab, Enter, Space) with visible focus. Record: same `applicationId` before and after reload, submit once, no horizontal overflow, each `data-demo` anchor appears exactly once per page, no console errors, no requests to non-localhost hosts, direct load and refresh of `/#/dashboard` with and without saved state. If browser automation is unavailable, record the smoke as BLOCKED; do not substitute another check.
10. Write docs/evidence/phase-1.md and a `PHASE_LOG.md` entry (BUILDER.md template) with commands and observed results. Add a short "Tests" line to docs/SETUP.md. Commit in logical steps, push, open a draft PR with base `main`, log the head SHA, and stop. Do not change Status or start Phase 2.

## Allowed paths
`src/**` (including `*.test.ts`), `package.json`, `package-lock.json` (only for `vitest` and the `test` script), `vite.config.ts` (only for the test config), `tsconfig.json` (only if needed for test types), `docs/evidence/phase-1.md`, `docs/SETUP.md`, `PHASE_LOG.md`. Exclude `.github/**`, `.env.example`, vendor SDKs, `docs/custom-events.yml` and every other planning file, console entities.

## Acceptance
Use P1.1–P1.4 in PROJECT_PLAN.md verbatim; the Builder gathers evidence and the Planner verifies. Expected result: a buildable app with zero vendor traffic and no instrumentation. Merging this PR changes `src/`, so it deploys the site; the approval request will say so. A COMPLETE, BLOCKED, or NEEDS_REVIEW revision cannot rerun from a stale START. On missing tools, permissions, or unclear scope, log BLOCKED and stop that part.
