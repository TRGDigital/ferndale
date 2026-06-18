import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-meta";
import {
  Container,
  Section,
  PageHeader,
  ButtonLink,
  Eyebrow,
} from "@/components/site/ui";
import { dotAccent, Decor } from "@/components/site/decor";
import { ManagedImg } from "@/components/ManagedImg";
import { careTeam } from "@/lib/content/home";
import { careTeamPride } from "@/lib/content/pages";
import { siteConfig } from "@/lib/site-config";

// Elevated card with a soft, brand-tinted shadow for depth (matches the home page).
const CARD =
  "rounded-2xl border border-brand-100 bg-white shadow-[0_12px_34px_-16px_rgba(19,82,113,0.20)]";
const CARD_HOVER =
  "transition duration-200 hover:-translate-y-1 hover:shadow-[0_22px_44px_-18px_rgba(19,82,113,0.30)]";

const heroImage = {
  src: "https://trmwjilicdxgrzbwzchf.supabase.co/storage/v1/object/public/blog/site/care-team/hero.jpg",
  alt: "Ferndale carers chatting and laughing with residents over tea in the sunny lounge",
};

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/care-team/", {
    title: "Care Team",
    description:
      "Our long-standing, qualified care team provides 24-hour care to national standards, led by manager Kelvin Amoorthasamy.",
  });
}

export default function CareTeamPage() {
  return (
    <main>
      <PageHeader
        eyebrow="Care Team"
        title="A long-standing team of exceptional people"
        lead="Our staff receive the very best training to ensure they become the very best carers, always working to national standards."
        heroImage={heroImage}
      />

      <Section>
        <Container className="max-w-3xl space-y-4 leading-relaxed text-ink/80">
          <p>
            We have a wonderful and experienced team at Ferndale. We offer care
            on a 24-hour basis, and our team of qualified, experienced staff
            ensure that all our residents, whether long-term or respite, receive
            excellent care. Staff receive regular training so they remain
            proficient and always work to national standards.
          </p>
          <p>
            Ferndale is a family-run home, led by our manager Kelvin, who has
            worked here since 2005.
          </p>
        </Container>
      </Section>

      {/* Meet the team */}
      <Section className="bg-white">
        <Container>
          <div className="max-w-2xl">
            <Eyebrow>Our people</Eyebrow>
            <h2 className="text-2xl font-semibold text-brand-700">
              Meet the team
            </h2>
            <p className="mt-4 leading-relaxed text-ink/80">
              Many of our team have been with us for years, and it shows in the
              warmth of the home. Hover over anyone to read a little more about
              them.
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {careTeam.map((m) => (
              <div
                key={m.name}
                className={`${CARD} group relative flex gap-5 p-6 transition duration-300 ease-out hover:z-10 hover:-translate-y-1 hover:scale-[1.03] hover:shadow-[0_22px_44px_-18px_rgba(19,82,113,0.30)]`}
              >
                {/* Swap m.photo for a real photo as they become available. */}
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full border border-brand-100">
                  <ManagedImg
                    src={m.photo}
                    fallbackAlt={m.name}
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-brand-700">{m.name}</h3>
                  <p className="text-sm font-medium text-terracotta-600">
                    {m.role}
                  </p>
                  {m.bio ? (
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      {m.bio}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* See how our people pride themselves */}
      <Section className="relative overflow-hidden">
        <Decor tone="warm" />
        <Container className="relative z-10">
          <div className="max-w-2xl">
            <Eyebrow>Pride in our work</Eyebrow>
            <h2 className="text-2xl font-semibold text-brand-700">
              See how our people pride themselves at Ferndale
            </h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {careTeamPride.map((c, i) => (
              <div key={c.title} className={`${CARD} ${CARD_HOVER} p-7`}>
                <div className="flex items-center gap-3">
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${dotAccent(i)}`} />
                  <h3 className="text-lg font-semibold text-brand-700">
                    {c.title}
                  </h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {c.body}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Join / contact CTA */}
      <Section className="relative overflow-hidden bg-brand-50">
        <Decor tone="cool" />
        <Container className="relative z-10 grid items-center gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold text-brand-700">
              Join our team
            </h2>
            <p className="mt-2 text-ink/80">
              Looking for a rewarding role in care? We’d love to hear from you.
            </p>
            <div className="mt-5">
              <ButtonLink href="/careers/">View careers</ButtonLink>
            </div>
          </div>
          <div className="md:text-right">
            <h2 className="text-2xl font-semibold text-brand-700">
              Need to contact our team?
            </h2>
            <p className="mt-2 text-ink/80">
              Call us on{" "}
              <a
                href={`tel:${siteConfig.telephoneE164}`}
                className="font-medium text-brand-700"
              >
                {siteConfig.telephone}
              </a>{" "}
              or send a message.
            </p>
            <div className="mt-5 md:flex md:justify-end">
              <ButtonLink href="/contact-us/" variant="secondary">
                Contact us
              </ButtonLink>
            </div>
          </div>
        </Container>
      </Section>
    </main>
  );
}
