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
2. Confirm the 1-day metric window (written in 4C.4, unconfirmed by API read-back) in the console and confirm the metric unit is Stable ID, matching the experiment.
3. In the Statsig console open the experiment and start it (button names not verified here).
4. Verify with a fresh Stable ID that the Apply details step shows or hides the reassurance line, and that the Presenter shows the source as `statsig`.
Stop:
1. Stop the experiment in the console.
2. In a browser with a fresh Stable ID (Presenter: Start as a new demo user), open Apply and check the Presenter diagnostics show the layer defaults: `show_reassurance = false`, `progress_style = "steps"`.
3. Record the result in `PHASE_LOG.md`.

## 6. Amplitude with Statsig: integration steps (all Erin's console work; none done)
Current status of every option: **not configured**. Source pages (full text read by the Planner on Nov 25 2026): overview https://docs.statsig.com/integrations/data-connectors/amplitude, metric source https://docs.statsig.com/integrations/data-connectors/amplitude/metric-source, cohort sync https://docs.statsig.com/integrations/data-connectors/amplitude/cohort-sync. UI labels below come from those pages and were not re-checked in a console by the Builder.

### Overview (https://docs.statsig.com/integrations/data-connectors/amplitude)
- Five integrations: Amplitude Native (Statsig to Amplitude), Amplitude events as a metric source (Amplitude to Statsig, Cloud), Amplitude Experiment, Amplitude cohort sync (generally available), and Amplitude event streaming (legacy).
- Amplitude Native, the metric source and Amplitude Experiment are early access and not enabled for every account. Ask the Statsig or Amplitude account team for access.
- Only US-hosted Amplitude projects support Native and the metric source. AmpliLoan uses the US zone (project 905260).
- Enabling Native and legacy event streaming for the same Amplitude project duplicates exposures in Amplitude.

### Org link (needed for the metric source and Native)
1. In Amplitude, find the org ID: the number after `/org/` in a settings URL.
2. In Statsig go to Settings > Manage Account > Info > Organization tab > Amplitude Linked Organization, enter the ID and save. The Statsig org admin's email must also be an Amplitude org admin.
3. Then on the Project tab > Amplitude Linked Projects: pick the Amplitude project for each Statsig environment and mark one Primary.
4. Warning: forwarded events cannot be removed from Amplitude and there is no backfill. Link a test project first if one exists.

### Metric source (https://docs.statsig.com/integrations/data-connectors/amplitude/metric-source)
1. Prerequisites: org link, US data center, Statsig Cloud project (`AmpliLoan [Cloud]`).
2. Statsig: Data > Metric Sources > Create > pick the Amplitude project (one source per project) > Confirm.
3. The source maps Amplitude User ID to Statsig User ID and Device ID to Stable ID. Add other ID types with Add ID Type.
4. Create Metric from the source: give a name, then define it against an Amplitude event with an aggregation (Count, Sum, Mean, Unit Count, Ratio) and optional filters.
5. Computed in a daily batch; days are bucketed in the organization's UTC offset.
6. OPEN CHECK before relying on experiment results from this source: confirm the Stable ID the app sends to Statsig equals the Amplitude Device ID, using the repo's identity mapping docs (`docs/INTEGRATION_NOTES.md`, `src/identity/`). Not verified.

### Cohort sync (https://docs.statsig.com/integrations/data-connectors/amplitude/cohort-sync)
1. Statsig Project Settings > Keys & Environments > Generate New Key > type Console.
2. In Amplitude add Statsig (Cohort Sync) as a cohort destination, paste the Console key, and sync a saved cohort. Existing AmpliLoan cohorts: `ioj44xe2`, `bnuw8dwc`, `14yez3z5`.
3. The cohort appears under Segments in Statsig as an ID List within about 15 minutes of a sync.
4. The IDs synced are Amplitude user IDs. The gate and experiment here use Stable ID, so a cohort-targeted gate needs an idType User ID gate (or a user attribute) and only reaches signed-in users.
5. Never write the key value in the repo or chat.

### Amplitude Native (https://docs.statsig.com/integrations/data-connectors/amplitude)
- Forwards exposures (`statsig::gate_exposure`, `statsig::experiment_exposure`, `statsig::config_exposure`, `statsig::layer_exposure`) and Statsig custom events. Only the first exposure per identity per config per UTC day is forwarded.
- The app already sends its business events to Amplitude directly, so forwarding Statsig custom events would duplicate them. Do not enable Native for custom events. If it cannot be limited to exposures, do not enable it.

### Legacy event streaming
Do not use.

### Recommended order
1. Account-team enablement. 2. Org link. 3. Metric source. 4. Optional cohort sync. 5. Native only if exposures-only is possible.

## 7. Known limitations
See `docs/VERIFICATION.md` section 6.
