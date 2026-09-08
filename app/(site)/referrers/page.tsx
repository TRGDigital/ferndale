import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/page-meta";
import { Container, Section, Eyebrow } from "@/components/site/ui";
import { EnquiryProvider, EnquiryButton } from "@/components/site/EnquiryDialog";
import { AvailabilityBadgeServer } from "@/components/site/AvailabilityBadgeServer";
import { ContactForm } from "@/components/site/ContactForm";
import { LocationMap } from "@/components/site/LocationMap";
import { Icon } from "@/components/site/Icon";
import { chipAccent, Decor } from "@/components/site/decor";
import { siteConfig } from "@/lib/site-config";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, faqPageSchema, type Faq } from "@/lib/schema";
import { getSitePage } from "@/lib/data/site-pages";
import { getFeaturedReviews } from "@/lib/data/reviews";
import { getTeam } from "@/lib/data/team";

// A page for hospital discharge teams, social workers, care navigators and GPs.
//
// Written for someone with a list of placements to make and very little time. The
// order answers their questions in the order they ask them: can you take this
// person, have you got a bed, how fast can you assess, who do I ring. Everything
// softer sits below that.
//
// Modelled on what NHS referral pages actually lead with. Locala's care home
// support team page opens with criteria, a triage time, opening hours and, most
// usefully, who they do NOT take, so nobody wastes a call. That last part is why
// the exclusions sit as high as they do here. Ferndale is registered for nursing,
// so the common wrong referral is the opposite of its sister home's: someone who
// needs residential care only, and would be better placed at Crossways.

const CARD =
  "rounded-2xl border border-brand-100 bg-white shadow-[0_12px_34px_-16px_rgba(19,82,113,0.20)]";
const CARD_HOVER =
  "transition duration-200 hover:-translate-y-1 hover:shadow-[0_22px_44px_-18px_rgba(19,82,113,0.30)]";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/referrers/", {
    title: "Information for Referrers",
    description:
      "Information for hospital discharge teams, social workers and GPs referring to Ferndale Nursing Home in Crawley, West Sussex. Referral criteria, nursing and dementia care, CHC and FNC funding, and direct contacts.",
  });
}

// Facts a discharge coordinator checks first, in the order they check them.
const AT_A_GLANCE = [
  { icon: "bed", label: "Beds", value: `${siteConfig.beds} rooms` },
  { icon: "heart", label: "Care provided", value: "Nursing, dementia and respite" },
  { icon: "users", label: "We care for", value: "Older people with nursing needs" },
  { icon: "pin", label: "Location", value: `${siteConfig.address.addressLocality}, ${siteConfig.address.addressRegion}` },
];

// What we can take, and what we cannot. The second list matters as much as the
// first: sending someone who needs nursing wastes an assessment visit and a bed
// day. Ferndale is a nursing home, and the honest answer for someone with no
// nursing need is to point at the sister residential home instead.
const CAN_TAKE = [
  "Older people with ongoing medical and nursing needs, cared for by registered nurses day and night",
  "Complex, long term and palliative needs, with close liaison with GPs and specialist services",
  "Specialist dementia and Alzheimer's care in a safe, calm and familiar setting",
  "Discharge to assess and short stay placements while longer term needs are worked out",
  "Placements funded privately, by the local authority, through NHS Continuing Healthcare, or with Funded Nursing Care",
];

const CANNOT_TAKE = [
  {
    text: "Someone who needs residential care only, with no nursing need",
    onward: `Our sister home, ${siteConfig.sisterHome.name} in ${siteConfig.sisterHome.locality}, is a residential home and may suit better`,
    href: siteConfig.sisterHome.url,
  },
  {
    text: "Care that needs a secure or detained setting under the Mental Health Act",
    onward: "Your local mental health placement team will be the right route",
  },
  {
    text: "Younger adults",
    onward: "Our registration covers older people",
  },
];

