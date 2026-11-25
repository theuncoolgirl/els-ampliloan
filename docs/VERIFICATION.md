# Verification

Steps Erin ran or can repeat. "Expected" is what the code and earlier evidence say should appear. Nothing in this document was run by its author; results recorded by Erin are listed separately in section 5. Do not use these checks to claim anything about live Statsig or Amplitude beyond what is recorded.

## 1. Presenter setup
1. Open `https://erinshields.dev/els-ampliloan/#/presenter`. Expected: page titled "Demo controls", a banner "Demo controls. Not part of the borrower experience."
2. Find **Preview (local overrides)**; confirm **Preview mode** is unchecked (Off). Preview applies local overrides only and sends nothing.
3. Persona order matters. First click **Start as a new demo user**, then **Yes, clear and start over** (it wipes persona and identity). Then choose a persona and click **Apply persona**. Expected message "Persona applied: first_time_personal." Applying a persona first and then starting a new user discards the persona. Do the same sequence when switching personas mid-demo.

## 2. Gate check (targeted help)
1. With persona "First-time personal borrower (no application)" applied, go to Home, Check your rate, choose Personal loan, Continue.
2. Expected on the details step: a "Need help with this step?" link under the helper sentence.
3. Expected on the Presenter page under "Statsig values read this session": `ampliloan_contextual_help = true statsig`.
4. Other personas (returning mortgage, business owner, existing customer) do not get the link, and the gate shows false.
If values show `default (no_key)` the build has no Statsig client key (local mode); that is a build setting, not a failure.

## 3. Presenter diagnostics behaviour
- "Statsig values read this session" is in memory per browser tab. A second tab starts empty.
- Application state and Stable ID are shared across tabs.
- A cross-tab monitor was considered and declined for now (Erin, 9:47 AM ET).
- Viewing the panel evaluates nothing.

## 4. Statsig console checks
1. Project `AmpliLoan [Cloud]` (`6oe5DaLQIx5XnKfBrG0JnT`): the live event stream shows business events (for example Rate Check Started, Application Submitted).
2. Exposures for `ampliloan_contextual_help` appear after the gate is read on the details step.
3. Built-in metrics `mau_28d`, `new_mau_28d`, `l14`, `l28` populate immediately and are not ours.
4. Our four `ampliloan_*` metrics roll up daily. To populate `ampliloan_validation_failed_count`, walk a full journey including one `Application Validation Failed` (leave a required field blank on the details step and press Next). Expect results the next day.
5. The experiment shows status `setup` (not started).

## 5. Results recorded by Erin, Nov 25 2026 (not re-run)
- Parameters served by Statsig; setup failures none.
- Gate true for the first-time persona.
- Events and exposures visible in the Statsig console.
- Cloud entities and metrics present.

## 6. Limitations
- The Statsig MCP the Planner uses is bound to the old warehouse-native project; Erin is investigating re-pointing it. The Cloud project's console URL is on the staging host.
- Old project `363sCqDdACZXt4M88ZqiKa` is superseded and untouched.
- Metric rollup window undecided; the Planner will state the API default at experiment finalization.
- The gate description in the console still says "No rules".
- Statsig Cloud metrics have daily rollups; multi-day funnels need validation and do not match Amplitude funnels.
- Guides and Surveys (4B) and the synthetic runner (4E) are not built. The experiment is not started. Amplitude as Statsig's analytics engine is not configured.
- Replay: upload requests were observed (`docs/evidence/phase-2.md`); playback and masking are not recorded as verified in the repo.
- The `og:image` URL in `index.html` points to `https://theuncoolgirl.github.io/els-ampliloan/images/og-image.png`, while the site is served at `https://erinshields.dev/els-ampliloan/`. Possibly wrong host; not changed here (docs-only phase) and not verified against the live site.
- Documents in `docs/` disagree in places; see "Disagreements" in `docs/ASSET_INVENTORY.md`.
- Not checked for this phase: the live public site, any console, any live journey.
