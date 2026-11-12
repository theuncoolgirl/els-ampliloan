# Statsig entity proposal — requires Go before creation
Status: PROPOSED. Project ID: unset. Environment: verify demo tier. No entities created. Planner presents this exact table, with resolved project and supported parameter API, before requesting Erin's Go. Go for drafts does not authorize start/publication/data generation.

| Page | Parameter store | Layer | Parameters and safe defaults | Initial use |
|---|---|---|---|---|
| Home | ampliloan_home | ampliloan_home_layer | hero_headline: string = A clearer path to the loan you need; cta_label: string = Check your rate | Rendered headline/CTA only |
| Application | ampliloan_application | ampliloan_application_layer | show_reassurance: boolean = false; progress_style: string = steps | One shared form; no alternate loan journeys |
| Offers | ampliloan_offers | ampliloan_offers_layer | show_comparison_hint: boolean = false | Optional explanatory copy; never change actual eligibility |
| Dashboard | ampliloan_dashboard | ampliloan_dashboard_layer | show_next_steps: boolean = true | Mock next-action presentation |

Each page parameter initially maps to its matching layer parameter; ensure exact type/default parity in console and code. Unused page values are not eagerly read. A missing binding is a visible setup failure in presenter, with safe borrower fallback. Page stores are an app organization choice, not a vendor requirement.

Standalone technical demonstrations, outside page-layer parameters:
- Gate `ampliloan_contextual_help`: boolean false by default; evaluate when help entry becomes relevant. Target synthetic borrowing_experience=first_time for a draft example.
- Dynamic config `ampliloan_support_content`: heading string default "Help", body string default empty (shown only when non-empty), max_items integer default 5 (clamp 1–5; the demo lowers it); read only when help panel opens. Demonstrates typed fallback and validation.
These are separate accessors, not duplicate backing sources for page parameters. Do not call both a store getter and an underlying gate/layer solely to display diagnostics.

## First experiment proposal
Name: `ampliloan_application_reassurance_v1`. Application layer; Stable ID unit. Eligibility: live_demo traffic, supported loan type, application details step reached. Randomize eligible stable IDs 50/50 only after explicit activation approval. Control show_reassurance=false; treatment=true. Keep progress_style constant. No simultaneous home/offers/dashboard experiments in the initial story.

Primary outcome: exposed units with Application Submitted. Secondary: application save, validation failure rate; diagnostic: elapsed seconds among submitters. Guardrail: failure/fallback rate if separately instrumented as technical telemetry; do not silently add a business event. Define exact metric settings in METRICS_AND_QA.md before activation. Draft population test uses an isolated environment/traffic filter; no significance claim.

Stop/rollback: authorized owner stops allocation in console and verifies the safe default on a fresh unit; log exact entity/config state. Do not silently flip active participants mid-application. Verify no assignments/exposures from preview mode. Developer walkthrough shows the integration facade, user object, gate, config, lazy layer-backed parameter, outcome payload, fallback and diagnostic snapshot.
