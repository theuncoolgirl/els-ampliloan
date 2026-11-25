# Console setup

Names and steps only; no secret values. Read 2026-11-25 from `docs/SETUP.md`, `docs/STATSIG_INVENTORY.md`, `docs/AMPLITUDE_ASSETS.md`, `.github/workflows/pages.yml`, `.env.example` and the Statsig and Amplitude docs cited below. Console UI labels are quoted from those docs and were not re-checked in a live console.

## 1. Keys and where each lives
| Name | Kind | Where it lives | Used by |
|---|---|---|---|
| `VITE_AMPLITUDE_API_KEY` | Browser-safe Amplitude project key (project 905260) | GitHub Actions repository secret of the same name; local `.env.local` for dev | Build step of the Pages workflow; bundled into the public site by design |
| `VITE_AMPLITUDE_SERVER_ZONE` | Public setting | Set to the literal `US` in the workflow; `.env.example` | Same |
| `VITE_STATSIG_CLIENT_KEY` | Browser-safe Statsig client key; must belong to project `AmpliLoan [Cloud]` | GitHub Actions repository secret of the same name; `.env.local` | Same. If unset, the site runs in Statsig local mode (defaults only, no vendor requests) |
| `VITE_STATSIG_ENVIRONMENT` | Optional | `.env.example`; empty means SDK default | Not passed by the workflow |
| `STATSIG_CONSOLE_API_KEY` | Console (management) secret. NOT browser-safe | Agent/operator secret store only. Never in a `VITE_` variable, the repo, the build or chat | Console API automation (entity creation, experiment control); also what Amplitude needs for cohort sync if Erin chooses that (section 5) |

Rule: only `VITE_` values may reach the browser bundle. Changing a GitHub secret does not redeploy; a change under a path the workflow lists (`src/**`, `public/**`, `index.html`, `package.json`, `package-lock.json`, `tsconfig*.json`, `vite.config.*`, the workflow file) on `main` does.

## 2. GitHub Actions and Pages deploy
1. Repository Settings > Secrets and variables > Actions: add `VITE_AMPLITUDE_API_KEY` and `VITE_STATSIG_CLIENT_KEY` as secrets (Erin).
2. Settings > Pages: source GitHub Actions (already set). Site: https://erinshields.dev/els-ampliloan/ (Vite base `/els-ampliloan/`, hash routes).
3. Workflow `.github/workflows/pages.yml` runs on push to `main` for the listed paths only; no manual trigger, no PR trigger. It builds with the three env names above, then configures, uploads and deploys Pages.
4. After a deploy, load the site fresh and open `#/presenter` to check `docs/VERIFICATION.md` section 2.

## 3. Statsig Cloud entity map
Project `AmpliLoan [Cloud]`, ID `6oe5DaLQIx5XnKfBrG0JnT`, console https://staging.console.statsig.com/6oe5DaLQIx5XnKfBrG0JnT (staging host). Full ID table: `docs/ASSET_INVENTORY.md`.
| Entity | Name | Default or rule |
|---|---|---|
| Layer + store | `ampliloan_home_layer` / `ampliloan_home` | `hero_headline` "A clearer path to the loan you need"; `cta_label` "Check your rate" |
| Layer + store | `ampliloan_application_layer` / `ampliloan_application` | `show_reassurance` false; `progress_style` "steps" (or "bar") |
| Layer + store | `ampliloan_offers_layer` / `ampliloan_offers` | `show_comparison_hint` false |
| Layer + store | `ampliloan_dashboard_layer` / `ampliloan_dashboard` | `show_next_steps` true |
| Gate | `ampliloan_contextual_help` | false; rule `first_time_borrowers`: custom field `borrowing_experience` any of `first_time`, 100% (ID type Stable ID) |
| Dynamic config | `ampliloan_support_content` | `{"heading":"Help","body":"","max_items":5}` |
| Metrics | `ampliloan_application_submitted_users` (primary), `ampliloan_application_saved_users`, `ampliloan_offer_selected_users`, `ampliloan_validation_failed_count` (guardrail, decrease) | Daily rollup; rollup window not set (undecided) |
| Experiment | `ampliloan_application_reassurance_v1` | Status `setup`; control `show_reassurance` false, treatment true; 50/50; layer `ampliloan_application_layer`; unit Stable ID. NOT STARTED |

