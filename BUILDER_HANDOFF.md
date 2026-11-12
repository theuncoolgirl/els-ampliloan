# Builder handoff — Phase 3
Status: START
Phase: 3
Revision: 3.3 (finish layers and parameter stores through the Console API; one live binding check; small presenter fix)
Owner: Planner
Builder ID/link: see PROJECT_PLAN.md (same Builder; resume it)
Repository / authorized branch: theuncoolgirl/els-ampliloan. Continue on `cursor/phase3-statsig-360f` (head `4d8eeae`), same draft PR #15. Read this handoff from `cursor/planner-phase3-start-360f`. Revisions 3.1 and 3.2 apply except where this one changes them.

## Activation
Erin Shields, Cursor chat, 2026-11-12 3:17 PM ET (entities and live Statsig traffic authorized) and 3:44 PM ET ("Use the console API key for the entities"). The Planner reads setting a just-created entity's parameters as part of creating it, and so extends the permission below; Erin is told in chat.

## Planner verification of revision 3.2 (read-only Statsig and Amplitude MCP)
Gate `ampliloan_contextual_help` and config `ampliloan_support_content` exist with the intended values (gate: no rules; config: `{heading:"Help", body:"", max_items:5}`), created "via CONSOLE API", no review pending. Statsig's log has `Application Submitted` (no value, all-string metadata) with `business_event_id` `353db122-a319-49a7-a803-8629467536b4`; Amplitude has the same ID. The gate not appearing in the client initialize payload is accepted as a known observation (a gate with no rules); do not add a rule.

## Permissions
Builder: Commit Yes; Push Yes (own branch only, never `main`); PR Yes (draft); Merge No; Deploy No.
Planner: Commit Yes; Push Yes (planning branches); PR Yes; Merge No unless Erin posts a named Approve for one PR and head SHA; Deploy No.
Console API (project `AmpliLoan [WHN]`, ID `363sCqDdACZXt4M88ZqiKa`, key from the environment variable `VITE_STATSIG_CONSOLE_KEY`): authorized to (a) POST the 4 layers and 4 parameter stores below if they do not exist, (b) PATCH or PUT ONLY those 8 entities and ONLY to set their parameter definitions (names, types, default values, and the store-to-layer references), and (c) GET entities you created, for verification. Still not authorized: DELETE; any change to the gate or the config (they are verified; leave them); any endpoint touching API or SDK keys; experiments, holdouts, segments, metrics, warehouse, project, member, role, or environment settings; any rule, rollout, percentage, or targeting that changes a served value; self-approving a review. If a PATCH needs a field you are unsure about, read the documentation (https://docs.statsig.com/console-api/); never send undocumented fields; if an entity cannot be completed, leave no half-built state you cannot describe, record the exact status and message, and stop that entity.
Telemetry: live Statsig and Amplitude client traffic remains authorized with `VITE_STATSIG_CLIENT_KEY` and `VITE_AMPLITUDE_API_KEY`. Cap for this revision: exactly 1 live journey. No synthetic population. Slack is retired.

## Key handling (strict, unchanged)
Never print, echo, log, or write the console key (also not in evidence, PR text, captures, or any file). Run API calls from a script outside the repository (for example /tmp) and delete it afterwards. Run EVERY `npm`, `vite`, build, preview, and test command with `env -u VITE_STATSIG_CONSOLE_KEY`, and prove `dist/` has no occurrence of the key value without printing it (prefixes of 9 or more characters; the 8-character coincidence inside rrweb file names you reported is known and fine). If the variable is missing or a call returns 401 or 403, record BLOCKED (yes or no and the HTTP status only) and stop console work.

## Entities (exactly; types and defaults as in `src/integrations/pageParameters.ts`)
| Layer (unit `stableID`) | Parameters | Parameter store (each parameter references the same-named layer parameter) |
|---|---|---|
| `ampliloan_home_layer` | `hero_headline` string "A clearer path to the loan you need"; `cta_label` string "Check your rate" | `ampliloan_home` |
| `ampliloan_application_layer` | `show_reassurance` boolean false; `progress_style` string "steps" | `ampliloan_application` |
| `ampliloan_offers_layer` | `show_comparison_hint` boolean false | `ampliloan_offers` |
| `ampliloan_dashboard_layer` | `show_next_steps` boolean true | `ampliloan_dashboard` |

No experiment is created; layers serve their defaults to everyone.

## Numbered tasks
1. Verify the repository and tree, fetch both branches, continue on your branch. Log yes or no only for whether `VITE_STATSIG_CONSOLE_KEY`, `VITE_STATSIG_CLIENT_KEY`, and `VITE_AMPLITUDE_API_KEY` exist.
2. Console: read `GET` lists first to see whether any of the 8 exist (they should not). Create layers, then set their parameters; create stores, then set their parameters and layer references; after each step GET the entity and compare to the table. Record every call as method, path, status, entity name and ID, never the key. Update `docs/STATSIG_INVENTORY.md` with IDs, parameters, and status.
3. Small offline fix: in fallback or when no user update is running, the presenter must not show "Trait update pending: Yes". Fix it in `src/presenter/Diagnostics.tsx` or the Statsig module with a test, and run `npm run typecheck`, `npm run build`, `npm test` with the console key removed.
4. One live journey on the production build (client keys set, console key removed), key values redacted: the same journey as revision 3.2 journey A (tagged landing → personal loan → typed amount → offers → select → review → save → resume → simulated sign-in → consent → submit → dashboard), plus on the way: open the help panel once (reads the config) and visit the application details step (evaluates the gate). Record, for every bound parameter, the gate, and the config, the returned value and its source (`statsig` or fallback with reason); the exposure events (type, count, whether repeated renders of the same parameter add exposures, whether unused parameters add none, and whether opening presenter diagnostics adds none); the initialize payload fields (stable ID, user ID, `custom` keys) and any environment tier reported; that the stable ID is unchanged at sign-in; and that a trait-only change did not discard a value for the same identity (stale flag only briefly). Record device, stable, and session IDs and the UTC window. If any parameter still shows `missing_binding`, say which and what the entity looks like in a GET.
5. Update docs/evidence/phase-3.md (revision 3.3 section; UI, SDK, console, telemetry, and data readiness as separate headings; warehouse-native receipt is not results availability, no warehouse check) and `PHASE_LOG.md`. Commit, push the same branch, and stop. Do not change Status or start Phase 4. Never print secret values.

## Allowed paths
`src/**` (including tests, for the presenter fix and any live-binding fix), `docs/STATSIG_INVENTORY.md`, `docs/evidence/phase-3.md`, `docs/SETUP.md`, `PHASE_LOG.md`. Exclude `.github/**`, `.env.example`, `package*.json`, planning files, and `docs/custom-events.yml`.

## Acceptance
P3.1 (live binding of the four stores, the gate evaluation, and the config read), P3.2 (documented real-SDK exposure behavior), and the live part of P3.4 as already recorded. The Planner verifies the entities through the read-only Statsig MCP. Merging PR #15 deploys the site with live Statsig traffic for all visitors; the approval request will say so.
