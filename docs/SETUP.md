# Setup

## Local
- `npm ci`, then `npm run dev` (served at `/els-ampliloan/`), `npm run typecheck`, `npm run build`, `npm run preview`.
- Copy `.env.example` to `.env.local` if needed. All `VITE_` values are public browser configuration. Never put server or management keys in env files. Phase 0 reads none of them.

## Pages workflow (`.github/workflows/pages.yml`)
- Trigger: `push` to `main` that changes one of: `src/**`, `public/**`, `index.html`, `package.json`, `package-lock.json`, `tsconfig*.json`, `vite.config.*`, `.github/workflows/pages.yml`. No `workflow_dispatch`, no pull-request trigger.
- Docs, planning files, `.env.example`, and `PHASE_LOG.md` do not redeploy. Changing a GitHub Actions secret or variable does not trigger a deploy; a later phase needs a listed-path change to publish it.
- Permissions: `contents: read`, `pages: write`, `id-token: write`.
- Steps: `npm ci`, `npm run build`, then `actions/configure-pages@v6`, `actions/upload-pages-artifact@v5`, `actions/deploy-pages@v5` (latest majors per each action's GitHub releases at 2026-11-12; `actions/checkout@v7`, `actions/setup-node@v7`). No secrets.
- Merging a listed-path change to `main` triggers a deploy to https://erinshields.dev/els-ampliloan/. Pages source must be GitHub Actions (already set).
- Vite `base` is `/els-ampliloan/`; routes are hash-based so deep links need no server rewrite.

## Tests
`npm test` runs the state-module unit tests (vitest, node environment, `src/**/*.test.ts`).

## Amplitude (Phase 2)
- `@amplitude/unified` is the only Amplitude package. `src/integrations/amplitude.ts` is the only file that calls it, with one module-level `initAll` per page load. The UI waits at most 2000 ms for initialization, then continues with local behavior.
- Build-time configuration: `VITE_AMPLITUDE_API_KEY` and `VITE_AMPLITUDE_SERVER_ZONE` (US). The Pages workflow passes only these two to the `npm run build` step: the key from the repository secret `VITE_AMPLITUDE_API_KEY`, the zone as the literal `US`. No other secret is used and no Statsig key exists. The key is a browser-safe project key and is bundled into the public site by design.
- With no key set the app runs in local mode: events are validated and listed on the presenter page but nothing is sent to any vendor.
- Statsig is intentionally disabled in this phase (`src/telemetry/statsigSink.ts` counts declined events and sends nothing).
- A change to the repository secret does not trigger a deploy; a listed-path change is needed to publish a new key.

## Statsig (Phase 3)
- `@statsig/js-client` is the only Statsig package, and `src/integrations/statsig.ts` is the only file that imports it. One client is created lazily per page load, only when a key exists.
- Build-time configuration: `VITE_STATSIG_CLIENT_KEY` (a browser-safe client key; never a console or server key). The environment tier is not set by the app, so the SDK default applies. The Pages workflow does not pass a Statsig key; with no key the production site runs in Statsig local mode (no client, zero vendor requests, all page values at their defaults).
- With a key, the UI waits at most 2000 ms for initialization, then continues on defaults. Late completion does not change visible values; values are re-evaluated at the next route change.
- Entities are listed in `docs/STATSIG_INVENTORY.md` (all `not provisioned`). Presenter Preview applies local overrides only and sends nothing.
- Statsig event telemetry: with a key, each valid business event is also sent to Statsig with the same name, no value, and flat string metadata including `business_event_id`. In local mode events are only counted as declined.
