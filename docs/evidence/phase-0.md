# Phase 0 evidence (revision 2)

## Environment (task 1)
- Repo theuncoolgirl/els-ampliloan; started on `cursor/planner-phase0-start-360f`, clean tree; work branch `cursor/phase0-shell-360f`.
- node v22.23.4, npm 10.9.9, Linux 6.12.113+ x86_64. No project package tooling existed before.
- Browser automation: Playwright not installed in the repo; `playwright-core` was installed outside the repo (`/tmp/pw`) and drove system Google Chrome 157.0.8103.50. Nothing added to repo dependencies.

## Direct dependencies (resolved, from `npm ls`; lockfile `package-lock.json` committed)
react 19.3.1, react-dom 19.3.1, vite 8.3.8, @vitejs/plugin-react 6.3.0, typescript 7.0.2, @types/react 19.3.0, @types/react-dom 19.3.0.

## P0.1 PASS
`npm run typecheck` exit 0; `npm run build` exit 0 (dist: index.html, one JS, one CSS asset).

## P0.2 PASS
Production build served by `npm run preview` (port 4173), Chrome headless, viewports 390x844 and 1440x900, each with normal and `prefers-reduced-motion: reduce`:
- `[data-demo=home-cta]` ("Check your rate") fully inside first screen at both sizes.
- Keyboard: Tab (7th press, after skip link and nav) reached the CTA; Enter navigated to `#/apply`; focus was on `H1` "Apply"; exactly one `application-root`, zero `home-cta` on apply.
- Hero animation name `float` normally, `none` under reduced motion.
- Console errors: none. Requests to non-localhost hosts: 0 (no SDK/vendor traffic).

## P0.3 PASS
Preview at `http://localhost:4173/els-ampliloan/#/dashboard`: direct load HTTP 200, h1 "Dashboard", one `dashboard-root`; reload also 200 with same result. Requests: `/els-ampliloan/`, hashed JS and CSS under `/els-ampliloan/assets/`, `/els-ampliloan/favicon.svg`; no 4xx/5xx; no console errors.

## P0.4
Pending approved deployment. Not run.

## Limitations
Smoke was one scripted run, not repeated; Chrome only. Focus on direct dashboard load stays on body (route-change focus applies to navigation, not initial load).
