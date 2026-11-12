# Builder handoff — Phase 2
Status: START
Phase: 2
Revision: 4 (masking evidence only)
Owner: Planner
Builder ID/link: see PROJECT_PLAN.md (same Builder; resume it)
Repository / authorized branch: theuncoolgirl/els-ampliloan. Continue on `cursor/phase2-amplitude-360f` (head `259a1b5`), same draft PR #12. Revisions 2 and 3 still apply except where this one changes them (git history on `cursor/planner-phase2-start-360f`).

## Activation
Erin Shields, Cursor chat, 2026-11-12 2:10 PM ET ("Start Phase 2 and real demo telemetry to Amplitude project 905260 is authorized") and 2:35 PM ET (the replay from revision 3 was only about 10 seconds and did not show the amount form; Erin asked for another one).

## Permissions
Unchanged: Builder Commit Yes; Push Yes (own branch only); PR Yes (draft); Merge No; Deploy No. Telemetry: exactly ONE more live run, below. No other sends. No Statsig, no console entities, no population.

## Why
In replay `f6d67c0f…/1794511713129` the Planner saw the apply page only briefly and no typed amount: the scripted run moved through the details step too fast and reloaded mid-journey, so masking of typed input is still unproven. Everything else in revision 3 is verified and must not change.

## Tasks
1. Do not change product code unless you find a masking defect. If you do, fix only that, run `npm run typecheck`, `npm run build`, `npm test`, and say so in the evidence file.
2. One live run on the production build (`npm run preview`) in a fresh browser context with empty storage, paced like a person and with NO mid-journey reload and NO presenter page: tagged landing (`?utm_source=google&utm_medium=cpc&utm_campaign=spring_rates#/`), pause 3 s, click through to apply, choose personal and continue, then on the details step stay at least 8 s: click the amount field, type `18250` one character at a time with about 200 ms between keys, pause 2 s, change it to `21500` the same way, pause 2 s, choose a purpose, pause 2 s, continue; on offers pause 4 s and select an offer; on review pause 3 s, tick consent, pause 2 s, submit; on the dashboard stay at least 8 s and open the loan details panel. Then wait at least 15 s before closing the browser context, so replay data flushes. Total time at least 60 s.
3. Capture request bodies with the API key redacted. Record the exact device ID, Amplitude session ID, app session ID, UTC window, the two typed values, the event names and counts, and the number of replay upload requests. Do not claim masking worked; the Planner and Erin verify it in the replay.
4. Update docs/evidence/phase-2.md (add this run; keep earlier runs recorded) and a `PHASE_LOG.md` entry, commit, push the same branch, and stop. Do not change Status or start Phase 3. Never print secret values.

## Allowed paths
Same as revision 3, but the expectation is documentation only: `docs/evidence/phase-2.md`, `PHASE_LOG.md`, plus `src/**` only if task 1 finds a masking defect.

## Acceptance
P2.4: a replay of at least 45 s that shows the details step, in which the typed amount is not readable in the replay. Merging PR #12 deploys the live site with telemetry on.
