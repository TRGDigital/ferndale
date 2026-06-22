import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-meta";
import { Container, Section, ButtonLink, Eyebrow } from "@/components/site/ui";
import { ToolHero } from "@/components/site/ToolHero";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/funded-nursing-care/", {
    title: "Funded Nursing Care Checker",
    description:
      "Check whether the NHS could pay a weekly contribution toward your nursing care through NHS-funded Nursing Care (FNC).",
  });
}

export default function FundedNursingCarePage() {
  return (
    <main>
      <ToolHero
        eyebrow="NHS funding"
        title="Funded Nursing Care checker"
        lead="If you live in a nursing home and need care from a registered nurse, the NHS may pay a weekly contribution toward your fees, known as NHS-funded Nursing Care (FNC). Use the checker to see whether it could apply to you."
        tool="fnc"
      />

      <Section>
        <Container className="max-w-3xl">
          <Eyebrow>About FNC</Eyebrow>
          <h2 className="text-3xl font-semibold text-brand-700">
            What is NHS-funded Nursing Care?
          </h2>
          <div className="mt-4 space-y-4 leading-relaxed text-ink/80">
            <p>
              NHS-funded Nursing Care (FNC) is a flat weekly amount the NHS pays
              directly to a nursing home toward the cost of care provided by a
              registered nurse. As Ferndale is a registered nursing home, many of
              our residents are eligible.
            </p>
            <p>
              FNC is not means-tested, so it does not depend on your savings or
              income. To qualify you need to be assessed as needing care from a
              registered nurse, and not already have that care fully funded
              through NHS Continuing Healthcare.
            </p>
            <p>
              The checker above gives a general guide. We can help arrange the
              assessment and explain how the contribution affects your fees.
            </p>
          </div>
        </Container>
      </Section>

      <Section className="bg-brand-600">
        <Container className="text-center">
          <h2 className="text-3xl font-semibold text-white">
            Ask us about nursing care funding
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-50">
            Our team can talk you through FNC, assessments and fees. Get in touch
            for friendly, no-obligation advice.
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
