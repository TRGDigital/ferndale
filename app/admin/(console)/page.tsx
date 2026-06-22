import Link from "next/link";
import { prisma } from "@/lib/db";
import {
  upsertPost,
  deletePost,
  upsertAuthor,
  deleteAuthor,
  upsertPage,
  deletePage,
  saveImageAlt,
  upsertJob,
  deleteJob,
  upsertLegal,
  resetLegal,
  updateLeadStatus,
  deleteLead,
  createAdminUser,
  deleteAdminUser,
  upsertArea,
  resetArea,
} from "./actions";
import { getAdminSession, envAdminEmails } from "@/lib/auth";
import { siteImages } from "@/lib/content/site-images";
import { legalSlugs, legalDefaults } from "@/lib/content/legal";
import {
  towns,
  careTypes,
  defaultAreaContent,
} from "@/lib/content/local-areas";

export const dynamic = "force-dynamic";

type Tab =
  | "home"
  | "posts"
  | "jobs"
  | "authors"
  | "pages"
  | "areas"
  | "legal"
  | "images"
  | "leads"
  | "seo"
  | "users";
const TABS: { key: Tab; label: string; master?: boolean }[] = [
  { key: "home", label: "Home" },
  { key: "leads", label: "Leads" },
  { key: "posts", label: "Posts" },
  { key: "jobs", label: "Jobs" },
  { key: "authors", label: "Authors" },
  { key: "pages", label: "Pages" },
  { key: "areas", label: "Areas" },
  { key: "legal", label: "Legal" },
  { key: "images", label: "Images" },
  { key: "seo", label: "SEO" },
  { key: "users", label: "Users", master: true },
];

// ── tiny presentational helpers ──────────────────────────────────────────
function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required,
  hint,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  type?: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-neutral-600">{label}</span>
      {hint ? <span className="text-xs text-neutral-400">{hint}</span> : null}
      <input
        type={type}
        name={name}
        defaultValue={defaultValue ?? ""}
        required={required}
        className="rounded border border-neutral-300 px-2 py-1.5"
      />
    </label>
  );
}

function Area({
  label,
  name,
  defaultValue,
  rows = 4,
  hint,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  rows?: number;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-neutral-600">{label}</span>
      {hint ? <span className="text-xs text-neutral-400">{hint}</span> : null}
      <textarea
        name={name}
        rows={rows}
        defaultValue={defaultValue ?? ""}
        className="rounded border border-neutral-300 px-2 py-1.5 font-mono text-xs"
      />
    </label>
  );
}

function SaveBar({ editing, tab }: { editing: boolean; tab: Tab }) {
  return (
    <div className="flex items-center gap-3 pt-1">
      <button
        type="submit"
        className="rounded bg-neutral-900 px-3 py-1.5 text-sm text-white"
      >
        {editing ? "Save changes" : "Create"}
      </button>
      {editing ? (
        <Link href={`?tab=${tab}`} className="text-sm underline" prefetch={false}>
          Cancel
        </Link>
      ) : null}
    </div>
  );
}

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-lg border border-neutral-200 bg-white p-4 ${className}`}
    >
      {children}
    </div>
  );
}

// ── page ───────────────────────────────────────────────────────────────────
export default async function ConsolePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; edit?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const session = await getAdminSession();
  const isMaster = session?.role === "MASTER";
  const visibleTabs = TABS.filter((t) => !t.master || isMaster);
  const tab: Tab =
    (visibleTabs.find((t) => t.key === sp.tab)?.key ?? "home") as Tab;
  const editId = sp.edit;

  return (
    <div className="flex flex-col gap-6">
      <nav className="flex gap-2 border-b border-neutral-200">
        {visibleTabs.map((t) => (
          <Link
            key={t.key}
            href={`?tab=${t.key}`}
            prefetch={false}
            className={`-mb-px border-b-2 px-3 py-2 text-sm ${
              tab === t.key
                ? "border-neutral-900 font-medium text-neutral-900"
                : "border-transparent text-neutral-500"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {tab === "home" ? <HomeTab /> : null}
      {tab === "leads" ? <LeadsTab /> : null}
      {tab === "posts" ? <PostsTab editId={editId} /> : null}
      {tab === "jobs" ? <JobsTab editId={editId} /> : null}
      {tab === "authors" ? <AuthorsTab editId={editId} /> : null}
      {tab === "pages" ? <PagesTab editId={editId} /> : null}
      {tab === "areas" ? <AreasTab /> : null}
      {tab === "legal" ? <LegalTab /> : null}
      {tab === "images" ? <ImagesTab /> : null}
      {tab === "seo" ? <SeoTab /> : null}
      {tab === "users" && isMaster ? <UsersTab error={sp.error} /> : null}
    </div>
  );
}

