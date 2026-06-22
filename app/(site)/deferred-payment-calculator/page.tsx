import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-meta";
import { Container, Section, ButtonLink, Eyebrow } from "@/components/site/ui";
import { ToolHero } from "@/components/site/ToolHero";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/deferred-payment-calculator/", {
    title: "Deferred Payment Calculator",
    description:
      "See how a deferred payment agreement could let you use the value of your home to help pay for nursing care now and repay later.",
  });
}

export default function DeferredPaymentPage() {
  return (
    <main>
      <ToolHero
        eyebrow="Paying for care"
        title="Deferred payment calculator"
        lead="A deferred payment agreement lets you use the value of your home to help pay for care now, and repay later, usually when the property is sold. Use the calculator to get a feel for how it could work for you."
        tool="dpa"
      />

      <Section>
        <Container className="max-w-3xl">
          <Eyebrow>What is a deferred payment?</Eyebrow>
          <h2 className="text-3xl font-semibold text-brand-700">
            Using your home to help pay for care
          </h2>
          <div className="mt-4 space-y-4 leading-relaxed text-ink/80">
            <p>
              A deferred payment agreement (DPA) is an arrangement with your local
              council. They effectively lend you money against the value of your
              home to help cover your care fees, so you do not have to sell your
              property straight away.
            </p>
            <p>
              The amount you defer is repaid later, typically from the sale of the
              home or from your estate. Interest and a small administration charge
              usually apply, and your eligibility depends on your circumstances.
            </p>
            <p>
              The calculator above gives a general guide only. West Sussex County
              Council arranges deferred payments in our area, and we are always
              happy to point you in the right direction.
            </p>
          </div>
        </Container>
      </Section>

      <Section className="bg-brand-600">
        <Container className="text-center">
          <h2 className="text-3xl font-semibold text-white">
            Talk to us about fees
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-50">
            Get in touch and we will talk you through fees and funding options
            openly and clearly, with no pressure.
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
