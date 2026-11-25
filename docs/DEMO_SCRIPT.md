# AmpliLoan demo script (talk track)

Site: https://erinshields.dev/els-ampliloan/ (hash routes; Presenter page at `#/presenter`). About 15 minutes. Status of each beat is marked **LIVE** (works today), **PARTIAL** or **NOT BUILT / NOT STARTED**. Nothing here has been re-run by the author of this document; every "what appears" line comes from the code and from earlier phase evidence. Check `docs/VERIFICATION.md` before presenting.

## Story in one breath
A campaign brings in a borrower, they hit friction in the application, Amplitude shows where and for whom conversion drops, Replay and feedback explain why, targeted help (a Statsig gate) and a Statsig-controlled improvement (an experiment) follow. One shared journey serves `personal`, `mortgage` and `small_business`; loan type is context only.

## Readiness at a glance
| Beat | Status today |
|---|---|
| Landing, one journey for 3 loan types, dashboard, presenter controls | LIVE |
| Amplitude business events, attribution, charts, dashboard, cohorts (project 905260) | LIVE (assets documented in `docs/AMPLITUDE_ASSETS.md`; chart values are tiny, make no conversion claims) |
| Amplitude Session Replay | PARTIAL: configured and upload requests seen; playback and masking were handed to the Planner and are not recorded as verified in repo files |
| Amplitude Guides, Surveys, Resource Center ("feedback") | NOT BUILT: phase 4B not run, nothing provisioned. The in-app Help panel is a normal React panel, not Resource Center |
| Statsig page parameters (hero, CTA, progress, hints, next steps) | LIVE: served by Statsig in Erin's Nov 25 check; fallbacks on failure |
| Statsig gate `ampliloan_contextual_help` (targeted help) | LIVE: true for the first-time persona |
| Statsig experiment `ampliloan_application_reassurance_v1` | NOT STARTED: exists in status `setup`; needs Erin's separate approval. Treatment can only be shown with local Preview overrides, which are not real assignment |
| Statsig metrics | PARTIAL: four `ampliloan_*` metrics exist, roll up daily; need data including one `Application Validation Failed` |
| Synthetic population runner (4E) | NOT BUILT: all data is hand-driven; do not call any chart "organic" |
| Amplitude as Statsig's analytics engine | NOT CONFIGURED (Erin's console work, see `docs/CONSOLE_SETUP.md`) |

## Before you start (2 minutes, off stage)
1. Open `https://erinshields.dev/els-ampliloan/#/presenter` (page titled "Demo controls"). Confirm **Preview mode** is unchecked.
2. Order matters: click **Start as a new demo user**, then **Yes, clear and start over**, THEN pick a persona and click **Apply persona**. Applying first and then starting a new user discards the persona. Repeat this order whenever you switch persona.
3. Keep a second tab on the Amplitude dashboard (`AmpliLoan - Demo overview`, ID `do8wdk80`) and one on the Statsig console (project `AmpliLoan [Cloud]`).
4. "Statsig values read this session" on the Presenter page is per tab. A second tab starts empty; application state and Stable ID are shared.

## Act 1: the campaign and the borrower (3 min), persona "First-time personal borrower" (LIVE)
| Time | Click | You see | Say |
|---|---|---|---|
| 0:00 | Presenter: new user, then persona First-time personal borrower, Apply persona | Message "Persona applied: first_time_personal." | "Meet a first-time borrower who arrived from paid search." (Persona first touch: google / cpc / `spring_rates`; a tagged URL such as `/els-ampliloan/?utm_source=google&utm_medium=cpc&utm_campaign=spring_rates#/` does the same for a real visit.) |
| 0:30 | Open Home (header "Home") | Hero with headline and "Check your rate" (text comes from Statsig, fallbacks otherwise) | "The headline and button text are Statsig parameters. Nothing is hard coded to a persona." |
| 0:45 | Click Check your rate | "Check your rate", Loan type radios | "One journey for every loan type." |
| 1:00 | Choose Personal loan, Continue | "Tell us about your personal loan", amount default $15,000, range $1,000 to $50,000 | |
| 1:15 | Look under the helper sentence | "Need help with this step?" link (only for this persona, from gate `ampliloan_contextual_help`) | "Targeted help is a Statsig gate. Other personas do not see it." |
| 1:30 | Clear the amount field, click Next | Validation error; this fires `Application Validation Failed` | "This is the friction." |
| 2:00 | Fix it, pick a purpose, Next | Offers: three illustrative offers with APR and estimated payment | "Offers are estimates, not approvals." |
| 2:30 | Select one, Continue to review | Review step, Edit links | |
| 2:45 | Tick the confirmation box, Submit | "Application submitted" | "`Application Submitted` fires once." |

