import type { Metadata } from "next";
import Link from "next/link";
import { SiteImage } from "@/components/SiteImage";
import { ManagedImg } from "@/components/ManagedImg";
import { pageMetadata } from "@/lib/page-meta";
import { getSitePage } from "@/lib/data/site-pages";
import { getGalleryImages } from "@/lib/data/blog";
import { siteConfig } from "@/lib/site-config";
import { JsonLd } from "@/components/JsonLd";
import { faqPageSchema, type Faq } from "@/lib/schema";
import {
  Container,
  Section,
  ButtonLink,
  Eyebrow,
  BleedFeature,
} from "@/components/site/ui";
import { Icon } from "@/components/site/Icon";
import { CHIP_ACCENTS, DOT_ACCENTS, Decor } from "@/components/site/decor";
import { ContactForm } from "@/components/site/ContactForm";
import { AvailabilityBadge } from "@/components/site/AvailabilityBadge";
import { tools } from "@/lib/content/tools";
import { homeFaqs } from "@/lib/content/home-faqs";
import { welcome, whyChooseUs, careTeam, heroImage } from "@/lib/content/home";
import {
  residentReview,
  rooms,
  roomsImage,
  dining,
  diningImage,
  garden,
  gardenImage,
  accreditationBadges,
  localArea,
  localAreaImage,
  welcomeImages,
} from "@/lib/content/pages";

export async function generateMetadata(): Promise<Metadata> {
  const meta = await pageMetadata("/", {
    title: siteConfig.name,
    description: siteConfig.description,
  });
  // Home uses an absolute title (no "| Ferndale" suffix from the template).
  meta.title = { absolute: `${siteConfig.name} | Nursing home in Crawley, West Sussex` };
  return meta;
}

// Full FAQ set lives in lib/content/home-faqs.ts; a SitePage "/" with faqs overrides it.
function readFaqs(value: unknown): Faq[] {
  if (!Array.isArray(value)) return homeFaqs;
  const ok = value.filter(
    (f): f is Faq =>
      !!f &&
      typeof (f as Faq).question === "string" &&
      typeof (f as Faq).answer === "string",
  );
  return ok.length ? ok : homeFaqs;
}

const FEATURES = [
  {
    title: "Our Care Team",
    body: "A long-standing, qualified team with years of experience, led by our registered manager Ramesh Mannick.",
    href: "/care-team/",
    icon: "users",
  },
  {
    title: "About Ferndale",
    body: "Helping residents live as independently as possible with 24-hour care and support.",
    href: "/about-us/",
    icon: "home",
  },
  {
    title: "Activities",
    body: "Fun, interaction and exercise every day, to keep residents stimulated in body and mind.",
    href: "/activities/",
    icon: "activity",
  },
];

const WHY_ICONS = ["shield", "heart"];

// Soft blue band that fades into the cream page background top and bottom.
const FADE_CREAM =
  "bg-[linear-gradient(to_bottom,var(--color-cream),var(--color-brand-50)_22%,var(--color-brand-50)_78%,var(--color-cream))]";

// Elevated card with a soft, brand-tinted shadow for depth.
const CARD =
  "rounded-2xl border border-brand-100 bg-white shadow-[0_12px_34px_-16px_rgba(19,82,113,0.20)]";
const CARD_HOVER =
  "transition duration-200 hover:-translate-y-1 hover:shadow-[0_22px_44px_-18px_rgba(19,82,113,0.30)]";

