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
