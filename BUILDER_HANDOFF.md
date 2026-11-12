# Builder handoff — Phase 2
Status: START
Phase: 2
Revision: 3 (follow-up to revision 2; fixes found in Planner review)
Owner: Planner
Builder ID/link: see PROJECT_PLAN.md (same Builder; resume it)
Repository / authorized branch: theuncoolgirl/els-ampliloan. Continue on your existing branch `cursor/phase2-amplitude-360f` (head `6820fdb`); push to the same branch and update the same PR. Revision 2 text is in git history at `4a2330a` on `cursor/planner-phase2-start-360f`; it still applies except where this revision changes it.

## Activation
Erin Shields, Cursor chat, 2026-11-12 2:10 PM ET: "Start Phase 2 and real demo telemetry to Amplitude project 905260 is authorized". Planner review of `6820fdb` found two gaps below; this revision authorizes one more run within that authorization.

## Permissions
Unchanged from revision 2: Builder Commit Yes; Push Yes (own branch only); PR Yes (draft); Merge No; Deploy No. Planner Merge No unless Erin posts a named Approve for one PR and head SHA. Telemetry: the revision 2 cap of 3 journeys is spent; this revision adds exactly ONE clean re-run (journeys A, B, and C in one browser context as before). No other sends. No Statsig, no console entities.

## Findings from Planner review
1. P2.2 defect: events 1–2 in your capture carry device `ebed5497…` and later ones `1a02072e…`. You report a Phase 1 store fix (anonymous ID regenerated until first write) made after the capture. It is unproven live.
2. P2.4 masking unproven: the Planner read the replay `1a02072e…/1794511318959`. It shows radio and checkbox values but no typed amount, so masking of typed input was not exercised.
Confirmed by the Planner: events reach project 905260 (counts for the sampled event types match one journey); two replays exist. Receipt of IDs and property types is still to be verified after the re-run.

## Tasks
1. Inspect the Phase 1 store fix for the anonymous ID. Keep it only if it never changes `anonymousId` between first read and later writes, and stays a one-line-scope change to `src/state/**`. Confirm the unit test covers it. Do not change any other Phase 1 behavior.
2. Make masking explicit for typed values: the amount field (number input), selects, and checkboxes must be masked in replay with the SDK's documented option. If the installed typings need a different option than you used, fix it and cite the typings in the evidence file.
3. Run `npm run typecheck`, `npm run build`, `npm test`.
4. One clean live re-run on the production build (`npm run preview`), in a fresh browser context with empty storage. Journey: tagged landing (`?utm_source=google&utm_medium=cpc&utm_campaign=spring_rates#/`) → personal loan → TYPE a non-default amount (for example 18,250) and choose a purpose → offers → select → review → save → reload → resume → simulated sign-in → submit → dashboard (A); reload after sign-in (B); sign-out (C). Do not use the presenter page for personas during this run.
5. Capture request bodies with the API key redacted. Record: every `device_id` seen in the run (there must be exactly one before sign-out and exactly one new one after sign-out), `user_id` values, `insert_id` equals `business_event_id` for every event, event names and counts, and that the first event already carries the final pre-sign-out device ID. Record the Amplitude session ID, the app session ID, and the UTC window.
6. State in the evidence file: the typed amount you entered (so the Planner can look for it in the replay) and whether replay requests were sent. Do not claim masking worked; the Planner verifies it in the replay.
7. Update docs/evidence/phase-2.md (supersede the P2.2 and P2.4 notes with the new run; keep the old run recorded as superseded, with its IDs), add a `PHASE_LOG.md` entry, commit, push the same branch, and stop. Do not change Status or start Phase 3. Never print secret values.

## Allowed paths
Same as revision 2: `src/**`, `package.json`/`package-lock.json` (only `@amplitude/unified`), `.env.example`, `.github/workflows/pages.yml` (only the build-step env), `docs/SETUP.md`, `docs/evidence/phase-2.md`, `PHASE_LOG.md`. Exclude planning files and `docs/custom-events.yml`.

## Acceptance
P2.1–P2.4 in PROJECT_PLAN.md. Merging the PR changes `src/`, `package.json`, and the workflow, so it deploys the live site with telemetry on.
