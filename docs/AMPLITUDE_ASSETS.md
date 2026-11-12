# Amplitude assets (Phase 4 slice 4A)

Project 905260, org 446257 (US). Created 2026-11-12 ~5:36-5:38 PM ET by the Planner through the Amplitude MCP, on Erin's "GO 4a". Nothing existing was edited or deleted. Data is synthetic demo traffic; test and live demo traffic are not separated (Erin, 2026-11-12). All assets are in Erin's personal space and unpublished (not shared with teammates).

## Dashboard
| Name | ID | URL |
|---|---|---|
| AmpliLoan - Demo overview | do8wdk80 | https://app.amplitude.com/analytics/ee-se-custom-sandbox/dashboard/do8wdk80 |

## Charts (saved; window Last 30 Days; unit as noted)
| Chart | ID | Type, unit, grouping |
|---|---|---|
| Submissions by first-touch channel | d7cn03z5 | Segmentation; unique users with Application Submitted; group first_touch_channel |
| Submissions by campaign and loan type | yrdsdzwl | Segmentation; unique users; group first_touch_campaign, loan_type |
| Funnel: rate check to submission (users) | oky4pk9x | Funnel; users; Rate Check Started, Offers Viewed, Offer Selected, Application Submitted; 7-day window; ordered |
| Funnel: application to submission (per application, by loan type) | r4a78shn | Funnel; users with `application_id` held constant; Application Started, Offers Viewed, Offer Selected, Application Submitted; group loan_type; 7-day window |
| Validation failures by step and error code | 4w0gtjrs | Segmentation; event totals; group step_id, validation_error_code |
| Save, resume and dashboard activity | wr4hwe19 | Segmentation; unique users; Application Saved, Application Resumed, Application Status Viewed |
| Help requests by topic | rcc7msxi | Segmentation; event totals; group help_topic |

The two funnels use different units (users from Rate Check Started versus applications from Application Started) and are not expected to match.

## Cohorts: NOT VERIFIED
The create call returned IDs and a size of 1 for each, but reading them back by ID, listing, and searching all return "not found", so their existence and definitions are unconfirmed. They were not recreated, to avoid duplicates.
| Intended cohort | Returned ID | Definition |
|---|---|---|
| Started application, not submitted (30d) | ioj44xe2 | Application Started >= 1 in 30 days AND NOT Application Submitted |
| Viewed offers, did not select (30d) | bnuw8dwc | Offers Viewed >= 1 AND NOT Offer Selected |
| Returned to a saved application (30d) | 14yez3z5 | Application Saved >= 1 AND Application Resumed >= 1 |
Check in the Amplitude audiences list for names starting "AmpliLoan"; if absent, they need to be created in the UI or the tool path investigated.

## Known limits
- `Application Task Completed` has not been received yet, so no dashboard-task chart exists; the event does not exist in the project taxonomy until a task is completed.
- Chart values are tiny (a handful of test users); no conversion claim should be made from them.
- The dashboard was not published or shared, and no subscription was created.
