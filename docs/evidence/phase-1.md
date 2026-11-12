# Phase 1 evidence (revision 2)

## Environment
node v22.23.4, npm 10.9.9, Linux x86_64. Branch `cursor/phase1-journey-360f` from `origin/main`. Browser automation: `playwright-core` installed outside the repo (`/tmp/pw`) driving system Google Chrome 157.0.8103.50. New repo dependency: `vitest` 5.1.0 (dev) only.

## P1.1 PASS
`npm run typecheck` exit 0; `npm run build` exit 0; `npm test` exit 0. Diff is `src/**`, `package.json`, `package-lock.json`, `vite.config.ts` (test config), `docs/SETUP.md`, this file, `PHASE_LOG.md`.

## P1.3 PASS
`npm test`: 1 file, 25 tests passed. Covers: all three loan types to `submitted` and on to `decision_ready` through the same functions; sequential double submit gives one transition and one `submittedAt`; two store instances on shared storage (two tabs) cannot both submit; invalid review returns `invalid_amount`, `required_field`, `missing_offer`, `missing_consent` in order and stays draft; cross-type offer rejected; loan type lock and explicit `startNewApplication`; status forward-only, no advance from draft, stops at final; task gating; band boundaries 24,999.99, 25,000, 99,999.99, 100,000, 499,999.99, 500,000; three corrupt-storage cases with dismissible notice; reload keeps `applicationId`; two owners isolated; reset application keeps owner, new-user reset clears it; deterministic personas.
Note: `submit` is synchronous and re-reads storage first, so "rapid double submit" is tested as two consecutive calls; the UI also disables the button with `aria-busy` while submitting.

## P1.2 PASS
Production build served by `npm run preview` at `http://localhost:4173/els-ampliloan/`. One scripted Chrome run each at 390x844, 1440x900, and 390x844 with `prefers-reduced-motion: reduce`. Keyboard only (Tab, Enter, Space, ArrowDown on the purpose select):
home -> Tab to "Check your rate", Enter -> chooser (focus on `h1` "Check your rate"); Continue with no choice shows a focused error summary "Choose a loan type."; Space on radio, Continue -> details (focus on `h1`); Next without purpose shows focused summary "Choose a purpose."; select purpose, Next -> offers; Continue without offer shows "Choose an offer to continue."; Space on offer, Continue -> review; Save draft -> "Draft saved on this browser."; page reload; `#/apply` shows "Resume your application"; Resume -> review; Submit without consent shows "Confirm to submit."; consent, Enter pressed three times on Submit -> one submission (status `submitted`, `submittedAt` set), confirmation `h1` "Application submitted"; dashboard link -> `h1` Dashboard, badge "Submitted".
- Same `applicationId` before and after reload: true at all three settings; status before submit `draft`.
- No horizontal overflow on home, chooser, details, offers, review, confirmation, dashboard, presenter: none at all three settings.
- Anchors per page (exactly one each): home `home-cta`; apply chooser `application-root`; details and review `application-root` + `application-step`; review `submit-application`; offers `offers-root`; dashboard `dashboard-root` + `dashboard-status` (when an application exists); presenter `presenter-root`; `help-entry` once on every page.
- Help: Enter on help control opens the dialog, Escape closes it, focus returns to `help-entry`.
- Presenter advance moved status to "Under review"; task checkbox toggled by Space stored `verify_details: true`.
- Console errors: none. Requests to non-localhost hosts: none.
- Direct load and refresh of `/els-ampliloan/#/dashboard`: with saved state (shows "Under review") and with no saved state (empty state, no errors), HTTP 200 both; `#/offers` with no state shows the "Start your application first" empty state; `#/apply` with no state shows the chooser.
Not checked by script: visible focus ring appearance (global `:focus-visible` outline is in CSS; not measured); persona selection and sign-in/up/out UI controls were not driven in the browser (state actions covered by unit tests only).

## P1.4 (Planner)
Stored fields only: ids, loan type, status, timestamps, amount, purpose id, offer id, step id, task booleans. No name, email, address, income, SSN, bank, or free text. No file input, no network code, no vendor SDK. Loan type fixed at creation; `createApplication` refuses when an application exists; changing type goes through the "Start a new application" confirmation (`startNewApplication`). Reset application and start as new demo user are separate presenter controls (the latter with confirmation).

## Design notes and deviations
- Sign-up carries the anonymous owner's application to the new simulated profile; sign-in loads the last or default simulated profile's stored data without merging.
- Personas `first_time_personal` and `business_owner` use a fresh anonymous owner; the other two use fixed simulated profiles with deterministic seeded data.
- Resume gate shows at `#/apply` without a step; `#/apply?step=details|review` open those steps directly, so a reload on a step stays on it.
- Presenter status advance is refused for drafts (a draft must be submitted through review).
