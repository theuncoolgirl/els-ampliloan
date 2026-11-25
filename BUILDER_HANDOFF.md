# Builder handoff — Phase 4F revision 4F.4 (og:image host and integration doc update)
Status: START
Phase: 4F, small fix plus docs
Revision: 4F.4

Authority: Erin, Cursor chat, 10:16 AM ET Nov 25, 2026: "Apply the og:image host fix." Deploy is NOT granted in this handoff; Erin will grant it per merge.

## Permissions
Builder Commit Yes; Push Yes (own branch `cursor/phase4f-og-fix-360f` only); PR Yes (draft); Merge No; Deploy No. No console writes; no secret values. No `git stash`.

## Tasks
1. `index.html`: change `og:image` from `https://theuncoolgirl.github.io/els-ampliloan/images/og-image.png` to `https://erinshields.dev/els-ampliloan/images/og-image.png`. Search `index.html` and `src/` for any other absolute `theuncoolgirl.github.io` URL and fix those too; list what you found. Add `og:url` (`https://erinshields.dev/els-ampliloan/`) and `twitter:image` with the same image URL. Do not change titles or descriptions.
2. `docs/CONSOLE_SETUP.md`: replace the Amplitude and Statsig integration steps with these, which Planner read from the full Statsig pages on Nov 25 (cite the URLs; leave "not configured" and "Erin's console work"):
   - Overview https://docs.statsig.com/integrations/data-connectors/amplitude: five integrations; Amplitude Native, Amplitude metric source and Amplitude Experiment are early access and not enabled for every account (ask the Statsig or Amplitude account team). Only US-hosted Amplitude projects support Native and the metric source (AmpliLoan uses the US zone). Enabling Native and legacy event streaming for the same Amplitude project duplicates exposures.
   - Org link (needed for metric source and Native): in Amplitude find the org ID (number after `/org/` in a settings URL); in Statsig go to Settings > Manage Account > Info > Organization tab > Amplitude Linked Organization, enter the ID, save. The Statsig org admin's email must also be an Amplitude org admin. Then Project tab > Amplitude Linked Projects: pick the Amplitude project for each Statsig environment, mark one Primary. Warning: forwarded events cannot be removed and there is no backfill; link a test project first if one exists.
   - Metric source https://docs.statsig.com/integrations/data-connectors/amplitude/metric-source: prerequisites (org link, US data center, Cloud project). Statsig Data > Metric Sources > Create > pick the Amplitude project (one source per project) > Confirm. The source maps Amplitude User ID to Statsig User ID and Device ID to Stable ID (add other ID types with Add ID Type). Create Metric from the source: name, then define against an Amplitude event with aggregation (Count, Sum, Mean, Unit Count, Ratio) and filters. Computed in a daily batch, days bucketed in UTC offset. Record the open check: confirm the Stable ID the app sends to Statsig equals the Amplitude Device ID, per the repo's identity mapping docs, before relying on experiment results from this source.
   - Cohort sync https://docs.statsig.com/integrations/data-connectors/amplitude/cohort-sync: Statsig Project Settings > Keys & Environments > Generate New Key > type Console; in Amplitude add Statsig (Cohort Sync) as a cohort destination, paste the Console key, sync a saved cohort (existing AmpliLoan cohorts: `ioj44xe2`, `bnuw8dwc`, `14yez3z5`); appears under Segments in Statsig as an ID List within about 15 minutes of a sync. IDs synced are Amplitude user IDs: the gate and experiment use Stable ID, so a cohort-targeted gate needs an idType User ID gate (or user attribute) and only reaches signed-in users. Never write the key value in the repo or chat.
   - Native https://docs.statsig.com/integrations/data-connectors/amplitude: forwards exposures (`statsig::gate_exposure`, `statsig::experiment_exposure`, `statsig::config_exposure`, `statsig::layer_exposure`) and Statsig custom events; the app already sends business events to Amplitude directly, so forwarding Statsig custom events would duplicate them. Do not enable it for custom events; if it cannot be limited to exposures, do not enable it. Only first exposure per identity per config per UTC day is forwarded.
   - Legacy event streaming: do not use.
   - Add a short recommended order: (1) account-team enablement, (2) org link, (3) metric source, (4) optional cohort sync, (5) Native only if exposures-only is possible.
3. `docs/VERIFICATION.md`: mark the og:image item as fixed in this revision, and update the Statsig MCP limitation: as of Nov 25 10:16 AM ET the Planner's Statsig connection points to `AmpliLoan [Cloud]` (ID `6oe5DaLQIx5XnKfBrG0JnT`) and independently read the draft experiment (status `setup`, not started, layer `ampliloan_application_layer`, 50/50) and the gate (rule `first_time_borrowers`, description corrected). Also record that 12 of 16 curated event names had reached Statsig by then; not yet seen: Application Saved, Application Resumed, Application Task Completed, Sign Up Completed, Signed In.

## Verification
`npm run build` passes; the built `dist/index.html` has the erinshields.dev URLs; `rg theuncoolgirl.github.io index.html src dist` returns nothing; `git diff --stat origin/main HEAD` on the pushed branch lists `index.html` and the two docs.

## Result
Draft PR to `main`, `PHASE_LOG.md` entry, set this file to `Status: IDLE` on your branch, stop. No deploy.
