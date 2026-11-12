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

## Cohorts (created 2026-11-12 ~6:08 PM ET after Erin provisioned cohorts; read back and verified)
The three earlier IDs (`ioj44xe2`, `bnuw8dwc`, `14yez3z5`) never existed and are void.
| Cohort | ID | Definition (rolling 30 days) | Size at creation |
|---|---|---|---|
| AmpliLoan - Started application, not submitted (30d) | lzv2xsg3 | Application Started >= 1 AND NOT Application Submitted >= 1 | 3 |
| AmpliLoan - Viewed offers, did not select (30d) | dxcan1gy | Offers Viewed >= 1 AND NOT Offer Selected >= 1 | 1 |
| AmpliLoan - Returned to a saved application (30d) | mgb3031z | Application Saved >= 1 AND Application Resumed >= 1 | 1 |
Dynamic (type redshift), owned by Erin, unpublished. Not yet added to the dashboard (the dashboard tool has no cohort tile).

## Known limits
- `Application Task Completed` has not been received yet, so no dashboard-task chart exists; the event does not exist in the project taxonomy until a task is completed.
- Chart values are tiny (a handful of test users); no conversion claim should be made from them.
- The dashboard was not published or shared, and no subscription was created.
