# Builder handoff — Phase 4F revision 4F.3 (Dashboard formatting fix)
Status: START
Phase: 4F, formatting and copy fix
Revision: 4F.3

Authority: Erin, Cursor chat, 9:09 AM ET Nov 25, 2026, with a screenshot of the live Dashboard: "The formatting is weird on this page, please correct."

## Permissions
Builder Commit Yes; Push Yes (own branch `cursor/phase4f-dashboard-fix-360f` only); PR Yes (draft); Merge No; Deploy No. No console writes. Commit every source change before building baselines, and never `git stash` or drop work: before reporting, run `git diff --stat origin/main HEAD` on the pushed branch and confirm `src/` files are included.

## Problems seen (Dashboard, submitted state, desktop)
1. "Your next steps" is a bare `fieldset` with a legend sitting on its border and a lavender fill. It does not match the other cards. Make it a normal `card` with an `h2` heading ("Your next steps") and keep the checkboxes, labels, `show_next_steps` gating, and `completeTask` behavior unchanged (a visually hidden `fieldset`/`legend` or `role="group"` with `aria-labelledby` is fine for accessibility).
2. Copy leak: "Simulated, no files are uploaded." Replace with neutral text such as "Mark these off as you go. No documents are needed here." Also remove "simulated" from the `under_review` status text in `DashboardPage.tsx` ("Complete the simulated tasks below" becomes "Complete the next steps below") and from the Help panel answer "Do I upload documents?" (rewrite without "simulated").
3. "Loan details" card: the `<details>` fills the whole card edge to edge, with a thick oversized focus outline hugging the card, and the card itself has no padding around the summary. Give the card normal padding, make the summary row look like the FAQ summaries (consistent padding, +/− marker), and use a normal 3 px focus ring with a small offset that stays inside the card's rounded shape.
4. "Earlier applications" is a bare heading and bullet list floating under the cards. Put it in a card with the same heading style, with each earlier application as a row (loan type, reference, status badge, amount), no bullets.
5. Timeline: only the first step is distinguished. Completed steps should show a filled mint circle with a white check; the current step a violet ring; future steps a muted ring; connector line mint between completed steps. Keep the `aria-current` and `aria-label` behavior.
6. Equal visual rhythm: same card padding, radius, and gap between the summary cards, the two-column row, Loan details and Earlier applications; align the top of the two columns.
7. Check the other states for the same problems: draft (Resume button), under review, result ready, no application yet (empty state with the supplied `dashboard-empty.webp` if the empty state exists), and mobile 375 px.

## Must not change
Journey, events, store logic, parameter bindings and gating (`show_next_steps`), `data-demo` attributes, stable IDs, copy outside the strings listed above.

## Verification
`npm test`, `npm run build`; rendered screenshots at 375 and 1280 px for each Dashboard state you can reach (say which you could not reach); `rg -i "simulat|demo|synthetic|sample" src/components src/pages index.html` outside the Presenter page returns no user-visible hits; event sequence unchanged for one journey (compare with a `main` build made from a clean worktree, not by stashing).

## Result
`docs/evidence/phase-4f3.md`, `PHASE_LOG.md` entry, draft PR to `main`, set this file to `Status: IDLE` on your branch, stop. No deploy.
