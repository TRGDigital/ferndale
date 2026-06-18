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
import { WeeklyTimetable } from "@/components/site/WeeklyTimetable";
import { weeklySchedule, regularVisits } from "@/lib/content/pages";

const heroImage = {
  src: "https://trmwjilicdxgrzbwzchf.supabase.co/storage/v1/object/public/blog/site/activities/hero.jpg",
  alt: "Residents laughing together during a balloon exercise activity in the Ferndale lounge",
};

const coordinatorImage = {
  src: "https://trmwjilicdxgrzbwzchf.supabase.co/storage/v1/object/public/blog/site/activities/coordinator.jpg",
  alt: "Residents, families and staff enjoying the annual summer BBQ in the Ferndale garden",
};

const weeklyImage = {
  src: "https://trmwjilicdxgrzbwzchf.supabase.co/storage/v1/object/public/blog/site/activities/weekly.jpg",
  alt: "A smiling Ferndale resident in the lounge",
};

// A symmetric left+right fade so the banner bleeds into the page on both sides.
const SIDE_FADE =
  "linear-gradient(to right, transparent, #000 8%, #000 92%, transparent)";

// Elevated card with a soft, brand-tinted shadow for depth (matches the home page).
const CARD =
  "rounded-2xl border border-brand-100 bg-white shadow-[0_12px_34px_-16px_rgba(19,82,113,0.20)]";
const CARD_HOVER =
  "transition duration-200 hover:-translate-y-1 hover:shadow-[0_22px_44px_-18px_rgba(19,82,113,0.30)]";

// A flavour of what the daily programme includes, for a bit of depth.
const ACTIVITY_HIGHLIGHTS = [
  { icon: "activity", label: "Gentle armchair exercise set to music" },
  { icon: "palette", label: "Arts, crafts, knitting and natter" },
  { icon: "puzzle", label: "Board games, puzzles and quizzes" },
  { icon: "music", label: "Singing, musicians and entertainment" },
  { icon: "film", label: "Films and movie afternoons" },
  { icon: "leaf", label: "Days out to local parks and gardens" },
];

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/activities/", {
    title: "Activities",
    description:
      "A dedicated activities coordinator runs a varied daily programme at Ferndale, plus regular visits from singers, musicians, a personal trainer, Pets as Therapy, church services, days out and more.",
  });
}

export default function ActivitiesPage() {
  return (
    <main>
      <PageHeader
        eyebrow="Activities"
        title="Fun, interaction and exercise, every day"
        lead="Our dedicated activities coordinator ensures every resident can take part in enjoyable daily activities, within their own abilities."
        heroImage={heroImage}
      />

      {/* Dedicated coordinator + highlights + horizontal image */}
      <Section>
        <Container>
          <div className="max-w-3xl">
            <Eyebrow>Something to look forward to</Eyebrow>
            <h2 className="text-2xl font-semibold text-brand-700">
              A dedicated activities coordinator
            </h2>
            <p className="mt-4 leading-relaxed text-ink/80">
              We have a dedicated activities coordinator who makes sure all our
              residents are able, should they wish, to take part in a wide
              range of enjoyable daily activities, within their own abilities.
              Activities change daily and weekly to suit each resident, so
              there’s always something to look forward to.
            </p>
          </div>

          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ACTIVITY_HIGHLIGHTS.map((h, i) => (
              <li
                key={h.label}
                className={`${CARD} ${CARD_HOVER} flex items-center gap-3 p-4`}
              >
                <span
                  className={`inline-flex shrink-0 rounded-xl p-2.5 ring-1 ${chipAccent(i)}`}
                >
                  <Icon name={h.icon} className="h-5 w-5" />
                </span>
                <span className="text-sm font-medium text-ink/90">
                  {h.label}
                </span>
              </li>
            ))}
          </ul>
        </Container>

        {/* Full-width banner that bleeds into the page on both sides */}
        <div className="relative mt-12 h-[260px] w-full overflow-hidden sm:h-[340px] lg:h-[440px]">
          <SiteImage
            src={coordinatorImage.src}
            fallbackAlt={coordinatorImage.alt}
            fill
            sizes="100vw"
            className="object-cover"
            style={{ WebkitMaskImage: SIDE_FADE, maskImage: SIDE_FADE }}
          />
        </div>
      </Section>

      {/* Full weekly timetable — accordion, one day at a time */}
      <Section className="bg-white">
        <Container>
          <div className="max-w-2xl">
            <Eyebrow>A typical week</Eyebrow>
            <h2 className="text-2xl font-semibold text-brand-700">
              Our weekly activities
            </h2>
            <p className="mt-3 leading-relaxed text-ink/80">
              From early-morning tea to an evening drink, every day follows a
              gentle, familiar rhythm of meals, refreshments and activities.
              Choose a day to see the full schedule.
            </p>
          </div>
          <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1.2fr_1fr]">
            <WeeklyTimetable schedule={weeklySchedule} />
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-brand-100 shadow-[0_12px_34px_-16px_rgba(19,82,113,0.20)]">
              <SiteImage
                src={weeklyImage.src}
                fallbackAlt={weeklyImage.alt}
                fill
                sizes="(min-width: 1152px) 440px, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </Container>
      </Section>

      {/* Regular visits */}
      <Section className="relative overflow-hidden">
        <Decor tone="warm" />
        <Container className="relative z-10">
          <div className="max-w-2xl">
            <Eyebrow>Beyond the daily programme</Eyebrow>
            <h2 className="text-2xl font-semibold text-brand-700">
              We also have regular visits
            </h2>
            <p className="mt-3 leading-relaxed text-ink/80">
              Familiar faces from the local community visit throughout the
              month, bringing music, movement, faith, furry friends and trips
              out to look forward to.
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {regularVisits.map((v, i) => (
              <div key={v.title} className={`${CARD} ${CARD_HOVER} p-6`}>
                <span
                  className={`inline-flex rounded-xl p-3 ring-1 ${chipAccent(i)}`}
                >
                  <Icon name={v.icon} />
                </span>
                <h3 className="mt-4 font-semibold text-brand-700">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {v.body}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Tour CTA */}
      <Section className="bg-brand-50">
        <Container className="max-w-3xl text-center">
          <h2 className="text-3xl font-semibold text-brand-700">
            Would you like to arrange a tour?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-ink/80">
            We welcome potential residents and their families to come for a full
            guided tour, so you can see our home for yourself and meet the staff
            and residents.
          </p>
          <div className="mt-7 flex justify-center">
            <ButtonLink href="/contact-us/">Book a tour</ButtonLink>
          </div>
        </Container>
      </Section>
    </main>
  );
}
