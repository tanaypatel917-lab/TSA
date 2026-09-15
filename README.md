# AI Compass

AI Compass is an interactive, offline-friendly learning portal for high-school
students in grades 9–12. It explains how AI works, offers practice activities,
and saves XP, badges, and quiz best scores locally in the browser.

## Run it

```bash
npm install
npm run dev
```

The verification scripts are `npm run typecheck`, `npm run lint`, `npm test`,
and `npm run build`. There is no backend, account system, or API call.

## Content and adding a module

Typed content lives in `src/content/`. Add a module file under
`src/content/modules/` that implements `Module`, import it in
`src/content/index.ts`, and place it in the `modules` array. A module supplies
lessons, an activity configuration, and five quiz questions; the existing
activity components render the activity kinds defined in `src/content/types.ts`.

Progress logic is framework-free in `src/engine/`, while routes and interactive
components live under `src/app/` and `src/components/`.

## Deploy

The site deploys to GitHub Pages via `.github/workflows/deploy.yml` on every
push to `main` (or manually via workflow dispatch). One-time setup: in the
repo go to **Settings → Pages** and set **Source** to "GitHub Actions".

`NEXT_PUBLIC_BASE_PATH` controls the base path baked into the static export.
It defaults to empty for local/dev builds; the workflow sets it to `/TSA`. If
you fork the repo under a different name, change the value in the workflow to
`/<your-repo-name>`.

To check a Pages-style build locally:

```bash
NEXT_PUBLIC_BASE_PATH=/TSA npm run build && npx serve out
```

Note: serve `out/` under `/` — the base-path build expects the site at `/TSA`,
so a quick smoke test of asset paths is easiest via the plain `npm run build`.

### PWA / offline

The app ships a web app manifest (`src/app/manifest.ts`) and a hand-written
service worker (`public/sw.js`) that precaches the app shell and serves pages
stale-while-revalidate, including offline navigation fallback. The service
worker only registers in production builds (`NODE_ENV === "production"`), so
`npm run dev` is unaffected.
