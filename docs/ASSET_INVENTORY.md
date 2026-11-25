# Asset inventory: Amplitude and Statsig

Reconciled from `docs/AMPLITUDE_ASSETS.md` (read 2026-11-25) and `docs/STATSIG_INVENTORY.md`. Status is what those files record; nothing was re-read from the consoles for this document. IDs are copied exactly; where the two documents disagree it is flagged under "Disagreements" instead of resolved.

## Amplitude (org 446257, US; project 905260; created 2026-11-12, owner Erin, unpublished)
| Type | Name | ID | Purpose | Status | Documented in |
|---|---|---|---|---|---|
| Dashboard | AmpliLoan - Demo overview | do8wdk80 | Landing view for the story | Created, unpublished, unshared | AMPLITUDE_ASSETS.md |
| Chart | Submissions by first-touch channel | d7cn03z5 | Attribution to submission | Saved | same |
| Chart | Submissions by campaign and loan type | yrdsdzwl | Campaign and loan type slice | Saved | same |
| Chart | Funnel: rate check to submission (users) | oky4pk9x | User-level funnel, 7-day window | Saved | same |
| Chart | Funnel: application to submission (per application, by loan type) | r4a78shn | Application-level funnel, `application_id` held constant | Saved | same |
| Chart | Validation failures by step and error code | 4w0gtjrs | Friction | Saved | same |
| Chart | Save, resume and dashboard activity | wr4hwe19 | Return behaviour | Saved | same |
| Chart | Help requests by topic | rcc7msxi | Help usage | Saved | same |
| Cohort | AmpliLoan - Started application, not submitted (30d) | ioj44xe2 | Friction audience | Active, size 1 when read | same |
| Cohort | AmpliLoan - Viewed offers, did not select (30d) | bnuw8dwc | Offer hesitation | Active, size 1 | same |
| Cohort | AmpliLoan - Returned to a saved application (30d) | 14yez3z5 | Resume behaviour | Active, size 1 | same |
| Cohort (archived, do not use) | duplicates | lzv2xsg3, dxcan1gy, mgb3031z | none | Archived by Erin | same |
| Guides, Surveys, Resource Center | not created | none | Phase 4B | NOT PROVISIONED | PROJECT_PLAN.md |
| Heatmaps | not created | none | conditional | NOT BUILT | METRICS_AND_QA.md |
| Session Replay | configured in the SDK (project setting not read from console) | none | Explain friction | Upload requests seen; playback and masking not recorded as verified | docs/evidence/phase-2.md |

## Statsig, project `AmpliLoan [Cloud]` ID `6oe5DaLQIx5XnKfBrG0JnT` (current)
Created 2026-11-12 23:04:44-55Z (entities), 23:13Z (metrics, experiment). Console: https://staging.console.statsig.com/6oe5DaLQIx5XnKfBrG0JnT
| Type | Name | ID | Purpose | Default / status | Documented in |
|---|---|---|---|---|---|
| Layer | ampliloan_home_layer | same as name | hero_headline, cta_label | Defaults served to all | STATSIG_INVENTORY.md |
| Layer | ampliloan_application_layer | same | show_reassurance (false), progress_style ("steps") | Defaults; the experiment is attached but not started | same |
| Layer | ampliloan_offers_layer | same | show_comparison_hint (false) | Defaults | same |
| Layer | ampliloan_dashboard_layer | same | show_next_steps (true) | Defaults | same |
| Parameter store | ampliloan_home | 3y4tImqDP2JzeEDhFJLymz | Reads home layer | Bound | same |
| Parameter store | ampliloan_application | 3BNzAoluZw18gDrl7wAUHG | | Bound | same |
| Parameter store | ampliloan_offers | 3CwtSBdqA5pWY8mhj727p7 | | Bound | same |
| Parameter store | ampliloan_dashboard | 3EIFykZ3LVvIyES8xd5eWS | | Bound | same |
| Gate | ampliloan_contextual_help | ampliloan_contextual_help | Contextual help for first-time borrowers; default false | One rule `first_time_borrowers` (ID 3H1GVhuDB1LYeb6bsFCS3R: `borrowing_experience` any of `first_time`, 100%); description corrected in the console (Planner read, Nov 25) | same |
| Dynamic config | ampliloan_support_content | ampliloan_support_content | Help panel heading, body, max_items | Default `{heading:"Help", body:"", max_items:5}`, no rules | same |
| Metric | ampliloan_application_submitted_users | ampliloan_application_submitted_users::event_user | Experiment primary | Defined; custom 1-day window (0 to 1) written in 4C.4, not confirmed by read-back | same (rev 4C.3) |
| Metric | ampliloan_application_saved_users | ...::event_user | Secondary | Defined | same |
| Metric | ampliloan_offer_selected_users | ...::event_user | Secondary | Defined | same |
| Metric | ampliloan_validation_failed_count | ampliloan_validation_failed_count::event_count_custom | Guardrail, decrease | Defined; needs an `Application Validation Failed` event | same |
| Experiment | ampliloan_application_reassurance_v1 | none recorded (control group 4XR9aEueKE1cYUa8Pd0vTU, treatment 4XR9aG9hcWaHijI4qkW9cW) | Reassurance line vs none | `setup`, NOT STARTED, 50/50 on layer `ampliloan_application_layer`, unit Stable ID | same |
| Built-in metrics | mau_28d, new_mau_28d, l14, l28 | n/a | Statsig defaults, not ours | Populate immediately | docs/VERIFICATION.md |

## Statsig, old project `AmpliLoan [WHN]` ID `363sCqDdACZXt4M88ZqiKa`
SUPERSEDED and untouched. Has the first copies of the gate, config, layers and stores. The Statsig MCP the Planner uses is still bound to this project.

## Disagreements and stale text (flagged, not resolved)
1. `STATSIG_INVENTORY.md` main table gives store IDs `YWTl4E33mPmYJjhrjXG3l`, `ZDMfK0Fowz7wohsxrIOkQ`, `10fQQK8ElPNovUraM6AgVS`, `1169qA5ZoX8l5ubZIlGQeW` and rule ID `ytc41AcZcgDgMS4U8Bl3s`. The "revision 4C.2, current" section gives different store IDs and rule ID (used above) for the Cloud project. The main table appears to describe the superseded WHN project but is not labelled so. This inventory uses the Cloud IDs.
2. `STATSIG_INVENTORY.md` says the experiment was "NOT created" (rev 4C.1, WHN project) and later that it exists in `setup` (rev 4C.3, Cloud). Both can be true (different projects); the sections are also ordered 4C.3 above 4C.2.
3. `docs/SETUP.md` (Statsig section) still says entities are "all `not provisioned`" and, in the Amplitude section, "no Statsig key exists". Superseded by the workflow, which passes `VITE_STATSIG_CLIENT_KEY`.
4. `AMPLITUDE_ASSETS.md` says `Application Task Completed` has not been received. `STATSIG_INVENTORY.md` says `Application Validation Failed` had not been received by the Cloud project on 2026-11-12. Erin's Nov 25 checks may have changed either; not re-read.
5. `docs/METRICS_AND_QA.md` recommends filtering Statsig metrics by `traffic_type=live_demo`; the metric records above list no such filter.
6. RESOLVED: the gate description was corrected in the console (Planner read, Nov 25 2026); the old "No rules" text in `STATSIG_INVENTORY.md` is now updated.
7. Code comment/wording in `STATSIG_INVENTORY.md` refers to "simulated tasks"; the borrower UI no longer uses that wording.
