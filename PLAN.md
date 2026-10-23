# fitcalc — project plan

Free, fast, mobile-friendly, privacy-first fitness calculators for a global
English-speaking audience. Angular + TypeScript, all calculations in the browser,
static hosting, no backend, no accounts. Monetisation is a later, optional step
(Google AdSense, not guaranteed).

Build order: calorie calculator first, make it excellent, reuse its components for
protein and body fat. Validate search demand before investing in more pages.

## Decisions

- **Hosting:** Cloudflare Pages, production branch `main`, automatic PR previews.
- **Canonical URL:** build-time `SITE_URL`. Production sets it in Cloudflare;
  previews fall back to `CF_PAGES_URL`; local defaults to `http://localhost:4200`.
- **Node:** 24.22.0 (Angular 22 requires >= 24.13.1). Pinned in `.nvmrc`, `engines`,
  and Cloudflare's `NODE_VERSION`.
- **Framework:** Angular 22.2.x, standalone components, signals, zoneless,
  OnPush by default, strict TypeScript, SCSS, Vitest + jsdom.
- **Dependencies:** no UI framework; dev-only `@lhci/cli`, `@playwright/test`,
  and the Angular ESLint toolchain.
- **Privacy:** no backend, no cookies, no analytics, no third-party runtime
  requests, no personal data stored.
- **Scope:** v1 is the calorie calculator plus trust pages. Protein and body fat
  ship only after the calorie page is indexed and shows demand, or by explicit
  product decision.

## Non-negotiable rules

- All calculations are pure functions in `src/app/core/formulas` with unit tests.
  No calculation logic in components.
- Every calculator shows formula, source, limitations, disclaimer, and a
  last-reviewed date.
- Never present results as medical advice or diagnosis.
- Never recommend a calorie target below 1200 kcal (female) or 1500 kcal (male).
  Show a warning and recommend a smaller deficit instead.
- Warn users who are under 18, pregnant, breastfeeding, or managing a medical
  condition to consult a professional.
- Original writing only. No copied competitor content.
- Mobile-first, WCAG 2.2 AA, 44px touch targets.
- Lighthouse mobile >= 95 on Performance, Accessibility, Best Practices, SEO.
- One branch per issue, Conventional Commits, PR with `Closes #n`, CI green
  before squash-merge.

## Project structure

```
src/app/
  core/formulas/      bmr.ts, tdee.ts, protein.ts, bodyfat.ts, units.ts + *.spec.ts
  shared/ui/          field, unit-toggle, result-card, disclaimer, faq, breadcrumb
  shared/seo/         seo.service.ts: title, meta, canonical, JSON-LD
  layout/             header, footer, ad-slot placeholder
  pages/              home, calorie, protein, body-fat, about, contact, privacy
```

Routes use kebab-case paths and trailing-slash canonicals:

- `/`
- `/calorie-calculator/`
- `/protein-calculator/`
- `/body-fat-calculator/`
- `/about/`
- `/contact/`
- `/privacy/`

## Milestones and tasks

### M1 Foundation

1. **Scaffold Angular app with static prerender.** Angular 22, strict, standalone,
   zoneless, SCSS, routing, Vitest; `outputMode: "static"`, all routes prerendered.
2. **Project structure and routing skeleton.** Create `core/formulas`, `shared/ui`,
   `shared/seo`, `layout`, `pages`; path aliases; lazy routes; placeholder pages.
3. **Design system.** CSS variables, system font stack, light/dark via
   `prefers-color-scheme`, AA contrast, 44px targets, visible focus, skip link.
4. **CI.** Install, lint, unit tests, build, Lighthouse CI on PRs with mobile
   assertions >= 0.95 across all four categories.
5. **Deploy pipeline.** Cloudflare Pages connected to the repo; production on
   `main`, preview deploys on PRs; security headers; no server artifact deployed.
6. **Repository docs.** PLAN.md, AGENTS.md, README, MIT LICENSE, Node `.gitignore`.

### M2 Calorie calculator (`/calorie-calculator/`)

7. **Units and validation.** kg/lb, cm/ft+in conversion; age 15–100, height
   120–250 cm, weight 30–300 kg; unit toggle persists in memory only.
8. **Formulas.** Mifflin-St Jeor BMR; TDEE = BMR x activity factor
   (1.2, 1.375, 1.55, 1.725, 1.9); goal presets maintain, deficit 250–500,
   surplus 250–500; minimum-intake warning. Pure functions plus tests, including
   male 30y 180cm 80kg -> BMR 1780 and female 25y 165cm 60kg -> BMR 1345.25.
9. **Shared form and result components.** Field, unit toggle, result card,
   disclaimer, FAQ, breadcrumb; accessible errors; `aria-live` results.
10. **Calculator page UI.** Reactive form with signals, instant results, keyboard
    and screen-reader support, no layout shift.
