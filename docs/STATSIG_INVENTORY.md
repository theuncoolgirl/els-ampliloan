# Statsig inventory (code side)

Binding status for every entity: `blocked`. Revision 3 could not create them: the project's organization requires SSO and the bot email/password login does not grant console access (see `docs/evidence/phase-3.md`). No entity ID exists. The live initialize payload for the production client key returned empty `feature_gates`, `dynamic_configs`, and `layer_configs`, which is consistent with nothing being provisioned. The code uses the defaults below and shows them as `default` with reason `missing_binding` in the presenter diagnostics.

| Code name | Entity type | Type | Default | Binding status | Where read | When evaluated |
|---|---|---|---|---|---|---|
| `ampliloan_home.hero_headline` | Parameter store parameter (layer `ampliloan_home_layer`) | string | `A clearer path to the loan you need` | blocked (no console access; no entity ID) | `src/components/Hero.tsx` | On first render of the home route per navigation |
| `ampliloan_home.cta_label` | Parameter store parameter | string | `Check your rate` | blocked (no console access; no entity ID) | `src/components/Hero.tsx` | Same |
| `ampliloan_application.show_reassurance` | Parameter store parameter (layer `ampliloan_application_layer`) | boolean | `false` | blocked (no console access; no entity ID) | `ApplyPage.tsx` details and review steps | When a step that renders it first renders in a navigation |
| `ampliloan_application.progress_style` | Parameter store parameter | string (`steps` or `bar`; anything else falls back to `steps`) | `steps` | blocked (no console access; no entity ID) | `Stepper` in `src/components/Forms.tsx` (details, offers, review) | When a step that renders the progress indicator first renders |
| `ampliloan_offers.show_comparison_hint` | Parameter store parameter (layer `ampliloan_offers_layer`) | boolean | `false` | blocked (no console access; no entity ID) | `OffersPage.tsx`, only when an application exists | On render of the offers page with an application |
| `ampliloan_dashboard.show_next_steps` | Parameter store parameter (layer `ampliloan_dashboard_layer`) | boolean | `true` | blocked (no console access; no entity ID) | `DashboardPage.tsx`, only when simulated tasks are available | On render of the dashboard with tasks available |
| `ampliloan_contextual_help` | Feature gate (standalone) | boolean | `false` | blocked (no console access; no entity ID) | `ApplyPage.tsx` details step | Once per navigation to the details step |
| `ampliloan_support_content` | Dynamic config (standalone) | `heading` string, `body` string, `max_items` integer | `Help`, empty string (the body line renders only when non-empty), `5` (clamped 1 to 5; non-integers use 5) | blocked (no console access; no entity ID) | `src/components/HelpPanel.tsx` | Only when the help panel opens |

Notes
- Page parameters are read through parameter store getters only. The code never calls a layer, gate, or config to back a page parameter, and never reads the underlying layer in addition to the store.
- A parameter that no rendered component asks for is never read, so it produces no SDK call and no exposure.
- Within one navigation a value is read once and kept; a late SDK response never changes a visible value. Values are re-evaluated at the next route change.
- A missing parameter, store, or config returns the default and is listed once per identity generation as a setup failure (`missing_binding`); a type or value mismatch is listed as `type_mismatch`. This includes an unknown `progress_style` value.
- Preview overrides are consulted before any SDK read and never evaluate or expose.

Known fragility
- Telling `missing_binding` from `type_mismatch` reads the SDK's internal `__configuration` field on the parameter store, because the typed getter does not say why it fell back. The read is wrapped: if the field is absent, renamed, or not an object, the parameter returns its default with reason `error` and no setup failure is recorded. Re-check this on every `@statsig/js-client` upgrade.
