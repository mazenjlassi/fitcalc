# AGENTS.md

## Stack

- Latest stable Angular (22.x), standalone components, signals, zoneless change detection.
- TypeScript strict, SCSS, no UI framework, no web fonts, no third-party runtime requests.
- Vitest + jsdom for unit tests. Playwright for the e2e smoke test.
- Static prerendering. No backend, no cookies, no analytics, no localStorage for personal data.

## Architecture

- All calculation logic is pure functions under `src/app/core/formulas`, each with a
  colocated `*.spec.ts`. Components never contain formula logic.
- Units are converted at the boundary. Store canonical metric internally (kg, cm),
  convert for display, and round only at presentation time.
- Shared UI lives in `src/app/shared/ui`; SEO helpers in `src/app/shared/seo`;
  layout in `src/app/layout`; routed pages in `src/app/pages`.
- Route paths are kebab-case with a trailing slash in canonical URLs:
  `/`, `/calorie-calculator/`, `/protein-calculator/`, `/body-fat-calculator/`,
  `/about/`, `/contact/`, `/privacy/`.

## Commands

```bash
npm ci
npm run lint
npm test -- --watch=false
npm run build
npm run test:e2e
npm run lighthouse
```

`SITE_URL` is required for production builds. Locally it defaults to
`http://localhost:4200`; Cloudflare previews fall back to `CF_PAGES_URL`.

## Quality gates

- Mobile-first, WCAG 2.2 AA, 44px minimum touch targets.
- Lighthouse mobile >= 95 for Performance, Accessibility, Best Practices, SEO.
- No layout shift from ads: ad slots, when enabled, have a fixed height.
- Every calculator page shows formula, source, limitations, disclaimer, and a
  last-reviewed date.

## Workflow

- One branch per issue: `feat/<slug>` or `fix/<slug>`.
- Conventional Commits, small commits.
- Open a PR through the GitHub MCP server with `Closes #<n>`, wait for CI green,
  then squash-merge.
- Ask before adding any dependency.
- Never commit secrets. Never run `git add` from the home directory; this project
  lives only in its own repository.

## Content rules

- Original writing only. No copied competitor copy.
- Cite primary sources (Mifflin et al. 1990; DRI/ISSN; Morton et al. 2018; ACE).
- Never present an estimate as a diagnosis or individualized medical advice.
- Warn for pregnancy, breastfeeding, under-18, and medical conditions.
- Do not recommend calorie targets below 1200 kcal (female) or 1500 kcal (male).
