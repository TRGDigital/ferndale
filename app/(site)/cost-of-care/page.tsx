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
  return pageMetadata("/cost-of-care/", {
    title: "Cost of Care Estimator",
    description:
      "Estimate the weekly, monthly and yearly cost of nursing or respite care at Ferndale in Crawley, and see who is likely to pay, you, the council or with help from benefits.",
  });
}

const POINTS = [
  "Weekly, monthly and yearly costs at a glance",
  "See who's likely to pay: you, the council, or both",
  "Adjust it to your own quote and situation",
];

export default function CostOfCarePage() {
  return (
    <EnquiryProvider>
      <main>
        <section className="relative bg-brand-50 py-16 sm:py-20">
          <Decor tone="cool" />
          <Container className="relative z-10 grid items-start gap-10 lg:grid-cols-2">
            <div className="max-w-xl lg:sticky lg:top-24">
              <Eyebrow>Paying for care</Eyebrow>
              <h1 className="text-4xl font-semibold leading-tight text-brand-700 sm:text-5xl">
                What will care cost?
              </h1>
              <p className="mt-5 text-lg leading-relaxed text-ink/80">
                The cost of care is one of the first things families want to understand. This quick
                estimator gives you a guide to the cost of nursing or respite care at Ferndale,
                and who is likely to pay once savings, property and benefits are taken into account.
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
                <EnquiryButton variant="solid">Get a personalised fee</EnquiryButton>
                <a
                  href={`tel:${siteConfig.telephoneE164}`}
                  className="inline-flex items-center justify-center rounded-full border border-brand-600 px-6 py-3 text-sm font-medium text-brand-700 hover:bg-brand-50"
                >
                  Call {siteConfig.telephone}
                </a>
              </div>
            </div>

            <div className={`${CARD} p-6 sm:p-8`}>
              <ToolEmbed tool="cost-estimator" />
            </div>
          </Container>
        </section>

        <Section>
          <Container className="max-w-3xl">
            <Eyebrow>Good to know</Eyebrow>
            <h2 className="text-2xl font-semibold text-brand-700">
              A guide, and then a proper conversation
            </h2>
            <div className="mt-4 space-y-4 leading-relaxed text-ink/80">
              <p>
                Every resident is different, so your actual weekly fee depends on the level of care
                you need and the room you choose. The estimator uses a typical guide figure, which you
                can adjust to the fee we quote you, so the numbers reflect your own situation.
              </p>
              <p>
                Many families are entitled to more help than they realise. Between council funding,
                Attendance Allowance and using a home&rsquo;s value through a Deferred Payment, the
                amount you actually pay can be very different from the headline fee. We&rsquo;re always
                happy to talk it through and point you to the right support.
              </p>
            </div>
          </Container>
        </Section>

        <Section className="bg-brand-600">
          <Container className="text-center">
            <h2 className="text-3xl font-semibold text-white">Let&rsquo;s work out your numbers</h2>
            <p className="mx-auto mt-3 max-w-xl text-brand-50">
              Get a clear, personalised fee for Ferndale and honest guidance on how to pay for care.
            </p>
            <div className="mt-7 flex justify-center">
              <EnquiryButton variant="light">Get in touch</EnquiryButton>
            </div>
          </Container>
        </Section>
      </main>
    </EnquiryProvider>
  );
}
