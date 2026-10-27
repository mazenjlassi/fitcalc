# Cloudflare Pages deployment

The site is a fully static Angular build. Cloudflare Pages serves it from its CDN and
creates a preview deployment for every pull request.

## One-time setup

1. Sign in to Cloudflare and open **Workers & Pages → Create → Pages → Connect to Git**.
2. Select the `mazenjlassi/fitcalc` repository.
3. Project name: `fitcalc` (the resulting `*.pages.dev` hostname depends on availability).
4. Production branch: `main`.
5. Framework preset: **None**.
6. Build command: `npm run build`.
7. Build output directory: `dist/fitcalc/browser`.
8. Environment variables:
   - `NODE_VERSION=24.22.0`
   - `SITE_URL=https://<your-domain>` (production only)
9. Save and deploy.

Node 24 is required by Angular 22. The repository also pins 24.22.0 in `.nvmrc` and
`engines.node`.

## Previews

Every pull request gets a Cloudflare preview URL automatically. Preview builds should
emit `Disallow: /` in `robots.txt` (implemented with the sitemap generator) so preview
pages are not indexed.

## Custom domain

1. Buy or transfer a domain to Cloudflare (Cloudflare Registrar is convenient but not
   required).
2. In the Pages project, open **Custom domains → Set up a custom domain**.
3. Add both `example.com` and `www.example.com`; redirect one to the other.
4. Wait for the certificate to become active.
5. Set `SITE_URL` to the canonical host, then trigger a new production deployment so
   canonical URLs, Open Graph tags, and the sitemap use it.
6. Optional: enable Cloudflare Email Routing and create `hello@<domain>` for the
   Contact page.

## Headers and caching

`public/_headers` is copied into the build and applies:

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` denies camera, microphone, geolocation, payment, and USB
- `X-Frame-Options: DENY`
- `Cross-Origin-Opener-Policy: same-origin`

A Content Security Policy is added after the SEO/trust pass, once inline styles and
any consent/ads scripts have been reviewed.

## Verify after the first deploy

- `/`, `/calorie-calculator/`, `/about/`, `/contact/`, and `/privacy/` return 200.
- `/does-not-exist` returns the static `404.html` with a 404 status.
- `http://` redirects to `https://`.
- Trailing slashes redirect consistently and canonical URLs match the served URL.
- `_headers` values are present in the response headers.
- A pull request produces a preview deployment and the preview is `noindex`.
- GitHub Actions passes lint, tests, build, and Lighthouse.

## Branch protection

In **GitHub → Settings → Branches**, protect `main` and require:

- the `Lint, test, build, Lighthouse` check
- branches to be up to date before merging
- squash merges only

## Rollback

Cloudflare Pages keeps previous deployments. Use **Deployments → ... → Rollback** to
return to a known-good production build.