11. **Content.** Methodology, activity-factor explanation, formula and source
    (Mifflin et al. 1990, Am J Clin Nutr), +/-10% accuracy note, FAQ, limitations,
    last-reviewed date. Original writing.
12. **Tests.** Formula unit tests, component tests, Playwright happy-path smoke
    test for metric and imperial.

### M3 SEO and trust pages

13. **SEO service.** Unique title/description per route, canonical, Open Graph,
    Twitter cards, JSON-LD (`WebApplication`, `FAQPage`, `BreadcrumbList`), all
    absolute URLs from `SITE_URL`.
14. **Sitemap and robots.** Generated at build time from prerendered routes;
    preview builds emit `Disallow: /`.
15. **Home page.** Tool chooser cards, short intro, internal links.
16. **Trust pages.** About, Contact (`mailto`, no backend), Privacy (calculations
    never leave the browser; ads/CMP section reserved).
17. **Performance pass.** Lazy routes, no external requests, image optimisation,
    no layout shift, CLS/LCP budgets.
18. **Accessibility pass.** Keyboard, screen-reader labels, contrast, zoom/reflow,
    reduced motion, focus management.

### M4 Protein and body fat (after demand check)

19. **Protein calculator.** Grams/day ranges by goal: general adult 0.8 g/kg
    (RDA minimum); active/endurance 1.2–1.6; muscle gain 1.6–2.2; fat loss while
    training 1.6–2.4; older adults 1.0–1.2. Show g/kg and g/lb plus explanation.
    Cite DRI, ISSN position stand, Morton et al. 2018. Reuse calorie components.
20. **Body-fat calculator.** US Navy circumference method:

    Men: `495 / (1.0324 - 0.19077*log10(waist - neck) + 0.15456*log10(height)) - 450`

    Women: `495 / (1.29579 - 0.35004*log10(waist + hip - neck) + 0.22100*log10(height)) - 450`

    Validate inputs (waist > neck, etc.), show ACE-style categories, state the
    estimate's accuracy limits, and include original measurement diagrams. Not a
    diagnosis.

### M5 Launch and AdSense

21. **Final QA.** Lighthouse, cross-browser, real phones, spelling, formula
    re-verification against sources.
22. **Search Console and AdSense readiness.** Verify the domain, submit the
    sitemap, reserve fixed-height ad slots, choose a Google-certified CMP for
    EU/UK consent, update the privacy policy, apply only when the site is
    finished. Approval and revenue are not guaranteed.

## Calorie math

BMR, Mifflin-St Jeor:

- Male: `10*kg + 6.25*cm - 5*age + 5`
- Female: `10*kg + 6.25*cm - 5*age - 161`

TDEE = BMR x activity factor. Goal presets add or subtract 250–500 kcal. Internally
keep raw floats; round only for display. If a target falls below the minimum
threshold, do not render it as a recommendation: show the floor warning and a
smaller deficit instead.

## Content and trust

- Plain disclaimer: general information, not medical advice; consult a
  professional for individual needs, pregnancy, medical conditions, or
  adolescents.
- Cite primary sources with links (PubMed/DOI where possible).
- Show a visible "Last reviewed" date and update it when formulas or copy change.
- Avoid extreme calorie targets and any language that implies diagnosis.

## Privacy

- Calculations happen in the browser; inputs are never transmitted.
- No accounts, cookies, analytics, or third-party scripts in v1.
- Contact is a `mailto:` link; no form backend.
- If advertising is enabled, update the privacy policy, add a consent management
  platform for EU/UK visitors, and keep ads non-intrusive with reserved space.

## Hosting

Cloudflare Pages:

- Build command: `npm run build`
- Output: `dist/fitcalc/browser`
- Environment: `NODE_VERSION=24.22.0`, `SITE_URL=https://<domain>`
- Custom domain with HTTPS; Cloudflare DNS.
- GitHub Actions verifies; Cloudflare deploys.
- Manual once: connect the repository, set environment variables, enable branch
  protection requiring CI + Lighthouse.

## Demand validation

After the calorie calculator is live and indexed (weeks to months), review Search
Console impressions, queries, and average position. Build protein and body fat if
there is traction, or if they are wanted as complementary tools. Keep running
costs limited to the domain.

## AdSense checklist

- Custom domain, HTTPS, original useful content, methodology and FAQs.
- About, Contact, and Privacy live and linked in the footer.
- Clean navigation, no broken pages, no placeholder text.
- Privacy policy covers ads and cookies.
- Google-certified CMP for personalised ads in the EU/UK, decided before applying.
- Fixed-height ad slots to avoid layout shift; non-intrusive placement.
- Apply only when the site looks finished. Approval and revenue are not guaranteed.

## Definition of done for v1

- Calorie calculator live with metric/imperial, BMR, TDEE, explanations, tests.
- Home, About, Contact, Privacy live; sitemap submitted.
- Lighthouse mobile >= 95 on all four categories.
- CI green; deploys automatic from `main`.
