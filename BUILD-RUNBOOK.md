# Crossways Care Home — Claude Code Build Runbook

Feed these to Claude Code **in order**, one at a time. After each ✅ check passes, commit.
Steps marked **[YOU]** are dashboard/credential tasks Claude Code can't (and shouldn't) do.

---

## Phase 0 — Prep (before any Claude Code prompt)

- **[YOU]** Confirm the WP REST API is live: open
  `https://www.crosswayscarehome.co.uk/wp-json/wp/v2/posts?per_page=1` in a browser. JSON = good.
- **[YOU] Supabase:** copy the **pooled** connection string (port 6543, add `?pgbouncer=true&connection_limit=1`)
  and the **direct** string (port 5432). Copy the **service-role key**. Create a **public** Storage bucket named `blog`.
- **[YOU] Vercel:** connect the GitHub repo, then set env vars (below).
- **[YOU] CQC:** register at `https://api-portal.service.cqc.org.uk/`, get an API key + partner code,
  and find the Crossways **location ID** (`1-XXXXXXXXX`).

### Env vars (Vercel + local `.env` — never paste secrets into chat)
```
DATABASE_URL=            # Supabase POOLED (6543, ?pgbouncer=true&connection_limit=1)
DIRECT_URL=              # Supabase DIRECT (5432) — migrations only
SUPABASE_URL=https://trmwjilicdxgrzbwzchf.supabase.co   # public, not a secret
SUPABASE_SERVICE_ROLE_KEY=   # SECRET — server-side only, never NEXT_PUBLIC_
REVALIDATE_SECRET=           # any long random string
SITE_URL=https://crosswayscarehome.vercel.app
SITE_NAME=Crossways Residential Care Home
CQC_LOCATION_ID=
CQC_PARTNER_CODE=TRGDIGITAL
CQC_API_KEY=
```

---

## Phase 1 — Scaffold & foundation

**1. Scaffold**
> Scaffold a Next.js app (App Router, TypeScript, Tailwind, `@/` alias) into this empty repo.
> Set `trailingSlash: true` in next.config. Add a sensible .gitignore and a .env.example listing the
> vars from CLAUDE.md (no values). Get `npm run dev` working.

✅ Dev server runs; `/` renders the starter page.

**2. Prisma + schema**
> Add Prisma. Create `prisma/schema.prisma` containing the four reusable models from /docs
> (BlogPost, BlogAuthor, SitePage, SiteImageAlt) plus the Redirect and Lead models and the
> datasource/generator block from `/docs/schema-additions.prisma`. Run `prisma generate` and
> `prisma migrate dev --name init`.

✅ Tables exist in Supabase (check the Table Editor).

**3. Option C data layer**
> Add the provided `lib/db.ts`, `lib/data/blog.ts`, and `app/api/revalidate/route.ts`.
> Then create `lib/data/site-pages.ts` and `lib/data/image-alts.ts` following the exact same
> `unstable_cache` + tags pattern as `blog.ts`.

✅ `lib/data/*` typechecks; no HTTP fetches to a public API anywhere in the read path.

**4. Port the reusable architecture**
> Port these libs from /docs into this app, adapted for the Option C read path (read Prisma via
> `lib/data`, not an Express API): `schema.ts` + `<JsonLd>`, `page-meta.ts` (`pageMetadata()`),
> and `image-alts` + `<AltMapProvider>` + `<SiteImage>`. Then build the admin console — the four-tab
> page (Posts, Authors, Pages, Alt Tags) — as CRUD behind admin auth, and make every successful save
> POST to `/api/revalidate` with the right tags.

✅ Admin console can create a draft post; saving it revalidates and it appears on the site.

---

## Phase 2 — Migrate the blog

**5. Run the migration**
> Add the provided `scripts/migrate-wordpress.ts`. Install `tsx` and `@supabase/supabase-js`.
> Run it with `--dry-run` and show me the output, then (after I confirm) run it for real.

✅ All ~22 posts + images in Supabase; the `/news/...` redirect seeded; spot-check 2 Elementor posts.

---

## Phase 3 — Public site

