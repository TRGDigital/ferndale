import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/page-meta";
import { Container, Section, Eyebrow } from "@/components/site/ui";
import { EnquiryProvider, EnquiryButton } from "@/components/site/EnquiryDialog";
import { siteConfig } from "@/lib/site-config";
import { Decor } from "@/components/site/decor";
import { SiteImage } from "@/components/SiteImage";
import { AvailabilityBadge } from "@/components/site/AvailabilityBadge";
import { LocationMap } from "@/components/site/LocationMap";
import { heroImage } from "@/lib/content/home";
import {
  townBySlug,
  careBySlug,
  areaCombos,
  defaultAreaContent,
  defaultAreasBody,
  titleCaseSlug,
  GENERIC_CARE_POINTS,
  baseTown,
} from "@/lib/content/local-areas";
import { getAreaPage, getManagedAreaPages } from "@/lib/data/area-pages";
import { getPublishedPosts } from "@/lib/data/blog";
import { JsonLd } from "@/components/JsonLd";
import {
  organizationSchema,
  areaServiceSchema,
  breadcrumbSchema,
  faqPageSchema,
} from "@/lib/schema";

const CARD =
  "rounded-2xl border border-brand-100 bg-white shadow-[0_12px_34px_-16px_rgba(19,82,113,0.20)]";
const CARD_HOVER =
  "transition duration-200 hover:-translate-y-1 hover:shadow-[0_22px_44px_-18px_rgba(19,82,113,0.30)]";
const PROSE =
  "[&_a]:font-medium [&_a]:text-brand-700 [&_a]:underline [&_ul]:list-disc [&_ul]:pl-6";

// Funding tools on the site — linked from every landing page (relevant to families researching
// care, and useful internal links for SEO).
const FUNDING_TOOLS = [
  { href: "/funding-calculator/", label: "Care funding calculator", desc: "Estimate the cost of nursing care and what you may need to pay." },
  { href: "/funded-nursing-care/", label: "Funded Nursing Care checker", desc: "Check whether the NHS could contribute toward your nursing care." },
  { href: "/nhs-continuing-healthcare/", label: "NHS Continuing Healthcare checker", desc: "See whether the NHS could fund the full cost of your care." },
  { href: "/local-council-funding/", label: "Local council funding", desc: "Understand council funding and the financial assessment." },
];

// New admin-created pages render on demand (then cache) so no rebuild is needed to add one.
export const dynamicParams = true;

