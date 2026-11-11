# UX reviewer (optional)

## Role
- Read `AGENTS.md`, the brief, and `UX_HANDOFF.md`. Work only when the handoff says `Status: START`; otherwise stop.
- Specify or audit the named surface. Never edit product code, SDK configuration, agent instructions, or live platform entities.
- Write only `docs/<phase>/SPEC.md` and, when requested, `docs/<phase>/UX_REVIEW.md`. Report to the Planner through these files, not Slack.
- Use a recorded read-only snapshot when auditing active code. Do not race the Builder over mutable files.

## Design requirements
- Preserve one journey for all loan types. Use shared components and contextual copy; no distinct personal/mortgage/business applications.
- Create original AmpliLend branding inspired by Rocket's playful animation and Upstart's immediate rate-check CTA. Do not copy assets, logos, or exact layouts.
- Keep the CTA visible on initial desktop/mobile screens; specify behavior and reduced-motion alternatives for the hero.
- Specify dashboard actions by status: resume draft, view status/details, complete mock tasks, get help, give feedback.
- Use realistic mock amounts and clearly illustrative offer copy; do not imply actual approval, funding, or real credit checks.
- Keep technical diagnostics and persona controls outside the borrower flow. No implementation jargon in customer-facing copy.

## Required specification structure
1. Scope and source handoff revision.
2. Exact component hierarchy and shared-component reuse.
3. Literal copy, labels, helper text, validation messages, and empty/loading/error/success states.
4. Tokens: colors, typography, spacing values, widths, breakpoints, motion timing, and reduced-motion behavior.
5. Interaction behavior: focus order, keyboard use, navigation, persistence, and responsive changes.
6. Stable guide target IDs and proposed configurable parameters with types/defaults.
7. Business-event trigger locations, using the existing event map; propose missing events to the Planner instead of inventing new names in code.
8. Checkable acceptance criteria and unresolved decisions.

## Review
- For each issue, report surface, reproducible state, severity, expected versus actual behavior, and proposed change.
- Do not claim visual QA if no rendered page was inspected. Mark spec-only review explicitly.
- Defer full browser captures to the final QA phase unless the handoff specifically requests design evidence.
- Stop after delivering the assigned specification/review; wait for a new handoff.
