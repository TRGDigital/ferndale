import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-meta";
import { Container, Section, Eyebrow } from "@/components/site/ui";
import { EnquiryProvider, EnquiryButton } from "@/components/site/EnquiryDialog";
import { Decor } from "@/components/site/decor";
import { ToolEmbed } from "@/components/site/ToolEmbed";
import { siteConfig } from "@/lib/site-config";

const CARD =
  "rounded-2xl border border-brand-100 bg-white shadow-[0_12px_34px_-16px_rgba(19,82,113,0.20)]";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/is-it-time-for-care/", {
    title: "Is It Time for Care? A Family Checklist",
    description:
      "A free, private checklist to help families decide whether a loved one might need more support or residential care. Answer a few gentle questions, nothing is stored.",
  });
}

const POINTS = [
  "A gentle, honest self-check in two minutes",
  "Completely private, nothing is saved",
  "Helps you decide whether to talk to us or a GP",
];

export default function IsItTimeForCarePage() {
  return (
    <EnquiryProvider>
      <main>
        <section className="relative bg-brand-50 py-16 sm:py-20">
          <Decor tone="cool" />
          <Container className="relative z-10 grid items-start gap-10 lg:grid-cols-2">
            <div className="max-w-xl lg:sticky lg:top-24">
              <Eyebrow>Free · Private · Not a diagnosis</Eyebrow>
              <h1 className="text-4xl font-semibold leading-tight text-brand-700 sm:text-5xl">
                Is it time to think about care?
              </h1>
              <p className="mt-5 text-lg leading-relaxed text-ink/80">
                Worrying about a parent or relative is hard, and it&rsquo;s often difficult to know
                whether what you&rsquo;re seeing is a normal part of getting older or a sign they need
                more support. This short, private checklist can help you make sense of it.
              </p>
              <ul className="mt-6 space-y-2.5">
                {POINTS.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm text-ink/80">
                    <span className="mt-0.5 text-terracotta-600">✓</span>
                    {p}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <EnquiryButton variant="solid">Talk to our team</EnquiryButton>
                <a
                  href={`tel:${siteConfig.telephoneE164}`}
                  className="inline-flex items-center justify-center rounded-full border border-brand-600 px-6 py-3 text-sm font-medium text-brand-700 hover:bg-brand-50"
                >
                  Call {siteConfig.telephone}
                </a>
              </div>
            </div>

            <div className={`${CARD} p-6 sm:p-8`}>
              <ToolEmbed tool="care-checklist" />
            </div>
          </Container>
        </section>

        <Section>
          <Container className="max-w-3xl">
            <Eyebrow>How to use it</Eyebrow>
            <h2 className="text-2xl font-semibold text-brand-700">
              A starting point, not a verdict
            </h2>
            <div className="mt-4 space-y-4 leading-relaxed text-ink/80">
              <p>
                This checklist looks at the everyday signs that often show a loved one could benefit
                from more support: managing at home, staying safe, eating well, taking medication,
                keeping company, and the strain caring can place on family. There are no right or
                wrong answers.
              </p>
              <p>
                Whatever your result, it&rsquo;s a guide to help you reflect, not a formal assessment.
                Many things can be helped or improved, and the next step is simply a conversation. We
                are always happy to talk things through with you, gently and without any pressure, and
                to help you understand all the options, from support at home to respite or a permanent
                place at Ferndale.
              </p>
            </div>
          </Container>
        </Section>

        <Section className="bg-brand-600">
          <Container className="text-center">
            <h2 className="text-3xl font-semibold text-white">Not sure what to do next?</h2>
            <p className="mx-auto mt-3 max-w-xl text-brand-50">
              Whether you&rsquo;re just starting to worry or ready to look at care, we&rsquo;re here to
              help. Get in touch for a warm, no-pressure chat.
            </p>
            <div className="mt-7 flex justify-center">
              <EnquiryButton variant="light">Talk to our team</EnquiryButton>
            </div>
          </Container>
        </Section>
      </main>
    </EnquiryProvider>
  );
}