// ── Home (about TRG Digital) ─────────────────────────────────────────────────
const TRG = {
  name: "TRG Digital",
  tagline: "A specialist care sector marketing agency",
  website: "https://trgdigital.co.uk",
  email: "lenny@trgdigital.co.uk",
  services: [
    "Care-sector website design & build",
    "SEO & local search visibility",
    "Lead generation & landing pages (CareBeds)",
    "Branding, copywriting & content",
    "Bespoke CRM & admin systems",
    "AI tools & automation",
  ],
};

function HomeTab() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <Card>
        <img
          // eslint-disable-next-line @next/next/no-img-element
          src="https://trmwjilicdxgrzbwzchf.supabase.co/storage/v1/object/public/blog/site/brand/trg-digital.png"
          alt={TRG.name}
          className="h-6 w-auto"
        />
        <p className="mt-3 text-sm text-neutral-500">{TRG.tagline}</p>
        <p className="mt-4 text-sm leading-relaxed text-neutral-700">
          Welcome to the Ferndale content console. This site was designed and
          built by {TRG.name}. Use the tabs above to manage enquiries, blog
          posts, job vacancies, page content, legal pages and image alt text.
          If you need a hand, just get in touch.
        </p>

        <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-lg border border-neutral-200 p-3">
            <dt className="text-xs font-medium uppercase tracking-wide text-neutral-400">
              Website
            </dt>
            <dd className="mt-1">
              <a
                href={TRG.website}
                target="_blank"
                rel="noopener"
                className="font-medium text-neutral-900 underline"
              >
                trgdigital.co.uk
              </a>
            </dd>
          </div>
          <div className="rounded-lg border border-neutral-200 p-3">
            <dt className="text-xs font-medium uppercase tracking-wide text-neutral-400">
              Email
            </dt>
            <dd className="mt-1">
              <a
                href={`mailto:${TRG.email}`}
                className="font-medium text-neutral-900 underline"
              >
                {TRG.email}
              </a>
            </dd>
          </div>
        </dl>
      </Card>

      <Card>
        <h2 className="mb-3 font-medium">What we do</h2>
        <ul className="space-y-2 text-sm text-neutral-700">
          {TRG.services.map((s) => (
            <li key={s} className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-900" />
              {s}
            </li>
          ))}
        </ul>
        <a
          href={TRG.website}
          target="_blank"
          rel="noopener"
          className="mt-5 inline-block rounded bg-neutral-900 px-3 py-1.5 text-sm text-white"
        >
          Visit our website
        </a>
      </Card>
    </div>
  );
}