// The three ways to refer, in the order a busy person will use them.
const ROUTES = [
  {
    icon: "phone",
    title: "Call us",
    body: "The quickest route. Ask for the home manager and tell us you are calling about a discharge or placement.",
    value: siteConfig.telephone,
    href: `tel:${siteConfig.telephoneE164}`,
    cta: `Call ${siteConfig.telephone}`,
  },
  {
    icon: "clipboard",
    title: "Send a referral",
    body: "Use the form below with the basics and we will come back to you. Attach an assessment if you have one ready.",
    value: "Referral form",
    href: "#refer",
    cta: "Go to the form",
  },
  {
    icon: "mail",
    title: "Email us",
    body: "Send the referral and any supporting assessments straight to the home. Please do not send patient identifiable information by ordinary email.",
    value: siteConfig.email,
    href: `mailto:${siteConfig.email}?subject=Hospital%20discharge%20referral`,
    cta: "Email the home",
  },
];

// What happens after a referral lands. Discharge teams plan around this, so it is
// stated as a sequence rather than a promise of speed.
const WHAT_HAPPENS = [
  { step: "1", title: "We read the referral", body: "We check straight away whether we can meet the person's needs, and tell you honestly if we cannot." },
  { step: "2", title: "We assess", body: "The home manager, or a senior member of the team, carries out a pre-admission assessment. We can do this on the ward." },
  { step: "3", title: "We confirm the room and the fee", body: "You get a clear written answer on availability and cost, including any third party contribution." },
  { step: "4", title: "We agree a date", body: "We work to the ward's timetable, and we will say plainly if we need longer to prepare." },
];

// Care offered, with the anchors the quick-jump strip points at.
const CARE = [
  {
    id: "nursing",
    icon: "heart",
    name: "Nursing care",
    body:
      "Twenty four hour nursing care led by qualified registered nurses, for older people with ongoing medical and nursing needs. Registered nurses are on site day and night.",
    points: [
      "Care from registered nurses, day and night",
      "Support for complex, long term and palliative needs",
      "Help with medication, mobility and personal care",
      "Close liaison with GPs and specialist services",
    ],
    href: "/crawley/nursing-care/",
  },
  {
    id: "dementia",
    icon: "puzzle",
    name: "Dementia and Alzheimer's care",
    body:
      "Specialist dementia care in a safe, calm and easy to navigate setting, from a team experienced in supporting people whose needs change over time.",
    points: [
      "A safe, secure and easy to navigate environment",
      "Person centred care built around each resident",
      "Staff experienced in dementia and Alzheimer's care",
      "Routine, reassurance and meaningful daily activities",
    ],
    href: "/crawley/dementia-care/",
  },
  {
    id: "respite",
    icon: "bed",
    name: "Respite and short stays",
    body:
      "Short stays including recovery after a hospital admission and discharge to assess placements, with the same nursing cover as our permanent residents.",
    points: [
      "Recovery and reablement after a hospital stay",
      "Nursing cover from day one of the stay",
      "Planned breaks for someone caring at home",
    ],
    href: "/our-home/",
  },
];

// Funding routes we accept. The calculators already exist on the site, so link to
// them rather than restating the rules here.
const FUNDING = [
  {
    icon: "shield",
    title: "NHS Continuing Healthcare",
    body: "Where someone has a primary health need, NHS Continuing Healthcare can meet the full cost of a nursing placement. We are used to supporting CHC assessments and can talk a family through the decision support tool.",
    href: "/nhs-continuing-healthcare/",
    linkText: "NHS Continuing Healthcare",
  },
  {
    icon: "heart",
    title: "Funded Nursing Care",
    body: "Where a resident needs care from a registered nurse but does not qualify for full CHC, NHS Funded Nursing Care contributes towards the nursing element of the fee.",
    href: "/funded-nursing-care/",
    linkText: "Funded Nursing Care",
  },
  {
    icon: "calculator",
    title: "Local authority funded",
    body: "We work with West Sussex County Council and neighbouring authorities. Where the authority rate sits below our fee, a third party contribution may be needed and we will set that out in writing before admission.",
    href: "/local-council-funding/",
    linkText: "Local council funding",
  },
  {
    icon: "tools",
    title: "Self funded and deferred payments",
    body: "The exact fee is always confirmed after assessment, so a referral gets a real number rather than a range. A deferred payment agreement can bridge a placement that depends on a property sale.",
    href: "/deferred-payment-calculator/",
    linkText: "Deferred payment calculator",
  },
];

