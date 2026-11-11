# AmpliLend: Cursor Project Brief

Owner: Erin Shields  
Prepared: November 11, 2026  
Working product name: AmpliLend  
Target: ready by Thanksgiving, November 26, 2026

## 1. Project summary

Build a polished, fictional lending website that demonstrates improving application conversion with Amplitude and Statsig. Serve personal-loan, mortgage, and small-business audiences through one shared questionnaire and application journey. Loan type changes content and mock offers, not the underlying flow or page architecture. Add a simple borrower dashboard for saved applications, status, loan details, and next steps.

Use Rocket Mortgage as inspiration for a playful, polished visual style and animated hero. Use Upstart as inspiration for a prominent, immediately available “Check your rate” CTA that opens a guided questionnaire. Create original branding, copy, and assets; do not copy either company's identity. AmpliLend is a working name, not a final branding decision.

The site must support both a business demo and a clear technical walkthrough of the Statsig implementation. Keep technical diagnostics in presenter-only controls, outside the borrower experience.

### Non-negotiable product boundary

- **Statsig exclusively owns feature gates, experiments, dynamic configs, parameter stores, and layers.**
- Amplitude owns Analytics, marketing attribution, Session Replay, Heatmaps where available, Guides, Surveys, and Resource Center.
- Install Amplitude through the Unified SDK (`@amplitude/unified`). Its inclusion of Amplitude Experiment code is acceptable. Do not create, configure, fetch, evaluate, or run Amplitude experiments or feature flags. Do not add a separate Amplitude Experiment demo.
- Instrument business actions for both platforms through a shared tracking contract and platform-specific adapters. Do not expect platform-generated events to match one for one.

## 2. Audience and business story

The fictional product serves individuals researching personal loans or mortgages and small-business owners seeking financing. Users include first-time borrowers needing guidance, experienced borrowers comparing offers, returning applicants resuming a draft, and existing customers viewing progress.

The primary story is: a campaign brings in a borrower; the borrower starts an application and encounters friction; Amplitude reveals where and for whom conversion drops; Replay and feedback explain why; targeted help and a Statsig-controlled improvement address the problem; results are compared by audience and loan type.

Use synthetic profiles and mock financial information. Audience traits personalize education and presentation, not real credit decisions. Do not collect real financial credentials, documents, or sensitive personal information.

### Repeatable presenter personas

| Persona | Starting state | Demo purpose |
|---|---|---|
| First-time borrower | Prospect, no draft, personal loan, paid-search entry | Acquisition, questionnaire, contextual help, conversion |
| Returning applicant | Saved mortgage application, email return | Resume prompt, multi-session funnel, dashboard recovery |
| Business owner | Small-business loan, partner entry, self-employed/business-owner profile | Same journey with different context and audience targeting |
| Existing customer | Submitted application, decision or next task available | Status, dashboard engagement, checklist, feedback |

These are selectable fixtures, not separate product journeys. All three loan types must work with the common flow. Do not hardwire experiment outcomes to persona names; support explicit preview overrides separately from real SDK assignment.

## 3. Site and flow

Main journey: Landing page → Check your rate → Choose loan type → Guided questions → Mock offers → Complete and submit application → Dashboard.

| Surface | Required behavior |
|---|---|
| Home | Original animated hero, top-level rate-check CTA, clear product value, trust/reassurance content, supporting educational content, dashboard entry |
| Application | Shared multi-step questionnaire; progress indicator; back/forward controls; validation; save/resume; loan-specific copy and sensible mock amounts |
| Offers | Comparable mock offer cards; term, estimated payment and illustrative rate; select an offer; clear simulated-data labeling |
| Review and submission | Review entered mock details, return to edit, submit once, show confirmation |
| Dashboard | Main application card with status and next action; loan details; resume draft; mock next-step tasks; contextual help and feedback |
| Help | Persistent help entry suitable for Amplitude Resource Center; glossary, application FAQs, and links to relevant guidance |

Application status: `draft` → `submitted` → `under_review` → `decision_ready`. Presenter controls may advance mock status; do not claim these updates come from a real underwriting backend. Show only actions appropriate to the current status.