**6. Blog pages**
> Build `/blog` (card list) and `/blog/[slug]` (full post) as Server Components reading through
> `lib/data/blog.ts`. Use `generateStaticParams` from published slugs and `generateMetadata` via
> `pageMetadata()`. Inject `blogPostingSchema` + `faqPageSchema` (when the post has FAQs) with `<JsonLd>`.

✅ Migrated posts render at their original `/blog/<slug>/` URLs with valid JSON-LD.

**7. Redirects middleware**
> Add `middleware.ts` that looks up the requested path in the Redirect table and issues the stored
> 301. Cache the redirect map so it's not a DB hit per request.

✅ `/news/crossways-residential-care-home-new-website/` 301s to its `/blog/...` URL.

**8. Marketing pages + page meta**
> Rebuild Home, About Us, Careers, Activities, Care Team, Contact Us as SSR pages with the new design,
> keeping their existing paths. Seed SitePage records for each (meta + footer fields). Move the big FAQ
> block into SitePage FAQs and render it with `faqPageSchema`.

✅ Every old top-level URL resolves; meta comes from SitePage with code fallback.

**9. Global schema (care-home profile)**
> In the root layout, render `organizationSchema` as a **LocalBusiness** with full NAP
> (2 Sunte Avenue, Lindfield, RH16 2AA; 01444 416 841), geo, `areaServed` (Lindfield / Haywards Heath /
> Mid Sussex), plus `webSiteSchema` and `siteNavigationSchema`. Anchor everything by `@id`.

✅ Rich Results Test shows LocalBusiness + WebSite, cross-referenced by @id.

---

## Phase 4 — Care-suite modules

**10. Live CQC footer**
> Build a server-side module that fetches the CQC Syndication API for `CQC_LOCATION_ID` (with
> `partnerCode` + API key), cached with a daily revalidate and a last-known-good fallback if the call
> fails. Render a branded ratings badge. Then build the new footer driven by SitePage footer fields:
> NAP, accreditations (RNHA, Food Hygiene, carehome.co.uk), the live CQC badge, and the Ferndale
> cross-link. The CQC rating is display-only — do NOT put it in aggregateRating/Review markup.

✅ Footer shows the current CQC rating; killing the API call falls back, never blanks.

**11. Lead capture endpoint**
> Add `app/api/public/leads/route.ts` — a POST that validates and writes to the Lead table, with an
> optional webhook to an email/CRM endpoint from env. Rate-limit it.

✅ A test POST creates a Lead row.

**12. Exit / scroll popup module**
> Build a reusable, config-driven popup: triggers for exit-intent (desktop), scroll depth, time-on-page,
> and end-of-blog-post. Two intents — "Book a visit" and "Request a brochure / more info" — posting to
> `/api/public/leads`. Frequency-cap with a cookie, make it accessible (focus trap, ESC, ARIA), and
> only fire after cookie consent. No full-screen popup on mobile page-load (intrusive-interstitial risk).

✅ Popup fires once per session on the right triggers; submissions land in Lead.

---

## Phase 5 — SEO finishers & launch

**13. Sitemap / robots / RSS / canonical**
> Generate dynamic `sitemap.xml` and `robots.txt` from published BlogPost + SitePage (lastmod from
> updatedAt), add `alternates.canonical` to all metadata, and an RSS feed at `/blog/feed.xml`.

✅ Sitemap lists every live URL with correct lastmod; canonicals present.

**14. Pre-launch QA** *(you + Claude Code)*
> Crawl the old site (or pull its old XML sitemap), diff against the new routes, and add any missing
> Redirect rows. Run Lighthouse and a schema validation pass; fix regressions.

✅ No orphaned old URLs; Lighthouse green; schema validates.

**15. Launch** **[YOU]**
- Point DNS to Vercel, set the production domain, update SITE_URL.
- Submit the new sitemap in Google Search Console; watch Coverage + 404s for a week.

---

### Reuse note
Phases 1, 4, 5 are site-agnostic. For the next care-sector site, clone this repo, swap the env vars
(`SITE_*`, `CQC_LOCATION_ID`) and the seed content, and re-run Phase 2 against the new WordPress source.
