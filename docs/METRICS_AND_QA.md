# Measurement and final verification
## Audience and user-property use
| Demo persona | Acquisition | Stable profile | Demonstration |
|---|---|---|---|
| First-time personal borrower | paid_search | new customer, first_time, employed | Attribution to conversion; reassurance and targeted help |
| Returning mortgage applicant | email | returning customer, experienced, employed | Saved application/resume; current vs first-touch attribution |
| Business owner | partner | new customer, experienced, self_employed | Same funnel sliced by small_business; config/help example |
| Existing customer | direct | existing customer, experienced | Dashboard status/details/tasks and feedback |

No real protected characteristics, credit score, income, name, email, address, bank or document contents. Personas are synthetic fixtures, not real underwriting segments. Loan amount bands represent mock UI values only.

## Measurement recipes
1. Acquisition: eligible Rate Check Started by first-touch channel/campaign, then Application Started → Offers Viewed → Offer Selected → Application Submitted. Loan Type Selected is useful diagnostically; not mandatory for resumed journeys. Amplitude ordered funnel proposed window 7 days; user-level conversion and application-level deduplicated counts are separate charts. For strict application counts, require matching application_id for steps beginning Application Started and verify the console's supported matching-property configuration.
2. Marketing: compare first-touch and session channel; tagged URL fixtures for paid_search/email/partner/direct. Organic/unclassified remains unknown until supported source evidence. Attribution is observed traffic source, not incremental marketing causality.
3. Friction: validation failures by step_id/code, save/resume and elapsed_seconds among submitters; link actual replays; cohort of started but not submitted within agreed window. No Abandoned event on browser unload.
4. Dashboard: status/details/tasks/help by relationship and loan type. Retention uses return visits or repeat status views with explicitly selected interval; scripted replay does not prove actual retention.
5. Statsig: primary proposed binary conversion per exposed Stable ID to Application Submitted; filter traffic_type=live_demo. Before start record supported console aggregation/attribution setting and choose 7 days if supported for that metric; otherwise Planner revises the concrete recipe and documents the difference before activation. Match unit on metric and experiment. Save exact denominator, exposure time, timezone, cutoff and event filters. Don't use userID in one denominator and Stable ID in the other.
6. elapsed_seconds measures wall-clock seconds from persisted application creation to accepted submission, including away time; nonnegative integer. It is not engagement time, revenue, or an unbiased causal speed metric because only submitters contribute. Loan principal is never revenue.
7. Breakdowns: event loan_type/application_status captures time-of-event context. User active_loan_type/active_application_status is mutable. Statsig baseline properties reflect exposure context; compare like-for-like cohorts, not current profiles against historical event dimensions.

## Console readiness inventory
Amplitude: acquisition view, ordered conversion funnel, validation breakdown, saved-but-unsubmitted cohort, status return view, one actual replay, anchored help guide, friction survey and dashboard resource center. Record project/asset URLs and draft/published state. Heatmaps conditional, explicitly marked if unavailable. Statsig: four page store/layer pairs, gate, config, configured metrics and one draft experiment; activation separate. No Amplitude Experiment entities.

## Final QA matrix (Phase 5 only)
Builder executes, Planner verifies. For each row store expected and observed result plus redacted payload, command, console URL or synthetic screenshot in docs/evidence/phase-5.md. Not run = BLOCKED. Use 390×844 and 1440×900, keyboard navigation, and reduced motion on shared pages. Network payloads must omit keys/secrets and sensitive fields.

| Case / steps | Expected observable result |
|---|---|
| Each loan type: fresh start → valid questions → offers → review → submit → dashboard | One shared structure; correct loan_type and application_id throughout; final status submitted |
| Save → close/reopen → resume → submit | Same ID/loan data; Application Resumed once per explicit resume; no replay of Started |
| Invalid fields → correction; double-click submit; refresh submitted page | Validation event with allowlisted code only; no submit until valid; one logical submission, no new submission on refresh |
| Tagged landing then different tagged session | First touch retained; session attribution changes by contract; both vendor payloads match |
| Anonymous → sign-up/sign-in during application | Same stable ID and assignment; known userID/traits updated before next event/evaluation |
| Sign out → different persona; new-user reset; application-only reset | Old identity cleared; sign-out/new user rotates unit; application reset retains unit but creates application ID |
| Two tabs editing same application | Serialize/reconcile persisted submission; no duplicate logical submission; log limitation if browser locking unsupported |
| Compare 17 business event payloads using controlled fixtures | Exact names, required properties and IDs; Amp types preserved; Statsig metadata strings; remote receipt separately verified |
| Preview override then live mode | Preview emits zero business outcomes/evaluation calls; live displays actual assignment/fallback; mode clearly visible |
| Open presenter; visit unused page later | Presenter adds zero exposures; only used parameters evaluated; raw evaluation/exposure evidence captured |
| Rapid profile switch during pending init/update | Stale async completion cannot overwrite current persona/assignment |
| Block SDK network; absent keys; malformed remote param | Safe defaults, functional UI, visible setup/fallback status; no other user's cache |
| Replay of synthetic submission; guide target and excluded persona; survey response | Replay loads with masking; guide correctly targeted/anchored; response received; published state verified |
| Keyboard and reduced motion at both viewports | All borrower controls reachable/usable, focus visible and errors announced, no overflow, nonessential movement removed |
| Deployed base home/apply/offers/dashboard refresh + hash deep links | No asset/route 404; correct route and focus; no hardcoded root-only paths |
| Inspect bundle/source/network | No server keys, no duplicate SDK init, no Amplitude Experiment fetch/config/evaluation; no Statsig replay/autocapture |
| Scripted cohort/experiment view | Traffic filter isolates scripted population; units/outcomes reconciled; no fabricated statistical claim |

Technical console errors may be logged locally or through a separately approved technical schema; do not expand the curated business-event list without Planner updating the map.