The dashboard should offer a few focused actions, not become a full banking portal. Mock document tasks use fixtures or simulated completion; do not upload real files.

Use responsive layouts, keyboard-accessible forms, visible focus states, clear labels, and reduced-motion behavior. Give guide targets stable identifiers. Preserve campaign context before routing changes or URL cleanup. Use routes compatible with GitHub Pages, including refresh/deep-link handling and repository base paths.

## 4. Shared audience and identity model

Maintain one application-owned profile. Map persistent traits to Amplitude user properties and Statsig `custom` attributes; use native identity/locale fields where appropriate. Update the profile before the associated event or Statsig evaluation. Do not assume Statsig reconstructs runtime targeting attributes from historical events.

| Property | Type / values | Use |
|---|---|---|
| `customer_relationship` | string: `prospect`, `existing_customer` | Compare new and existing relationships |
| `borrowing_experience` | string: `first_time`, `experienced`, `unknown` | Target educational guidance |
| `employment_type` | string: `employed`, `self_employed`, `business_owner`, `unknown` | Segment application friction |
| `preferred_language` | string: `en`, `es` | Language targeting; full Spanish translation is optional |
| `acquisition_channel_first_touch` | string: `paid_search`, `organic_search`, `email`, `partner`, `direct`, `unknown` | Original acquisition source; set once |
| `journey_stage` | string: `exploring`, `applying`, `submitted`, `decision_ready` | Current lifecycle targeting |
| `has_saved_application` | boolean | Resume eligibility |
| `active_loan_type` | string: `personal`, `mortgage`, `small_business`, `unknown` | Current application context for targeting |
| `active_application_status` | string: `none`, `draft`, `submitted`, `under_review`, `decision_ready` | Dashboard and messaging state |
| `applications_submitted_count` | integer | First versus repeat application |
| `demo_persona` | string: fixture identifier | Reproducible presenter scenarios |
| `traffic_type` | string: `presenter`, `synthetic_population`, `qa` | Separate demo populations and test traffic |

Use native browser/device/geography properties when available. Any simulated geography or device must be explicitly labeled as synthetic; do not misrepresent it as the browser's actual context.

### Identity requirements

- Generate and persist an anonymous browser identifier. Use an opaque synthetic user ID after mock sign-in; never use one shared ID for all visitors.
- Keep a documented mapping between Amplitude anonymous device identity, Statsig Stable ID/custom identity, and the signed-in user ID. Use the same known user ID across tools.
- Choose and document the randomization unit for each Statsig experiment. Anonymous-to-signed-in conversion must not silently change treatment mid-journey. Verify the chosen strategy against the installed SDK rather than assuming Amplitude identity stitching also applies to Statsig.
- Separate “reset current application” from “start as a new demo user.” Resetting an application should not inadvertently create a new experimental unit.
- Loan type is primarily application context. Always attach `loan_type` to loan-related business events, even when `active_loan_type` exists on the profile. A user can have multiple applications over time.
- In Statsig Cloud, user properties for result slicing reflect first exposure. Select loan type and set baseline attributes before exposing an application experiment. Do not use post-treatment status changes as if they were baseline segments.

## 5. Event contract

Use common Title Case business event names and snake_case properties. `Application Submitted` is the final submission event. **Do not use `Application Step Completed`.** Instrument step views and validation failures separately to reveal friction.

| Business event | Trigger |
|---|---|
| `Rate Check Started` | Visitor activates the rate-check entry point |
| `Loan Type Selected` | Visitor selects or changes loan type |
| `Application Started` | A new application record is created after loan selection; once per application |
| `Application Step Viewed` | A questionnaire/review step becomes visible |
| `Application Validation Failed` | A validation attempt fails; send an error code, not field contents |
| `Application Saved` | Application is explicitly saved |
| `Application Resumed` | A saved application is resumed |
| `Offers Viewed` | Mock offers become visible |
| `Offer Selected` | Visitor chooses an offer |
| `Application Submitted` | A valid submission changes the application from draft to submitted; once per application |
| `Application Status Viewed` | User views the status detail/timeline |
| `Loan Details Viewed` | User opens loan details |
| `Application Task Completed` | User completes a mock dashboard next step |
| `Help Requested` | User invokes contextual help |
| `Sign Up Completed`, `Signed In`, `Signed Out` | Corresponding mock identity action |

