import type { Metadata } from "next";
import { AvailabilityBadgeServer } from "@/components/site/AvailabilityBadgeServer";
import { pageMetadata } from "@/lib/page-meta";
import { Container, Section, Eyebrow } from "@/components/site/ui";
import { Decor } from "@/components/site/decor";
import { ToolEmbed } from "@/components/site/ToolEmbed";
import { siteConfig } from "@/lib/site-config";

const CARD =
  "rounded-2xl border border-brand-100 bg-white shadow-[0_12px_34px_-16px_rgba(19,82,113,0.20)]";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/book-a-visit/", {
    title: "Book a Visit",
    description:
      "Arrange a visit to Ferndale Nursing Home in Crawley, West Sussex. Choose a date and time that suits you, meet the team and see our home for yourself.",
  });
}

const POINTS = [
  "See the home, the rooms and the gardens",
  "Meet our warm, long-standing care team",
  "Ask anything, with no pressure and no obligation",
];

export default function BookAVisitPage() {
  return (
    <main>
      <section className="relative bg-brand-50 py-16 sm:py-20">
        <Decor tone="cool" />
        <Container className="relative z-10 grid items-start gap-10 lg:grid-cols-2">
          <div className="max-w-xl lg:sticky lg:top-24">
            <div className="mb-4">
              <AvailabilityBadgeServer />
            </div>
            <Eyebrow>Come and see us</Eyebrow>
            <h1 className="text-4xl font-semibold leading-tight text-brand-700 sm:text-5xl">
              Book a visit to Ferndale
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-ink/80">
              The best way to get a feel for Ferndale is to come and see it. Choose a date and time
              that suits you and we&rsquo;ll show you and your family around, share a cup of tea and
              answer any questions you have.
            </p>
            <ul className="mt-6 space-y-2.5">
              {POINTS.map((p) => (
                <li key={p} className="flex items-start gap-2 text-sm text-ink/80">
                  <span className="mt-0.5 text-terracotta-600">✓</span>
                  {p}
                </li>
              ))}
            </ul>
            <p className="mt-8 text-sm text-ink/80">
              Prefer to talk?{" "}
              <a href={`tel:${siteConfig.telephoneE164}`} className="font-medium text-brand-700 underline">
                Call us on {siteConfig.telephone}
              </a>
              .
            </p>
          </div>

          <div className={`${CARD} p-6 sm:p-8`}>
            <ToolEmbed tool="book-visit" />
          </div>
        </Container>
      </section>

      <Section className="bg-brand-600">
        <Container className="text-center">
          <h2 className="text-3xl font-semibold text-white">We look forward to meeting you</h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-50">
            Visitors are always welcome at Ferndale. Pop in for a look around whenever suits, we
            can&rsquo;t wait to show you our home.
          </p>
        </Container>
      </Section>
    </main>
  );
}
