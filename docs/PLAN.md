# AI Learning Portal — Build Plan (2026-27 theme)

Target: high school students (grades 9–12). New top-level project in the portfolio repo, e.g. `ai-portal/`, following the repo convention (own directory + `docs/` spec/plan entry + README table row).

## 1. Tech approach
- **Next.js 14 + TypeScript + Tailwind** (same stack as TagTriage → shared conventions, CI already knows how to typecheck/lint/test/build).
- **Static export** (`output: 'export'`) so it deploys anywhere (GitHub Pages / Netlify) with no backend — judges can open it from a URL or a zip.
- **Progress stored in localStorage** (versioned JSON, no accounts, no PII). Export/import progress as a JSON file so students can move devices.
- **Content as data**: each module = a TypeScript/MDX file (lesson text, quiz items, activity config). Easy to add modules later.
- Tests: Vitest for the XP/badge/progress engine (pure functions), Playwright smoke test for the golden path, axe a11y check.

## 2. Educational content modules (3 required, proposing 4 + capstone)
Each module = 3–5 short lessons → interactive activity → 5-question quiz.

| # | Module | Lessons | Interactive activity |
|---|--------|---------|----------------------|
| 1 | **AI Foundations** | What AI is / isn't; machine learning vs rules; how LLMs predict text; training data & bias; strengths vs limits (hallucinations) | "Train a classifier" toy: students label examples and watch accuracy change; "next-word predictor" demo |
| 2 | **AI Tools & Techniques** | Prompting basics (role/task/context/format); iterating & verifying outputs; study tools (summaries, flashcards, tutoring); coding/data/image tools; when *not* to use AI | Prompt lab: rewrite a weak prompt, get scored on a rubric; side-by-side prompt comparison |
| 3 | **Ethical & Responsible Use** | Academic integrity & citing AI; bias & fairness; privacy & data; misinformation/deepfakes; environmental & labor impacts | Scenario decision game ("Is this OK?") with branching feedback; build your own class AI-use policy |
| 4 | **AI in the Real World** (optional) | Careers, medicine, climate, creative fields; how to keep learning | Case-study cards + reflection |
| ★ | **Capstone** | Apply all three: plan a school project using AI ethically | Guided worksheet → downloadable certificate |

Reading level ~grade 9, glossary with hover definitions, all interactive demos run client-side (no API keys, no real AI calls — safe for schools).

## 3. Gamification & progress tracking
- **XP**: lesson read = 10 XP, activity = 25, quiz = up to 50 (scaled by score), streak bonus for daily return.
- **Levels**: Novice → Explorer → Practitioner → Ethicist → AI Ally (thresholds on total XP).
- **Badges** (~12): per-module completion, "Perfect Quiz", "Prompt Engineer", "Ethics Champion", "Myth Buster", "Capstone Complete", streak badges. Badge unlock toast + animated badge case.
- **Progress dashboard** (home page after start): ring/percent per module, XP bar to next level, badge shelf, "continue where you left off" card, weekly activity mini-chart.
- **Quiz feedback**: instant explanations, retry allowed (best score kept).
- **Leaderboard**: intentionally omitted (privacy, no backend); optional "class code" export instead.

## 4. Site map
Home / Dashboard · Modules index · Module → Lesson → Activity → Quiz · Badges · Glossary · About/Teacher guide (standards alignment, how progress works) · Accessibility statement

## 5. Non-functional
- WCAG 2.1 AA (keyboard nav, contrast, reduced-motion), responsive mobile-first, Lighthouse ≥ 90.
- No third-party trackers; works offline after first load (optional PWA, reusing TagTriage know-how).
- Cite sources for all factual content (bibliography page).

## 6. Build phases (each = a PR)
1. Scaffold `ai-portal/`, layout, design system, content schema, progress engine + tests, CI wiring.
2. Module 1 + 2 content and activities; quiz engine.
3. Module 3 + capstone; badges, levels, dashboard polish.
4. Glossary, teacher guide, a11y pass, Playwright/axe tests, static export + deploy config.

Module 4, AI in the Real World, is included in this implementation.
