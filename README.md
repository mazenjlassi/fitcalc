# fitcalc

Free, privacy-first fitness calculators that run entirely in the browser.

- Calorie calculator (BMR + TDEE, metric and imperial)
- Protein calculator
- Body-fat calculator (US Navy circumference method)

No accounts, no backend, no cookies, no analytics. Inputs never leave the device.

## Stack

- Angular 22, standalone components, signals, zoneless change detection
- TypeScript strict, SCSS, Vitest + jsdom
- Static prerendering; deployed to Cloudflare Pages
- No UI framework, no web fonts, no third-party runtime requests

## Requirements

- Node.js 24.22.0 (see `.nvmrc`; Angular 22 requires >= 24.13.1)
- npm 11+

## Commands

```bash
npm ci
npm start                 # dev server at http://localhost:4200
npm run lint
npm test -- --watch=false
npm run build             # static output in dist/fitcalc/browser
npm run e2e               # Playwright smoke tests against the built output
npm run lighthouse
```

End-to-end tests need a Chromium build: run `npx playwright install chromium`
once, then `npm run build` before `npm run e2e`. CI installs the browser itself;
test artifacts are ignored.

`SITE_URL` controls canonical URLs, Open Graph URLs, and the sitemap. It defaults
to `http://localhost:4200` locally and falls back to `CF_PAGES_URL` in Cloudflare
preview builds. Production builds must set `SITE_URL=https://<your-domain>`.

## Structure

```
src/app/
  core/formulas/   pure calculation functions and unit tests
  shared/ui/       field, unit-toggle, result-card, disclaimer, faq, breadcrumb
  shared/seo/      title, meta, canonical, JSON-LD
  layout/          header, footer, ad slot
  pages/           home, calorie, protein, body-fat, about, contact, privacy
```

All calculation logic lives in `core/formulas` as pure functions. Components
only collect input and render results.

## Privacy

Calculations happen in the browser. The site does not transmit calculator input,
does not use cookies, and does not load analytics. See the Privacy page for the
full statement. Advertising, if enabled later, will be disclosed and gated behind
a consent management platform where required.

## Content and safety

Every calculator shows its formula, source, limitations, and last-reviewed date.
Results are general information, not medical advice or diagnosis. The calorie
calculator refuses to recommend targets below common minimum-intake thresholds
and warns users who are under 18, pregnant, breastfeeding, or managing a medical
condition to consult a professional.

## Deployment

Cloudflare Pages, production branch `main`:

- Build command: `npm run build`
- Output directory: `dist/fitcalc/browser`
- Environment: `NODE_VERSION=24.22.0`, `SITE_URL=https://<your-domain>`

Pull requests receive automatic Cloudflare preview deployments. GitHub Actions
runs lint, unit tests, build, and Lighthouse CI. Security headers live in
`public/_headers`.

The full setup, custom-domain, preview, and verification checklist is in
[docs/cloudflare-pages.md](docs/cloudflare-pages.md).

## License

MIT. See [LICENSE](LICENSE).
