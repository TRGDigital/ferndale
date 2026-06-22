import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/page-meta";
import { Container, Section, PageHeader } from "@/components/site/ui";
import { Icon } from "@/components/site/Icon";
import { chipAccent, Decor } from "@/components/site/decor";
import { tools } from "@/lib/content/tools";

const CARD =
  "rounded-2xl border border-brand-100 bg-white shadow-[0_12px_34px_-16px_rgba(19,82,113,0.20)]";
const CARD_HOVER =
  "transition duration-200 hover:-translate-y-1 hover:shadow-[0_22px_44px_-18px_rgba(19,82,113,0.30)]";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/tools/", {
    title: "Tools",
    description:
      "Free, easy-to-use tools to help you plan and understand nursing care funding, including our care funding calculator and NHS funding checkers.",
  });
}

export default function ToolsPage() {
  return (
    <main>
      <PageHeader
        eyebrow="Tools"
        title="Helpful tools"
        lead="Free, easy-to-use tools to help you understand and plan for care and the funding that may be available. We add to these over time, so do check back."
      />

      <Section className="relative overflow-hidden">
        <Decor tone="cool" />
        <Container className="relative z-10">
          {tools.length === 0 ? (
            <p className="text-muted">
              No tools available yet. Please check back soon.
            </p>
          ) : (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {tools.map((tool, i) => (
                <li key={tool.href}>
                  <Link
                    href={tool.href}
                    className={`group ${CARD} ${CARD_HOVER} flex h-full flex-col p-7`}
                  >
                    <span
                      className={`inline-flex rounded-xl p-3 ring-1 ${chipAccent(i)}`}
                    >
                      <Icon name={tool.icon} />
                    </span>
                    <h2 className="mt-4 text-lg font-semibold text-brand-700">
                      {tool.name}
                    </h2>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                      {tool.description}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-terracotta-600">
                      Open tool
                      <span className="transition-transform group-hover:translate-x-1">
                        →
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Container>
      </Section>
    </main>
  );
}