// ── Posts ────────────────────────────────────────────────────────────────
async function PostsTab({ editId }: { editId?: string }) {
  const [posts, authors, editing] = await Promise.all([
    prisma.blogPost.findMany({
      orderBy: { updatedAt: "desc" },
      include: { author: true },
    }),
    prisma.blogAuthor.findMany({ orderBy: { name: "asc" } }),
    editId
      ? prisma.blogPost.findUnique({ where: { id: editId } })
      : Promise.resolve(null),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <h2 className="mb-3 font-medium">Posts ({posts.length})</h2>
        <ul className="max-h-[55vh] divide-y divide-neutral-100 overflow-y-auto pr-1 text-sm">
          {posts.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between gap-2 py-2"
            >
              <span className="truncate">
                <span className="font-medium">{p.title}</span>{" "}
                <span className="text-neutral-400">/{p.slug}</span>
              </span>
              <span className="flex items-center gap-2">
                <span
                  className={`rounded px-1.5 py-0.5 text-xs ${
                    p.status === "PUBLISHED"
                      ? "bg-green-100 text-green-700"
                      : "bg-neutral-100 text-neutral-500"
                  }`}
                >
                  {p.status}
                </span>
                <Link
                  href={`?tab=posts&edit=${p.id}`}
                  prefetch={false}
                  className="underline"
                >
                  Edit
                </Link>
                <form action={deletePost}>
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="slug" value={p.slug} />
                  <button className="text-red-600 underline">Delete</button>
                </form>
              </span>
            </li>
          ))}
          {posts.length === 0 ? (
            <li className="py-2 text-neutral-400">No posts yet.</li>
          ) : null}
        </ul>
      </Card>

      <Card>
        <h2 className="mb-3 font-medium">
          {editing ? "Edit post" : "New post"}
        </h2>
        <form action={upsertPost} className="flex flex-col gap-3">
          {editing ? (
            <input type="hidden" name="id" value={editing.id} />
          ) : null}
          <Field label="Title" name="title" defaultValue={editing?.title} required />
          <Field label="Slug" name="slug" defaultValue={editing?.slug} required />
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-neutral-600">Status</span>
            <select
              name="status"
              defaultValue={editing?.status ?? "DRAFT"}
              className="rounded border border-neutral-300 px-2 py-1.5"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-neutral-600">Author</span>
            <select
              name="authorId"
              defaultValue={editing?.authorId ?? ""}
              className="rounded border border-neutral-300 px-2 py-1.5"
            >
              <option value="">— none —</option>
              {authors.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>
          <Area label="Excerpt" name="excerpt" defaultValue={editing?.excerpt} rows={2} />
          <Area label="Content (HTML)" name="content" defaultValue={editing?.content} rows={8} />
          <Field label="Cover image URL" name="coverImageUrl" defaultValue={editing?.coverImageUrl} />
          <Field label="Cover image alt" name="coverImageAlt" defaultValue={editing?.coverImageAlt} />
          <Field label="Tags (comma-separated)" name="tags" defaultValue={editing?.tags.join(", ")} />
          <Field label="SEO title" name="seoTitle" defaultValue={editing?.seoTitle} />
          <Field label="Meta description" name="metaDescription" defaultValue={editing?.metaDescription} />
          <Field
            label="Canonical URL"
            name="canonicalUrl"
            defaultValue={editing?.canonicalUrl}
            hint="Optional — leave blank to auto-use this page's own URL."
          />
          <Area
            label="FAQs (JSON)"
            name="faqs"
            hint='[{"question":"…","answer":"…"}]'
            defaultValue={editing?.faqs ? JSON.stringify(editing.faqs, null, 2) : ""}
          />
          <SaveBar editing={!!editing} tab="posts" />
        </form>
      </Card>
    </div>
  );
}