const REFERRER_FAQS: Faq[] = [
  {
    question: "Do you take discharge to assess placements?",
    answer:
      "Yes. We take short stay and discharge to assess placements while longer term needs are worked out, subject to a pre-admission assessment and a room being available.",
  },
  {
    question: "Do you have registered nurses on site?",
    answer:
      "Yes. Ferndale is a nursing home, with qualified registered nurses on site day and night, supporting complex, long term and palliative needs.",
  },
  {
    question: "Do you take residential only placements?",
    answer:
      `Where there is no nursing need, our sister home, ${siteConfig.sisterHome.name} in ${siteConfig.sisterHome.locality}, is a residential home and is often the better fit. Ring us either way and we will point you to the right one.`,
  },
  {
    question: "Can you assess on the ward?",
    answer:
      "Yes. The home manager or a senior member of the team can carry out a pre-admission assessment on the ward, and we would usually rather do that than rely on paperwork alone.",
  },
  {
    question: "Do you accept local authority funded placements?",
    answer:
      "Yes. Where the authority rate sits below our fee a third party contribution may be needed. We set that out in writing before admission so there is no surprise later.",
  },
  {
    question: "How quickly can someone move in?",
    answer:
      "It depends on the assessment and on the room. Once we have assessed and confirmed the fee we work to the ward's timetable, and we will tell you plainly if we need longer to prepare.",
  },
  {
    question: "What information should a referral include?",
    answer:
      "A current assessment of needs, any moving and handling or falls information, a medication list, and the funding route. If something is missing we will ask rather than delay.",
  },
  {
    question: "Do you take residents living with dementia?",
    answer:
      "Yes. We provide specialist dementia and Alzheimer's care in a safe, calm and easy to navigate setting, with nursing cover throughout.",
  },
  {
    question: "Do you accept NHS Continuing Healthcare and Funded Nursing Care?",
    answer:
      "Yes to both. We are used to supporting CHC assessments, and Funded Nursing Care contributes towards the nursing element of the fee where someone needs care from a registered nurse but does not qualify for full CHC.",
  },
  {
    question: "Who should I speak to about a placement?",
    answer:
      `Ask for the home manager, ${siteConfig.manager}. The office is open ${siteConfig.officeHours}, and outside those hours you can leave a message or email ${siteConfig.email}.`,
  },
];

function readFaqs(value: unknown): Faq[] {
  if (!Array.isArray(value)) return REFERRER_FAQS;
  const ok = value.filter(
    (f): f is Faq =>
      !!f &&
      typeof (f as Faq).question === "string" &&
      typeof (f as Faq).answer === "string",
  );
  return ok.length ? ok : REFERRER_FAQS;
}

// Marks a detail Len still has to confirm, so the preview is honest about what is
// real and what is standing in. Remove the flag once the value is confirmed.
function ToConfirm() {
  return (
    <span className="ml-2 inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 align-middle text-[11px] font-medium text-amber-800">
      To confirm
    </span>
  );
}

