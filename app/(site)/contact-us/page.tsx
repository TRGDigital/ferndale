import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-meta";
import { siteConfig } from "@/lib/site-config";
import { Container, Section, PageHeader } from "@/components/site/ui";
import { Icon } from "@/components/site/Icon";
import { chipAccent, Decor } from "@/components/site/decor";
import { ContactForm } from "@/components/site/ContactForm";
import { heroImage } from "@/lib/content/home";

// Elevated card with a soft, brand-tinted shadow for depth (matches the home page).
const CARD =
  "rounded-2xl border border-brand-100 bg-white shadow-[0_12px_34px_-16px_rgba(19,82,113,0.20)]";
const CARD_HOVER =
  "transition duration-200 hover:-translate-y-1 hover:shadow-[0_22px_44px_-18px_rgba(19,82,113,0.30)]";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/contact-us/", {
    title: "Contact Us",
    description:
      "Get in touch with Ferndale Nursing Home in Lindfield. Book a visit, request a brochure, or ask a question.",
  });
}

export default function ContactPage() {
  const { address } = siteConfig;

  // Full-width OpenStreetMap embed (no API key, no cookies) — same as the home page.
  const { latitude: lat, longitude: lon } = siteConfig.geo;
  const bbox = [lon - 0.012, lat - 0.006, lon + 0.012, lat + 0.006].join("%2C");
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lon}`;
  const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${lat}%2C${lon}`;

  const details = [
    {
      icon: "pin",
      label: "Address",
      lines: [
        siteConfig.name,
        `${address.streetAddress}, ${address.addressLocality}`,
        `${address.addressRegion}, ${address.postalCode}`,
      ],
    },
    {
      icon: "phone",
      label: "Phone",
      value: siteConfig.telephone,
      href: `tel:${siteConfig.telephoneE164}`,
    },
    {
      icon: "mail",
      label: "Email",
      value: siteConfig.email,
      href: `mailto:${siteConfig.email}`,
    },
    { icon: "clock", label: "Office hours", value: siteConfig.officeHours },
  ];

  return (
    <main>
      <PageHeader
        eyebrow="Contact Us"
        title="We’d love to hear from you"
        lead="Book a visit, request a brochure, ask about a vacancy, or just say hello. We’re always here to help."
        heroImage={heroImage}
      />

      <Section className="relative overflow-hidden">
        <Decor tone="warm" />
        <Container className="relative z-10 grid items-start gap-12 lg:grid-cols-2">
          {/* Contact details */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-terracotta-600">
              How to reach us
            </p>
            <h2 className="text-2xl font-semibold text-brand-700">
              Get in touch
            </h2>
            <p className="mt-3 leading-relaxed text-ink/80">
              Whether you’re looking for a permanent home, respite care or just
              some advice, our friendly team is always happy to help. Pop in,
              pick up the phone, or drop us a line.
            </p>

            <ul className="mt-8 space-y-4">
              {details.map((d, i) => (
                <li
                  key={d.label}
                  className={`${CARD} ${CARD_HOVER} flex items-start gap-4 p-5`}
                >
                  <span
                    className={`inline-flex shrink-0 rounded-xl p-3 ring-1 ${chipAccent(i)}`}
                  >
                    <Icon name={d.icon} className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-brand-700">
                      {d.label}
                    </h3>
                    {d.lines ? (
                      <address className="mt-1 not-italic leading-relaxed text-ink/80">
                        {d.lines.map((line, i) => (
                          <span key={i} className="block">
                            {line}
                          </span>
                        ))}
                      </address>
                    ) : d.href ? (
                      <a
                        href={d.href}
                        className="mt-1 block break-words text-ink/80 hover:text-brand-700"
                      >
                        {d.value}
                      </a>
                    ) : (
                      <p className="mt-1 text-ink/80">{d.value}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Enquiry form */}
          <div className={`${CARD} p-7`}>
            <h2 className="text-xl font-semibold text-brand-700">
              Send us a message
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Fill in the form below and a member of our team will get back to
              you as soon as possible.
            </p>
            <div className="mt-5">
              <ContactForm />
            </div>
          </div>
        </Container>
      </Section>

      {/* Full-width location map (same as the home page) */}
      <section className="relative" aria-label="Find us on the map">
        <iframe
          title="Map showing Ferndale Nursing Home, Lindfield"
          src={mapSrc}
          loading="lazy"
          className="block h-[520px] w-full border-0"
        />
        {/* Wrapper is click-through; only the card captures pointer events. */}
        <div className="pointer-events-none absolute inset-0 flex items-center py-8">
          <Container className="w-full">
            <div className="pointer-events-auto w-full max-w-sm rounded-2xl bg-cream/95 p-6 shadow-xl ring-1 ring-brand-100 backdrop-blur">
              <h2 className="font-serif text-2xl text-brand-700">Find us</h2>
              <p className="mt-1 text-sm text-ink/80">
                In the heart of Lindfield, close to Haywards Heath.
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
                <li className="text-muted">
                  {address.streetAddress}, {address.addressLocality},{" "}
                  {address.addressRegion} {address.postalCode}
                </li>
              </ul>
              <div className="mt-5 flex flex-wrap items-center gap-4">
                <a
                  href={directionsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-full bg-brand-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-700"
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
