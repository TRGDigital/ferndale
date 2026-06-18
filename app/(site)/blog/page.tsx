import Link from "next/link";
import type { Metadata } from "next";
import { getPublishedPosts } from "@/lib/data/blog";
import { pageMetadata } from "@/lib/page-meta";
import { siteConfig } from "@/lib/site-config";
import { Container, Section, PageHeader } from "@/components/site/ui";
import { Icon } from "@/components/site/Icon";
import { Decor } from "@/components/site/decor";

// Elevated card with a soft, brand-tinted shadow for depth (matches the home page).
const CARD =
  "rounded-2xl border border-brand-100 bg-white shadow-[0_12px_34px_-16px_rgba(19,82,113,0.20)]";
const CARD_HOVER =
  "transition duration-200 hover:-translate-y-1 hover:shadow-[0_22px_44px_-18px_rgba(19,82,113,0.30)]";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/blog/", {
    title: "News & Blog",
    description: `Life, activities and care news from ${siteConfig.name} in Lindfield, West Sussex.`,
  });
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

export default async function BlogIndexPage() {
  // .catch keeps credential-less builds green; tag revalidation refills at runtime.
  const posts = await getPublishedPosts().catch(() => []);

  return (
    <main>
      <PageHeader
        eyebrow="News & Blog"
        title="Life at Ferndale"
        lead="News, activities and the little moments that make Ferndale feel like home. Take a look at what our residents and team have been up to."
      />

      <Section className="relative overflow-hidden">
        <Decor tone="cool" />
        <Container className="relative z-10">
          {posts.length === 0 ? (
            <p className="text-muted">No posts published yet. Please check back soon.</p>
          ) : (
            <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <li key={post.id} className={`${CARD} ${CARD_HOVER} group overflow-hidden`}>
                  <Link
                    href={`/blog/${post.slug}/`}
                    className="flex h-full flex-col"
                  >
                    <div className="aspect-[16/9] w-full overflow-hidden bg-brand-50">
                      {post.coverImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element -- migrated cover; managed <SiteImage> used in body
                        <img
                          src={post.coverImageUrl}
                          alt={post.coverImageAlt ?? ""}
                          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-brand-200">
                          <Icon name="heart" className="h-10 w-10" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <time className="text-xs font-semibold uppercase tracking-wide text-terracotta-600">
                        {formatDate(post.publishedAt)}
                      </time>
                      <h2 className="mt-1.5 text-lg font-semibold text-brand-700 transition-colors group-hover:text-brand-600">
                        {post.title}
                      </h2>
                      {post.excerpt ? (
                        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">
                          {post.excerpt}
                        </p>
                      ) : null}
                      <div className="mt-auto pt-5">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors group-hover:bg-brand-700">
                          Read now
                          <span
                            aria-hidden="true"
                            className="transition-transform duration-200 group-hover:translate-x-0.5"
                          >
                            →
                          </span>
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Container>
      </Section>
    </main>
  );
}
