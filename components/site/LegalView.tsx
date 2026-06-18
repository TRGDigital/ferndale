import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container, Section, PageHeader } from "@/components/site/ui";
import { pageMetadata } from "@/lib/page-meta";
import { getLegalPage } from "@/lib/data/legal";
import { legalDefaults, type LegalSlug } from "@/lib/content/legal";

export async function legalMetadata(
  path: string,
  slug: LegalSlug,
): Promise<Metadata> {
  const fallback = legalDefaults[slug];
  return pageMetadata(path, {
    title: fallback.title,
    description: `${fallback.title} for Ferndale Nursing Home, Lindfield.`,
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

export async function LegalView({ slug }: { slug: string }) {
  const page = await getLegalPage(slug);
  if (!page) notFound();
  const updated = formatDate(page.updatedAt);

  return (
    <main>
      <PageHeader eyebrow="Legal" title={page.title} />
      <Section>
        <Container className="max-w-3xl">
          <div
            className="leading-relaxed text-ink/80 [&>*:first-child]:mt-0 [&_a]:font-medium [&_a]:text-brand-700 [&_a]:underline [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-brand-700 [&_h3]:mt-6 [&_h3]:font-semibold [&_h3]:text-brand-700 [&_li]:mt-1.5 [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-6"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
          {updated ? (
            <p className="mt-10 border-t border-brand-100 pt-6 text-sm text-muted">
              Last updated {updated}.
            </p>
          ) : null}
        </Container>
      </Section>
    </main>
  );
}