// ── Authors ────────────────────────────────────────────────────────────────
async function AuthorsTab({ editId }: { editId?: string }) {
  const [authors, editing] = await Promise.all([
    prisma.blogAuthor.findMany({ orderBy: { name: "asc" } }),
    editId
      ? prisma.blogAuthor.findUnique({ where: { id: editId } })
      : Promise.resolve(null),
  ]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Card>
        <h2 className="mb-3 font-medium">Authors ({authors.length})</h2>
        <ul className="divide-y divide-neutral-100 text-sm">
          {authors.map((a) => (
            <li key={a.id} className="flex items-center justify-between py-2">
              <span>
                {a.name}{" "}
                <span className="text-neutral-400">/{a.slug}</span>
              </span>
              <span className="flex items-center gap-2">
                <Link href={`?tab=authors&edit=${a.id}`} prefetch={false} className="underline">
                  Edit
                </Link>
                <form action={deleteAuthor}>
                  <input type="hidden" name="id" value={a.id} />
                  <button className="text-red-600 underline">Delete</button>
                </form>
              </span>
            </li>
          ))}
          {authors.length === 0 ? (
            <li className="py-2 text-neutral-400">No authors yet.</li>
          ) : null}
        </ul>
      </Card>

      <Card>
        <h2 className="mb-3 font-medium">{editing ? "Edit author" : "New author"}</h2>
        <form action={upsertAuthor} className="flex flex-col gap-3">
          {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
          <Field label="Name" name="name" defaultValue={editing?.name} required />
          <Field label="Slug" name="slug" defaultValue={editing?.slug} required />
          <Field label="Email" name="email" type="email" defaultValue={editing?.email} />
          <Field label="Avatar URL" name="avatarUrl" defaultValue={editing?.avatarUrl} />
          <Area label="Bio" name="bio" defaultValue={editing?.bio} rows={3} />
          <SaveBar editing={!!editing} tab="authors" />
        </form>
      </Card>
    </div>
  );
}

// ── Pages ────────────────────────────────────────────────────────────────
async function PagesTab({ editId }: { editId?: string }) {
  const [pages, editing] = await Promise.all([
    prisma.sitePage.findMany({ orderBy: { path: "asc" } }),
    editId
      ? prisma.sitePage.findUnique({ where: { id: editId } })
      : Promise.resolve(null),
  ]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Card>
        <h2 className="mb-3 font-medium">Pages ({pages.length})</h2>
        <ul className="divide-y divide-neutral-100 text-sm">
          {pages.map((pg) => (
            <li key={pg.id} className="flex items-center justify-between py-2">
              <span>
                <span className="font-mono text-xs">{pg.path}</span> — {pg.title}
              </span>
              <span className="flex items-center gap-2">
                <Link href={`?tab=pages&edit=${pg.id}`} prefetch={false} className="underline">
                  Edit
                </Link>
                <form action={deletePage}>
                  <input type="hidden" name="id" value={pg.id} />
                  <input type="hidden" name="path" value={pg.path} />
                  <button className="text-red-600 underline">Delete</button>
                </form>
              </span>
            </li>
          ))}
          {pages.length === 0 ? (
            <li className="py-2 text-neutral-400">No pages yet.</li>
          ) : null}
        </ul>
      </Card>

      <Card>
        <h2 className="mb-3 font-medium">{editing ? "Edit page" : "New page"}</h2>
        <form action={upsertPage} className="flex flex-col gap-3">
          {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
          <Field label="Path (e.g. /about/)" name="path" defaultValue={editing?.path} required />
          <Field label="Title" name="title" defaultValue={editing?.title} required />
          <Field label="Meta title" name="metaTitle" defaultValue={editing?.metaTitle} />
          <Field label="Meta description" name="metaDescription" defaultValue={editing?.metaDescription} />
          <Field
            label="Canonical URL"
            name="canonicalUrl"
            defaultValue={editing?.canonicalUrl}
            hint="Optional — leave blank to auto-use this page's own URL."
          />
          <Field label="OG image URL" name="ogImageUrl" defaultValue={editing?.ogImageUrl} />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="published"
              defaultChecked={editing?.published ?? true}
            />
            Published
          </label>
          <Area
            label="FAQs (JSON)"
            name="faqs"
            hint='[{"question":"…","answer":"…"}]'
            defaultValue={editing?.faqs ? JSON.stringify(editing.faqs, null, 2) : ""}
          />
          <Area
            label="Footer (JSON)"
            name="footer"
            hint="footer fields for this page (NAP, links, etc.)"
            defaultValue={editing?.footer ? JSON.stringify(editing.footer, null, 2) : ""}
          />
          <SaveBar editing={!!editing} tab="pages" />
        </form>
      </Card>
    </div>
  );
}

// ── Images / alt tags ────────────────────────────────────────────────────────
async function ImagesTab() {
  const overrides = await prisma.siteImageAlt.findMany();
  const map = Object.fromEntries(overrides.map((o) => [o.src, o.alt]));
  const customCount = siteImages.filter((img) => map[img.src]).length;

  return (
    <Card>
      <h2 className="mb-1 font-medium">
        Site images ({siteImages.length}) · {customCount} customised
      </h2>
      <p className="mb-4 text-sm text-neutral-500">
        Every photo and logo used across the site. Edit the alt text (the
        description read by screen readers and search engines) and press Save.
        Saved text is used live on the site; clear it to restore the default.
        Blog post images are managed on the Posts tab.
      </p>
      <ul className="space-y-3">
        {siteImages.map((img) => {
          const current = map[img.src];
          return (
            <li
              key={img.src}
              className="flex flex-col gap-3 rounded-lg border border-neutral-200 p-3 sm:flex-row sm:items-center"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.src}
                alt=""
                loading="lazy"
                className="h-16 w-24 shrink-0 rounded border border-neutral-200 bg-neutral-50 object-contain"
              />
              <form
                action={saveImageAlt}
                className="flex flex-1 flex-col gap-1.5"
              >
                <input type="hidden" name="src" value={img.src} />
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-neutral-500">
                    {img.location}
                  </span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-xs ${
                      current
                        ? "bg-green-100 text-green-700"
                        : "bg-neutral-100 text-neutral-500"
                    }`}
                  >
                    {current ? "Custom" : "Default"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <input
                    name="alt"
                    defaultValue={current ?? img.alt}
                    placeholder={img.alt}
                    className="flex-1 rounded border border-neutral-300 px-2 py-1.5 text-sm"
                  />
                  <button
                    type="submit"
                    className="shrink-0 rounded bg-neutral-900 px-3 py-1.5 text-sm text-white"
                  >
                    Save
                  </button>
                </div>
              </form>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

// ── Local-area landing pages ─────────────────────────────────────────────────
async function AreasTab() {
  const rows = await prisma.areaPage.findMany();
  const byPath = new Map(rows.map((r) => [r.path, r]));
  const total = towns.length * careTypes.length;

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-neutral-500">
        Local-area landing pages ({total}). Edit the heading, intro and
        &ldquo;more about&rdquo; text for each town &amp; care type. Saved values
        override the default wording; intro and body are HTML. The rest of each
        page is templated.
      </p>
      {towns.map((town) => (
        <Card key={town.slug}>
          <h2 className="mb-3 font-medium">{town.name}</h2>
          <div className="space-y-4">
            {careTypes.map((care) => {
              const path = `/${town.slug}/${care.slug}/`;
              const row = byPath.get(path);
              const def = defaultAreaContent(town, care);
              return (
                <form
                  key={path}
                  action={upsertArea}
                  className="space-y-2 rounded-lg border border-neutral-200 p-3"
                >
                  <input type="hidden" name="path" value={path} />
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">
                      {care.name}{" "}
                      <a
                        href={path}
                        target="_blank"
                        rel="noopener"
                        className="font-mono text-xs text-neutral-400 underline"
                      >
                        {path}
                      </a>
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-xs ${
                        row
                          ? "bg-green-100 text-green-700"
                          : "bg-neutral-100 text-neutral-500"
                      }`}
                    >
                      {row ? "Saved" : "Default"}
                    </span>
                  </div>
                  <Field
                    label="Heading"
                    name="heading"
                    defaultValue={row?.heading ?? def.heading}
                  />
                  <Area
                    label="Intro — top of page (HTML)"
                    name="intro"
                    rows={3}
                    defaultValue={row?.intro ?? def.intro}
                  />
                  <Area
                    label="More about — extra paragraphs (HTML)"
                    name="body"
                    rows={5}
                    defaultValue={row?.body ?? def.body}
                  />
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      type="submit"
                      className="rounded bg-neutral-900 px-3 py-1.5 text-sm text-white"
                    >
                      Save
                    </button>
                    {row ? (
                      <button
                        type="submit"
                        formAction={resetArea}
                        className="text-sm text-red-600 underline"
                      >
                        Reset
                      </button>
                    ) : null}
                  </div>
                </form>
              );
            })}
          </div>
        </Card>
      ))}
    </div>
  );
}

