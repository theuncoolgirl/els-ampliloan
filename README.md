# AmpliLend — final Steps 2 and 3 package
Prepared November 11, 2026. Planning only; no website code, SDK connection, console entities, or experiment activation performed.

## Contents
- PROJECT_PLAN.md: six phases, scoped files, risks, permissions, evidence and completion checks.
- docs/custom-events.yml: 17 curated business events, typed properties, audience traits, identity and vendor mappings.
- BUILDER_HANDOFF.md: numbered Phase 0 tasks; Status IDLE pending implementation instruction and actual repo/branch.
- docs/INTEGRATION_NOTES.md: official documentation links and implementation decisions.
- docs/STATSIG_PROPOSAL.md: concrete store/layer/gate/config and first-experiment proposal; no provisioning permission.
- docs/METRICS_AND_QA.md: audience use cases, measurement recipes, console inventory and final QA.
- DECISIONS.md / PHASE_LOG.md: intentionally empty starter files, as requested. Existing design decisions remain in PROJECT_PLAN.md and docs/INTEGRATION_NOTES.md.
- PROJECT_BRIEF.md / AGENTS.md / PLANNER.md / BUILDER.md / UX.md: unchanged copies of existing brief and reviewed role specs.

Copy these into the intended repository root; preserve any newer existing files and reconcile before overwrite. No scripts or dependencies are included because Phase 0 belongs to Builder.

## Suggested next prompt for Cursor Planner
Read AGENTS.md, PLANNER.md, PROJECT_BRIEF.md, PROJECT_PLAN.md, DECISIONS.md and BUILDER_HANDOFF.md. Begin Phase 0 local implementation through one Builder. First verify the repository, branch, capabilities and existing work; record the actual Builder ID. Activate a new handoff revision after those are known. Keep Git and external-service actions disabled unless I explicitly authorize them. Use Cursor chat for all communication with me. Complete the local scaffold checks and return a reviewable diff; do not merge, deploy, connect SDKs, create console entities or start experiments.

## What remains to supply
Actual repository/branch, verified Cursor capabilities, later Amplitude demo project/region/public API key and Statsig demo project/environment/public client key through configuration (not chat). Console entitlements and target URLs must be verified. These do not block reviewing this plan or, once instructed in Cursor, local scaffolding.

## Validation of this package
YAML parsed; 17 unique event names; all required/optional property references resolve; every application event has application and loan context; no Step Completed event; all phases have criteria; handoff is Phase 0 revision 1 IDLE with permissions No. This validates planning consistency, not application behavior. Actual test and remote delivery evidence remains for Builder.
