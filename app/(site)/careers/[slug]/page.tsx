import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { jobPostingSchema, pageBreadcrumbs } from "@/lib/schema";
import { pageMetadata } from "@/lib/page-meta";
import { siteConfig } from "@/lib/site-config";
import { Container, Section, PageHeader, ButtonLink, Eyebrow } from "@/components/site/ui";
import { CareersForm } from "@/components/site/CareersForm";
import { getOpenJobs, getPublishedJobBySlug } from "@/lib/data/jobs";
import { isJobOpen, jobPath, jobSlug } from "@/lib/jobs";

type Params = { slug: string };

const CARD =
  "rounded-2xl border border-brand-100 bg-white shadow-[0_12px_34px_-16px_rgba(19,82,113,0.20)]";

export async function generateStaticParams() {
  // Resilient so credential-less builds don't fail; new jobs render on demand.
  const jobs = await getOpenJobs().catch(() => []);
  return jobs.map((j) => ({ slug: jobSlug(j) }));
}

function formatDate(d: Date | string | null) {
  if (!d) return "";
  const dt = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(dt.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(dt);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const job = await getPublishedJobBySlug(slug).catch(() => null);
  if (!job) return { title: "Vacancy not found", robots: { index: false } };
  const meta = await pageMetadata(jobPath(job), {
    title: `${job.title} job in ${siteConfig.address.addressLocality}`,
    description:
      job.summary ??
      `${job.title} vacancy at ${siteConfig.name}, ${siteConfig.address.addressLocality}. Apply online today.`,
    ignoreSitePage: true,
  });
  // Closed roles stay reachable for anyone with the link, but drop out of search.
  return isJobOpen(job) ? meta : { ...meta, robots: { index: false, follow: true } };
}

export default async function JobPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const job = await getPublishedJobBySlug(slug).catch(() => null);
  if (!job) notFound();
  // Title edited since the link was shared: send it to the current URL.
  if (slug !== jobSlug(job)) permanentRedirect(jobPath(job));

  const open = isJobOpen(job);
  const meta = [job.type, job.hours, job.salary, job.location].filter(Boolean) as string[];
  const closing = formatDate(job.closingDate);

  return (
    <main>
      <JsonLd
        data={[
          // Google wants JobPosting markup removed once a role closes.
          open ? jobPostingSchema(job) : null,
          pageBreadcrumbs(jobPath(job), job.title, { name: "Careers", path: "/careers/" }),
        ]}
      />
      <PageHeader
        eyebrow="Vacancy"
        title={job.title}
        lead={job.summary ?? `Join the team at ${siteConfig.name} in ${siteConfig.address.addressLocality}.`}
      />
      <Section>
        <Container className="grid items-start gap-10 md:grid-cols-2">
          <div className="space-y-5 leading-relaxed text-ink/80">
            {!open ? (
              <p role="status" className="rounded-xl bg-brand-50 p-5 font-medium text-brand-700">
                This vacancy has now closed. You can still send us your details below and
                we’ll keep them on file, or see our other roles on the{" "}
                <Link href="/careers/" className="underline">
                  careers page
                </Link>
                .
              </p>
            ) : null}
            {meta.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {meta.map((m) => (
                  <li
                    key={m}
                    className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 ring-1 ring-brand-100"
                  >
                    {m}
                  </li>
                ))}
              </ul>
            ) : null}
            <Eyebrow>About the role</Eyebrow>
            <div className="space-y-3">
              {job.description.split(/\n\s*\n/).map((para, i) => (
                <p key={i} className="whitespace-pre-line">
                  {para}
                </p>
              ))}
            </div>
            <p className="text-sm text-muted">
              Based at {siteConfig.address.streetAddress}, {siteConfig.address.addressLocality},{" "}
              {siteConfig.address.postalCode}.
              {closing ? ` Closing date: ${closing}.` : ""}
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <ButtonLink href="#apply">Apply for this role</ButtonLink>
              <ButtonLink href="/careers/" variant="secondary">
                Why work at Ferndale
              </ButtonLink>
            </div>
          </div>
          <div id="apply" className={`${CARD} scroll-mt-24 p-7`}>
            <h2 className="text-lg font-semibold text-brand-700">
              {open ? `Apply for ${job.title}` : "Send us your details"}
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              It only takes a couple of minutes. Attach your CV if you have one to hand, and
              we’ll take it from there.
            </p>
            <div className="mt-5">
              <CareersForm position={job.title} />
            </div>
          </div>
        </Container>
      </Section>
    </main>
  );
}