// ── Legal pages ──────────────────────────────────────────────────────────────
async function LegalTab() {
  const rows = await prisma.legalPage.findMany();
  const map = Object.fromEntries(rows.map((r) => [r.slug, r]));

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-neutral-500">
        Edit the legal pages shown in the footer. Content is HTML (headings
        &lt;h2&gt;/&lt;h3&gt;, paragraphs &lt;p&gt;, lists &lt;ul&gt;&lt;li&gt;,
        links &lt;a&gt;). Saved changes go live immediately. “Reset” restores the
        original wording.
      </p>
      {legalSlugs.map((slug) => {
        const row = map[slug];
        const def = legalDefaults[slug];
        return (
          <Card key={slug}>
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="font-medium">
                {def.title}{" "}
                <a
                  href={`/${slug}/`}
                  target="_blank"
                  rel="noopener"
                  className="font-mono text-xs text-neutral-400 underline"
                >
                  /{slug}/
                </a>
              </h2>
              <span
                className={`rounded px-1.5 py-0.5 text-xs ${
                  row
                    ? "bg-green-100 text-green-700"
                    : "bg-neutral-100 text-neutral-500"
                }`}
              >
                {row ? "Customised" : "Default"}
              </span>
            </div>
            <form action={upsertLegal} className="flex flex-col gap-3">
              <input type="hidden" name="slug" value={slug} />
              <Field
                label="Page title"
                name="title"
                defaultValue={row?.title ?? def.title}
                required
              />
              <Area
                label="Content (HTML)"
                name="content"
                defaultValue={row?.content ?? def.content}
                rows={16}
              />
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="submit"
                  className="rounded bg-neutral-900 px-3 py-1.5 text-sm text-white"
                >
                  Save changes
                </button>
                {row ? (
                  <button
                    type="submit"
                    formAction={resetLegal}
                    className="text-sm text-red-600 underline"
                  >
                    Reset to default
                  </button>
                ) : null}
              </div>
            </form>
          </Card>
        );
      })}
    </div>
  );
}

