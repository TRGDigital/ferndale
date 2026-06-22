import { Container, ButtonLink, Eyebrow } from "@/components/site/ui";
import { Decor } from "@/components/site/decor";
import { ToolEmbed } from "@/components/site/ToolEmbed";

const CARD =
  "rounded-2xl border border-brand-100 bg-white shadow-[0_12px_34px_-16px_rgba(19,82,113,0.20)]";

// Shared hero for tool-embed pages: explanatory text on the left (sticky, stays
// in view as the tool expands), the tool on the right. No overflow-hidden on the
// section — it would disable the sticky (Decor clips its own blobs).
export function ToolHero({
  eyebrow,
  title,
  lead,
  tool,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  tool: string;
}) {
  return (
    <section className="relative bg-brand-50 py-16 sm:py-20">
      <Decor tone="cool" />
      <Container className="relative z-10 grid items-start gap-10 lg:grid-cols-2">
        <div className="max-w-xl lg:sticky lg:top-24">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="text-4xl font-semibold leading-tight text-brand-700 sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 text-lg text-ink/80">{lead}</p>
          <div className="mt-8">
            <ButtonLink href="/contact-us/">Speak to our team</ButtonLink>
          </div>
        </div>
        <div className={`${CARD} p-5 sm:p-6`}>
          <ToolEmbed tool={tool} />
        </div>
      </Container>
    </section>
  );
}
