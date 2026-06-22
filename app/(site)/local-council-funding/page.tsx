import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-meta";
import { Container, Section, ButtonLink, Eyebrow } from "@/components/site/ui";
import { ToolHero } from "@/components/site/ToolHero";

const CARD =
  "rounded-2xl border border-brand-100 bg-white shadow-[0_12px_34px_-16px_rgba(19,82,113,0.20)]";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/local-council-funding/", {
    title: "Local Council & Funding",
    description:
      "Find your local council and the adult social care funding it offers, and see how funding works for Ferndale in West Sussex.",
  });
}

export default function LocalCouncilFundingPage() {
  return (
    <main>
      <ToolHero
        eyebrow="Paying for care"
        title="Local council & funding"
        lead="Adult social care funding starts with your local council. Use the lookup to find your council and the support it offers, then see how funding works for Ferndale in West Sussex."
        tool="la-lookup"
      />

      <Section>
        <Container className="max-w-3xl">
          <Eyebrow>Local authority</Eyebrow>
          <h2 className="text-3xl font-semibold text-brand-700">
            Ferndale sits within West Sussex
          </h2>
          <div className="mt-4 space-y-4 leading-relaxed text-ink/80">
            <p>
              Ferndale is in Crawley, which falls under{" "}
              <strong>West Sussex County Council</strong>. They are the local
              authority responsible for adult social care in our area, so any
              council funding starts with them.
            </p>
            <p>
              If you think you may be entitled to local authority funding, West
              Sussex County Council arranges the{" "}
              <strong>care needs assessment</strong> and the{" "}
              <strong>financial assessment</strong> that decide what support you
              can receive. All funding questions and applications need to go
              through them.
            </p>
          </div>

          <div className={`${CARD} mt-8 p-7`}>
            <h3 className="text-lg font-semibold text-brand-700">
              Contact West Sussex adult social care
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              West Sussex County Council&rsquo;s Adults&rsquo; CarePoint can talk
              you through assessments, funding and the help that is available.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-ink/80">
              <li>
                <span className="font-medium text-brand-700">Phone:</span>{" "}
                <a href="tel:+441243642121" className="hover:text-brand-700">
                  01243 642121
                </a>{" "}
                (Adults&rsquo; CarePoint)
              </li>
              <li>
                <span className="font-medium text-brand-700">Online:</span>{" "}
                <a
                  href="https://www.westsussex.gov.uk/adults"
                  target="_blank"
                  rel="noopener"
                  className="font-medium text-brand-700 underline"
                >
                  westsussex.gov.uk/adults
                </a>
              </li>
            </ul>
            <p className="mt-4 text-xs text-muted">
              Please check the West Sussex County Council website for the latest
              contact details and funding thresholds.
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
            Get in touch and we will talk you through fees and funding openly and
            clearly, with no pressure.
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