// ── Jobs / vacancies ─────────────────────────────────────────────────────────
function dateInputValue(d: Date | null): string {
  if (!d) return "";
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? "" : dt.toISOString().slice(0, 10);
}

async function JobsTab({ editId }: { editId?: string }) {
  const [jobs, editing] = await Promise.all([
    prisma.jobPosting.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    }),
    editId
      ? prisma.jobPosting.findUnique({ where: { id: editId } })
      : Promise.resolve(null),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <h2 className="mb-1 font-medium">Vacancies ({jobs.length})</h2>
        <p className="mb-3 text-sm text-neutral-500">
          Published vacancies show on the careers page. Unpublished ones are
          hidden (drafts).
        </p>
        <ul className="divide-y divide-neutral-100 text-sm">
          {jobs.map((j) => (
            <li key={j.id} className="flex items-center justify-between gap-2 py-2">
              <span className="truncate">
                <span className="font-medium">{j.title}</span>
                {j.type ? (
                  <span className="text-neutral-400"> · {j.type}</span>
                ) : null}
              </span>
              <span className="flex items-center gap-2">
                <span
                  className={`rounded px-1.5 py-0.5 text-xs ${
                    j.published
                      ? "bg-green-100 text-green-700"
                      : "bg-neutral-100 text-neutral-500"
                  }`}
                >
                  {j.published ? "Published" : "Draft"}
                </span>
                <Link
                  href={`?tab=jobs&edit=${j.id}`}
                  prefetch={false}
                  className="underline"
                >
                  Edit
                </Link>
                <form action={deleteJob}>
                  <input type="hidden" name="id" value={j.id} />
                  <button className="text-red-600 underline">Delete</button>
                </form>
              </span>
            </li>
          ))}
          {jobs.length === 0 ? (
            <li className="py-2 text-neutral-400">No vacancies yet.</li>
          ) : null}
        </ul>
      </Card>

      <Card>
        <h2 className="mb-3 font-medium">
          {editing ? "Edit vacancy" : "New vacancy"}
        </h2>
        <form action={upsertJob} className="flex flex-col gap-3">
          {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
          <Field label="Job title" name="title" defaultValue={editing?.title} required />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Type (e.g. Full-time)" name="type" defaultValue={editing?.type} />
            <Field label="Hours (e.g. 36 hrs/week)" name="hours" defaultValue={editing?.hours} />
            <Field label="Salary / rate" name="salary" defaultValue={editing?.salary} />
            <Field label="Location" name="location" defaultValue={editing?.location ?? "Lindfield, West Sussex"} />
          </div>
          <Field
            label="Summary (one line)"
            name="summary"
            defaultValue={editing?.summary}
            hint="Short teaser shown under the title."
          />
          <Area
            label="Description"
            name="description"
            defaultValue={editing?.description}
            rows={8}
            hint="Full role description. Plain text; blank lines start new paragraphs."
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Closing date"
              name="closingDate"
              type="date"
              defaultValue={dateInputValue(editing?.closingDate ?? null)}
            />
            <Field
              label="Sort order"
              name="sortOrder"
              type="number"
              defaultValue={editing ? String(editing.sortOrder) : "0"}
              hint="Lower numbers show first."
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="published"
              defaultChecked={editing?.published ?? false}
            />
            Published (visible on the careers page)
          </label>
          <SaveBar editing={!!editing} tab="jobs" />
        </form>
      </Card>
    </div>
  );
}