export default async function ReferrersPage() {
  const [page, reviews, team] = await Promise.all([
    getSitePage("/referrers/"),
    getFeaturedReviews(),
    getTeam(),
  ]);
  const faqs = readFaqs(page?.faqs);
  const pageUrl = `${siteConfig.url}/referrers/`;

  // The registered manager comes from the team list so it stays right when the
  // admin console changes it. The seed list puts the manager first.
  const manager = team[0];

  return (
    <EnquiryProvider>
      <main>
        <JsonLd
          data={[
            breadcrumbSchema([
              { name: "Home", path: "/" },
              { name: "Referrers", path: "/referrers/" },
            ]),
            faqPageSchema(faqs, pageUrl),
          ]}
        />

        {/* Hero. Phone number set large because for this reader it is the whole
            point of the page, and the live availability badge sits beside it so a
            discharge team can see there is a bed before they ring. */}
        <Section className="relative overflow-hidden bg-brand-50">
          <Decor tone="cool" />
          <Container className="relative">
            <div className="max-w-3xl">
              {/* Availability, shown even when full: a discharge coordinator is served by a
                  straight "currently full" as well as by a yes, and the line beside it is
                  true on any day, so the page never implies a bed it cannot offer. */}
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <AvailabilityBadgeServer showWhenFull />
                <span className="text-sm text-muted">
                  Rooms change daily. Call to check what is free today.
                </span>
              </div>
              <Eyebrow>For health and social care professionals</Eyebrow>
              <h1 className="text-4xl font-semibold leading-tight text-brand-700 sm:text-5xl">
                Information for referrers
              </h1>
              <p className="mt-5 text-lg leading-relaxed text-ink/80">
                For hospital discharge teams, social workers, care navigators and GPs.
                Everything you need to decide whether Ferndale is the right placement,
                without having to ring first. If it is easier to just ring, the number
                is below and it reaches the home, not a call centre.
              </p>

              <div className="mt-8 rounded-2xl border border-brand-200 bg-white p-6 shadow-[0_12px_34px_-16px_rgba(19,82,113,0.20)] sm:p-7">
                <p className="text-sm font-medium uppercase tracking-wide text-muted">
                  Speak to the home
                </p>
                <a
                  href={`tel:${siteConfig.telephoneE164}`}
                  className="mt-1 block text-4xl font-semibold tracking-tight text-brand-700 hover:text-brand-600 sm:text-5xl"
                >
                  {siteConfig.telephone}
                </a>
                <p className="mt-3 text-sm text-muted">
                  Office hours {siteConfig.officeHours}. Outside those hours leave a
                  message or email{" "}
                  <a className="underline hover:text-brand-700" href={`mailto:${siteConfig.email}`}>
                    {siteConfig.email}
                  </a>
                  .
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <EnquiryButton variant="solid">Make a referral</EnquiryButton>
                  <a
                    href="#refer"
                    className="inline-flex items-center justify-center rounded-full border border-brand-600 px-6 py-3 text-sm font-medium text-brand-700 hover:bg-brand-50"
                  >
                    Referral form
                  </a>
                </div>
              </div>

              <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {AT_A_GLANCE.map((f, i) => (
                  <div key={f.label} className="rounded-xl border border-brand-100 bg-white/80 p-4">
                    <span className={`inline-flex rounded-lg p-2 ring-1 ${chipAccent(i)}`}>
                      <Icon name={f.icon} />
                    </span>
                    <dt className="mt-3 text-xs font-medium uppercase tracking-wide text-muted">
                      {f.label}
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-brand-700">{f.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Container>
        </Section>

        {/* Criteria. High on the page on purpose: the fastest way to help a
            discharge team is to tell them early when the answer is no. */}
        <Section>
          <Container>
            <div className="max-w-2xl">
              <Eyebrow>Referral criteria</Eyebrow>
              <h2 className="text-3xl font-semibold text-brand-700">
                Who we can take, and who we cannot
              </h2>
              <p className="mt-4 leading-relaxed text-ink/80">
                We would rather say no quickly than tie up a bed day with an assessment
                that was never going to work. If someone falls outside this, ring us
                anyway and we will point you somewhere better.
              </p>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              <div className={`${CARD} p-7`}>
                <h3 className="text-lg font-semibold text-brand-700">We can usually help with</h3>
                <ul className="mt-4 space-y-3">
                  {CAN_TAKE.map((t) => (
                    <li key={t} className="flex gap-3 text-sm leading-relaxed text-ink/80">
                      <span className="mt-0.5 text-brand-600" aria-hidden="true">
                        <Icon name="shield" />
                      </span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={`${CARD} p-7`}>
                <h3 className="text-lg font-semibold text-brand-700">We are not the right home for</h3>
                <ul className="mt-4 space-y-4">
                  {CANNOT_TAKE.map((t) => (
                    <li key={t.text} className="text-sm leading-relaxed">
                      <p className="font-medium text-ink">{t.text}</p>
                      <p className="mt-1 text-muted">
                        {t.onward}
                        {t.href ? (
                          <>
                            {". "}
                            <a
                              className="text-brand-700 underline hover:text-brand-600"
                              href={t.href}
                              target="_blank"
                              rel="noopener"
                            >
                              Visit {siteConfig.sisterHome.name}
                            </a>
                          </>
                        ) : (
                          "."
                        )}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Container>
        </Section>

        {/* Approach to care */}
        <Section className="bg-white">
          <Container>
            <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-start">
              <div>
                <Eyebrow>Our approach to care</Eyebrow>
                <h2 className="text-3xl font-semibold text-brand-700">
                  Nursing care from a team who stay
                </h2>
                <div className="mt-5 space-y-4 leading-relaxed text-ink/80">
                  <p>
                    Ferndale is a {siteConfig.beds} bed nursing home in{" "}
                    {siteConfig.address.addressLocality}, with registered nurses on site
                    day and night. The team know every resident by name, their history
                    and what a good day looks like for them, which is what makes a move
                    from hospital settle quickly rather than slowly.
                  </p>
                  <p>
                    Every referral starts with a proper assessment, on the ward where
                    that helps. We would rather turn a placement down at that point than
                    accept someone whose needs we cannot meet and move them again a few
                    weeks later. That is worse for the person and worse for you.
                  </p>
                  <p>
                    Once someone arrives, the first days are planned around them: the
                    routine they are used to, the food they like, the people they want
                    to see. Families are welcome without appointment.
                  </p>
                </div>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link
                    href="/about-us/"
                    className="inline-flex items-center justify-center rounded-full border border-brand-600 px-6 py-3 text-sm font-medium text-brand-700 hover:bg-brand-50"
                  >
                    About the home
                  </Link>
                  <Link
                    href="/care-team/"
                    className="inline-flex items-center justify-center rounded-full border border-brand-600 px-6 py-3 text-sm font-medium text-brand-700 hover:bg-brand-50"
                  >
                    Meet the care team
                  </Link>
                </div>
              </div>

              <div className={`${CARD} p-7`}>
                <h3 className="text-lg font-semibold text-brand-700">
                  What happens after you refer
                </h3>
                <ol className="mt-5 space-y-5">
                  {WHAT_HAPPENS.map((s) => (
                    <li key={s.step} className="flex gap-4">
                      <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
                        {s.step}
                      </span>
                      <span>
                        <span className="block font-medium text-ink">{s.title}</span>
                        <span className="mt-1 block text-sm leading-relaxed text-muted">
                          {s.body}
                        </span>
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </Container>
        </Section>

        {/* Make a referral: three routes, then the form itself. */}
        <Section id="refer" className="scroll-mt-24 bg-brand-50">
          <Container>
            <div className="max-w-2xl">
              <Eyebrow>Make a referral</Eyebrow>
              <h2 className="text-3xl font-semibold text-brand-700">
                Three ways to refer
              </h2>
              <p className="mt-4 leading-relaxed text-ink/80">
                Use whichever is quickest for you. All three reach the same people at
                the home.
              </p>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {ROUTES.map((r, i) => (
                <div key={r.title} className={`${CARD} ${CARD_HOVER} flex flex-col p-7`}>
                  <span className={`inline-flex w-fit rounded-xl p-3 ring-1 ${chipAccent(i)}`}>
                    <Icon name={r.icon} />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-brand-700">{r.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{r.body}</p>
                  <a
                    href={r.href}
                    className="mt-5 inline-flex items-center justify-center rounded-full bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
                  >
                    {r.cta}
                  </a>
                </div>
              ))}
            </div>

            <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-start">
              <div className={`${CARD} p-7`}>
                <h3 className="text-lg font-semibold text-brand-700">
                  Before you send a referral
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  It helps if you can include a current assessment of needs, any moving
                  and handling or falls information, a medication list, and the funding
                  route. If something is missing we will ask rather than hold things up.
                </p>
                <p className="mt-4 text-sm leading-relaxed text-muted">
                  Please do not send patient identifiable information by ordinary email.
                  Ring us and we will agree a secure route.
                </p>
                <dl className="mt-6 space-y-3 border-t border-brand-100 pt-5 text-sm">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 text-brand-600" aria-hidden="true">
                      <Icon name="clock" />
                    </span>
                    <span>
                      <dt className="font-medium text-ink">Office hours</dt>
                      <dd className="text-muted">{siteConfig.officeHours}</dd>
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 text-brand-600" aria-hidden="true">
                      <Icon name="clipboard" />
                    </span>
                    <span>
                      <dt className="font-medium text-ink">
                        Response time
                        <ToConfirm />
                      </dt>
                      <dd className="text-muted">
                        We aim to respond to every referral within one working day.
                      </dd>
                    </span>
                  </div>
                </dl>
              </div>

              <div className={`${CARD} p-7`}>
                <h3 className="text-lg font-semibold text-brand-700">Referral form</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  Send us the basics and we will come straight back to you. Please leave
                  personal details of the person being referred out of this form and we
                  will take those on the phone.
                </p>
                <div className="mt-5">
                  <ContactForm source="/referrers/" />
                </div>
              </div>
            </div>
          </Container>
        </Section>

        {/* Care offered, with quick jump links. */}
        <Section>
          <Container>
            <div className="max-w-2xl">
              <Eyebrow>The care we offer</Eyebrow>
              <h2 className="text-3xl font-semibold text-brand-700">
                What we are registered to provide
              </h2>
              <p className="mt-4 leading-relaxed text-ink/80">
                Jump straight to what you need.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {CARE.map((c) => (
                  <a
                    key={c.id}
                    href={`#${c.id}`}
                    className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-4 py-2 text-sm font-medium text-brand-700 hover:border-brand-600 hover:bg-brand-50"
                  >
                    <Icon name={c.icon} className="h-4 w-4" />
                    {c.name}
                  </a>
                ))}
              </div>
            </div>

            <div className="mt-10 space-y-6">
              {CARE.map((c, i) => (
                <div key={c.id} id={c.id} className={`${CARD} scroll-mt-24 p-7 sm:p-8`}>
                  <div className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-start">
                    <span className={`inline-flex w-fit rounded-xl p-3 ring-1 ${chipAccent(i)}`}>
                      <Icon name={c.icon} />
                    </span>
                    <div>
                      <h3 className="text-xl font-semibold text-brand-700">{c.name}</h3>
                      <p className="mt-2 leading-relaxed text-ink/80">{c.body}</p>
                      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                        {c.points.map((p) => (
                          <li key={p} className="flex gap-2 text-sm text-muted">
                            <span className="text-brand-600" aria-hidden="true">
                              <Icon name="heart" className="h-4 w-4" />
                            </span>
                            {p}
                          </li>
                        ))}
                      </ul>
                      <Link
                        href={c.href}
                        className="mt-5 inline-flex text-sm font-medium text-brand-700 underline hover:text-brand-600"
                      >
                        Read more
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </Section>

        {/* Funding */}
        <Section className="bg-white">
          <Container>
            <div className="max-w-2xl">
              <Eyebrow>Funding</Eyebrow>
              <h2 className="text-3xl font-semibold text-brand-700">
                Funding routes we accept
              </h2>
              <p className="mt-4 leading-relaxed text-ink/80">
                We take privately funded and local authority funded placements. The exact
                fee is always confirmed in writing after assessment, so a referral gets a
                real number rather than a range.
              </p>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {FUNDING.map((f, i) => (
                <div key={f.title} className={`${CARD} ${CARD_HOVER} p-7`}>
                  <span className={`inline-flex rounded-xl p-3 ring-1 ${chipAccent(i)}`}>
                    <Icon name={f.icon} />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-brand-700">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{f.body}</p>
                  <Link
                    href={f.href}
                    className="mt-4 inline-flex text-sm font-medium text-brand-700 underline hover:text-brand-600"
                  >
                    {f.linkText}
                  </Link>
                </div>
              ))}
            </div>
          </Container>
        </Section>

        {/* Named contacts. A discharge coordinator wants a person, not a switchboard. */}
        <Section className="bg-brand-50">
          <Container>
            <div className="max-w-2xl">
              <Eyebrow>Who to speak to</Eyebrow>
              <h2 className="text-3xl font-semibold text-brand-700">Your contacts here</h2>
              <p className="mt-4 leading-relaxed text-ink/80">
                Two people, both at the home. You will not be passed around.
              </p>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              <div className={`${CARD} p-7`}>
                <span className={`inline-flex rounded-xl p-3 ring-1 ${chipAccent(0)}`}>
                  <Icon name="users" />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-brand-700">
                  {manager?.name ?? siteConfig.manager}
                </h3>
                <p className="text-sm text-muted">{manager?.role ?? "Registered Manager"}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  Assessments, placement decisions and anything clinical. Ask for the home
                  manager when you ring.
                </p>
                <dl className="mt-5 space-y-2 text-sm">
                  <div>
                    <dt className="sr-only">Telephone</dt>
                    <dd>
                      <a className="font-medium text-brand-700 hover:underline" href={`tel:${siteConfig.telephoneE164}`}>
                        {siteConfig.telephone}
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="sr-only">Email</dt>
                    <dd>
                      <a className="text-brand-700 hover:underline" href={`mailto:${siteConfig.email}`}>
                        {siteConfig.email}
                      </a>
                    </dd>
                  </div>
                </dl>
              </div>

              <div className={`${CARD} p-7`}>
                <span className={`inline-flex rounded-xl p-3 ring-1 ${chipAccent(1)}`}>
                  <Icon name="clipboard" />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-brand-700">
                  Home administrator
                  <ToConfirm />
                </h3>
                <p className="text-sm text-muted">Admissions paperwork and funding</p>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  Contracts, funding confirmations, invoices and admission paperwork.
                </p>
                <dl className="mt-5 space-y-2 text-sm">
                  <div>
                    <dt className="sr-only">Telephone</dt>
                    <dd>
                      <a className="font-medium text-brand-700 hover:underline" href={`tel:${siteConfig.telephoneE164}`}>
                        {siteConfig.telephone}
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="sr-only">Email</dt>
                    <dd>
                      <a className="text-brand-700 hover:underline" href={`mailto:${siteConfig.email}`}>
                        {siteConfig.email}
                      </a>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </Container>
        </Section>

        {/* Reviews. Renders only when there are reviews to show, matching how the
            header hides the Reviews link on a site with none. */}
        {reviews.length > 0 && (
          <Section>
            <Container>
              <div className="max-w-2xl">
                <Eyebrow>What families say</Eyebrow>
                <h2 className="text-3xl font-semibold text-brand-700">
                  From the people who know us
                </h2>
              </div>
              <div className="mt-10 grid gap-6 lg:grid-cols-3">
                {reviews.slice(0, 3).map((r) => (
                  <figure key={r.id} className={`${CARD} flex flex-col p-7`}>
                    <div className="flex gap-1 text-brand-600" aria-label={`${r.rating} out of 5`}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} aria-hidden="true" className={i < r.rating ? "" : "opacity-25"}>
                          <Icon name="heart" className="h-4 w-4" />
                        </span>
                      ))}
                    </div>
                    {r.title ? (
                      <figcaption className="mt-3 font-medium text-brand-700">{r.title}</figcaption>
                    ) : null}
                    <blockquote className="mt-2 flex-1 text-sm leading-relaxed text-ink/80">
                      {r.body}
                    </blockquote>
                    <p className="mt-4 text-sm text-muted">
                      {r.author}
                      {r.relationship ? `, ${r.relationship}` : ""}
                    </p>
                  </figure>
                ))}
              </div>
              <div className="mt-8">
                <Link
                  href="/reviews/"
                  className="inline-flex items-center justify-center rounded-full border border-brand-600 px-6 py-3 text-sm font-medium text-brand-700 hover:bg-brand-50"
                >
                  Read all reviews
                </Link>
              </div>
            </Container>
          </Section>
        )}

        {/* FAQs. Native details/summary, no JavaScript, matching the rest of the site. */}
        <Section className="bg-white">
          <Container className="max-w-3xl">
            <div className="mb-8">
              <Eyebrow>Questions from referrers</Eyebrow>
              <h2 className="text-3xl font-semibold text-brand-700">
                The things we get asked most
              </h2>
            </div>
            <div className={`${CARD} divide-y divide-brand-100`}>
              {faqs.map((f) => (
                <details key={f.question} className="group p-6">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-medium text-brand-700">
                    {f.question}
                    <span
                      aria-hidden="true"
                      className="mt-1 flex-none text-xl leading-none text-brand-600 transition group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{f.answer}</p>
                </details>
              ))}
            </div>
          </Container>
        </Section>

        {/* Map, directly above the footer. */}
        <LocationMap />
      </main>
    </EnquiryProvider>
  );
}
