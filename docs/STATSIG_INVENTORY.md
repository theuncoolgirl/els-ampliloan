# Statsig inventory (code side)

Binding status for every entity: `not provisioned`. None of these exist in the Statsig console. The code uses the defaults below and shows them as `default` in the presenter diagnostics.

| Code name | Entity type | Type | Default | Binding status | Where read | When evaluated |
|---|---|---|---|---|---|---|
| `ampliloan_home.hero_headline` | Parameter store parameter (layer `ampliloan_home_layer`) | string | `Your next chapter starts here` | not provisioned | `src/components/Hero.tsx` | On first render of the home route per navigation |
| `ampliloan_home.cta_label` | Parameter store parameter | string | `Check your rate` | not provisioned | `src/components/Hero.tsx` | Same |
| `ampliloan_application.show_reassurance` | Parameter store parameter (layer `ampliloan_application_layer`) | boolean | `false` | not provisioned | `ApplyPage.tsx` details and review steps | When a step that renders it first renders in a navigation |
| `ampliloan_application.progress_style` | Parameter store parameter | string (`steps` or `bar`; anything else falls back to `steps`) | `steps` | not provisioned | `Stepper` in `src/components/Forms.tsx` (details, offers, review) | When a step that renders the progress indicator first renders |
| `ampliloan_offers.show_comparison_hint` | Parameter store parameter (layer `ampliloan_offers_layer`) | boolean | `false` | not provisioned | `OffersPage.tsx`, only when an application exists | On render of the offers page with an application |
| `ampliloan_dashboard.show_next_steps` | Parameter store parameter (layer `ampliloan_dashboard_layer`) | boolean | `true` | not provisioned | `DashboardPage.tsx`, only when simulated tasks are available | On render of the dashboard with tasks available |
| `ampliloan_contextual_help` | Feature gate (standalone) | boolean | `false` | not provisioned | `ApplyPage.tsx` details step | Once per navigation to the details step |
| `ampliloan_support_content` | Dynamic config (standalone) | `heading` string, `body` string, `max_items` integer | `Help and answers`, `Browse common questions about your sample application.`, `3` (clamped 1 to 5; non-integers use 3) | not provisioned | `src/components/HelpPanel.tsx` | Only when the help panel opens |

Notes
- Page parameters are read through parameter store getters only. The code never calls a layer, gate, or config to back a page parameter, and never reads the underlying layer in addition to the store.
- A parameter that no rendered component asks for is never read, so it produces no SDK call and no exposure.
- Within one navigation a value is read once and kept; a late SDK response never changes a visible value. Values are re-evaluated at the next route change.
- A missing parameter, store, or config returns the default and is listed once per identity generation as a setup failure (`missing_binding`); a type or value mismatch is listed as `type_mismatch`. This includes an unknown `progress_style` value.
- Preview overrides are consulted before any SDK read and never evaluate or expose.