export async function generateStaticParams() {
  const managed = await getManagedAreaPages().catch(() => []);
  const combos = [
    ...areaCombos(),
    ...managed.map((r) => ({ town: r.townSlug as string, care: r.careSlug as string })),
  ];
  const seen = new Set<string>();
  return combos.filter((c) => {
    const key = `${c.town}/${c.care}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

type Params = { params: Promise<{ town: string; care: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { town: townSlug, care: careSlug } = await params;
  const path = `/${townSlug}/${careSlug}/`;
  const row = await getAreaPage(path).catch(() => null);
  const codeTown = townBySlug(townSlug);
  const codeCare = careBySlug(careSlug);
  if (!codeTown && !codeCare && (!row || !row.published || !row.managed)) return {};

  const townName = codeTown?.name ?? row?.townName ?? titleCaseSlug(townSlug);
  const careName = codeCare?.name ?? row?.careName ?? titleCaseSlug(careSlug);
  // Area-page meta is managed on the AreaPage row (edited in the admin Areas tab), not SitePage.
  // The title is used verbatim (single brand, no template suffix).
  const title =
    row?.metaTitle || `${careName} in ${townName} | Ferndale Nursing Home`;
  const description =
    row?.metaDescription ||
    `${careName} for older people in ${townName} and the surrounding area, from Ferndale Nursing Home in ${baseTown}, West Sussex.`;
  return pageMetadata(path, {
    title,
    description,
    titleAbsolute: true,
    ignoreSitePage: true,
  });
}

export default async function AreaLandingPage({ params }: Params) {
  const { town: townSlug, care: careSlug } = await params;
  const path = `/${townSlug}/${careSlug}/`;

  const [row, managed, allPosts] = await Promise.all([
    getAreaPage(path).catch(() => null),
    getManagedAreaPages().catch(() => []),
    getPublishedPosts().catch(() => []),
  ]);
  const posts = allPosts.slice(0, 3);

  const codeTown = townBySlug(townSlug);
  const codeCare = careBySlug(careSlug);
  const isCodeCombo = !!codeTown && !!codeCare;

  // Resolve the town + service from the code lists first, then from an admin-created row.
  const town = codeTown
    ? { slug: codeTown.slug, name: codeTown.name }
    : row?.townSlug
      ? { slug: row.townSlug, name: row.townName ?? titleCaseSlug(townSlug) }
      : null;

  const care = codeCare
    ? {
        slug: codeCare.slug,
        name: codeCare.name,
        noun: codeCare.noun,
        blurb: codeCare.blurb,
        points: codeCare.points as string[],
      }
    : row?.careSlug
      ? {
          slug: row.careSlug,
          name: row.careName ?? titleCaseSlug(careSlug),
          noun: (row.careNoun ?? row.careName ?? titleCaseSlug(careSlug)).toLowerCase(),
          blurb: "",
          points:
            row.offerPoints && row.offerPoints.length
              ? row.offerPoints
              : GENERIC_CARE_POINTS,
        }
      : null;

  if (!town || !care) notFound();
  // A page that isn't a code combo must be a published, managed row.
  if (!isCodeCombo && (!row || !row.published || !row.managed)) notFound();

  const def = codeTown && codeCare ? defaultAreaContent(codeTown, codeCare) : null;
  const heading = row?.heading || def?.heading || `${care.name} in ${town.name}`;
  const intro =
    row?.intro ||
    def?.intro ||
    `<p>Looking for ${care.noun} in ${town.name}? Ferndale Nursing Home offers warm, family-run nursing care a short distance from ${town.name}, in ${baseTown}, West Sussex. We warmly welcome residents and families from ${town.name} and across the wider area.</p>`;
  const body = row?.body || def?.body || null;
  const blurb =
    care.blurb ||
    `Warm, family-run ${care.noun} from Ferndale Nursing Home in ${baseTown}, West Sussex.`;
  const points = care.points;
  const faqs = row?.faqs ?? null;

  // The full set of existing pages (code combos + managed) so cross-links never 404.
  const codeList = areaCombos().map(({ town: ts, care: cs }) => ({
    townSlug: ts,
    townName: townBySlug(ts)!.name,
    careSlug: cs,
    careName: careBySlug(cs)!.name,
  }));
  const managedList = managed.map((r) => ({
    townSlug: r.townSlug as string,
    townName: r.townName ?? titleCaseSlug(r.townSlug as string),
    careSlug: r.careSlug as string,
    careName: r.careName ?? titleCaseSlug(r.careSlug as string),
  }));
  const seen = new Set<string>();
  const all = [...codeList, ...managedList].filter((p) => {
    const key = `${p.townSlug}/${p.careSlug}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const nearby = all.filter(
    (p) => p.careSlug === care.slug && p.townSlug !== town.slug,
  );
  const otherCare =
    all.find((p) => p.townSlug === town.slug && p.careSlug !== care.slug) ?? null;

  // The "Areas we cover" link grid: admin-set links win; otherwise auto cross-links to every
  // live page for the same service in another town (so the links never 404).
  const autoAreaLinks = nearby.map((t) => ({
    label: `${care.name} in ${t.townName}`,
    href: `/${t.townSlug}/${t.careSlug}/`,
  }));
  const areaLinks =
    row?.areasLinks && row.areasLinks.length ? row.areasLinks : autoAreaLinks;

  const mask =
    "[-webkit-mask-image:linear-gradient(to_right,transparent,#000_34%)] [mask-image:linear-gradient(to_right,transparent,#000_34%)]";

  return (
    <EnquiryProvider>
    <main>
      <JsonLd
        data={[
          organizationSchema(),
          areaServiceSchema({
            path,
            serviceName: care.name,
            townName: town.name,
            description: row?.metaDescription ?? blurb,
          }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: `${care.name} in ${town.name}`, path },
          ]),
          ...(faqs && faqs.length
            ? [faqPageSchema(faqs, `${siteConfig.url}${path}`)]
            : []),
        ]}
      />
      {/* Hero — home-style bleed image, availability badge, editable heading + intro */}
      <section className="relative overflow-hidden bg-brand-50 py-16 sm:py-20 lg:min-h-[460px]">
        <Container className="relative z-10 flex items-center">
          <div className="max-w-xl">
            <div className="mb-4">
              <AvailabilityBadge />
            </div>
            <Eyebrow>
              {care.name} · {town.name}
            </Eyebrow>
            <h1 className="text-4xl font-semibold leading-tight text-brand-700 sm:text-5xl">
              {heading}
            </h1>
            <div
              className={`mt-5 space-y-4 text-lg leading-relaxed text-ink/80 ${PROSE}`}
              dangerouslySetInnerHTML={{ __html: intro }}
            />
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <EnquiryButton variant="solid">Book a visit</EnquiryButton>
              <a
                href={`tel:${siteConfig.telephoneE164}`}
                className="inline-flex items-center justify-center rounded-full border border-brand-600 px-6 py-3 text-sm font-medium text-brand-700 hover:bg-brand-50"
              >
                Call {siteConfig.telephone}
              </a>
            </div>

            {/* Mobile: full-bleed image below the text */}
            <div className="-mx-6 mt-10 lg:hidden">
              <SiteImage
                src={heroImage.src}
                fallbackAlt={heroImage.alt}
                width={1800}
                height={1142}
                priority
                className="w-full object-cover"
              />
            </div>
          </div>
        </Container>

        {/* Desktop: image bleeds to the right edge and fades into the blue */}
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[56%] lg:block">
          <SiteImage
            src={heroImage.src}
            fallbackAlt={heroImage.alt}
            fill
            priority
            sizes="56vw"
            className={`object-cover object-center ${mask}`}
          />
        </div>
      </section>

      {/* What we offer */}
      <Section>
        <Container className="max-w-3xl">
          <Eyebrow>What we offer</Eyebrow>
          <h2 className="text-3xl font-semibold text-brand-700">
            Our {care.noun}
          </h2>
          <p className="mt-4 leading-relaxed text-ink/80">{blurb}</p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-2 text-sm text-ink/80">
                <span className="mt-0.5 text-terracotta-600">✓</span>
                {p}
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <EnquiryButton>Arrange a visit</EnquiryButton>
          </div>
        </Container>
      </Section>

      {/* More about — editable per page */}
      {body ? (
        <Section className="bg-white">
          <Container className="max-w-3xl">
            <Eyebrow>More about</Eyebrow>
            <h2 className="text-2xl font-semibold text-brand-700">
              {care.name} in {town.name}
            </h2>
            <div
              className={`mt-4 space-y-4 leading-relaxed text-ink/80 ${PROSE}`}
              dangerouslySetInnerHTML={{ __html: body }}
            />
            <div className="mt-8">
              <EnquiryButton>Ask us a question</EnquiryButton>
            </div>
          </Container>
        </Section>
      ) : null}

      {/* FAQs — accordion (native <details>, no JS), matching the rest of the site */}
      {faqs && faqs.length ? (
        <Section>
          <Container className="max-w-3xl">
            <Eyebrow>Questions</Eyebrow>
            <h2 className="text-3xl font-semibold text-brand-700">
              {care.name} in {town.name}: your questions answered
            </h2>
            <div
              className={`mt-8 divide-y divide-brand-100 overflow-hidden ${CARD}`}
            >
              {faqs.map((faq, i) => (
                <details key={i} className="group">
                  <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-4 font-medium text-ink marker:content-[''] hover:bg-brand-50/60">
                    {faq.question}
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-lg text-brand-600 ring-1 ring-brand-100 transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="px-6 pb-5 leading-relaxed text-ink/80">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
            <div className="mt-8">
              <EnquiryButton>Ask us anything</EnquiryButton>
            </div>
          </Container>
        </Section>
      ) : null}

      {/* Areas we cover — internal cross-links (admin-editable, defaults to auto cross-links) */}
      {areaLinks.length || otherCare ? (
        <Section className="relative overflow-hidden">
          <Decor tone="warm" />
          <Container className="relative z-10">
            <div>
              <Eyebrow>Areas we cover</Eyebrow>
              <h2 className="text-2xl font-semibold text-brand-700">
                {row?.areasHeading || `${care.name} near ${town.name}`}
              </h2>
              <div
                className={`mt-3 leading-relaxed text-ink/80 ${PROSE}`}
                dangerouslySetInnerHTML={{
                  __html:
                    row?.areasBody ||
                    defaultAreasBody(town.name, town.slug, care.noun),
                }}
              />
            </div>
            {areaLinks.length ? (
              <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {areaLinks.map((t) => (
                  <li key={t.href}>
                    <Link
                      href={t.href}
                      className={`${CARD} ${CARD_HOVER} block px-4 py-3 text-sm font-medium text-brand-700`}
                    >
                      {t.label} →
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
            {otherCare ? (
              <p className="mt-6 text-sm text-muted">
                Also looking for {otherCare.careName.toLowerCase()}?{" "}
                <Link
                  href={`/${otherCare.townSlug}/${otherCare.careSlug}/`}
                  className="font-medium text-brand-700 underline"
                >
                  {otherCare.careName} in {town.name}
                </Link>
                .
              </p>
            ) : null}
            <div className="mt-8">
              <EnquiryButton>Check availability</EnquiryButton>
            </div>
          </Container>
        </Section>
      ) : null}

      {/* Plan and pay for care — links to the funding tools */}
      <Section className="bg-brand-50/50">
        <Container>
          <Eyebrow>Plan and pay for care</Eyebrow>
          <h2 className="text-2xl font-semibold text-brand-700">
            Free tools to help with care funding
          </h2>
          <p className="mt-3 max-w-2xl leading-relaxed text-ink/80">
            Working out how to pay for {care.noun} can feel daunting. These free
            tools and guides help you understand the options.
          </p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {FUNDING_TOOLS.map((t) => (
              <li key={t.href}>
                <Link
                  href={t.href}
                  className={`${CARD} ${CARD_HOVER} group block h-full px-5 py-4`}
                >
                  <span className="font-medium text-brand-700 group-hover:text-brand-600">
                    {t.label} →
                  </span>
                  <span className="mt-1 block text-sm text-ink/70">{t.desc}</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <EnquiryButton>Talk to us about fees</EnquiryButton>
          </div>
        </Container>
      </Section>

      {/* Helpful reading — internal links to the blog for topical clustering */}
      {posts.length ? (
        <Section className="bg-white">
          <Container>
            <Eyebrow>Helpful reading</Eyebrow>
            <h2 className="text-2xl font-semibold text-brand-700">
              From the Ferndale blog
            </h2>
            <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/blog/${p.slug}/`}
                    className={`${CARD} ${CARD_HOVER} group block h-full overflow-hidden`}
                  >
                    {p.coverImageUrl ? (
                      <SiteImage
                        src={p.coverImageUrl}
                        fallbackAlt={p.coverImageAlt ?? p.title}
                        width={640}
                        height={360}
                        className="aspect-video w-full object-cover"
                      />
                    ) : null}
                    <div className="p-5">
                      <h3 className="font-semibold leading-snug text-brand-700 group-hover:text-brand-600">
                        {p.title}
                      </h3>
                      {p.excerpt ? (
                        <p className="mt-2 line-clamp-2 text-sm text-ink/70">
                          {p.excerpt}
                        </p>
                      ) : null}
                      <span className="mt-3 inline-block text-sm font-medium text-brand-600">
                        Read more →
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <EnquiryButton>Get in touch</EnquiryButton>
            </div>
          </Container>
        </Section>
      ) : null}

      {/* CTA */}
      <Section className="bg-brand-600">
        <Container className="text-center">
          <h2 className="text-3xl font-semibold text-white">
            Arrange a visit to Ferndale
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-50">
            We&rsquo;d love to show you and your family around our home. Get in
            touch to arrange a visit or ask us anything.
          </p>
          <div className="mt-7 flex justify-center">
            <EnquiryButton variant="light">Contact us</EnquiryButton>
          </div>
        </Container>
      </Section>

      {/* Location map */}
      <LocationMap />
    </main>
    </EnquiryProvider>
  );
}