Use Amplitude autocapture for ordinary page views and clicks rather than duplicating every interaction as a business event. A dashboard page view can use autocapture; retain explicit events for meaningful dashboard actions. Use native Guides/Surveys lifecycle events for their analysis and avoid duplicating them blindly.

Attach applicable properties:

| Property | Type / rule |
|---|---|
| `application_id` | string; stable across the application lifecycle |
| `loan_type` | `personal`, `mortgage`, `small_business`; use `unknown` only before selection |
| `application_status` | string; state at event time |
| `step_id`, `step_index` | string and integer; stable step definitions |
| `requested_amount`, `amount_band` | numeric dollars and a documented categorical band |
| `offer_id`, `term_months` | string and integer |
| `entry_point` | `hero`, `navigation`, `campaign_landing`, `dashboard`, or another documented value |
| `validation_error_code` | string; no input values or sensitive free text |
| `elapsed_seconds` | number; define whether active or wall-clock time before implementation |
| `traffic_type` | same enum as profile; useful for event filtering |

Capture initial and current attribution context, including UTMs/referrer when available. Preserve first-touch versus return-campaign semantics. Map campaign context to Statsig explicitly; Amplitude's automatic attribution does not synchronize it to Statsig.

Implement one business tracking helper with separate Amplitude and Statsig adapters. Preserve semantic parity while respecting each SDK's payload types and metadata constraints. Document conversions; do not assume identical raw JSON contracts. Loan principal is not revenue; do not emit revenue simply because an application has a requested amount.

Use `application_id` as a constant in application-level Amplitude funnels to avoid combining different applications. Infer abandonment through missing downstream events and a defined time window; do not claim a reliable abandonment event from closing a tab.

## 6. What the demo must show

### Amplitude

1. Marketing-to-application attribution: compare acquisition channels/campaigns by loan type and submissions. Ad spend, CAC and ROAS need separate data and are not implied by SDK installation.
2. Funnel analysis: start → offers → selection → submission; inspect step friction and time to completion. Slice by audience traits, loan type, device, and acquisition.
3. Product behavior: save/resume, dashboard return visits, next-step completion, and help usage. Define multi-session return/completion analyses.
4. Behavioral cohorts: started but not submitted; viewed offers but did not select; returned to a saved application. Demonstrate reuse in analysis and eligible targeting.
5. Session Replay: inspect a captured session from an application drop-off, including reproducible mock validation friction. Configure capture/sample rate and masking; SDK installation alone is insufficient.
6. Guides: first-time borrower help, dashboard welcome, and returning-applicant resume guidance. Set active-session properties before personalization; allow cohort-refresh latency in demos.
7. Surveys: optional hesitation feedback and post-submission satisfaction, linked to the user journey. Configure real Amplitude experiences rather than substituting custom mock widgets and calling them Amplitude.
8. Resource Center: glossary, FAQs, and contextual assistance accessible throughout the site, subject to sandbox availability.
9. Heatmaps: prepare the landing page for click/scroll analysis; mark readiness conditional on project enablement and sufficient real browser/replay interactions.

### Statsig

1. Initialization and identity: readable client setup, user updates, targeting attributes, environment selection, and documented randomization units.
2. Feature gate: an enhanced dashboard checklist/help panel that can be targeted to an audience, progressively rolled out, and disabled.
3. Experiment: a common application progress/reassurance treatment with submission as the primary outcome. The shared loan journey remains intact. Offer-card presentation can be a later experiment.
4. Dynamic config: change educational copy or presentation settings for an audience without redeploying. Do not change real eligibility or underwriting logic.
5. Parameter stores and layers: one store and linked layer per actual page template (home, application, offers, dashboard; extend if separate templates are added). Example parameters include `hero_headline`, `hero_cta_label`, `progress_style`, `show_reassurance`, `offer_layout`, and `show_next_steps`.
6. Abstraction: page components use a typed `getPageParams(page)` helper. Keep direct Statsig entity access in a small documented integration layer; explain the mapping in code and a config inventory.
7. Experiment iteration and mutual exclusion: demonstrate remapping typed parameters without deployment and related experiments sharing a layer. Do not create a separate layer for every questionnaire step unless it is a distinct template.
8. Exposure logging: evaluate only relevant features/parameters. Layer retrieval alone differs from reading a parameter; avoid eager reads and diagnostic-panel calls that create unintended exposures. Prefer the SDK's normal exposure behavior; justify any manual handling.
9. Outcomes and breakdowns: submit/start/offer-selection metrics, validation-failure guardrails, completion-time diagnostics, and Explore breakdowns by baseline audience attributes. Event metadata supplies loan-specific outcome dimensions.
10. Reliability: typed defaults, cached/network behavior, user updates, and a controlled failure demonstration. The borrower flow must remain usable if SDK/network access is unavailable.

