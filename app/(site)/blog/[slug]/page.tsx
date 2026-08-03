import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPostBySlug, getPublishedSlugs } from "@/lib/data/blog";
import { pageMetadata } from "@/lib/page-meta";
import { JsonLd } from "@/components/JsonLd";
import { blogPostingSchema, faqPageSchema, type Faq } from "@/lib/schema";
import { siteConfig } from "@/lib/site-config";
import { processBlogContent } from "@/lib/blog-content";
import { splitHtmlForCtas } from "@/lib/blog-cta";
import { BlogCta } from "@/components/site/BlogCta";
import { EnquiryProvider } from "@/components/site/EnquiryDialog";
import { Fragment } from "react";

type Params = { slug: string };

export async function generateStaticParams() {
  // Resilient so credential-less builds don't fail; new slugs render on demand.
  const slugs = await getPublishedSlugs().catch(() => []);
  return slugs.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug).catch(() => null);
  return pageMetadata(`/blog/${slug}/`, {
    title: post ? post.title : siteConfig.name,
    description: post?.excerpt ?? undefined,
    ogImageUrl: post?.coverImageUrl ?? undefined,
  });
}

/** Coerce the JSON `faqs` column into a typed list (tolerates bad shapes). */
function readFaqs(value: unknown): Faq[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (f): f is Faq =>
      !!f &&
      typeof (f as Faq).question === "string" &&
      typeof (f as Faq).answer === "string",
  );
}

function formatDate(d: Date | string | null) {
  if (!d) return "";
  const dt = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(dt.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(dt);
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug).catch(() => null);
  if (!post || post.status !== "PUBLISHED") notFound();

  const faqs = readFaqs(post.faqs);
  const url = `${siteConfig.url}/blog/${post.slug}/`;

  // Give the migrated body proper heading anchors + a table of contents.
  const { html: contentHtml, toc } = processBlogContent(post.content);

  return (
    <EnquiryProvider>
    <main className="mx-auto max-w-3xl px-6 py-12">
      <JsonLd
        data={[
          blogPostingSchema(post),
          ...(faqs.length ? [faqPageSchema(faqs, url)] : []),
        ]}
      />

      <article>
        <header className="mb-8">
          <time className="text-xs uppercase tracking-wide text-neutral-400">
            {formatDate(post.publishedAt)}
          </time>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            {post.title}
          </h1>
          {post.author ? (
            <p className="mt-2 text-sm text-neutral-500">By {post.author.name}</p>
          ) : null}
        </header>

        {post.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- migrated HTML body uses absolute Supabase URLs
          <img
            src={post.coverImageUrl}
            alt={post.coverImageAlt ?? ""}
            className="mb-8 w-full rounded-lg object-cover"
          />
        ) : null}

        {/* In-page table of contents — only when there are enough sections. */}
        {toc.length >= 2 ? (
          <nav
            aria-label="On this page"
            className="mb-8 rounded-lg border border-neutral-200 bg-neutral-50 p-5"
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
              On this page
            </p>
            <ol className="space-y-1.5 text-sm">
              {toc.map((item) => (
                <li key={item.id} className={item.level === 3 ? "ml-4" : ""}>
                  <a
                    href={`#${item.id}`}
                    className="text-brand-700 hover:underline"
                  >
                    {item.text}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        ) : null}

        {/* Content is migrated, sanitised-at-source WordPress/Elementor HTML, with heading anchors
            + a demoted body H1 applied server-side. Split once so a single enquiry CTA sits mid-post. */}
        {splitHtmlForCtas(contentHtml, 1).map((part, idx, parts) => (
          <Fragment key={idx}>
            <div
              className="prose prose-neutral max-w-none"
              dangerouslySetInnerHTML={{ __html: part }}
            />
            {idx < parts.length - 1 ? <BlogCta /> : null}
          </Fragment>
        ))}

        {/* Author details */}
        {post.author ? (
          <aside className="mt-12 flex items-start gap-4 rounded-lg border border-neutral-200 bg-neutral-50 p-5">
            {post.author.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- avatar uses an absolute Supabase URL
              <img
                src={post.author.avatarUrl}
                alt={post.author.name}
                className="h-14 w-14 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-50 text-lg font-semibold text-brand-700">
                {post.author.name.charAt(0)}
              </div>
            )}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Written by
              </p>
              <p className="font-semibold text-neutral-900">
                {post.author.name}
              </p>
              {post.author.bio ? (
                <p className="mt-1 text-sm leading-relaxed text-neutral-600">
                  {post.author.bio}
                </p>
              ) : null}
            </div>
          </aside>
        ) : null}
      </article>

      {faqs.length ? (
        <section className="mt-12 border-t border-neutral-200 pt-8">
          <h2 className="mb-4 text-xl font-semibold">
            Frequently asked questions
          </h2>
          <dl className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i}>
                <dt className="font-medium">{faq.question}</dt>
                <dd className="mt-1 text-neutral-600">{faq.answer}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {/* Sentinel for the end-of-post popup trigger (Step 12). */}
      <div data-end-of-post aria-hidden="true" />
    </main>
    </EnquiryProvider>
  );
}
