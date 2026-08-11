import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/page-meta";
import { Container, Section, PageHeader, ButtonLink } from "@/components/site/ui";
import { Icon } from "@/components/site/Icon";
import { Decor } from "@/components/site/decor";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";
import { siteConfig } from "@/lib/site-config";
import { baseTown } from "@/lib/content/local-areas";
import { getAreasWeServe } from "@/lib/content/areas-index";

const CARD =
  "rounded-2xl border border-brand-100 bg-white shadow-[0_12px_34px_-16px_rgba(19,82,113,0.20)]";
const CARD_HOVER =
  "transition duration-200 hover:-translate-y-1 hover:shadow-[0_22px_44px_-18px_rgba(19,82,113,0.30)]";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/areas-we-serve/", {
    title: "Areas We Serve",
    description:
      "Ferndale Nursing Home welcomes families from across Crawley, West Sussex and east Surrey, including Horsham, East Grinstead, Haywards Heath, Reigate and the surrounding areas. Find nursing and dementia care near you.",
  });
}

export default async function AreasWeServePage() {
  const towns = await getAreasWeServe();

  return (
    <main>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Areas We Serve", path: "/areas-we-serve/" },
        ])}
      />

      <PageHeader
        eyebrow="Areas we serve"
        title="Nursing care for families across the area"
        lead={`Ferndale sits in ${baseTown}, close to Gatwick and within easy reach of families right across West Sussex and east Surrey. Choose your area below to see our nursing and dementia care nearby.`}
      />

      <Section className="relative overflow-hidden">
        <Decor tone="cool" />
        <Container className="relative z-10">
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {towns.map((town) => (
              <li key={town.townSlug}>
                <div className={`${CARD} ${CARD_HOVER} flex h-full flex-col p-6`}>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex shrink-0 rounded-xl bg-brand-50 p-2.5 text-brand-700 ring-1 ring-brand-100">
                      <Icon name="home" />
                    </span>
                    <h2 className="text-lg font-semibold text-brand-700">
                      {town.townName}
                    </h2>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {town.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="group flex items-center justify-between rounded-lg px-3 py-2 text-sm text-ink/80 ring-1 ring-brand-100 transition hover:bg-brand-50 hover:text-brand-700"
                        >
                          <span>
                            {link.careName} in {town.townName}
                          </span>
                          <span className="text-terracotta-600 transition-transform group-hover:translate-x-1">
                            →
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-12 rounded-2xl bg-brand-50 p-8 text-center">
            <h2 className="text-2xl font-semibold text-brand-700">
              Not sure which is right for your family?
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted">
              Wherever you are in {siteConfig.address.addressRegion} and the surrounding
              area, we are happy to talk everything through with no pressure. Come and
              visit, meet the team and see the home for yourself.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <ButtonLink href="/contact-us/">Book a visit</ButtonLink>
              <ButtonLink href="/fees/" variant="secondary">
                Fees &amp; funding
              </ButtonLink>
            </div>
          </div>
        </Container>
      </Section>
    </main>
  );
}
