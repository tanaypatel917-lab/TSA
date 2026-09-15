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

## Testing

Unit tests for the progress engine run with `npm test` (Vitest). Browser tests
run with Playwright: `npm run test:e2e` covers the golden path and every
activity, and `npm run test:a11y` runs axe scans tagged `@a11y`. Playwright
builds the static export and serves `out/` on port 4173 automatically; the
first run needs `npx playwright install chromium`.

## Content and adding a module

Typed content lives in `src/content/`. Add a module file under
`src/content/modules/` that implements `Module`, import it in
`src/content/index.ts`, and place it in the `modules` array. A module supplies
lessons, an activity configuration, and five quiz questions; the existing
activity components render the activity kinds defined in `src/content/types.ts`.

Progress logic is framework-free in `src/engine/`, while routes and interactive
components live under `src/app/` and `src/components/`.
