# Statsig inventory (code side)

Binding status (revision 3.2, created through the Console API with POST only): the gate and the dynamic config are `provisioned`; the four layers and four parameter stores are `blocked`. The POST bodies for layers and parameter stores accept no parameter definitions, and PATCH/PUT were not authorized, so empty shells were not created. Parameters therefore still show `missing_binding` in the presenter and use the code defaults.

| Code name | Entity type | Type | Default | Binding status | Where read | When evaluated |
|---|---|---|---|---|---|---|
| `ampliloan_home.hero_headline` | Parameter store parameter (layer `ampliloan_home_layer`) | string | `A clearer path to the loan you need` | blocked (Console API POST cannot define layer or store parameters; PATCH not authorized; no entity created) | `src/components/Hero.tsx` | On first render of the home route per navigation |
| `ampliloan_home.cta_label` | Parameter store parameter | string | `Check your rate` | blocked (Console API POST cannot define layer or store parameters; PATCH not authorized; no entity created) | `src/components/Hero.tsx` | Same |
| `ampliloan_application.show_reassurance` | Parameter store parameter (layer `ampliloan_application_layer`) | boolean | `false` | blocked (Console API POST cannot define layer or store parameters; PATCH not authorized; no entity created) | `ApplyPage.tsx` details and review steps | When a step that renders it first renders in a navigation |
| `ampliloan_application.progress_style` | Parameter store parameter | string (`steps` or `bar`; anything else falls back to `steps`) | `steps` | blocked (Console API POST cannot define layer or store parameters; PATCH not authorized; no entity created) | `Stepper` in `src/components/Forms.tsx` (details, offers, review) | When a step that renders the progress indicator first renders |
| `ampliloan_offers.show_comparison_hint` | Parameter store parameter (layer `ampliloan_offers_layer`) | boolean | `false` | blocked (Console API POST cannot define layer or store parameters; PATCH not authorized; no entity created) | `OffersPage.tsx`, only when an application exists | On render of the offers page with an application |
| `ampliloan_dashboard.show_next_steps` | Parameter store parameter (layer `ampliloan_dashboard_layer`) | boolean | `true` | blocked (Console API POST cannot define layer or store parameters; PATCH not authorized; no entity created) | `DashboardPage.tsx`, only when simulated tasks are available | On render of the dashboard with tasks available |
| `ampliloan_contextual_help` | Feature gate (standalone), ID `ampliloan_contextual_help`, ID type `stableID`, no rules, created 2026-11-12T20:47:54Z | boolean | `false` | provisioned (not present in the client initialize payload; see evidence) | `ApplyPage.tsx` details step | Once per navigation to the details step |
| `ampliloan_support_content` | Dynamic config (standalone), ID `ampliloan_support_content`, ID type `stableID`, no rules, default value `{heading:"Help", body:"", max_items:5}`, created 2026-11-12T20:47:55Z | `heading` string, `body` string, `max_items` integer | `Help`, empty string (the body line renders only when non-empty), `5` (clamped 1 to 5; non-integers use 5) | provisioned (delivered in the client initialize payload) | `src/components/HelpPanel.tsx` | Only when the help panel opens |

Notes
- Page parameters are read through parameter store getters only. The code never calls a layer, gate, or config to back a page parameter, and never reads the underlying layer in addition to the store.
- A parameter that no rendered component asks for is never read, so it produces no SDK call and no exposure.
- Within one navigation a value is read once and kept; a late SDK response never changes a visible value. Values are re-evaluated at the next route change.
- A missing parameter, store, or config returns the default and is listed once per identity generation as a setup failure (`missing_binding`); a type or value mismatch is listed as `type_mismatch`. This includes an unknown `progress_style` value.
- Preview overrides are consulted before any SDK read and never evaluate or expose.

Known fragility
- Telling `missing_binding` from `type_mismatch` reads the SDK's internal `__configuration` field on the parameter store, because the typed getter does not say why it fell back. The read is wrapped: if the field is absent, renamed, or not an object, the parameter returns its default with reason `error` and no setup failure is recorded. Re-check this on every `@statsig/js-client` upgrade.

Statsig hosts for blocking tests (observed in revision 3)
- Primary: `featureassets.org` (initialize), `prodregistryv2.org` (event log).
- Fallbacks the SDK uses when the primary fails: `assetsconfigcdn.org` (initialize) and `beyondwickedmapping.org`, discovered through a `cloudflare-dns.com` TXT lookup. A fallback test must block all four Statsig hosts (and any host matching `statsig` or `featuregates`); `cloudflare-dns.com` is not a Statsig host.

Update behavior (revision 3.1)
- Identity generation changes only when the stable ID or known user ID changes. It discards every cached value for the old identity and starts a fresh update at once; a response for an older generation is ignored.
- Trait-only changes (any other `custom` change) are coalesced: changes in one tick produce one `updateUserAsync`, at most one is in flight, and only the latest trait set is sent next. Nothing cached is discarded.
- While a trait update is in flight, reads return the last value evaluated for the same identity (source `statsig`, `stale_traits` in the presenter), never block, and never return another identity's value. A key never evaluated for this identity gets its default with reason `timeout`. A failed trait update keeps the previous values and records reason `error`.
- Newly evaluated values become visible only at the next route or step boundary.
- Application-store parameters are read only when the resolved user's `active_loan_type` matches the current application; otherwise the default with reason `timeout` is returned (`settled()` bounds a wait at 2000 ms).
