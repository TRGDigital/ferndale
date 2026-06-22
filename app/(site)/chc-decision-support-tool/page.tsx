import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-meta";
import { Container, Section, ButtonLink, Eyebrow } from "@/components/site/ui";
import { ToolHero } from "@/components/site/ToolHero";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/chc-decision-support-tool/", {
    title: "CHC Decision Support Tool Guide",
    description:
      "Understand the Decision Support Tool the NHS uses to assess Continuing Healthcare, and what each care domain means.",
  });
}

export default function ChcDecisionSupportToolPage() {
  return (
    <main>
      <ToolHero
        eyebrow="NHS funding"
        title="CHC Decision Support Tool guide"
        lead="If you are being assessed for NHS Continuing Healthcare, the assessors use a Decision Support Tool (DST) that scores your needs across twelve care domains. This guide explains what each domain means so you can feel prepared."
        tool="chc-dst"
      />

      <Section>
        <Container className="max-w-3xl">
          <Eyebrow>About the DST</Eyebrow>
          <h2 className="text-3xl font-semibold text-brand-700">
            What is the Decision Support Tool?
          </h2>
          <div className="mt-4 space-y-4 leading-relaxed text-ink/80">
            <p>
              The Decision Support Tool (DST) is the standard form a
              multidisciplinary team completes when assessing eligibility for NHS
              Continuing Healthcare. It looks at your needs across twelve
              &ldquo;care domains&rdquo;, such as mobility, nutrition, cognition,
              behaviour and medication.
            </p>
            <p>
              Each domain is given a level from no needs through to priority or
              severe. The overall pattern, intensity, complexity and
              unpredictability of your needs is what decides whether you have a
              &ldquo;primary health need&rdquo; and therefore qualify for CHC.
            </p>
            <p>
              The guide above walks through the domains in plain language. It is
              for information only and does not replace the formal assessment, but
              it can help you and your family understand the process.
            </p>
          </div>
        </Container>
      </Section>

      <Section className="bg-brand-600">
        <Container className="text-center">
          <h2 className="text-3xl font-semibold text-white">
            Preparing for an assessment?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-50">
            Our nursing team is experienced in supporting residents through CHC
            assessments. Get in touch and we will be glad to help.
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
