import type { Metadata } from "next";
import { AvailabilityBadgeServer } from "@/components/site/AvailabilityBadgeServer";
import { pageMetadata } from "@/lib/page-meta";
import { Container, Section, Eyebrow } from "@/components/site/ui";
import { EnquiryProvider, EnquiryButton } from "@/components/site/EnquiryDialog";
import { SiteImage } from "@/components/SiteImage";
import { Icon } from "@/components/site/Icon";
import { chipAccent, Decor } from "@/components/site/decor";
import { getGalleryImages } from "@/lib/data/gallery";
import { siteConfig } from "@/lib/site-config";

const CARD =
  "rounded-2xl border border-brand-100 bg-white shadow-[0_12px_34px_-16px_rgba(19,82,113,0.20)]";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/our-home/", {
    title: "Our Home",
    description:
      "Take a look inside Ferndale Nursing Home in Crawley, West Sussex: our comfortable rooms, sunny lounges, home-cooked dining and beautiful gardens. A warm, family-run home.",
  });
}

const FEATURES = [
  {
    icon: "home",
    title: "Comfortable rooms",
    body: "Bright, homely rooms, many with en-suite facilities, that residents are warmly encouraged to make their own.",
  },
  {
    icon: "cup",
    title: "Sunny lounges",
    body: "Welcoming lounges and quiet corners to relax, read, chat with friends or enjoy a visit from family.",
  },
  {
    icon: "utensils",
    title: "Home-cooked dining",
    body: "Freshly prepared meals served in our friendly dining room, with menus to suit every taste and dietary need.",
  },
  {
    icon: "leaf",
    title: "Beautiful gardens",
    body: "Secure, well-kept gardens and a summer house to enjoy the fresh air, a stroll or a cup of tea in the sun.",
  },
];

export default async function OurHomePage() {
  const images = await getGalleryImages();

  return (
    <EnquiryProvider>
      <main>
        {/* Hero */}
        <Section className="bg-brand-50">
          <Container className="max-w-3xl">
            <div className="mb-4">
              <AvailabilityBadgeServer />
            </div>
            <Eyebrow>Our home · Crawley</Eyebrow>
            <h1 className="text-4xl font-semibold leading-tight text-brand-700 sm:text-5xl">
              Take a look around Ferndale
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-ink/80">
              We think the best way to get a feel for a care home is to see it. Here
              is a look inside Ferndale, our rooms, our lounges, our dining room and
              our gardens. Better still, come and visit us in person.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <EnquiryButton variant="solid">Arrange a visit</EnquiryButton>
              <a
                href={`tel:${siteConfig.telephoneE164}`}
                className="inline-flex items-center justify-center rounded-full border border-brand-600 px-6 py-3 text-sm font-medium text-brand-700 hover:bg-brand-50"
              >
                Call {siteConfig.telephone}
              </a>
            </div>
          </Container>
        </Section>

        {/* What you'll find */}
        <Section>
          <Container>
            <div className="max-w-2xl">
              <Eyebrow>What you&rsquo;ll find</Eyebrow>
              <h2 className="text-3xl font-semibold text-brand-700">
                A real home, not an institution
              </h2>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((f, i) => (
                <div key={f.title} className={`${CARD} p-6`}>
                  <span className={`inline-flex rounded-xl p-3 ring-1 ${chipAccent(i)}`}>
                    <Icon name={f.icon} />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-brand-700">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{f.body}</p>
                </div>
              ))}
            </div>
          </Container>
        </Section>

        {/* Gallery */}
        {images.length ? (
          <Section className="relative overflow-hidden bg-white">
            <Decor tone="warm" />
            <Container className="relative z-10">
              <div className="max-w-2xl">
                <Eyebrow>Gallery</Eyebrow>
                <h2 className="text-3xl font-semibold text-brand-700">
                  Inside Ferndale
                </h2>
              </div>
              <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {images.map((img) => (
                  <li key={img.id}>
                    <figure className={`${CARD} overflow-hidden`}>
                      <div className="relative aspect-[4/3]">
                        <SiteImage
                          src={img.url}
                          fallbackAlt={img.alt}
                          fill
                          sizes="(min-width:1024px) 30vw, (min-width:640px) 45vw, 90vw"
                          className="object-cover"
                        />
                      </div>
                      {img.caption ? (
                        <figcaption className="px-4 py-3 text-sm leading-relaxed text-muted">
                          {img.caption}
                        </figcaption>
                      ) : null}
                    </figure>
                  </li>
                ))}
              </ul>
            </Container>
          </Section>
        ) : null}

        {/* CTA */}
        <Section className="bg-brand-600">
          <Container className="text-center">
            <h2 className="text-3xl font-semibold text-white">
              Come and see it for yourself
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-brand-50">
              Photos only tell part of the story. Arrange a visit and we will show you
              and your family around, share a cup of tea and answer any questions.
            </p>
            <div className="mt-7 flex justify-center">
              <EnquiryButton variant="light">Arrange a visit</EnquiryButton>
            </div>
          </Container>
        </Section>
      </main>
    </EnquiryProvider>
  );
}