### Measurement rules

- Define each metric's denominator, unit, time window, and event source. For the main application experiment, report submission among eligible exposed users; keep starts and other diagnostics separate.
- Distinguish user-level experiment metrics from application-level business funnels. Do not promise identical numbers when analysis units/windows differ.
- Statsig Cloud funnel metrics have daily rollup behavior. Validate multi-day saved-application analysis rather than assuming equivalence with Amplitude funnels.
- Seeded/synthetic results must be clearly labeled. Do not promise statistical significance from a few manual sessions or engineer fake “winning” results without disclosure.

## 7. Technical constraints and readiness

- Static frontend, no backend; GitHub Pages deployed with GitHub Actions. Mock fixtures live in the repository; browser persistence supports save/resume and mock sign-in.
- Suggested implementation: React + TypeScript with a static build tool. Final framework choice is an implementation decision, not an established requirement. Avoid server-only features.
- Amplitude destination: EE sandbox organization **446257**, not AmpliDemo. The project ID/API key still need to be selected and verified; the organization ID is not an SDK key.
- Statsig: separate demo project; its ID and client key still need to be supplied/verified. Use client-safe keys in browser code. Keep management/server secrets out of the browser and repository.
- Use one Amplitude Unified SDK entry point and one `initAll()` per page load. Configure products deliberately and verify installed versions against official documentation. No separate Analytics installation that duplicates tracking.
- Present a capability checklist separating: UI built, SDK installed, console entity configured, telemetry verified, and demo data ready. Do not mark a product ready merely because its package is present.
- Verify actual sandbox entitlements, SDK versions, and MCP operations. Use placeholders for unavailable configuration and report blockers precisely. Do not invent IDs, tools, approvals, or a successful connection.

### Presenter controls and data

Provide a presenter-only control panel for choosing a persona, setting mock application state, resetting application data, starting a new user, and inspecting emitted business events and evaluated configuration. Clearly distinguish local preview overrides from genuine Statsig assignments. Do not expose credentials.

Start with deterministic fixtures and manual walkthroughs. Plan a separate, bounded synthetic-population run to populate analytics and experiment examples, with traffic labels and a stated volume. Replays require actual browser interaction; API-only event seeding cannot create them. Never represent frontend-only status simulation as server-side execution.

## 8. Build order and handoff expectations

This is the product brief plus implementation requirements, not a completed repository or agent specification package. Use it to generate the Planner/Builder instructions, phase plan, event map, and initial handoff before coding.

Suggested phases:

1. Static scaffold, original visual direction, responsive landing page, GitHub Pages deployment setup.
2. Shared application flow, offers, mock identity, persistence, dashboard, and presenter fixtures.
3. Shared identity/event adapters and Amplitude instrumentation; replay and engagement integration surfaces.
4. Statsig client integration, gates/configs, page parameter stores/layers, and experiment-ready treatments.
5. Console setup and measurement definitions; populate approved demo experiences/data; final browser and telemetry verification.

Within build phases, run typecheck, production build, and a focused smoke check. Reserve comprehensive browser walkthroughs, screenshots, replay inspection, and cross-platform telemetry audit for final verification. Fix real defects when found.

