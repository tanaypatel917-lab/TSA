# Working on Wordplay

## Owner preferences
- When a change is finished and verified, commit it and push to `main` without asking. Then watch the
  GitHub Actions runs (CI and "Deploy to GitHub Pages") and check the live site at
  https://tanaypatel917-lab.github.io/TSA/.
- 3D models are built in Spline. The owner publishes Spline changes; keep the `Wordplay.World.Kit`
  group visible (Spline drops hidden objects from exports) and keep the editor view framed on the
  question mark before publishing, because the export uses the editor view as its camera.

## Verification
- `npx tsc --noEmit`
- `npm run lint`
- `npx vitest run`
- `PLAYWRIGHT_CHANNEL=chrome npm run test:e2e` (builds a static export with the 3D scene switched off)
