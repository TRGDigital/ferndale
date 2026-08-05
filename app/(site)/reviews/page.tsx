import type { Metadata } from "next";
import { AvailabilityBadgeServer } from "@/components/site/AvailabilityBadgeServer";
import { pageMetadata } from "@/lib/page-meta";
import { Container, Section, Eyebrow } from "@/components/site/ui";
import { EnquiryProvider, EnquiryButton } from "@/components/site/EnquiryDialog";
import { getReviews, getReviewStats } from "@/lib/data/reviews";
import { getSetting } from "@/lib/data/settings";

const CARD =
  "rounded-2xl border border-brand-100 bg-white shadow-[0_12px_34px_-16px_rgba(19,82,113,0.20)]";

const CAREHOME_DEFAULT =
  "https://www.carehome.co.uk/carehome.cfm/searchazref/10001070CROB";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/reviews/", {
    title: "Reviews",
    description:
      "Read what families say about Ferndale Nursing Home in Crawley, West Sussex, in their own words, and see our reviews on carehome.co.uk.",
  });
}

function Stars({ rating }: { rating: number }) {
  return (
    <span aria-label={`${rating} out of 5 stars`}>
      <span className="text-amber-400">{"★".repeat(rating)}</span>
      <span className="text-brand-100">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

function fmtDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

// Admin setting `review_sources`: one source per line, "Label | https://url" (label optional).
function parseSources(raw: string): { label: string; url: string }[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const idx = line.indexOf("|");
      const rawLabel = idx === -1 ? "" : line.slice(0, idx).trim();
      let url = (idx === -1 ? line : line.slice(idx + 1)).trim();
      if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
      let label = rawLabel;
      if (!label) {
        try {
          label = new URL(url).hostname.replace(/^www\./, "");
        } catch {
          label = url;
        }
      }
      return { label, url };
    })
    .filter((s) => s.url);
}

export default async function ReviewsPage() {
  const [reviews, stats, reviewsUrl, sourcesRaw] = await Promise.all([
    getReviews(),
    getReviewStats(),
    getSetting("reviews_url", CAREHOME_DEFAULT),
    getSetting("review_sources", ""),
  ]);
  const sources = parseSources(sourcesRaw);

  return (
    <EnquiryProvider>
      <main>
        <Section className="bg-brand-50">
          <Container className="max-w-3xl">
            <div className="mb-4">
              <AvailabilityBadgeServer />
            </div>
            <Eyebrow>Reviews</Eyebrow>
            <h1 className="text-4xl font-semibold leading-tight text-brand-700 sm:text-5xl">
              What families say
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-ink/80">
              Choosing a care home is a big, personal decision. We are proud of the kind words
              families share about life at Ferndale, here are some of them, in their own words.
            </p>
            {stats.count > 0 ? (
              <p className="mt-6 flex items-center gap-2 text-lg text-brand-700">
                <Stars rating={Math.round(stats.average)} />
                <span className="font-semibold">{stats.average.toFixed(1)} out of 5</span>
                <span className="text-ink/60">· {stats.count} review{stats.count > 1 ? "s" : ""}</span>
              </p>
            ) : null}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <EnquiryButton variant="solid">Arrange a visit</EnquiryButton>
              <a
                href={reviewsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-brand-600 px-6 py-3 text-sm font-medium text-brand-700 hover:bg-brand-50"
              >
                Read all our reviews on carehome.co.uk →
              </a>
            </div>
            {sources.length ? (
              <div className="mt-8 border-t border-brand-100 pt-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">
                  Where our reviews come from
                </p>
                <div className="mt-3 flex flex-wrap gap-2.5">
                  {sources.map((s) => (
                    <a
                      key={s.url}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-white px-4 py-2 text-sm font-medium text-brand-700 transition-colors hover:border-brand-400 hover:bg-brand-50"
                    >
                      {s.label}
                      <svg className="h-3 w-3 opacity-60" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                        <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                        <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </Container>
        </Section>

        {reviews.length ? (
          <Section>
            <Container>
              <ul className="flex flex-col gap-5">
                {reviews.map((r) => (
                  <li key={r.id}>
                    <figure className={`${CARD} grid gap-5 p-6 sm:grid-cols-[210px_1fr] sm:gap-7 sm:p-7`}>
                      <figcaption className="flex flex-col gap-2.5 sm:border-r sm:border-brand-100 sm:pr-6">
                        <span className="flex items-center gap-3">
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-50 font-serif text-lg font-semibold text-brand-700">
                            {r.author.slice(0, 1).toUpperCase()}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate font-medium text-brand-700">{r.author}</span>
                            {r.relationship ? (
                              <span className="block truncate text-sm text-muted">{r.relationship}</span>
                            ) : null}
                          </span>
                        </span>
                        <Stars rating={r.rating} />
                        {r.reviewDate ? (
                          <span className="text-xs text-muted">{fmtDate(r.reviewDate)}</span>
                        ) : null}
                      </figcaption>
                      <div className="min-w-0">
                        {r.title ? (
                          <p className="mb-2 font-serif text-xl text-brand-700">{r.title}</p>
                        ) : null}
                        <blockquote className="leading-relaxed text-ink/80">
                          &ldquo;{r.body}&rdquo;
                        </blockquote>
                      </div>
                    </figure>
                  </li>
                ))}
              </ul>
            </Container>
          </Section>
        ) : (
          <Section>
            <Container className="max-w-2xl text-center">
              <p className="leading-relaxed text-ink/80">
                You can read all of our latest reviews on our{" "}
                <a href={reviewsUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-brand-700 underline">
                  carehome.co.uk page
                </a>
                .
              </p>
            </Container>
          </Section>
        )}

        <Section className="bg-brand-600">
          <Container className="text-center">
            <h2 className="text-3xl font-semibold text-white">See for yourself</h2>
            <p className="mx-auto mt-3 max-w-xl text-brand-50">
              The warmest welcome is the one you feel in person. Arrange a visit and come and meet us.
            </p>
            <div className="mt-7 flex justify-center">
              <EnquiryButton variant="light">Arrange a visit</EnquiryButton>
            </div>
          </Container>
        </Section>
      </main>
    </EnquiryProvider>
  );
}
