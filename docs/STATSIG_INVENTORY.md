# Statsig inventory (code side)

Binding status (revision 3.4 live check: all six store parameters, the gate and the config served with source `statsig`; earlier text below is the revision 3.3 record): the gate and the dynamic config are `provisioned` (rev 3.2, untouched). The four layers and four parameter stores were created on 2026-11-12 20:53Z (POST, then PATCH on the layer and POST `/param_stores/{name}` on the store to set parameters; each verified with GET). Layers: unit `stableID`, no experiment, no rules; they serve their defaults to everyone. Live check (one journey): `hero_headline`, `cta_label`, `show_reassurance`, `progress_style` were served by Statsig; `show_comparison_hint` and `show_next_steps` returned `default (timeout)` because they were first read while a trait update was in flight (see the evidence file, revision 3.3).

| Code name | Entity type | Type | Default | Binding status | Where read | When evaluated |
|---|---|---|---|---|---|---|
| `ampliloan_home.hero_headline` | Parameter store parameter (layer `ampliloan_home_layer`) | string | `A clearer path to the loan you need` | bound: store `ampliloan_home` (ID `YWTl4E33mPmYJjhrjXG3l`) references layer parameter of the same name; layer and store verified by GET. Live: served by Statsig (source `statsig`) | `src/components/Hero.tsx` | On first render of the home route per navigation |
| `ampliloan_home.cta_label` | Parameter store parameter | string | `Check your rate` | bound: store `ampliloan_home` (ID `YWTl4E33mPmYJjhrjXG3l`) references layer parameter of the same name; layer and store verified by GET. Live: served by Statsig (source `statsig`) | `src/components/Hero.tsx` | Same |
| `ampliloan_application.show_reassurance` | Parameter store parameter (layer `ampliloan_application_layer`) | boolean | `false` | bound: store `ampliloan_application` (ID `ZDMfK0Fowz7wohsxrIOkQ`) references layer parameter of the same name; layer and store verified by GET. Live: served by Statsig (source `statsig`) | `ApplyPage.tsx` details and review steps | When a step that renders it first renders in a navigation |
| `ampliloan_application.progress_style` | Parameter store parameter | string (`steps` or `bar`; anything else falls back to `steps`) | `steps` | bound: store `ampliloan_application` (ID `ZDMfK0Fowz7wohsxrIOkQ`) references layer parameter of the same name; layer and store verified by GET. Live: served by Statsig (source `statsig`) | `Stepper` in `src/components/Forms.tsx` (details, offers, review) | When a step that renders the progress indicator first renders |
| `ampliloan_offers.show_comparison_hint` | Parameter store parameter (layer `ampliloan_offers_layer`) | boolean | `false` | bound: store `ampliloan_offers` (ID `10fQQK8ElPNovUraM6AgVS`) references layer parameter of the same name; layer and store verified by GET. Live: default with reason `timeout` in the one live journey (first read during an in-flight trait update); not yet shown as served | `OffersPage.tsx`, only when an application exists | On render of the offers page with an application |
| `ampliloan_dashboard.show_next_steps` | Parameter store parameter (layer `ampliloan_dashboard_layer`) | boolean | `true` | bound: store `ampliloan_dashboard` (ID `1169qA5ZoX8l5ubZIlGQeW`) references layer parameter of the same name; layer and store verified by GET. Live: default with reason `timeout` in the one live journey (first read during an in-flight trait update); not yet shown as served | `DashboardPage.tsx`, only when simulated tasks are available | On render of the dashboard with tasks available |
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
- Layers created in revision 3.3 (all unit `stableID`, `isImplicitLayer` false): `ampliloan_home_layer` (hero_headline, cta_label), `ampliloan_application_layer` (show_reassurance false, progress_style "steps"), `ampliloan_offers_layer` (show_comparison_hint false), `ampliloan_dashboard_layer` (show_next_steps true).
- A route that mounts while a user update is running is held until `settled()` (bounded at 2000 ms) so that first reads are not pinned to defaults (added in revision 3.3; offline-tested only).
- Application-store parameters are read only when the resolved user's `active_loan_type` matches the current application; otherwise the default with reason `timeout` is returned (`settled()` bounds a wait at 2000 ms).

## Cloud project (revision 4C.2, current)

Project `AmpliLoan [Cloud]`, ID `6oe5DaLQIx5XnKfBrG0JnT` (https://staging.console.statsig.com/6oe5DaLQIx5XnKfBrG0JnT/settings). Created 2026-11-12 23:04:44-55Z through `https://statsigapi.net/console/v1`; every entity verified by GET. Same names, types, defaults and store-to-layer references as the table above.
- Layers (idType `stableID`, ID equals name): `ampliloan_home_layer`, `ampliloan_application_layer`, `ampliloan_offers_layer`, `ampliloan_dashboard_layer`.
- Parameter stores: `ampliloan_home` (3y4tImqDP2JzeEDhFJLymz), `ampliloan_application` (3BNzAoluZw18gDrl7wAUHG), `ampliloan_offers` (3CwtSBdqA5pWY8mhj727p7), `ampliloan_dashboard` (3EIFykZ3LVvIyES8xd5eWS).
- Gate `ampliloan_contextual_help` (idType `stableID`) with one rule `first_time_borrowers` (ID `3H1GVhuDB1LYeb6bsFCS3R`: custom field `borrowing_experience` any of `first_time`, pass 100%).
- Dynamic config `ampliloan_support_content` (idType `stableID`, default `{"heading":"Help","body":"","max_items":5}`, no rules).
- No experiment, metric, or other entity. The old project below is superseded and untouched; the client key in the build must belong to this project.

Old project `363sCqDdACZXt4M88ZqiKa` (`AmpliLoan [WHN]`): SUPERSEDED. The text above this section describes its state.
