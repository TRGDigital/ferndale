import type { Metadata } from "next";
import { SiteImage } from "@/components/SiteImage";
import { pageMetadata } from "@/lib/page-meta";
import {
  Container,
  Section,
  PageHeader,
  ButtonLink,
  Eyebrow,
} from "@/components/site/ui";
import { Icon } from "@/components/site/Icon";
import { chipAccent, Decor } from "@/components/site/decor";
import { CareersForm } from "@/components/site/CareersForm";
import { residentReview } from "@/lib/content/pages";
import { getPublishedJobs } from "@/lib/data/jobs";

function formatClosing(d: Date | string | null) {
  if (!d) return "";
  const dt = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(dt.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(dt);
}

// Elevated card with a soft, brand-tinted shadow for depth (matches the home page).
const CARD =
  "rounded-2xl border border-brand-100 bg-white shadow-[0_12px_34px_-16px_rgba(19,82,113,0.20)]";
const CARD_HOVER =
  "transition duration-200 hover:-translate-y-1 hover:shadow-[0_22px_44px_-18px_rgba(19,82,113,0.30)]";

const heroImage = {
  src: "https://trmwjilicdxgrzbwzchf.supabase.co/storage/v1/object/public/blog/site/careers/hero.jpg",
  alt: "A smiling Ferndale carer in the dining room as residents enjoy lunch together",
};

const teamImage = {
  src: "https://trmwjilicdxgrzbwzchf.supabase.co/storage/v1/object/public/blog/site/careers/team.jpg",
  alt: "Two smiling Ferndale carers in uniform in the dining room",
};

const applicationSteps = [
  {
    title: "Send us your details",
    body: "Fill in the short form and attach your CV if you have one to hand.",
  },
  {
    title: "We’ll read your application",
    body: "A member of our team personally reviews every application we receive.",
  },
  {
    title: "We’ll be in touch",
    body: "If it looks like a good fit, we’ll arrange a friendly chat and a visit to the home.",
  },
];

const careerBenefits = [
  {
    icon: "heart",
    title: "A friendly, family-run home",
    body: "We’re a small, close team where everyone is known by name, residents and staff alike, not a big impersonal chain.",
  },
  {
    icon: "shield",
    title: "Training and development",
    body: "We support those starting out and develop experienced carers, with regular training to national standards and a path to senior roles.",
  },
  {
    icon: "users",
    title: "Supportive management",
    body: "Our long-standing manager and team are always on hand. You’ll never feel on your own, and good ideas are always welcome.",
  },
  {
    icon: "sun",
    title: "Genuinely rewarding work",
    body: "Few jobs let you make such a real difference every day. The relationships you build with residents stay with you.",
  },
  {
    icon: "home",
    title: "Excellent working conditions",
    body: "A beautiful home in Lindfield with a warm, settled atmosphere and the time to give residents the care they deserve.",
  },
  {
    icon: "leaf",
    title: "A long-standing team",
    body: "Many of our staff have been with us for years. People stay because Ferndale is a wonderful place to work.",
  },
];

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/careers/", {
    title: "Careers",
    description:
      "Experienced carer looking for a rewarding role? Ferndale offers excellent working conditions in a friendly, family-run home in Lindfield.",
  });
}

