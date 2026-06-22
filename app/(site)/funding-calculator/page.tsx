import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-meta";
import { Container, Section, ButtonLink, Eyebrow } from "@/components/site/ui";
import { Icon } from "@/components/site/Icon";
import { chipAccent } from "@/components/site/decor";
import { ToolHero } from "@/components/site/ToolHero";

const CARD =
  "rounded-2xl border border-brand-100 bg-white shadow-[0_12px_34px_-16px_rgba(19,82,113,0.20)]";
const CARD_HOVER =
  "transition duration-200 hover:-translate-y-1 hover:shadow-[0_22px_44px_-18px_rgba(19,82,113,0.30)]";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/funding-calculator/", {
    title: "Care Funding Calculator",
    description:
      "Use our free care funding calculator to get a quick guide to the cost of nursing care and the financial support you may be entitled to.",
  });
}

const FUNDING_OPTIONS = [
  {
    icon: "shield",
    title: "NHS Continuing Healthcare",
    body: "If you have a primary health need, your care may be fully funded by the NHS through Continuing Healthcare, regardless of your finances.",
  },
  {
    icon: "activity",
    title: "NHS-funded Nursing Care",
    body: "As a registered nursing home, our residents may receive a weekly NHS contribution toward the nursing part of their fees (FNC).",
  },
  {
    icon: "shield",
    title: "Local Authority funding",
    body: "If your capital is below the threshold, West Sussex County Council may contribute toward your care after a financial assessment.",
  },
  {
    icon: "home",
    title: "Self-funding",
    body: "If your capital is above the threshold, you will usually pay for your own care. We are always happy to talk through the costs openly and clearly.",
  },
  {
    icon: "gift",
    title: "Attendance Allowance",
    body: "A benefit for people over State Pension age who need help with personal care. It is not means-tested and is worth a set amount each week.",
  },
  {
    icon: "users",
    title: "Other support",
    body: "Deferred payment agreements, third-party top-ups and benefits advice can all help. We are glad to point you in the right direction.",
  },
];

export default function FundingCalculatorPage() {
  return (
    <main>
      <ToolHero
        eyebrow="Paying for care"
        title="Care funding calculator"
        lead="Work out a guide to the cost of nursing care and the financial support you may be entitled to. Answer a few simple questions to see your options, then talk to us for friendly, no-obligation advice."
        tool="funding"
      />

      {/* Intro */}
      <Section>
        <Container className="max-w-3xl">
          <Eyebrow>How care is paid for</Eyebrow>
          <h2 className="text-3xl font-semibold text-brand-700">
            Understanding the cost of care
          </h2>
          <div className="mt-4 space-y-4 leading-relaxed text-ink/80">
            <p>
              Paying for nursing care can feel daunting, but there is often more
              support available than families realise, particularly where there
              is a nursing or health need. The calculator above gives you a quick
              guide to what you might pay and the help you could be entitled to.
            </p>
            <p>
              Below is a short overview of the main ways care can be funded. Every
              situation is different, so please do get in touch and we will happily
              talk things through with you.
            </p>
          </div>
        </Container>
      </Section>

      {/* Funding options */}
      <Section className="relative overflow-hidden bg-white">
        <Container className="relative z-10">
          <div className="max-w-2xl">
            <Eyebrow>Your options</Eyebrow>
            <h2 className="text-2xl font-semibold text-brand-700">
              Ways care can be funded
            </h2>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FUNDING_OPTIONS.map((o, i) => (
              <div key={o.title} className={`${CARD} ${CARD_HOVER} p-7`}>
                <span
                  className={`inline-flex rounded-xl p-3 ring-1 ${chipAccent(i)}`}
                >
                  <Icon name={o.icon} />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-brand-700">
                  {o.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {o.body}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-8 max-w-3xl text-sm leading-relaxed text-muted">
            The calculator gives a general guide only and is not financial or
            legal advice. Funding rules and thresholds change from time to time,
            so please check the latest figures with your local authority or a
            qualified adviser.
          </p>
        </Container>
      </Section>

      {/* CTA */}
      <Section className="bg-brand-600">
        <Container className="text-center">
          <h2 className="text-3xl font-semibold text-white">
            Talk to us about fees
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-50">
            We believe in being open and clear about costs. Get in touch and we
            will talk you through fees and funding with no pressure.
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
    </main>
  );
}