Follow David's one-Planner/one-Builder workflow when supported. Do not assume Slack subscriptions, named agent mentions, or child-agent resumption exist in the chosen Cursor setup. Verify capabilities first; use the Cursor conversation as a fallback coordination surface if necessary. Each merge/deployment requires Erin's explicit approval for the relevant PR. Distinguish Planner review approval from Erin's merge approval. Do not create or launch experiments incidentally while provisioning stores/layers; make experiment setup and activation a separate reviewable action.

### Definition of done

- All three loan types use the same functional flow and dashboard, with persistent mock state.
- The animated landing page and immediate rate-check entry match the agreed design direction; reduced motion and keyboard use work.
- `Application Submitted` fires once per valid submission. Loan-related events contain the correct `loan_type` and `application_id`; profile updates precede dependent actions.
- Amplitude business events, attribution, user identity, replay, and available engagement experiences are verified with real evidence. Conditional features have explicit readiness status.
- Statsig gates, experiment treatment, config, typed defaults, stores/layers, exposure behavior, and outcome events work and are documented. No Amplitude Experiment setup/evaluation exists.
- Anonymous/sign-in transitions and application resets have been tested for identity and treatment consistency.
- The final live site loads as a fresh signed-out visitor, including deep links/assets; build and browser checks pass.
- Supply setup instructions, configuration names without secret values, event/property inventory, Statsig entity map, demo talk track, evidence, and remaining limitations.

## 9. Out of scope

Real credit decisions, credit checks, payments, document storage, bank connections, production authentication, backend services, and genuine funding. No separate journeys per loan type. No Amplitude experiments or feature flags. No server SDK, forward proxy, warehouse-native Statsig implementation, warehouse integration, or production AI agent unless separately scoped. These may be discussed in a technical walkthrough but must not be presented as running features.

## 10. Reference material

The following official documentation informed this brief; verify exact APIs against installed versions during implementation.

- [Amplitude Unified SDK setup](https://www.amplitude.com/docs/sdks/analytics/browser/browser-unified-sdk/get-started)
- [Amplitude Unified SDK reference](https://www.amplitude.com/docs/sdks/analytics/browser/browser-unified-sdk/reference)
- [Amplitude user and event properties](https://www.amplitude.com/docs/data/user-properties-and-events)
- [Amplitude identity](https://www.amplitude.com/docs/data/sources/instrument-track-unique-users)
- [Browser instrumentation and attribution](https://www.amplitude.com/docs/sdks/analytics/browser/browser-sdk-2/instrument-and-configure)
- [Hold properties constant in funnels](https://amplitude.com/docs/analytics/charts/funnel-analysis/funnel-analysis-hold-properties-constant)
- [Find Session Replays](https://amplitude.com/docs/session-replay/find-replays)
- [Create Heatmaps](https://amplitude.com/docs/heatmaps/create-a-heatmap)
- [Guides and Surveys targeting](https://www.amplitude.com/docs/guides-and-surveys/setup-and-target)
- [Guide personalization](https://www.amplitude.com/docs/guides-and-surveys/personalize-with-variables)
- [Resource Center](https://www.amplitude.com/docs/assistant/resource-center/resource-center-overview)
- [Statsig user object](https://docs.statsig.com/sdks/user)
- [Statsig JavaScript SDK](https://docs.statsig.com/client/javascript-sdk)
- [Statsig parameter stores](https://docs.statsig.com/client/concepts/parameter-stores)
- [Statsig layers and exposures](https://docs.statsig.com/experiments/layers-overview)
- [Statsig feature gates versus experiments](https://docs.statsig.com/guides/featureflags-or-experiments)
- [Statsig user-property slicing](https://docs.statsig.com/experiments/interpreting-results/user-properties)
- [Statsig event dimensions and results](https://docs.statsig.com/experiments/interpreting-results/read-results)
- [Statsig funnel metrics](https://docs.statsig.com/metrics/create-user-funnels)
- [Rocket Mortgage: visual inspiration](https://www.rocketmortgage.com/)
- [Upstart: rate-check entry inspiration](https://www.upstart.com/)
- [David's original workflow and sandbox clarification](https://amplitude.slack.com/archives/C0A8Y778H9P/p1793213100150069)

Source workflow: David Halk's supplied Agent-Team-Companion.pdf. Scope and decisions above reflect Erin's instructions and take precedence over its generic ecommerce examples.
