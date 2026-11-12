# Provisioning gaps (running list)

Features the demo cannot exercise yet because the environment is not provisioned for them. Add a row whenever one is found; remove a row only with evidence that the feature works.

| Date | Service | Feature | Status | Impacted work | Needed to unblock |
|---|---|---|---|---|---|
| 2026-11-12 | Amplitude (EE sandbox 446257, project 905260) | Behavioral cohorts (paid feature) | RESOLVED 2026-11-12: Erin provisioned cohorts; the three AmpliLoan cohorts (`ioj44xe2`, `bnuw8dwc`, `14yez3z5`) exist and were verified (`docs/AMPLITUDE_ASSETS.md`). | none | none |
| 2026-11-12 | Statsig | Warehouse-native assignment source, metric sources, and experiment creation | Project `AmpliLoan [WHN]` is warehouse-native with no warehouse. Superseded by the plan to move to a Statsig Cloud project (see DECISIONS.md). | Experiment `ampliloan_application_reassurance_v1`, metrics (4C) | Create a Statsig Cloud project and re-provision entities there. |
