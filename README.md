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
and `npm run build`. Accounts are optional; the app remains fully local when
Supabase is not configured.

## Accounts (optional)

To enable cloud progress sync, create a Supabase project and run
[`supabase/schema.sql`](supabase/schema.sql) in its SQL editor. Copy
[`.env.example`](.env.example) to `.env.local` and set
`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. For GitHub Pages,
add those values as repository Variables and pass them to the deploy workflow's
build step:

```yaml
env:
  NEXT_PUBLIC_SUPABASE_URL: ${{ vars.NEXT_PUBLIC_SUPABASE_URL }}
  NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ vars.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
```

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
NEXT_PUBLIC_BASE_PATH=/TSA npm run build
mkdir -p /tmp/site && ln -sfn "$PWD/out" /tmp/site/TSA
npx serve /tmp/site   # open http://localhost:3000/TSA/
```

The base-path build expects to be mounted at `/TSA`, so it must be served from
a parent directory (as above); a plain `npm run build` serves fine from `out/`.

### PWA / offline

The app ships a web app manifest (`public/manifest.webmanifest`, relative URLs so it works under any base path) and a hand-written
service worker (`public/sw.js`) that precaches the app shell and serves pages
stale-while-revalidate, including offline navigation fallback. The service
worker only registers in production builds (`NODE_ENV === "production"`), so
`npm run dev` is unaffected.