## Act 2: where and for whom (3 min) (LIVE, small data)
1. In Amplitude open the dashboard. Show: Submissions by first-touch channel (`d7cn03z5`), Funnel: rate check to submission (`oky4pk9x`), Validation failures by step and error code (`4w0gtjrs`), Help requests by topic (`rcc7msxi`).
2. Say: "Funnel and channel show where traffic drops and from which campaign." Add: "These counts are a handful of test users, not a conversion result."
3. Show the cohort `AmpliLoan - Started application, not submitted (30d)` (`ioj44xe2`). Cohorts are not on the dashboard tile list; open them from Cohorts.

## Act 3: why (2 min) (PARTIAL / NOT BUILT)
- Session Replay: open Replays for the session you just ran, only if you have confirmed playback beforehand (not recorded as verified in repo). Inputs are configured to be masked; confirm in the replay that typed amounts are masked before claiming it.
- Feedback survey and guide: NOT BUILT (4B). Say "the next step is an Amplitude Survey on the details step"; do not show anything.

## Act 4: targeted help and the Statsig improvement (3 min)
1. Targeted help (LIVE): on the Presenter page the diagnostics list `ampliloan_contextual_help = true statsig` for the first-time persona. Switch persona (new user first, then Apply persona) to Returning mortgage borrower; the Apply details step has no help link and the gate reads false.
2. Experiment (NOT STARTED): explain `ampliloan_application_reassurance_v1` (control: no reassurance line; treatment: "Your answers are saved on this device as you go."). Show it in the Statsig console in status "setup". To illustrate the treatment, tick **Preview mode** and turn on `show_reassurance`; say clearly "this is a local override, not an assignment, and nothing is sent." Untick Preview afterwards.
3. Do not start the experiment during a demo. Starting needs Erin's separate named approval (see `docs/CONSOLE_SETUP.md`).

## Act 5: one journey, three loan types (2 min)
Repeat Act 1 quickly (new user first) with Mortgage (amount $100,000 to $1,000,000) and Small business loan ($5,000 to $500,000), or use the personas:
| Persona | Starting state | Use it to show |
|---|---|---|
| First-time personal borrower | No application; personal intent | Gate, journey |
| Returning mortgage borrower | Saved draft at offers | Resume; same funnel with `loan_type` mortgage |
| Business owner | No application; small business intent | Same journey, `small_business` context |
| Existing customer | Personal loan under review | Dashboard: status timeline, next steps (Statsig `show_next_steps`, default on), earlier applications |

Every loan-related event carries `loan_type`; final submission is `Application Submitted`.

## Dashboard and status (LIVE)
Open Dashboard. Status moves submitted, under review, result ready. Only the presenter changes it (Presenter, **Advance status one step**); say it is a presenter control, not a lending backend. There is no real underwriting, payment, upload or document storage.

## Wrap (1 min)
Recap: Amplitude finds and explains the drop; Statsig changes the experience for the right people and measures it. Be explicit about what is not running: experiment not started, Guides and Surveys not provisioned, no synthetic runner, Amplitude-as-Statsig-engine not configured.

## Recovery
- Values show `default (no_key)`: the build has no Statsig key (local mode). Not a Statsig outage.
- Persona seems ignored: you applied it before starting a new user. Redo in the right order.
- Diagnostics empty: you are in a second tab.
