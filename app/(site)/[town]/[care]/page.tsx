import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/page-meta";
import { Container, Section, ButtonLink, Eyebrow } from "@/components/site/ui";
import { siteConfig } from "@/lib/site-config";
import { Decor } from "@/components/site/decor";
import { SiteImage } from "@/components/SiteImage";
import { AvailabilityBadge } from "@/components/site/AvailabilityBadge";
import { LocationMap } from "@/components/site/LocationMap";
import { heroImage } from "@/lib/content/home";
import {
  towns,
  careTypes,
  townBySlug,
  careBySlug,
  areaCombos,
  defaultAreaContent,
  baseTown,
} from "@/lib/content/local-areas";
import { getAreaContent } from "@/lib/data/area-pages";

const CARD =
  "rounded-2xl border border-brand-100 bg-white shadow-[0_12px_34px_-16px_rgba(19,82,113,0.20)]";
const CARD_HOVER =
  "transition duration-200 hover:-translate-y-1 hover:shadow-[0_22px_44px_-18px_rgba(19,82,113,0.30)]";
const PROSE =
  "[&_a]:font-medium [&_a]:text-brand-700 [&_a]:underline [&_ul]:list-disc [&_ul]:pl-6";

export const dynamicParams = false;

export function generateStaticParams() {
  return areaCombos();
}

type Params = { params: Promise<{ town: string; care: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { town: townSlug, care: careSlug } = await params;
  const town = townBySlug(townSlug);
  const care = careBySlug(careSlug);
  if (!town || !care) return {};
  const path = `/${townSlug}/${careSlug}/`;
  const override = await getAreaContent(path).catch(() => null);
  const heading = override?.heading || defaultAreaContent(town, care).heading;
  return pageMetadata(path, {
    title: heading,
    description: `${care.name} for older people in ${town.name} and the surrounding area, from Ferndale Nursing Home in ${baseTown}, West Sussex.`,
  });
}

export default async function AreaLandingPage({ params }: Params) {
  const { town: townSlug, care: careSlug } = await params;
  const town = townBySlug(townSlug);
  const care = careBySlug(careSlug);
  if (!town || !care) notFound();

  const path = `/${townSlug}/${careSlug}/`;
  const override = await getAreaContent(path).catch(() => null);
  const def = defaultAreaContent(town, care);
  const heading = override?.heading || def.heading;
  const intro = override?.intro || def.intro;
  const body = override?.body || def.body;

  const otherCare = careTypes.find((c) => c.slug !== care.slug)!;
  const nearby = towns.filter((t) => t.slug !== town.slug);
  const mask =
    "[-webkit-mask-image:linear-gradient(to_right,transparent,#000_34%)] [mask-image:linear-gradient(to_right,transparent,#000_34%)]";

  return (
    <main>
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
              <ButtonLink href="/contact-us/">Book a visit</ButtonLink>
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
          <p className="mt-4 leading-relaxed text-ink/80">{care.blurb}</p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {care.points.map((p) => (
              <li key={p} className="flex items-start gap-2 text-sm text-ink/80">
                <span className="mt-0.5 text-terracotta-600">✓</span>
                {p}
              </li>
            ))}
          </ul>
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
          </Container>
        </Section>
      ) : null}

      {/* Areas we cover — internal cross-links */}
      <Section className="relative overflow-hidden">
        <Decor tone="warm" />
        <Container className="relative z-10">
          <div className="max-w-2xl">
            <Eyebrow>Areas we cover</Eyebrow>
            <h2 className="text-2xl font-semibold text-brand-700">
              {care.name} near {town.name}
            </h2>
            <p className="mt-3 leading-relaxed text-ink/80">
              Ferndale is based in {baseTown}, West Sussex, and warmly welcomes
              residents and families from {town.name} and the surrounding towns
              and villages.
            </p>
          </div>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {nearby.map((t) => (
              <li key={t.slug}>
                <Link
                  href={`/${t.slug}/${care.slug}/`}
                  className={`${CARD} ${CARD_HOVER} block px-4 py-3 text-sm font-medium text-brand-700`}
                >
                  {care.name} in {t.name} →
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-muted">
            Also looking for {otherCare.noun}?{" "}
            <Link
              href={`/${town.slug}/${otherCare.slug}/`}
              className="font-medium text-brand-700 underline"
            >
              {otherCare.name} in {town.name}
            </Link>
            .
          </p>
        </Container>
      </Section>

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
            <ButtonLink
              href="/contact-us/"
              variant="secondary"
              className="border-white bg-white text-brand-700 hover:bg-brand-50"
            >
              Contact us
            </ButtonLink>
          </div>
        </Container>
      </Section>

      {/* Location map */}
      <LocationMap />
    </main>
  );
}
