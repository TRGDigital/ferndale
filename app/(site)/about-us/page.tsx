import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-meta";
import { siteConfig } from "@/lib/site-config";
import Link from "next/link";
import {
  Container,
  Section,
  PageHeader,
  ButtonLink,
  BleedFeature,
  Eyebrow,
} from "@/components/site/ui";
import { Icon } from "@/components/site/Icon";
import { chipAccent, Decor } from "@/components/site/decor";
import {
  facilities,
  aboutAims,
  aboutSupport,
  aboutTestimonial,
} from "@/lib/content/pages";
import { heroImage } from "@/lib/content/home";

// Elevated card with a soft, brand-tinted shadow for depth (matches the home page).
const CARD =
  "rounded-2xl border border-brand-100 bg-white shadow-[0_12px_34px_-16px_rgba(19,82,113,0.20)]";
const CARD_HOVER =
  "transition duration-200 hover:-translate-y-1 hover:shadow-[0_22px_44px_-18px_rgba(19,82,113,0.30)]";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/about-us/", {
    title: "About Us",
    description:
      "Ferndale is a warm, family-run residential care home for the elderly in Lindfield, West Sussex, registered for up to 25 residents aged 65 and over.",
  });
}

export default function AboutPage() {
  return (
    <main>
      <PageHeader
        eyebrow="About Us"
        title="A home that helps you live well"
        lead="Our aim is to enable our residents to continue living as independently as possible, with 24-hour care and support, treated always with respect and dignity."
        heroImage={heroImage}
      />

      {/* We offer you the best support */}
      <Section className="relative overflow-hidden">
        <Decor tone="warm" />
        <Container className="relative z-10">
          <h2 className="text-2xl font-semibold text-brand-700">
            We offer you the best support
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {aboutSupport.map((c, i) => (
              <div
                key={c.title}
                className="rounded-2xl border border-brand-100 bg-white p-7"
              >
                <span
                  className={`inline-flex rounded-xl p-3 ring-1 ${chipAccent(i)}`}
                >
                  <Icon name={c.icon} />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-brand-700">
                  {c.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {c.body}
                </p>
                {c.href ? (
                  <Link
                    href={c.href}
                    className="mt-3 inline-block text-sm font-medium text-terracotta-600"
                  >
                    View careers →
                  </Link>
                ) : null}
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <BleedFeature
        className="bg-[linear-gradient(to_bottom,var(--color-cream),var(--color-brand-50)_22%,var(--color-brand-50)_78%,var(--color-cream))]"
        eyebrow="Welcome"
        heading="Welcome to Ferndale"
        body={`Ferndale is a care home for the elderly, housed in a beautiful detached house in the exclusive area of Lindfield, close to Haywards Heath. We are registered to accommodate up to ${siteConfig.beds} people aged 65 and over, including married couples and partners. We also offer respite care.`}
        image={{
          src: "https://trmwjilicdxgrzbwzchf.supabase.co/storage/v1/object/public/blog/site/about/welcome.jpg",
          alt: "Inside Ferndale: the lounge, dining room and hallway, with fresh flowers throughout",
        }}
        side="right"
        bleedY
      >
        <div className="mt-4 space-y-4 leading-relaxed text-ink/80">
          <p>
            Our manager is {siteConfig.manager}, with over 18 years of
            experience in caring; our registered provider is{" "}
            {siteConfig.legalName}. There is a lift to the first floor and a
            chair lift to assist those who prefer the stairs.
          </p>
          <p>
            Our rooms are all individually decorated, and residents are
            encouraged to bring their own personal possessions to create a
            “home from home” feel.
          </p>
        </div>
        <div className="mt-6">
          <ButtonLink href="/contact-us/">Book a visit</ButtonLink>
        </div>
      </BleedFeature>

      {/* Facilities */}
      <Section className="bg-white">
        <Container>
          <div className="max-w-2xl">
            <Eyebrow>Facilities</Eyebrow>
            <h2 className="text-2xl font-semibold text-brand-700">
              Our care home facilities
            </h2>
            <p className="mt-4 leading-relaxed text-ink/80">
              Everything at Ferndale is designed to feel like home, with the
              comforts and support our residents need close at hand, from
              en-suite rooms and a passenger lift to landscaped gardens and a
              full programme of activities.
            </p>
          </div>
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {facilities.map((f, i) => (
              <li
                key={f.label}
                className={`${CARD} ${CARD_HOVER} flex items-center gap-4 p-5`}
              >
                <span
                  className={`inline-flex shrink-0 rounded-xl p-3 ring-1 ${chipAccent(i)}`}
                >
                  <Icon name={f.icon} className="h-5 w-5" />
                </span>
                <span className="font-medium text-ink/90">{f.label}</span>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* Aims */}
      <BleedFeature
        className="bg-[linear-gradient(to_bottom,white,var(--color-brand-50)_20%,var(--color-brand-50)_100%)]"
        eyebrow="Our aims"
        heading="Helping you live well, every day"
        body="Everything we do is guided by a simple set of aims, to keep our residents as independent, comfortable and content as possible, treated always with respect and dignity."
        points={aboutAims}
        image={{
          src: "https://trmwjilicdxgrzbwzchf.supabase.co/storage/v1/object/public/blog/site/about/aims.jpg",
          alt: "Residents enjoying a lively chair-based activity session with the Ferndale activity leader",
        }}
        side="left"
        bleedY
      />

      {/* Testimonial */}
      <Section className="relative overflow-hidden bg-brand-50">
        <Decor tone="mixed" />
        <Container className="relative z-10 max-w-3xl text-center">
          <blockquote className="font-serif text-2xl leading-relaxed text-brand-700">
            “{aboutTestimonial.quote}”
          </blockquote>
          <figcaption className="mt-4 text-sm text-muted">
            {aboutTestimonial.attribution}, {aboutTestimonial.source}
          </figcaption>
        </Container>
      </Section>
    </main>
  );
}