// ── Leads / CRM ────────────────────────────────────────────────────────────
const INTENT_LABEL: Record<string, string> = {
  BOOK_VISIT: "Visit enquiry",
  BROCHURE: "Brochure request",
  CAREERS: "Job application",
};
const INTENT_STYLE: Record<string, string> = {
  BOOK_VISIT: "bg-blue-100 text-blue-700",
  BROCHURE: "bg-neutral-100 text-neutral-600",
  CAREERS: "bg-orange-100 text-orange-700",
};
const STATUSES = ["NEW", "CONTACTED", "CLOSED"];

function fmtDateTime(d: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

async function LeadsTab() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <Card>
      <h2 className="mb-1 font-medium">Leads &amp; applications ({leads.length})</h2>
      <p className="mb-4 text-sm text-neutral-500">
        Enquiries, brochure requests and job applications. Applications include a
        CV download.
      </p>
      <ul className="space-y-4">
        {leads.map((l) => {
          const meta = (l.meta ?? {}) as {
            position?: string | null;
            cvName?: string | null;
            cvPath?: string | null;
          };
          return (
            <li
              key={l.id}
              className="rounded-lg border border-neutral-200 p-4 text-sm"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{l.name}</span>
                <span
                  className={`rounded px-1.5 py-0.5 text-xs ${
                    INTENT_STYLE[l.intent] ?? "bg-neutral-100"
                  }`}
                >
                  {INTENT_LABEL[l.intent] ?? l.intent}
                </span>
                <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-600">
                  {l.status}
                </span>
                <span className="ml-auto text-xs text-neutral-400">
                  {fmtDateTime(l.createdAt)}
                </span>
              </div>

              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-neutral-600">
                {l.email ? (
                  <a href={`mailto:${l.email}`} className="underline">
                    {l.email}
                  </a>
                ) : null}
                {l.phone ? <span>{l.phone}</span> : null}
                {l.source ? (
                  <span className="text-neutral-400">via {l.source}</span>
                ) : null}
                {meta.position ? (
                  <span className="font-medium text-neutral-700">
                    Position: {meta.position}
                  </span>
                ) : null}
              </div>

              {l.message ? (
                <p className="mt-2 whitespace-pre-wrap text-neutral-700">
                  {l.message}
                </p>
              ) : null}

              <div className="mt-3 flex flex-wrap items-center gap-3">
                {meta.cvPath ? (
                  <a
                    href={`/admin/cv/${l.id}`}
                    target="_blank"
                    rel="noopener"
                    className="rounded bg-neutral-900 px-2.5 py-1 text-xs text-white"
                  >
                    Download CV{meta.cvName ? ` (${meta.cvName})` : ""}
                  </a>
                ) : null}
                <form action={updateLeadStatus} className="flex items-center gap-1">
                  <input type="hidden" name="id" value={l.id} />
                  <select
                    name="status"
                    defaultValue={l.status}
                    className="rounded border border-neutral-300 px-1.5 py-1 text-xs"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <button className="text-xs underline">Update</button>
                </form>
                <form action={deleteLead}>
                  <input type="hidden" name="id" value={l.id} />
                  <button className="text-xs text-red-600 underline">Delete</button>
                </form>
              </div>
            </li>
          );
        })}
        {leads.length === 0 ? (
          <li className="text-neutral-400">No leads yet.</li>
        ) : null}
      </ul>
    </Card>
  );
}