export default async function HomePage() {
  const page = await getSitePage("/").catch(() => null);
  const faqs = readFaqs(page?.faqs);
  const gallery = await getGalleryImages(9).catch(() => []);

  // Full-width OpenStreetMap embed (no API key, no cookies).
  const { latitude: lat, longitude: lon } = siteConfig.geo;
  const bbox = [lon - 0.012, lat - 0.006, lon + 0.012, lat + 0.006].join("%2C");
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lon}`;
  const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${lat}%2C${lon}`;

  return (
    <main>
      <JsonLd data={faqPageSchema(faqs, `${siteConfig.url}/`)} />

      {/* Hero — photo bleeds into the section background */}
      <Section className="relative overflow-hidden bg-brand-50 pt-20 lg:min-h-[560px]">
        <Container className="relative z-10 flex items-center">
          <div className="max-w-xl">
            <div className="mb-4">
              <AvailabilityBadge />
            </div>
            <Eyebrow>Nursing Care in Crawley</Eyebrow>
            <h1 className="text-4xl font-semibold leading-tight text-brand-700 sm:text-5xl">
              Care that feels like family
            </h1>
            <p className="mt-5 text-lg text-ink/80">
              Ferndale is a warm, family-run nursing home for the elderly in
              Crawley, West Sussex, providing high-quality 24-hour nursing care,
              including dementia, Alzheimer&rsquo;s and Parkinson&rsquo;s care
              and respite, for people aged 65 and over.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <ButtonLink href="/contact-us/">Book a visit</ButtonLink>
              <ButtonLink href="/about-us/" variant="secondary">
                About our home
              </ButtonLink>
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
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[58%] lg:block">
          <SiteImage
            src={heroImage.src}
            fallbackAlt={heroImage.alt}
            fill
            priority
            sizes="58vw"
            className="object-cover object-center [-webkit-mask-image:linear-gradient(to_right,transparent,#000_34%)] [mask-image:linear-gradient(to_right,transparent,#000_34%)]"
          />
        </div>
      </Section>

      {/* The care we offer (quick summary) */}
      <Section className="py-8 sm:py-10">
        <Container>
          <Eyebrow>The care we offer</Eyebrow>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: "activity",
                title: "Nursing care",
                body: "24-hour care led by qualified registered nurses, for people with ongoing medical and nursing needs.",
              },
              {
                icon: "shield",
                title: "Dementia care",
                body: "Specialist, patient support for people living with dementia, in a safe and familiar setting.",
              },
              {
                icon: "heart",
                title: "Alzheimer's care",
                body: "Compassionate care for people living with Alzheimer's, focused on dignity, routine and reassurance.",
              },
              {
                icon: "bed",
                title: "Respite care",
                body: "Short stays and respite, whether for a break, recovery after hospital, or to try us out.",
              },
            ].map((c, i) => (
              <div
                key={c.title}
                className={`${CARD} ${CARD_HOVER} flex items-start gap-4 p-5`}
              >
                <span
                  className={`inline-flex shrink-0 rounded-xl p-3 ring-1 ${CHIP_ACCENTS[i % CHIP_ACCENTS.length]}`}
                >
                  <Icon name={c.icon} />
                </span>
                <div>
                  <h2 className="font-semibold text-brand-700">{c.title}</h2>
                  <p className="mt-0.5 text-sm leading-relaxed text-muted">
                    {c.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Accreditations trust band (real badge logos) */}
      <div className="border-y border-brand-100 bg-white">
        <Container className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 py-6">
          {accreditationBadges.map((b) => (
            <ManagedImg
              key={b.src}
              src={b.src}
              fallbackAlt={b.alt}
              loading="lazy"
              className="h-16 w-auto object-contain"
            />
          ))}
        </Container>
      </div>

      {/* Welcome / your health is our primary concern */}
      <Section>
        <Container>
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <Eyebrow>Welcome to Ferndale</Eyebrow>
              <h2 className="text-3xl font-semibold text-brand-700">
                {welcome.heading}
              </h2>
              {welcome.paragraphs.map((p, i) => (
                <p key={i} className="mt-4 leading-relaxed text-ink/80">
                  {p}
                </p>
              ))}

              {/* Small supporting accreditation marks, below the text */}
              <p className="mt-8 text-xs font-semibold uppercase tracking-[0.15em] text-muted">
                Regulated &amp; accredited
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-5">
                {welcomeImages.map((img) => (
                  <ManagedImg
                    key={img.src}
                    src={img.src}
                    fallbackAlt={img.alt}
                    loading="lazy"
                    className="h-12 w-auto object-contain"
                  />
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-brand-100 bg-white p-6 shadow-sm">
              <h3 className="font-serif text-xl text-brand-700">
                Get in touch to arrange a visit
              </h3>
              <p className="mt-1 text-sm text-muted">
                Send us a message and a member of our team will be in touch.
              </p>
              <div className="mt-4">
                <ContactForm />
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Features */}
      <Section className="bg-white">
        <Container className="grid gap-6 md:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Link
              key={f.href}
              href={f.href}
              className={`group ${CARD} ${CARD_HOVER} p-7`}
            >
              <span
                className={`inline-flex rounded-xl p-3 ring-1 ${CHIP_ACCENTS[i % CHIP_ACCENTS.length]}`}
              >
                <Icon name={f.icon} />
              </span>
              <h2 className="mt-4 text-xl font-semibold text-brand-700">
                {f.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">{f.body}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-terracotta-600">
                Read more
                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </span>
            </Link>
          ))}
        </Container>
      </Section>

      {/* Funding calculator banner */}
      <div className="py-3 sm:py-4">
        <Container>
          <Link
            href="/funding-calculator/"
            className="group relative block overflow-hidden rounded-3xl bg-brand-600 p-8 shadow-[0_18px_44px_-20px_rgba(19,82,113,0.45)] sm:p-10"
          >
            <Decor tone="blue" />
            <div className="relative z-10 flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-5">
                <span className="hidden shrink-0 rounded-2xl bg-white/15 p-3 text-white ring-1 ring-white/25 sm:inline-flex">
                  <Icon name="calculator" className="h-7 w-7" />
                </span>
                <div className="max-w-2xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-50/80">
                    Paying for care
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
                    Worried about the cost of care?
                  </h2>
                  <p className="mt-2 leading-relaxed text-brand-50">
                    Use our free care funding calculator to get a quick guide to
                    what you might pay and the financial support you could be
                    entitled to.
                  </p>
                </div>
              </div>
              <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-brand-700 transition-colors group-hover:bg-brand-50">
                Try the funding calculator
                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </span>
            </div>
          </Link>
        </Container>
      </div>

      {/* More tools (compact strip — smaller than the funding banner) */}
      <Section className="py-6 sm:py-8">
        <Container>
          <Eyebrow>More tools to help</Eyebrow>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tools
              .filter((t) => t.href !== "/funding-calculator/")
              .map((t, i) => (
                <Link
                  key={t.href}
                  href={t.href}
                  className={`group ${CARD} ${CARD_HOVER} flex flex-col p-5`}
                >
                  <span
                    className={`inline-flex w-fit rounded-xl p-2.5 ring-1 ${CHIP_ACCENTS[(i + 2) % CHIP_ACCENTS.length]}`}
                  >
                    <Icon name={t.icon} className="h-5 w-5" />
                  </span>
                  <h3 className="mt-3 text-sm font-semibold text-brand-700">
                    {t.name}
                  </h3>
                  <p className="mt-1 flex-1 text-xs leading-relaxed text-muted">
                    {t.description}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-terracotta-600">
                    Open
                    <span className="transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                </Link>
              ))}
          </div>
        </Container>
      </Section>

      {/* The care we provide */}
      <BleedFeature
        className="bg-[linear-gradient(to_bottom,white,var(--color-brand-50)_22%,var(--color-brand-50)_78%,var(--color-cream))]"
        eyebrow="The care we provide"
        heading="Personal, attentive care you can trust"
        body={`At Ferndale, care is personal. We are a small, family-run home registered for up to ${siteConfig.beds} residents, which means our team truly gets to know each person, their history, their preferences and their routines, and shapes their care around them.`}
        image={{
          src: "https://nuxsbykzkivbjtkhheph.supabase.co/storage/v1/object/public/blog/site/home/care.jpg",
          alt: "A Ferndale nurse sitting and holding hands with an elderly resident, chatting warmly as he reads a book in the lounge",
        }}
        side="right"
        bleedY
      >
        <div className="mt-4 space-y-4 leading-relaxed text-ink/80">
          <p>
            We provide 24-hour nursing care for people aged 65 and over,
            including dementia, Alzheimer&rsquo;s and Parkinson&rsquo;s care and
            respite, and we welcome married couples and partners. Whether someone
            needs a little support or more complex nursing, our registered nurses
            and carers are always close by, day and night.
          </p>
          <p>
            Everything we do is guided by dignity, kindness and respect. From
            medication and personal care to a warm meal, a chat in the garden or
            help getting to an appointment, we are here to make every day
            comfortable, safe and as fulfilling as possible.
          </p>
        </div>
        <div className="mt-6">
          <ButtonLink href="/about-us/">More about our care</ButtonLink>
        </div>
      </BleedFeature>

      {/* Why Choose Us */}
      <Section className="relative overflow-hidden">
        <Decor tone="warm" />
        <Container className="relative z-10">
          <Eyebrow>Why choose us</Eyebrow>
          <div className="mt-2 grid gap-6 md:grid-cols-2">
            {whyChooseUs.map((c, i) => (
              <div key={c.title} className={`${CARD} p-7`}>
                <span
                  className={`inline-flex rounded-xl p-3 ring-1 ${CHIP_ACCENTS[(i + 3) % CHIP_ACCENTS.length]}`}
                >
                  <Icon name={WHY_ICONS[i] ?? "heart"} />
                </span>
                <h2 className="mt-4 text-xl font-semibold text-brand-700">
                  {c.title}
                </h2>
                <p className="mt-3 leading-relaxed text-ink/80">{c.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Rooms & accommodation */}
      <BleedFeature
        className={FADE_CREAM}
        eyebrow="Rooms"
        heading={rooms.heading}
        body={rooms.body}
        points={rooms.points}
        image={roomsImage}
        side="right"
        bleedY
      />

      {/* Dining & food */}
      <BleedFeature
        className={FADE_CREAM}
        eyebrow="Dining"
        heading={dining.heading}
        body={dining.body}
        points={dining.points}
        image={diningImage}
        side="left"
        bleedY
      />

      {/* Garden & grounds */}
      <BleedFeature
        className={FADE_CREAM}
        eyebrow="Garden"
        heading={garden.heading}
        body={garden.body}
        image={gardenImage}
        side="right"
        bleedY
      />

      {/* Life at Ferndale */}
      <Section>
        <Container className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <Eyebrow>Life at Ferndale</Eyebrow>
            <h2 className="text-3xl font-semibold text-brand-700">
              A true home, not just care
            </h2>
            <p className="mt-4 leading-relaxed text-ink/80">
              Life at Ferndale is about creating a true home. Each day is shaped
              around the individual, from familiar routines and favourite
              activities to meaningful social moments, in our welcoming nursing
              home in Crawley, West Sussex.
            </p>
            <p className="mt-4 leading-relaxed text-ink/80">
              We are registered to care for up to {siteConfig.beds} residents,
              which means everyone is known by name and cared for as part of the
              family.
            </p>
          </div>
          <div className={`${CARD} p-8`}>
            <h3 className="font-semibold text-brand-700">At a glance</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-ink/80">
              {[
                `Up to ${siteConfig.beds} residents, small and personal`,
                "24-hour nursing care for ages 65+",
                "Couples and partners welcome",
                "Individually decorated, “home from home” rooms",
                "Lift & chair-lift access",
                siteConfig.areaServed.join(" · "),
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${DOT_ACCENTS[i % DOT_ACCENTS.length]}`}
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </Section>

      {/* Life gallery — real photos migrated from the blog */}
      {gallery.length > 0 ? (
        <Section className="bg-white">
          <Container>
            <Eyebrow>Life at Ferndale</Eyebrow>
            <h2 className="text-3xl font-semibold text-brand-700">
              Moments from our home
            </h2>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {gallery.map((g) => (
                <Link
                  key={g.slug}
                  href={`/blog/${g.slug}/`}
                  className="group relative block aspect-square overflow-hidden rounded-xl"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={g.coverImageUrl ?? ""}
                    alt={g.coverImageAlt ?? g.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* "Read Blog" affordance — always visible (touch-friendly) */}
                  <span className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-black/60 via-black/15 to-transparent px-2 pb-3 pt-10">
                    <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-brand-700 shadow-sm transition-colors group-hover:bg-brand-600 group-hover:text-white">
                      Read Blog →
                    </span>
                  </span>
                </Link>
              ))}
            </div>
            <div className="mt-6">
              <ButtonLink href="/blog/" variant="secondary">
                Read our news &amp; blog
              </ButtonLink>
            </div>
          </Container>
        </Section>
      ) : null}

      {/* Care team preview */}
      <Section>
        <Container>
          <Eyebrow>Our care team</Eyebrow>
          <h2 className="text-3xl font-semibold text-brand-700">
            The people who make Ferndale home
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {careTeam.slice(0, 4).map((m) => (
              <div key={m.name} className={`${CARD} p-6`}>
                {/* Silhouette placeholder — swap m.photo for a real photo. */}
                <ManagedImg
                  src={m.photo}
                  fallbackAlt={m.name}
                  className="mb-4 h-20 w-20 rounded-full border border-brand-100 object-cover"
                />
                <h3 className="font-semibold text-brand-700">{m.name}</h3>
                <p className="mt-0.5 text-sm font-medium text-terracotta-600">
                  {m.role}
                </p>
                {m.bio ? (
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    {m.bio}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
          <div className="mt-8">
            <ButtonLink href="/care-team/" variant="secondary">
              Meet the team
            </ButtonLink>
          </div>
        </Container>
      </Section>

      {/* Resident reviews */}
      <Section className="relative overflow-hidden bg-white">
        <Decor tone="mixed" />
        <Container className="relative z-10 max-w-3xl">
          <div className={`relative ${CARD} bg-brand-50 px-8 py-12 text-center sm:px-12`}>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-6 top-2 font-serif text-7xl leading-none text-brand-200 sm:left-10"
            >
              &ldquo;
            </span>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-terracotta-600">
              Resident reviews
            </p>
            <blockquote className="relative font-serif text-2xl leading-relaxed text-brand-700">
              {residentReview.quote}
            </blockquote>
            <figcaption className="mt-5 text-sm text-muted">
              {residentReview.attribution}, {residentReview.source}
            </figcaption>
            <p className="mt-6 text-sm text-muted">
              Ferndale is recommended on{" "}
              <a
                href="https://www.carehome.co.uk/"
                rel="noopener"
                className="font-medium text-brand-700 underline"
              >
                carehome.co.uk
              </a>
              .
            </p>
          </div>
        </Container>
      </Section>

      {/* Local area / find us */}
      <BleedFeature
        className="bg-[linear-gradient(to_bottom,white,var(--color-brand-50)_22%,var(--color-brand-50)_78%,var(--color-cream))]"
        eyebrow="Find us"
        heading={localArea.heading}
        body={localArea.body}
        image={localAreaImage}
        side="right"
        bleedY
      >
        <address className="mt-4 not-italic text-ink/80">
          {siteConfig.address.streetAddress},{" "}
          {siteConfig.address.addressLocality},{" "}
          {siteConfig.address.addressRegion} {siteConfig.address.postalCode}
        </address>
        <p className="mt-2 text-sm text-muted">
          Areas served: {siteConfig.areaServed.join(" · ")}
        </p>
        <div className="mt-6">
          <ButtonLink href="/contact-us/">Get in touch</ButtonLink>
        </div>
      </BleedFeature>

      {/* FAQ — accordion (native <details>, no JS) */}
      <Section>
        <Container className="max-w-3xl">
          <Eyebrow>Questions</Eyebrow>
          <h2 className="text-3xl font-semibold text-brand-700">
            Frequently asked questions
          </h2>
          <div className={`mt-8 divide-y divide-brand-100 overflow-hidden ${CARD}`}>
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
        </Container>
      </Section>

      {/* CTA */}
      <Section className="bg-brand-600">
        <Container className="text-center">
          <h2 className="text-3xl font-semibold text-white">
            Come and see Ferndale for yourself
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-50">
            We’d love to show you around. Arrange a visit or request a brochure.
          </p>
          <div className="mt-7 flex justify-center gap-4">
            <ButtonLink
              href="/contact-us/"
              variant="secondary"
              className="border-white bg-white text-brand-700 hover:bg-brand-50"
            >
              Book a visit
            </ButtonLink>
          </div>
        </Container>
      </Section>

      {/* Full-width location map with a Contact us overlay */}
      <section className="relative" aria-label="Contact us and map">
        <iframe
          title="Map showing Ferndale Nursing Home, Crawley"
          src={mapSrc}
          loading="lazy"
          className="block h-[520px] w-full border-0"
        />
        {/* Wrapper is click-through; only the card captures pointer events. */}
        <div className="pointer-events-none absolute inset-0 flex items-center py-8">
          <Container className="w-full">
            <div className="pointer-events-auto w-full max-w-sm rounded-2xl bg-cream/95 p-6 shadow-xl ring-1 ring-brand-100 backdrop-blur">
              <h2 className="font-serif text-2xl text-brand-700">Contact us</h2>
              <p className="mt-1 text-sm text-ink/80">
                We’d love to show you around. Get in touch to arrange a visit.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-ink/80">
                <li>
                  <a
                    href={`tel:${siteConfig.telephoneE164}`}
                    className="flex items-center gap-2 hover:text-brand-700"
                  >
                    <Icon name="phone" className="h-4 w-4 text-brand-600" />
                    {siteConfig.telephone}
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${siteConfig.email}`}
                    className="break-all hover:text-brand-700"
                  >
                    {siteConfig.email}
                  </a>
                </li>
                <li className="text-muted">
                  {siteConfig.address.streetAddress},{" "}
                  {siteConfig.address.addressLocality},{" "}
                  {siteConfig.address.addressRegion}{" "}
                  {siteConfig.address.postalCode}
                </li>
              </ul>
              <div className="mt-5 flex flex-wrap items-center gap-4">
                <ButtonLink href="/contact-us/">Contact us</ButtonLink>
                <a
                  href={directionsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-brand-700 underline"
                >
                  Get directions →
                </a>
              </div>
            </div>
          </Container>
        </div>
      </section>
    </main>
  );
}
