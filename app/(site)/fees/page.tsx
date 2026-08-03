import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/page-meta";
import { Container, Section, Eyebrow } from "@/components/site/ui";
import { EnquiryProvider, EnquiryButton } from "@/components/site/EnquiryDialog";
import { Icon } from "@/components/site/Icon";
import { chipAccent, Decor } from "@/components/site/decor";
import { siteConfig } from "@/lib/site-config";

const CARD =
  "rounded-2xl border border-brand-100 bg-white shadow-[0_12px_34px_-16px_rgba(19,82,113,0.20)]";
const CARD_HOVER =
  "transition duration-200 hover:-translate-y-1 hover:shadow-[0_22px_44px_-18px_rgba(19,82,113,0.30)]";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/fees/", {
    title: "Fees & Funding",
    description:
      "Understand the fees at Ferndale Nursing Home in Crawley, what your weekly fee includes, and the funding and benefits that can help pay for care. Get a personalised fee.",
  });
}

const INCLUDED = [
  {
    icon: "home",
    title: "Your own room",
    body: "A comfortable, furnished room, many with en-suite facilities, that you are welcome to make your own.",
  },
  {
    icon: "utensils",
    title: "All meals and drinks",
    body: "Three freshly cooked meals a day, plus snacks and drinks, with menus that cater for every dietary need.",
  },
  {
    icon: "heart",
    title: "All personal care",
    body: "Round-the-clock care from our long-standing, qualified team, tailored to each resident as their needs change.",
  },
  {
    icon: "palette",
    title: "Activities and outings",
    body: "A full programme of daily activities, entertainment and trips, so there is always something to enjoy.",
  },
  {
    icon: "leaf",
    title: "Laundry and housekeeping",
    body: "Personal laundry, room cleaning and all housekeeping are taken care of, along with heating, lighting and Wi-Fi.",
  },
  {
    icon: "users",
    title: "Our gardens and lounges",
    body: "Full use of our comfortable lounges, dining rooms and beautiful gardens, and a warm welcome for your visitors.",
  },
];

const FUNDING = [
  {
    title: "Funding calculator",
    body: "See who pays for care, you, the council or the NHS, and what your likely contribution could be.",
    href: "/funding-calculator/",
  },
  {
    title: "Funded Nursing Care",
    body: "Check whether the NHS could pay a weekly contribution toward your nursing care through FNC.",
    href: "/funded-nursing-care/",
  },
  {
    title: "NHS Continuing Healthcare",
    body: "See whether you might be eligible for NHS Continuing Healthcare, where the NHS funds the full cost of your care.",
    href: "/nhs-continuing-healthcare/",
  },
  {
    title: "Local council & funding",
    body: "Find your local council, the support it offers, and the savings thresholds that decide it.",
    href: "/local-council-funding/",
  },
];

export default function FeesPage() {
  return (
    <EnquiryProvider>
      <main>
        {/* Hero */}
        <Section className="bg-brand-50">
          <Container className="max-w-3xl">
            <Eyebrow>Paying for care</Eyebrow>
            <h1 className="text-4xl font-semibold leading-tight text-brand-700 sm:text-5xl">
              Fees &amp; funding
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-ink/80">
              We believe in being open and clear about the cost of care. Your weekly
              fee at Ferndale covers almost everything, and there is plenty of help
              available to pay for it. Here is how it works, and how we can help you
              plan.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <EnquiryButton variant="solid">Get a personalised fee</EnquiryButton>
              <a
                href={`tel:${siteConfig.telephoneE164}`}
                className="inline-flex items-center justify-center rounded-full border border-brand-600 px-6 py-3 text-sm font-medium text-brand-700 hover:bg-brand-50"
              >
                Call {siteConfig.telephone}
              </a>
            </div>
          </Container>
        </Section>

        {/* What's included */}
        <Section>
          <Container>
            <div className="max-w-2xl">
              <Eyebrow>What your fee includes</Eyebrow>
              <h2 className="text-3xl font-semibold text-brand-700">
                One weekly fee, almost everything covered
              </h2>
              <p className="mt-4 leading-relaxed text-ink/80">
                Unlike many homes, we keep things simple. Your weekly fee covers your
                room, your care and daily life at Ferndale, with no hidden extras.
              </p>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {INCLUDED.map((p, i) => (
                <div key={p.title} className={`${CARD} p-7`}>
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
              A few personal extras, such as hairdressing, chiropody, newspapers and
              private outings, are charged separately, and we are always upfront about
              these before you decide.
            </p>
          </Container>
        </Section>

        {/* How fees are set */}
        <Section className="bg-white">
          <Container className="max-w-3xl">
            <Eyebrow>How our fees are set</Eyebrow>
            <h2 className="text-2xl font-semibold text-brand-700">
              What will it cost?
            </h2>
            <div className="mt-4 space-y-4 leading-relaxed text-ink/80">
              <p>
                Every resident is different, so your weekly fee depends on the level
                of care you need and the room you choose. Residential and respite
                stays are priced separately, and respite is available by the week for
                planned breaks or recovery after a hospital stay.
              </p>
              <p>
                Rather than a one-size-fits-all price, we would much rather give you an
                accurate, personalised figure. Get in touch and we will talk you
                through the costs clearly, with no pressure and no obligation. You are
                also very welcome to visit and see the home for yourself first.
              </p>
            </div>
            <div className="mt-7">
              <EnquiryButton variant="solid">Ask about our fees</EnquiryButton>
            </div>
          </Container>
        </Section>

        {/* Help with funding */}
        <Section className="relative overflow-hidden">
          <Decor tone="warm" />
          <Container className="relative z-10">
            <div className="max-w-2xl">
              <Eyebrow>Help with funding</Eyebrow>
              <h2 className="text-3xl font-semibold text-brand-700">
                Paying for care, and the help available
              </h2>
              <p className="mt-4 leading-relaxed text-ink/80">
                Many families are entitled to more help than they realise, from
                council funding and benefits to using the value of a home. Our free
                tools give you a quick, private guide to your options.
              </p>
            </div>
            <ul className="mt-10 grid gap-4 sm:grid-cols-2">
              {FUNDING.map((t) => (
                <li key={t.href}>
                  <Link
                    href={t.href}
                    className={`${CARD} ${CARD_HOVER} group block h-full px-6 py-5`}
                  >
                    <span className="font-semibold text-brand-700 group-hover:text-brand-600">
                      {t.title} →
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-muted">
                      {t.body}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-8 max-w-3xl text-sm leading-relaxed text-muted">
              These tools give a general guide only and are not financial advice.
              Rules and thresholds change, so please confirm the details with your
              local authority or a qualified adviser, and talk to us any time.
            </p>
          </Container>
        </Section>

        {/* CTA */}
        <Section className="bg-brand-600">
          <Container className="text-center">
            <h2 className="text-3xl font-semibold text-white">
              Let&rsquo;s talk about the cost of care
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-brand-50">
              Get a clear, personalised fee for Ferndale, and honest guidance on how
              to pay for care. No pressure, just help.
            </p>
            <div className="mt-7 flex justify-center">
              <EnquiryButton variant="light">Get in touch</EnquiryButton>
            </div>
          </Container>
        </Section>
      </main>
    </EnquiryProvider>
  );
}
