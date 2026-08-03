import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-meta";
import { Container, Section, ButtonLink, Eyebrow } from "@/components/site/ui";
import { Icon } from "@/components/site/Icon";
import { chipAccent, Decor } from "@/components/site/decor";
import { ToolHero } from "@/components/site/ToolHero";

const CARD =
  "rounded-2xl border border-brand-100 bg-white shadow-[0_12px_34px_-16px_rgba(19,82,113,0.20)]";
const CARD_HOVER =
  "transition duration-200 hover:-translate-y-1 hover:shadow-[0_22px_44px_-18px_rgba(19,82,113,0.30)]";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/dementia-signs/", {
    title: "Dementia Signs Checklist",
    description:
      "A free, private checklist to help families spot possible early signs of dementia in a relative. Based on the AD8 screening tool. It is not a diagnosis, it helps you decide whether to speak to a GP.",
  });
}

const POINTS = [
  {
    icon: "puzzle",
    title: "What it checks",
    body: "Eight everyday areas where early changes often show first: judgement, losing interest in hobbies, repeating questions, using gadgets, remembering dates, handling money, keeping appointments, and day-to-day memory.",
  },
  {
    icon: "shield",
    title: "Private and free",
    body: "Everything is worked out in your browser. We do not ask for a name, email or any personal details, and we do not save your answers.",
  },
  {
    icon: "heart",
    title: "Not a diagnosis",
    body: "Many things can affect memory, and some are treatable. The checklist helps you decide whether it is worth speaking to a GP. Only a doctor can diagnose dementia.",
  },
  {
    icon: "phone",
    title: "You are not alone",
    body: "If you are worried, the Alzheimer's Society Dementia Support Line (0333 150 3456) and our own team are always here to help.",
  },
];

export default function DementiaSignsPage() {
  return (
    <main>
      <ToolHero
        eyebrow="Dementia support"
        title="Dementia signs checklist"
        lead="If you have noticed changes in a parent or relative, this short, private checklist can help you decide whether it is worth speaking to a doctor. It takes about two minutes, and nothing is stored."
        tool="dementia-signs"
      />

      <Section>
        <Container className="max-w-3xl">
          <Eyebrow>The basics</Eyebrow>
          <h2 className="text-3xl font-semibold text-brand-700">
            How this checklist works
          </h2>
          <div className="mt-4 space-y-4 leading-relaxed text-ink/80">
            <p>
              This free checklist is based on the AD8, a short screening tool used
              by clinicians and researchers. A family member or close friend
              answers eight simple questions about the person they are concerned
              about, thinking about changes over the last few years caused by
              problems with memory or thinking, not how they have always been.
            </p>
            <p>
              Each area where you notice a change counts as one point. If you note
              changes in two or more areas, it is worth speaking to a GP. This does
              not mean the person has dementia, it simply means the changes are
              significant enough to be worth a professional opinion. You are always
              welcome to talk it through with us, too.
            </p>
          </div>
        </Container>
      </Section>

      <Section className="relative overflow-hidden bg-white">
        <Decor tone="warm" />
        <Container className="relative z-10">
          <div className="max-w-2xl">
            <Eyebrow>Good to know</Eyebrow>
            <h2 className="text-2xl font-semibold text-brand-700">
              Before you begin
            </h2>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {POINTS.map((p, i) => (
              <div key={p.title} className={`${CARD} ${CARD_HOVER} p-7`}>
                <span className={`inline-flex rounded-xl p-3 ring-1 ${chipAccent(i)}`}>
                  <Icon name={p.icon} />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-brand-700">
                  {p.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{p.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 max-w-3xl text-sm leading-relaxed text-muted">
            This checklist is based on the AD8 Dementia Screening Interview (Galvin
            et al., Washington University). It is a guide to help you decide whether
            to seek advice, not a diagnosis, and not a substitute for professional
            medical assessment. Always speak to a GP about any health concern.
          </p>
        </Container>
      </Section>

      <Section className="bg-brand-600">
        <Container className="text-center">
          <h2 className="text-3xl font-semibold text-white">
            Worried about a loved one?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-50">
            Whether you are just starting to notice changes or already looking at
            care, we are here to help. Get in touch for a warm, no-pressure chat.
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