## 4. Amplitude assets
Org 446257 (US), project 905260. Dashboard `AmpliLoan - Demo overview` (`do8wdk80`); charts `d7cn03z5`, `yrdsdzwl`, `oky4pk9x`, `r4a78shn`, `4w0gtjrs`, `wr4hwe19`, `rcc7msxi`; cohorts `ioj44xe2`, `bnuw8dwc`, `14yez3z5`. Everything is in Erin's personal space and unpublished. To share: publish the dashboard and share it from Amplitude (Erin). Source: `docs/AMPLITUDE_ASSETS.md`. Not provisioned: Guides, Surveys, Resource Center, Heatmaps (see PROJECT_PLAN.md 4B).

## 5. Start and stop the experiment (Erin only)
Status today: `setup`, never started. Do not start it as a side effect of any other work.
Start:
1. Erin gives a separate, named approval for starting `ampliloan_application_reassurance_v1`.
2. Before starting, decide and record the metric rollup window (the Planner will state the API default at finalization) and confirm the metric unit is Stable ID, matching the experiment.
3. In the Statsig console open the experiment and start it (button names not verified here).
4. Verify with a fresh Stable ID that the Apply details step shows or hides the reassurance line, and that the Presenter shows the source as `statsig`.
Stop:
1. Stop the experiment in the console.
2. In a browser with a fresh Stable ID (Presenter: Start as a new demo user), open Apply and check the Presenter diagnostics show the layer defaults: `show_reassurance = false`, `progress_style = "steps"`.
3. Record the result in `PHASE_LOG.md`.

## 6. Amplitude with Statsig: options (all Erin's console work; none done)
Current status of every option: **not configured**. Sources, re-read 2026-11-12 to 2026-11-25 through the search tool (excerpts, not full pages): Statsig docs index https://docs.statsig.com/integrations/data-connectors/amplitude, metric source https://docs.statsig.com/integrations/data-connectors/amplitude/metric-source, cohort sync https://docs.statsig.com/integrations/data-connectors/amplitude/cohort-sync, legacy https://docs.statsig.com/integrations/data-connectors/amplitude/legacy, Amplitude's page on forwarded events https://amplitude.com/docs/data/statsig-forwarded-events.
| Option | Direction, status | Prerequisites | Steps (Erin) |
|---|---|---|---|
| Amplitude events as a metric source | Amplitude to Statsig, Cloud, early access | Statsig org linked to the Amplitude org; US Amplitude project (project 905260 is US); Statsig Cloud project; access enabled by the Statsig or Amplitude account team | In Statsig: Data > Metric Sources > Create, pick the Amplitude project, Confirm; open the source, Create Metric against an Amplitude event with an aggregation. One source per Amplitude project. Computed once a day in UTC-offset daily buckets. Device ID maps to Stable ID, User ID to User ID |
| Amplitude cohort sync | Amplitude to Statsig, generally available | A saved Amplitude cohort; admin on the Statsig project to create a Console API key | Statsig: Project Settings > Keys & Environments > Generate New Key > Console. In Amplitude add Statsig as a cohort destination, paste the key, sync a cohort (for example `ioj44xe2`). Cohort appears in Statsig Segments as an ID List within about 15 minutes of a sync. Never paste the key anywhere else |
| Amplitude Native | Statsig to Amplitude, early access, Cloud and Warehouse Native | Org link; US project; enablement from the account team | Link orgs from a Statsig org-admin account whose email is also an Amplitude admin; enable Native for project 905260. Forwarded events cannot be removed from Amplitude later and there is no backfill |
| Legacy event streaming | Both directions, legacy | API keys | Do not use. Enabling it together with Native duplicates exposures |
Cautions:
1. Native forwards Statsig custom events as well as exposures. This app already sends the same business events to Amplitude directly, so enabling Native forwarding of custom events would duplicate them. Do not enable it for custom events; if Native is used, limit it to exposures.
2. Cohort sync matches user IDs. The gate and experiment here use Stable ID. A synced cohort can only target a user-ID-based gate or an attribute; it will not match an anonymous visitor. Pick a user-ID-based gate or pass an attribute before relying on it.

## 7. Known limitations
See `docs/VERIFICATION.md` section 6.
