# Builder handoff — Phase 4F revision 4F.2 (remove demo wording)
Status: IDLE
Phase: 4F, copy-only revision
Revision: 4F.2

Authority: Erin, Cursor chat, 8:58 AM ET Nov 25, 2026: "Remove references to the fact that it's a demo site on all pages except for the demo controls page." Recorded in `DECISIONS.md`.

## Permissions
Builder Commit Yes; Push Yes (own branch `cursor/phase4f-copy-360f` only, never `main`); PR Yes (draft); Merge No; Deploy No. No console or platform writes; do not use `STATSIG_CONSOLE_API_KEY`.

## Task
Copy-only change. On every borrower-facing surface (landing, Apply, Offers, Dashboard, Help panel, header, footer, page titles and meta in `index.html`, alt text), remove wording that says or implies the site is a demo, demonstration, synthetic, mock, placeholder, "no one will reply", "no real loans/credit checks", "sample data", or "(demo)". Leave the Presenter page (`/presenter`, "Demo controls"), diagnostics, tests of those, and internal identifiers (`demo_persona`, `traffic_type`, `data-demo` attributes, `startAsNewDemoUser`, variable names) untouched.

Known places (not exhaustive; search `src/` and `index.html` for demo, demonstration, synthetic, sample, mock, placeholder, "no real"):
- Hero: disclaimer line; Landing: stat strip "In this demo", estimator hint and "(demo)" text and "demo APR" wording, trust band heading ("A demo you can explore with confidence") and items ("Synthetic data only"), FAQ answers ("Is this a real loan?", credit-check answer, "sample data"), final CTA subline, "apply to this demo only".
- Apply: the reassurance text (`REASSURANCE`) and the submit consent checkbox label.
- Offers: "Demo data, not a real offer" and "sample data" banner.
- Dashboard: "Sample result" status text.
- Help panel: "Is this a real application?" / "Are the offers real?" answers, "This site is a demonstration", the contact placeholder line, "sample offer" wording.
- Footer: "Demo with synthetic data..." and "AmpliLoan demo" copyright, and the "Demo controls" link label (rename to a neutral label such as "Presenter"; keep the link and route).

## Replacement rules
- Keep one neutral standard disclosure, not a demo admission, in the footer and on Offers: "Rates, amounts, and offers shown are illustrative and are not an approval, quote, or commitment to lend." Keep "illustrative"/"estimated" on figures where it prevents misreading them as binding.
- Replace the Apply reassurance text with copy that makes no demo claim, for example "Your answers are saved on this device as you go." This is the experiment treatment element: keep the element, its gating (`show_reassurance`, off by default), and its position unchanged; change only the words.
- Replace the consent checkbox label with, for example, "I confirm these details are correct and I'm ready to submit." The checkbox, its id, validation (`missing_consent`), error text behavior, and event sequence must not change.
- FAQ and Help: rewrite the "real loan / real application / real offers" answers into accurate non-demo wording about estimates, such as "Your options are estimates based on what you tell us. Final terms would depend on a full review." Do not claim real approvals, funding, or credit checks happening.
- Remove or reword the fictional customer quote caption so it does not say "fictional"; if it cannot be reworded without claiming a real customer, remove the quote block.
- Update `<title>` and meta text accordingly.

## Must not change
Journey, routes, state, events and their properties, Amplitude and Statsig code, parameter bindings and fallbacks (`hero_headline`, `cta_label` fallback values keep their current text), gates, guide target IDs, and the Presenter page text.

## Verification (record separately)
- `npm test` and `npm run build` pass; update any test that asserts removed wording, and say which.
- Run `rg -i "demo|demonstration|synthetic|mock|placeholder" src index.html` and list every remaining hit with its reason (presenter, diagnostics, identifiers, tests only). No hit may be user-visible outside `/presenter`.
- Walk the personal, mortgage, and small-business journeys; event sequence unchanged from `main`.
- Render check of home, Apply step 1 and the submit step, Offers, Dashboard, Help panel, at 375 and 1280 px. State what was rendered versus read from code.

## Result
`docs/evidence/phase-4f2.md`, `PHASE_LOG.md` entry, draft PR to `main`, set this file to `Status: IDLE` on your branch, stop. No deploy.
