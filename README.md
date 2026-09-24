# Wordplay

Wordplay — Hands-on AI literacy for students in grades 9–12. Learn how AI works,
practice asking useful questions, and save XP, badges, and quiz best scores in
this browser. Activities use local rules, not live AI. Hosted artwork needs a
network connection; cold offline availability is not guaranteed.

## Fonts and local setup

Before running a build, provision the genuine Clash Display variable WOFF2 from
[Fontshare’s official Clash Display download](https://www.fontshare.com/fonts/clash-display).
Place the unmodified variable WOFF2 at `public/fonts/clash-display-variable.woff2`.
The ITF Free Font License (FFL 2.0) permits self-hosting but prohibits repository
redistribution and subsetting: this exact binary is ignored by Git and must be
provisioned locally or on the build machine. Do not add it to the repository.
Its license is retained at `public/fonts/licenses/clash-display-FFL.txt`.

Uncut Sans is supplied at `public/fonts/uncut-sans-variable.woff2`, sourced from
[the official Uncut Sans project](https://uncut.wtf/sans-serif/uncut-sans/).
Its SIL OFL notice is in `public/fonts/licenses/uncut-sans-OFL.txt`. Uncut Sans
may be redistributed with that notice. Both fonts use `next/font/local`; Uncut
uses normal style, and neither font is artificially stretched.

```bash
npm install
npm run dev
```

The approved question-mark scene URL is the default in `src/content/visuals.ts`.
`NEXT_PUBLIC_SPLINE_SCENE_URL` overrides it at build time; an explicitly empty
value disables scene loading. See `.env.example`. Reduced motion and narrow
screens use an editorial typographic question mark, not a rendered scene poster.
No local PNG poster is supplied. A failed scene never prevents learning.

## Game mode: Wordplay World

`/play/` is a drivable 3D island built at runtime in the same Spline scene as the
intro. Arrow keys, WASD or the on-screen pad move the question mark; driving
through one of the 20 glossary words collects it (+2 XP). Each of the five chapter
stations starts a mission (`src/content/missions.ts`): pick up message crates,
read them and drive them through the right one of two gates before the 75-second
clock or three mistakes end the run. Correct answers in a row build a ×4 combo;
one star stamps the station (+10 XP) and a first perfect run adds +5 XP. Relaxed
mode removes the clock and Expert mode (50 seconds, two lives, four crates at once, ×1.5
points) raises the stakes. The central plaza starts a daily challenge: one mission
picked by date with the same crates for everyone that day. Every run is saved to a
local top-five board (`src/engine/scores.ts`, key `wordplay:scores:v1`), and
synthesized sound effects (`src/components/world/sound.ts`) can be switched off.
The rules are pure functions in `src/engine/mission.ts`.
Stamping every station earns World Explorer and collecting every word earns Word
Collector. Movement, collisions and layout live in `src/engine/world.ts` and
`src/content/world.ts`; the scene is `src/components/world/WorldScene.ts`.
If the scene contains objects named `Wordplay.World.Kit.Landmark.<stack|brackets|scale|globe|star>`,
`Wordplay.World.Kit.Word.<1-3>` or `Wordplay.World.Kit.Tree.<1-3>`, they are
cloned in place of the built-in shapes. Reduced motion, narrow screens, no WebGL
or a failed load open the same game as an interactive map, where missions become a
quick sort with the same scoring, so every learning action works without 3D.

## Hands-on lesson tools

`src/content/figures.ts` places interactive figures between lesson paragraphs:
a system diagram, a keyword-rule spam filter, a simplified tokenizer, the
next-word predictor, a fruit-sorter bias lab (a real nearest-average model trained
in the browser), a hallucination spotter, a prompt builder, an ask-three-times
variability demo and a privacy redactor. Their logic lives in `src/engine/labs.ts`
and the components in `src/components/labs/`.

## Homepage demo

The hero runs a live next-word predictor (`src/engine/predictor.ts`): a trigram
model with bigram and unigram backoff, trained in the browser on the sentences in
`src/content/predictor.ts`. Learners pick a starter, add likely words, or let it
write with a creativity (temperature) slider.

## Judges' tour and documentation

The homepage and About page start an eight-stop site tour (`src/content/tour.ts`,
`src/components/TourGuide.tsx`). The current stop is kept in `sessionStorage`
under `wordplay:tour:v1`, so the tour survives reloads and page changes. About
explains how the site was built, and References holds the sources, credits,
licenses and a copyright checklist (`copyrightChecklist` in
`src/content/references.ts`).

## Deploying to GitHub Pages

Pushing to `main` runs `.github/workflows/deploy.yml`. It downloads Clash
Display from Fontshare's official download on the build machine (the binary is
never committed), runs the typecheck, lint and unit tests, builds with
`NEXT_PUBLIC_BASE_PATH=/TSA` so every page and asset lives under the project
path, and publishes `out/` to GitHub Pages. The repository's Pages source must
be set to GitHub Actions. To preview the project-path build locally, run
`NEXT_PUBLIC_BASE_PATH=/TSA npm run build` and serve `out/` at `/TSA/`.

## Verification

```bash
npm run typecheck
npm run lint
npm test
npm run build
PLAYWRIGHT_CHANNEL=chrome npm run test:e2e
```

Browser tests use installed Google Chrome without downloading a browser. They
build a scene-disabled static export and serve `out/` with Python 3 on
`127.0.0.1:3100` through `tests/e2e/serve.py`, which raises the listen backlog;
the default `python3 -m http.server` resets connections under Chrome's parallel
chunk and prefetch requests, which breaks hydration and makes tests flaky. Like a
static host, it answers unknown paths with `out/404.html` and a 404 status.
Do not run them concurrently with another build or dev server.
Omit `PLAYWRIGHT_CHANNEL` only if a compatible Playwright Chromium is already
installed. The ordinary build uses the real scene default unless overridden.

## Content and adding a module

Typed content lives in `src/content/`. Add a module file under
`src/content/modules/` that implements `Module`, import it in
`src/content/index.ts`, and place it in the `modules` array. A module supplies
lessons, an activity configuration, and five quiz questions; the existing
activity components render the activity kinds defined in `src/content/types.ts`.
A classifier activity can also list `clues` (a label and a regular expression);
matching words are highlighted after each answer and tallied on the results
screen. Glossary terms are linked automatically the first time each appears in
a lesson, so new terms in `src/content/glossary.ts` need no extra markup.

Sources for lesson facts live in `src/content/references.ts` and appear on the
References page and under each lesson. Map each source to the lessons it
supports with `moduleId/lessonId` keys, and give it a `kind`, `publisher` and
`short` label for the References evidence board and filters;
`src/content/references.test.ts` fails if any lesson has no source, a key points
at a missing lesson, or a source is missing those labels.

Progress logic is framework-free in `src/engine/`, while routes and interactive
components live under `src/app/` and `src/components/`. Progress is stored under
`wordplay:progress:v1`. Prompt drafts use the separate
`wordplay:drafts:v1` namespace and are not included in progress exports.
