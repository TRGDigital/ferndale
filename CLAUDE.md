# CLAUDE.md — Ferndale Nursing Home

Project memory for Claude Code. Read this before every task.

## What this is
A rebuild of Ferndale Nursing Home (currently WordPress at ferndalenursinghome.co.uk) as a fast,
SSR marketing site. **Cloned from the Crossways codebase** (TRG Digital's reusable care-sector
suite) and re-skinned: sage-green palette, Ferndale NAP/identity, nursing-home content. Favour
patterns that generalise. Crossways is the sister home (cross-linked in the footer).

## Re-skin status (clone from Crossways)
Done: site-config (NAP/identity), green palette (globals.css), brand rename Crossways→Ferndale
across content/pages, legal company placeholders, careTeam reduced to the manager seed, CQC badge
handles a blank location id, package name, .env placeholders.
TODO before go-live: create a NEW Supabase project (do not reuse Crossways) + Vercel project;
fill .env; `npm install`; upload Ferndale images to its own Storage and repoint the Supabase URLs
in lib/content/* (currently still point at the Crossways bucket); confirm CQC location id; write
Ferndale-specific content (team, FAQs, testimonials, services emphasis on nursing/dementia/
Parkinson's); confirm company registration details for the legal pages.

## Stack
- Next.js (App Router) + TypeScript + Tailwind, `@/` path alias
- Prisma → Supabase Postgres
- Supabase Storage for images
- Hosted on Vercel
- Architecture reference: `/docs` (Content + SEO CMS doc + schema-additions.prisma)

## Architecture decision: Option C (read path)
The site reads the DB **directly** through cached helpers in `lib/data/*` (Prisma wrapped in
`unstable_cache` with tags). There is **no Express public API** for the frontend. Keep a thin HTTP
surface ONLY for: the lead-capture POST (`/api/public/leads`), the sitemap/RSS, and the CQC fetch.
The admin console writes to the DB and POSTs `/api/revalidate` on every successful save.

Cache tags: `blog`, `blog:<slug>`, `site-pages`, `page:<path>`, `image-alts`, `footer`.
`revalidate: 60` is only a safety-net timer — tag revalidation is the real publish mechanism.

## Hard rules — never violate
1. **`trailingSlash: true`** in next.config. The old WP URLs all have trailing slashes; match them exactly.
2. **Secrets never go in `NEXT_PUBLIC_`.** The Supabase service-role key and DB URLs are server-side only.
3. **DB connections:** `DATABASE_URL` = Supabase pooled (6543, `?pgbouncer=true&connection_limit=1`) for the
   app; `DIRECT_URL` = direct (5432) for migrations only. Migrations hang against the pooler.
4. **The CQC rating is display-only.** NEVER put it in `aggregateRating` or `Review` schema — it's a
   regulatory rating, not user reviews, and misrepresenting it triggers a Google manual action.
5. **Preserve URLs.** Original paths must keep resolving. Anything that moves goes in the `Redirect`
   table and is served as a 301 by `middleware.ts`.
6. **Never hotlink the old WordPress host.** All images live in Supabase Storage.
7. **Revalidate on save.** Every admin write POSTs `/api/revalidate` with the correct tags.
8. **No full-screen popup on mobile page-load** (Google intrusive-interstitial penalty). Exit-intent,
   scroll-depth, and end-of-post are fine.

## Provided files (already written — use, don't reinvent)
- `lib/db.ts` — Prisma singleton
- `lib/data/blog.ts` — the read-layer pattern to copy for site-pages & image-alts
- `app/api/revalidate/route.ts` — on-demand revalidation (secret-protected)
- `prisma/schema.prisma` — built from `/docs/schema-additions.prisma`
- `scripts/migrate-wordpress.ts` — WP → Supabase blog migration (dry-run first, always)

## Data models
`BlogPost`, `BlogAuthor`, `SitePage`, `SiteImageAlt` (the four reusable models) plus `Redirect` and `Lead`.

## SEO conventions
- Page meta via `pageMetadata(path, fallback)` — DB value wins, code fallback never lets meta break.
- Structured data via centralised builders in `schema.ts`, injected with `<JsonLd>`.
- Org schema = **LocalBusiness** with full NAP, geo, `areaServed`; everything cross-referenced by `@id`.
- Add `alternates.canonical` to all metadata.
- Images use `<SiteImage>` (managed alt text via `<AltMapProvider>`), never bare `<img>`.

## Ferndale facts (for content, schema, NAP)
- Name: Ferndale Nursing Home · Provider: Ferndale Healthcare Limited
- Address: 124 Malthouse Road, Crawley, West Sussex, RH10 6BH
- Phone: 01293 520368 · Email: enquiries@ferndalenursinghome.co.uk
- 28 beds (18 single, 5 double), 65+ · 24-hour NURSING care + dementia/Alzheimer's + Parkinson's + respite
- Manager: Ramesh Mannick, RMN (40+ years) — Director / Registered Manager
- CQC rating: Good (confirm location id) · Accreditations: RNHA, Food Hygiene, carehome.co.uk recommended
- Sister home: Crossways Residential Care Home, Lindfield (cross-link in footer)
- Areas served: Crawley, Horsham, Mid Sussex, Gatwick

## Commands
```
npm run dev
npm run build
npx tsc --noEmit          # typecheck before declaring a step done
npm run lint
npx prisma generate
npx prisma migrate dev
npx tsx scripts/migrate-wordpress.ts --dry-run   # ALWAYS dry-run first
```

## How to work
- One runbook step per task. Run typecheck + lint before saying a step is done. Commit after each ✅.
- Never run the migration script for real without showing me the dry-run output first.
- Ask before anything destructive (dropping tables, force-pushing, deleting data).
- Don't put secrets in code, commits, or `NEXT_PUBLIC_` vars. Reference env vars by name only.

## Toolchain note (from scaffold)
This Next.js version flags breaking changes vs. older conventions (`AGENTS.md`). Before writing
framework code, check `node_modules/next/dist/docs/` for the current API.
