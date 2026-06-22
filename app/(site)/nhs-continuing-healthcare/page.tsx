import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-meta";
import { Container, Section, ButtonLink, Eyebrow } from "@/components/site/ui";
import { ToolHero } from "@/components/site/ToolHero";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/nhs-continuing-healthcare/", {
    title: "NHS Continuing Healthcare Checker",
    description:
      "See whether you might be eligible for NHS Continuing Healthcare (CHC), where the NHS funds the full cost of your care.",
  });
}

export default function ContinuingHealthcarePage() {
  return (
    <main>
      <ToolHero
        eyebrow="NHS funding"
        title="NHS Continuing Healthcare checker"
        lead="If you have significant ongoing health needs, the NHS may pay for the full cost of your care through NHS Continuing Healthcare (CHC). Use the checker to see whether it could be worth seeking an assessment."
        tool="chc-checker"
      />

      <Section>
        <Container className="max-w-3xl">
          <Eyebrow>About CHC</Eyebrow>
          <h2 className="text-3xl font-semibold text-brand-700">
            What is NHS Continuing Healthcare?
          </h2>
          <div className="mt-4 space-y-4 leading-relaxed text-ink/80">
            <p>
              NHS Continuing Healthcare (CHC) is a package of care arranged and
              funded entirely by the NHS for adults with a complex, ongoing
              &ldquo;primary health need&rdquo;. Where someone is eligible, the NHS
              covers the full cost of their care, including their nursing-home fees.
            </p>
            <p>
              Eligibility is decided by an assessment of your care needs, not your
              finances, so CHC is not means-tested. Many people are unaware they
              may qualify, particularly where health needs have increased.
            </p>
            <p>
              The checker above is a general guide only. If it suggests CHC could
              be relevant, the next step is usually a full assessment using the
              Decision Support Tool, which we explain on a separate page.
            </p>
          </div>
        </Container>
      </Section>

      <Section className="bg-brand-600">
        <Container className="text-center">
          <h2 className="text-3xl font-semibold text-white">
            Unsure where to start?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-50">
            Our team can help you understand CHC and how to request an assessment.
            Get in touch for friendly, no-obligation advice.
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