// ── Users (master only) ──────────────────────────────────────────────────────
async function UsersTab({ error }: { error?: string }) {
  const users = await prisma.adminUser.findMany({ orderBy: { createdAt: "asc" } });
  const owners = envAdminEmails();

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1fr_360px]">
      <Card>
        <h2 className="mb-1 font-medium">Admin users</h2>
        <p className="mb-3 text-sm text-neutral-500">
          Owners are set in config and are always master. You can add client
          logins (content only) or additional masters.
        </p>
        <ul className="divide-y divide-neutral-100 text-sm">
          {owners.map((e) => (
            <li key={e} className="flex items-center justify-between py-2">
              <span>{e}</span>
              <span className="rounded bg-neutral-200 px-1.5 py-0.5 text-xs text-neutral-700">
                Master · Owner
              </span>
            </li>
          ))}
          {users.map((u) => (
            <li key={u.id} className="flex items-center justify-between py-2">
              <span>{u.email}</span>
              <span className="flex items-center gap-2">
                <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-600">
                  {u.role === "MASTER" ? "Master" : "Client"}
                </span>
                <form action={deleteAdminUser}>
                  <input type="hidden" name="id" value={u.id} />
                  <button className="text-red-600 underline">Remove</button>
                </form>
              </span>
            </li>
          ))}
          {users.length === 0 ? (
            <li className="py-2 text-neutral-400">No added users yet.</li>
          ) : null}
        </ul>
      </Card>

      <Card className="lg:sticky lg:top-6">
        <h2 className="mb-3 font-medium">Add a user</h2>
        {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}
        <form action={createAdminUser} className="flex flex-col gap-3">
          <Field label="Email" name="email" type="email" required />
          <Field
            label="Password"
            name="password"
            type="text"
            hint="At least 8 characters — share it with the user; they can change it later."
            required
          />
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-neutral-600">Role</span>
            <select
              name="role"
              defaultValue="CLIENT"
              className="rounded border border-neutral-300 px-2 py-1.5"
            >
              <option value="CLIENT">Client — content only</option>
              <option value="MASTER">Master — can manage users</option>
            </select>
          </label>
          <button
            type="submit"
            className="rounded bg-neutral-900 px-3 py-1.5 text-sm text-white"
          >
            Create user
          </button>
        </form>
      </Card>
    </div>
  );
}

// ── SEO / site files ─────────────────────────────────────────────────────────
function SeoTab() {
  const files = [
    { label: "Sitemap", href: "/sitemap.xml", desc: "All public URLs, for search engines." },
    { label: "Robots.txt", href: "/robots.txt", desc: "Crawler rules + a pointer to the sitemap." },
    { label: "LLMs.txt", href: "/llms.txt", desc: "A plain-text site summary for AI assistants." },
    { label: "RSS feed", href: "/blog/feed.xml", desc: "The blog feed for readers and aggregators." },
  ];
  return (
    <Card>
      <h2 className="mb-1 font-medium">SEO &amp; site files</h2>
      <p className="mb-4 text-sm text-neutral-500">
        These are generated automatically from your published content.
      </p>
      <ul className="divide-y divide-neutral-100">
        {files.map((f) => (
          <li key={f.href} className="flex items-center justify-between gap-4 py-3">
            <span className="text-sm">
              <span className="font-medium">{f.label}</span>
              <span className="block text-neutral-500">{f.desc}</span>
              <span className="block text-xs text-neutral-400">{f.href}</span>
            </span>
            <a
              href={f.href}
              target="_blank"
              rel="noopener"
              className="shrink-0 rounded bg-neutral-900 px-2.5 py-1 text-xs text-white"
            >
              Open
            </a>
          </li>
        ))}
      </ul>
    </Card>
  );
}