export default async function CareersPage() {
  const jobs = await getPublishedJobs().catch(() => []);

  return (
    <main>
      <PageHeader
        eyebrow="Careers"
        title="Careers with Ferndale"
        lead="If you have experience in care and are looking for a wonderful home with excellent working conditions, we’d love to hear from you."
        heroImage={heroImage}
      />
      <Section>
        <Container className="max-w-3xl space-y-4 leading-relaxed text-ink/80">
          <Eyebrow>Join our team</Eyebrow>
          <h2 className="text-2xl font-semibold text-brand-700">
            We could use your help
          </h2>
          <p>
            Here at Ferndale, we are always looking for experienced carers who
            want to make a difference. Working in care is one of the most
            rewarding careers there is.
          </p>
          {jobs.length > 0 ? (
            <p>
              We currently have {jobs.length}{" "}
              {jobs.length === 1 ? "vacancy" : "vacancies"} open, listed below.
              If one looks right for you, apply using the form further down the
              page, or send us your CV and a short covering letter.
            </p>
          ) : (
            <p>
              We don’t have any open vacancies right now, but we’re always keen
              to hear from exceptional people. If you’re looking for a new role
              as a carer with a company that offers great benefits, please send
              your CV and a short covering letter and a member of our team will
              be in touch.
            </p>
          )}
          <div className="pt-2">
            <ButtonLink href="#apply">Apply now</ButtonLink>
          </div>
          <figure className="mt-8 rounded-2xl bg-brand-50 p-7">
            <blockquote className="font-serif text-lg leading-relaxed text-brand-700">
              “{residentReview.quote}”
            </blockquote>
            <figcaption className="mt-3 text-sm text-muted">
              {residentReview.attribution}, {residentReview.source}
            </figcaption>
          </figure>
        </Container>
      </Section>

      {/* Current vacancies (managed in the console) */}
      {jobs.length > 0 ? (
        <Section className="relative overflow-hidden bg-white">
          <Decor tone="warm" />
          <Container className="relative z-10">
            <div className="max-w-2xl">
              <Eyebrow>Current vacancies</Eyebrow>
              <h2 className="text-2xl font-semibold text-brand-700">
                Open roles at Ferndale
              </h2>
            </div>
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              {jobs.map((job) => {
                const meta = [job.type, job.hours, job.salary, job.location].filter(
                  Boolean,
                ) as string[];
                const closing = formatClosing(job.closingDate);
                return (
                  <article key={job.id} className={`${CARD} flex flex-col p-7`}>
                    <h3 className="text-xl font-semibold text-brand-700">
                      {job.title}
                    </h3>
                    {meta.length > 0 ? (
                      <ul className="mt-3 flex flex-wrap gap-2">
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
                    {job.summary ? (
                      <p className="mt-4 font-medium text-ink/90">{job.summary}</p>
                    ) : null}
                    <div className="mt-3 space-y-3 text-sm leading-relaxed text-ink/80">
                      {job.description
                        .split(/\n\s*\n/)
                        .map((para, i) => (
                          <p key={i} className="whitespace-pre-line">
                            {para}
                          </p>
                        ))}
                    </div>
                    <div className="mt-5 flex flex-wrap items-center gap-4 pt-1">
                      <ButtonLink href="#apply">Apply for this role</ButtonLink>
                      {closing ? (
                        <span className="text-xs text-muted">
                          Closing date: {closing}
                        </span>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          </Container>
        </Section>
      ) : null}

      {/* Why work at Ferndale */}
      <Section className="relative overflow-hidden bg-white">
        <Decor tone="cool" />
        <Container className="relative z-10">
          <div className="max-w-2xl">
            <Eyebrow>Why work at Ferndale</Eyebrow>
            <h2 className="text-2xl font-semibold text-brand-700">
              A rewarding place to build a career in care
            </h2>
            <p className="mt-3 leading-relaxed text-ink/80">
              Working in care is one of the most rewarding careers there is, and
              we do everything we can to support our team to be the very best
              carers they can be.
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {careerBenefits.map((b, i) => (
              <div key={b.title} className={`${CARD} ${CARD_HOVER} p-7`}>
                <span
                  className={`inline-flex rounded-xl p-3 ring-1 ${chipAccent(i)}`}
                >
                  <Icon name={b.icon} />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-brand-700">
                  {b.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {b.body}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Job application form */}
      <Section id="apply" className="scroll-mt-24">
        <Container className="grid items-start gap-10 md:grid-cols-2">
          <div>
            <Eyebrow>Apply now</Eyebrow>
            <h2 className="text-2xl font-semibold text-brand-700">
              Submit your application
            </h2>
            <p className="mt-3 leading-relaxed text-ink/80">
              Tell us a little about yourself and the kind of role you’re looking
              for, and a member of our team will be in touch. We’d love to hear
              from kind, caring people who want to make a difference.
            </p>

            {/* What happens next — a bit of context on the process */}
            <ol className="mt-6 space-y-4">
              {applicationSteps.map((s, i) => (
                <li key={s.title} className="flex gap-3.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-medium text-brand-700">{s.title}</p>
                    <p className="text-sm leading-relaxed text-muted">
                      {s.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="relative mt-8 aspect-[4/3] overflow-hidden rounded-2xl border border-brand-100 shadow-[0_12px_34px_-16px_rgba(19,82,113,0.20)]">
              <SiteImage
                src={teamImage.src}
                fallbackAlt={teamImage.alt}
                fill
                sizes="(min-width: 768px) 512px, 100vw"
                className="object-cover"
              />
            </div>
          </div>
          <div className={`${CARD} p-7`}>
            <h3 className="text-lg font-semibold text-brand-700">Your details</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              It only takes a couple of minutes. Attach your CV if you have one to
              hand, and we’ll take it from there.
            </p>
            <div className="mt-5">
              <CareersForm />
            </div>
          </div>
        </Container>
      </Section>
    </main>
  );
}
