# Decaf Discovered

Honest reviews of decaf coffee from a normal coffee drinker. Static Astro site,
hosted on Azure Static Web Apps (canonical) with a Netlify mirror that hosts
the CMS.

> **AI assistants:** read [AGENTS.md](AGENTS.md) before proposing changes. It
> is the canonical statement of repo conventions and load-bearing constraints.

- **Live site:** https://decafdiscovered.co.uk
- **CMS:** https://decafdiscovered.co.uk/admin/ (redirects to Netlify Identity
  on `decafdiscovered.netlify.app` — invite-only)
- **Node:** 20+
- **Framework:** Astro 5, TypeScript (strict), Tailwind CSS v4
- **Licence:** MIT for code, all rights reserved for content — see
  [LICENSE](LICENSE)

---

## Contents

- [Decaf Discovered](#decaf-discovered)
  - [Contents](#contents)
  - [What \& why](#what--why)
  - [Architecture at a glance](#architecture-at-a-glance)
  - [Technology stack](#technology-stack)
  - [Repo tour](#repo-tour)
  - [Local development](#local-development)
    - [Previewing the production build](#previewing-the-production-build)
    - [Path aliases](#path-aliases)
    - [Tailwind v4](#tailwind-v4)
  - [Scripts](#scripts)
  - [Editing content](#editing-content)
    - [1. Directly in the repo](#1-directly-in-the-repo)
    - [2. Via Decap CMS at `/admin/`](#2-via-decap-cms-at-admin)
    - [3. Publish gates](#3-publish-gates)
    - [Content model summary](#content-model-summary)
  - [Environment variables \& hard-coded defaults](#environment-variables--hard-coded-defaults)
    - [Hard-coded values worth knowing](#hard-coded-values-worth-knowing)
    - [Contact form + Turnstile](#contact-form--turnstile)
  - [Deployment](#deployment)
    - [Active workflow](#active-workflow)
    - [The `staticwebapp.config.json` placement rule](#the-staticwebappconfigjson-placement-rule)
    - [Provisioning the SWA resource (one-off)](#provisioning-the-swa-resource-one-off)
  - [Search, SEO, RSS, analytics](#search-seo-rss-analytics)
  - [Security \& privacy](#security--privacy)
  - [Known limitations](#known-limitations)
  - [Contributing](#contributing)
  - [Licence](#licence)

---

## What & why

Decaf coffee is under-covered by mainstream coffee media and most reviews
assume specialty-coffee vocabulary. Decaf Discovered is a personal blog
publishing honest, plain-English reviews of decaf beans — aimed at everyday
drinkers who want to know "is this bag worth a tenner?" rather than a full
sensory analysis. It's a hobby site, written and run by one person.

Goals:

- Publish decaf reviews with a consistent, comparable rating model.
- Stay free/near-free to run — static hosting, no runtime backend.
- Let non-technical editors update content in a browser without leaving the
  site's own domain.
- Rank in search results (structured data, sitemap, RSS, IndexNow).

Anti-goals:

- Cupping jargon, "notes of blueberry", scoring in tenths of a percent.
- Anything requiring a database, a Node server, or a paid third party.

## Architecture at a glance

```
┌────────────────────────────────────────────────────────────────────┐
│  Editor path A: git PR                                             │
│  Editor path B: Decap CMS at /admin/  ─┐                           │
│                                        │ commits to main via       │
│                                        │ Netlify Git Gateway       │
│                                        ▼                           │
│                                    GitHub main                     │
│                                        │                           │
│               GitHub Actions ──────────┴─────► Azure Static Web    │
│               (build + deploy)                  Apps (canonical)   │
│                                                                    │
│                                    Netlify mirror ← for Identity + │
│                                                     Git Gateway    │
└────────────────────────────────────────────────────────────────────┘
```

Two hosts serve the same `dist/`:

| Host | URL | Role |
|---|---|---|
| **Azure Static Web Apps** | https://decafdiscovered.co.uk | Canonical public site. |
| **Netlify** | https://decafdiscovered.netlify.app | Mirror. Exists solely to host Netlify Identity + Git Gateway for the CMS. Not linked to users; `<link rel="canonical">` always points at `.co.uk`. |

The Azure host redirects `/admin/*` to the Netlify mirror
(`public/staticwebapp.config.json`) so a single sign-in flow works for
editors.

## Technology stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Astro 5 | Static output only. No SSR / edge / API routes. |
| Language | TypeScript | `astro/tsconfigs/strict`. |
| Styling | Tailwind CSS **v4** | Design tokens live in `@theme { ... }` inside `src/styles/global.css`. **There is intentionally no `tailwind.config.js`.** |
| Markdown | Astro content collections + MDX | Zod schemas in `src/content/config.ts`. |
| Search | Pagefind | Built into `dist/pagefind/` as part of `npm run build`. Regions to index are marked with `data-pagefind-body`. |
| Analytics | Ahrefs Web Analytics | Cookieless. No GA / no Meta Pixel. |
| Forms | Formspree + Cloudflare Turnstile | Submitted client-side via `fetch` so users stay on the site. |
| Newsletter | Beehiiv | Loader script embed (preferred), or a POST-form fallback. |
| CMS | Decap CMS + Netlify Identity + Git Gateway | Invite-only. |
| CI/CD | GitHub Actions → Azure/static-web-apps-deploy | See [Deployment](#deployment). |
| Dev environment | `.devcontainer/` (Node 20 on Debian) | Optional but recommended. |

## Repo tour

```
astro.config.mjs         Astro entry — SITE_URL env var handling, integrations.
package.json             Scripts, deps.
tsconfig.json            Strict, with @components/@layouts/@utils/@styles/@scripts aliases.
LICENSE                  MIT for code; content is all-rights-reserved.
AGENTS.md                AI-assistant contract; also useful for humans.
.devcontainer/           VS Code dev container (Node 20, GH CLI, Azure CLI).
.github/workflows/       Only the *lemon-sky* workflow is active. See Deployment.
public/                  Copied verbatim into dist/.
  admin/                 Decap CMS shell + config.yml (Netlify Identity widget).
  images/coffees/        Review images (uploaded here by the CMS).
  staticwebapp.config.json   Azure SWA routing/headers. MUST live in public/.
  <32-hex>.txt           IndexNow key file — filename stem must == body.
scripts/
  indexnow-submit.mjs    Post-deploy job: submits every review/guide URL.
src/
  content/               Reviews, roasters, guides. Zod-validated.
    config.ts            Source of truth for the content model.
  components/            Astro components (no framework).
  layouts/BaseLayout.astro   Wraps every page. Also contains the Netlify
                             Identity hash-token forwarder — do not remove.
  pages/                 File-based routes.
  scripts/               Vanilla-TS interactivity (filters). No framework.
  styles/global.css      Tailwind v4 imports + @theme design tokens.
  utils/site.ts          SITE config object + formatters + isPublished().
```

## Local development

Node 20+ is required.

```bash
npm install
npm run dev            # http://localhost:4321
```

Or open the folder in VS Code and pick **"Reopen in Container"** — the
[.devcontainer](.devcontainer/devcontainer.json) sets up Node 20, GitHub CLI,
Azure CLI, the Astro + Tailwind + Prettier extensions, and mounts
`node_modules` to a named volume for speed.

### Previewing the production build

```bash
npm run build
npm run preview -- --host   # --host needed inside a dev container / VM
```

### Path aliases

Import from these, not relative paths:

```ts
import BaseLayout from '@layouts/BaseLayout.astro';
import SectionHeading from '@components/SectionHeading.astro';
import { SITE, isPublished } from '@utils/site';
```

### Tailwind v4

- No `tailwind.config.js` — colours, fonts, radii and shadows are declared as
  CSS custom properties inside `@theme { ... }` in
  [src/styles/global.css](src/styles/global.css).
- Reference tokens with arbitrary values, e.g.
  `class="bg-[color:var(--color-mocha-700)] text-[color:var(--color-cream-50)] rounded-[var(--radius-card)]"`.
- Reusable component classes (`btn`, `btn-primary`, `container-page`,
  `prose-decaf`, `skip-link`) live under `@layer components` in the same file.

## Scripts

| Command                     | What it does                                                    |
| --------------------------- | --------------------------------------------------------------- |
| `npm run dev`               | Local dev server with hot reload.                               |
| `npm run build`             | Build the site **and** the Pagefind search index into `dist/`.  |
| `npm run preview -- --host` | Preview the built site locally (run `npm run build` first).     |
| `npm run check`             | Astro + TypeScript type check. Run this before pushing — CI does not. |
| `npm run format`            | Prettier across the codebase.                                   |
| `npm run indexnow`          | Submit built review/guide URLs in `dist/` to the IndexNow API.  |
| `npm run publish:content`   | `npm run build && npm run indexnow`.                            |

## Editing content

There are three ways to add or edit a review, roaster or guide.

### 1. Directly in the repo

Add a Markdown file under `src/content/{reviews,roasters,guides}/` and open a
PR. The Zod schema in [src/content/config.ts](src/content/config.ts) is the
source of truth — `npm run check` validates it locally.

### 2. Via Decap CMS at `/admin/`

Log in with a Netlify Identity account (invite only). Commits go straight to
`main` via Netlify Git Gateway and trigger a redeploy.

Under the covers:

- The Azure host redirects `/admin/*` to
  `https://decafdiscovered.netlify.app/admin/` — see
  [public/staticwebapp.config.json](public/staticwebapp.config.json).
- The identity widget is initialised in
  [public/admin/index.html](public/admin/index.html) with an explicit
  `APIUrl` pointing at the Netlify mirror.
- A defensive hash-token forwarder in
  [src/layouts/BaseLayout.astro](src/layouts/BaseLayout.astro) catches
  recovery / invite / email-confirmation links that land on any non-`/admin/`
  page and re-routes them to `/admin/` preserving the hash.

**To invite an editor:** Netlify → your site → **Identity → Invite users**.
They'll receive an email; the invite link takes them to `/admin/` where they
set a password.

### 3. Publish gates

Every listing / RSS / JSON-LD filter combines **all three** of:

- `draft: false`
- `isSampleContent: false`
- `publishedDate <= today` (via
  [`isPublished()`](src/utils/site.ts))

Missing any of these will silently hide the entry. Future-dated posts stay
hidden **until the next build runs** — see
[Known limitations](#known-limitations).

### Content model summary

- **Reviews** (`src/content/reviews/*.md`): coffee, roaster, country,
  decaffeination method, roast level, price/weight/URL, ratings (overall
  required, others optional), taste notes, pros/cons, best-for tags.
- **Roasters** (`src/content/roasters/*.md`): name, location, country,
  optional flag/website/summary/local image.
- **Guides** (`src/content/guides/*.md`): title, summary, publishedDate.

Adding a field requires updating **both**
[src/content/config.ts](src/content/config.ts) (the Zod schema) **and**
[public/admin/config.yml](public/admin/config.yml) (the Decap CMS form) in
the same PR.

## Environment variables & hard-coded defaults

All variables below are optional. Set them as **GitHub Actions repository
variables** (not secrets — `PUBLIC_*` values are shipped to the browser at
build time).

| Variable                      | Purpose                                                                                 | Fallback if unset                                                          |
| ----------------------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `SITE_URL`                    | Canonical URL used for OG tags, sitemap, RSS.                                           | `https://decafdiscovered.co.uk`.                                           |
| `PUBLIC_AHREFS_ANALYTICS_KEY` | Ahrefs Web Analytics site key.                                                          | **Loads with the owner's key** (hard-coded in `BaseHead.astro`). See below. |
| `PUBLIC_BEEHIIV_FORM_ACTION`  | Beehiiv legacy POST-form endpoint (only used if `SITE.beehiivFormId` is empty).         | Loader-script embed or the "Subscribe on Beehiiv" fallback button.         |
| `PUBLIC_TURNSTILE_SITE_KEY`   | Cloudflare Turnstile site key used by the contact form widget.                          | A key is currently hard-coded in `src/pages/contact.astro`.                |
| `INDEXNOW_KEY`                | Override for the IndexNow key.                                                          | Auto-discovered from `public/<32-hex>.txt`.                                |
| `INDEXNOW_ENDPOINT`           | Override for the IndexNow endpoint.                                                     | `https://api.indexnow.org/indexnow`.                                       |
| `INDEXNOW_DIST_DIR`           | Directory the IndexNow script walks for built pages.                                    | `dist`.                                                                    |
| `INDEXNOW_PUBLIC_DIR`         | Directory the IndexNow script scans for the key file.                                   | `public`.                                                                  |

The Azure deploy token belongs in **GitHub Secrets** as
`AZURE_STATIC_WEB_APPS_API_TOKEN_LEMON_SKY_08B7B9103` (the name the active
workflow reads from).

### Hard-coded values worth knowing

These are not env-driven and are baked into source. Change them in the file
listed, not via a variable:

- **Formspree endpoint** — `src/pages/contact.astro` (`mjgngydn`).
- **Turnstile site key** — `src/pages/contact.astro`.
- **Beehiiv form id** — `src/utils/site.ts` (`beehiivFormId`).
- **Beehiiv publication URL** — `src/utils/site.ts` (`newsletterUrl`).
- **Ahrefs analytics key default** — `src/components/BaseHead.astro`.
- **Buy-me-a-coffee URL** — `src/utils/site.ts` (`buyMeACoffeeUrl`).
- **IndexNow key file** — `public/k1nye9k5g7wgff89jswrf2uz877yhsff.txt`. The
  filename stem must equal the file body; the submit script refuses to run
  if they differ.

### Contact form + Turnstile

- The contact page submits via `fetch` with `Accept: application/json` so
  Formspree returns JSON instead of redirecting. Users stay on the site and
  see an inline confirmation. See
  [src/pages/contact.astro](src/pages/contact.astro).
- Do **not** put your Turnstile secret in this repo. Store it in Formspree's
  Turnstile / CAPTCHA settings.

## Deployment

### Active workflow

[.github/workflows/azure-static-web-apps-lemon-sky-08b7b9103.yml](.github/workflows/azure-static-web-apps-lemon-sky-08b7b9103.yml)
runs on every push to `main` and on every PR. It:

1. Builds locally with `npm run build` (which also produces the Pagefind
   index).
2. Deploys `dist/` to Azure Static Web Apps with `skip_app_build: true`.
3. On pushes to `main`, submits every review/guide URL to IndexNow.

Every PR gets its own Azure SWA preview environment; the URL is posted as a
PR comment by the `Azure/static-web-apps-deploy` action.

### The `staticwebapp.config.json` placement rule

Azure SWA reads its config from the deployed folder. Because the workflow
deploys `dist/` (`skip_app_build: true`) and Astro only copies files from
`public/`, this project's `staticwebapp.config.json` **must live at**
[public/staticwebapp.config.json](public/staticwebapp.config.json). If it
gets moved back to the repo root it silently stops being applied — the
`/admin/*` redirect breaks and all global security headers disappear.

### Provisioning the SWA resource (one-off)

The workflow uses `app_location: 'dist'` with `skip_app_build: true`, so
match that when creating a fresh resource:

```bash
az staticwebapp create \
  --name decaf-discovered \
  --resource-group rg-decaf-discovered \
  --location westeurope \
  --source https://github.com/<you>/decaf-diaries \
  --branch main \
  --app-location "dist" \
  --output-location "" \
  --login-with-github
```

Then copy the API token into GitHub Secrets as
`AZURE_STATIC_WEB_APPS_API_TOKEN_LEMON_SKY_08B7B9103` (or update the workflow
to point at whatever secret name you prefer).

## Search, SEO, RSS, analytics

- **Search:** Pagefind indexes `dist/` at build time. Regions to include are
  marked with `data-pagefind-body` (see review and reviews-index pages). No
  search UI is surfaced yet, but the index is being shipped.
- **Sitemap:** `@astrojs/sitemap` produces `/sitemap-index.xml` at build.
- **RSS:** [src/pages/rss.xml.ts](src/pages/rss.xml.ts) emits `/rss.xml`
  with published, non-draft, non-sample reviews.
- **JSON-LD:** each review page emits a Product + Review structured-data
  block — see [src/pages/reviews/[slug].astro](src/pages/reviews/%5Bslug%5D.astro).
- **Canonical URLs:** every page emits `<link rel="canonical">` pointing at
  the `.co.uk` domain so the Netlify mirror doesn't cause duplicate-content
  issues.
- **IndexNow:** on every push to `main`, the workflow re-runs
  `npm run build` in a follow-up job and calls
  [scripts/indexnow-submit.mjs](scripts/indexnow-submit.mjs) with every
  built review/guide URL.

## Security & privacy

- **Global response headers** are set in
  [public/staticwebapp.config.json](public/staticwebapp.config.json):
  `Strict-Transport-Security`, `X-Frame-Options: DENY`,
  `X-Content-Type-Options: nosniff`, `Referrer-Policy`,
  `Permissions-Policy`. There is deliberately **no CSP** yet — adding one
  requires auditing the Beehiiv, Turnstile, Ahrefs, Decap and
  identity.netlify.com script/frame sources.
- **No cookies, no first-party tracking.** Ahrefs Web Analytics is
  cookieless. Do not add Google Analytics, Meta Pixel, or any cookie-setting
  analytics without discussion.
- **Formspree + Turnstile.** The site key is public; the secret lives in
  Formspree's dashboard, not in this repo.
- **Affiliate links** carry `rel="sponsored noopener nofollow"` and open in
  a new tab.

## Known limitations

- **No scheduled rebuild.** [`isPublished()`](src/utils/site.ts) hides
  future-dated content until the next deploy runs. If you set
  `publishedDate` in the future and don't push again, the post never
  appears. Workaround: publish same-day, or add a scheduled
  `workflow_dispatch` cron.
- **Roaster ↔ review linkage is a free-text string match.** The review
  count on `/roasters/` matches `review.data.roaster` against
  `roaster.data.name` (case-insensitive, trimmed). Renaming a roaster
  silently zeroes its review count until every review is updated.
- **Hard-coded defaults override "unset" env vars.** In particular, the
  Ahrefs analytics key falls back to the owner's key if
  `PUBLIC_AHREFS_ANALYTICS_KEY` is not set — a fork will send data to that
  account until it's changed.
- **CI does not run type-check or format.** Run `npm run check` and
  `npm run format` locally before pushing.
- **No CSP** (see [Security & privacy](#security--privacy)).
- **No test suite.** Regressions are caught by `astro check` and by manual
  review of the PR preview environment.

## Contributing

- Branch from `main`, open a PR, wait for the Azure preview URL to appear
  in the PR comments, and eyeball the change there.
- Run `npm run check` and `npm run format` locally first.
- Read [AGENTS.md](AGENTS.md) — it lists the constraints AI assistants
  (and humans) must respect.
- Prefer small PRs. Avoid drive-by refactors.

## Licence

- **Code:** MIT — see [LICENSE](LICENSE).
- **Written content and images** under `src/content/**` and
  `public/images/**` (including the "Decaf Discovered" name and logo) are
  **© Sarah Lean, all rights reserved** and are not licensed for reuse
  without prior written permission.
