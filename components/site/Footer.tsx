import Link from "next/link";
import Image from "next/image";
import { SHOW_IMAGE_PLACEHOLDERS, isPlaceholderImage } from "@/lib/flags";

const LOGO_SRC = "/images/crossways-logo.png";
const LOGO_MISSING = SHOW_IMAGE_PLACEHOLDERS || isPlaceholderImage(LOGO_SRC);
import { siteConfig } from "@/lib/site-config";
import { primaryNav } from "@/lib/nav";
import { Container } from "@/components/site/ui";
import { CqcBadge } from "@/components/site/CqcBadge";
import { CookieSettingsButton } from "@/components/site/CookieSettingsButton";

// Footer driven by siteConfig defaults (SitePage `footer` overrides can be
// layered in later). The live CQC badge lands here in Step 10 — placeholder now.
export function Footer() {
  const { address } = siteConfig;
  return (
    <footer className="mt-auto border-t border-brand-100 bg-sand/60">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          {LOGO_MISSING ? (
            <span className="inline-flex items-center gap-2">
              <span className="font-serif text-lg font-semibold text-brand-700">
                Ferndale Nursing Home
              </span>
              <span className="rounded border border-dashed border-brand-300 px-1.5 py-0.5 text-[0.55rem] uppercase tracking-wide text-muted">
                logo to add
              </span>
            </span>
          ) : (
            <Image
              src={LOGO_SRC}
              alt="Ferndale Nursing Home"
              width={200}
              height={46}
              className="h-11 w-auto"
            />
          )}
          <address className="mt-3 text-sm not-italic leading-relaxed text-muted">
            {address.streetAddress}
            <br />
            {address.addressLocality}, {address.addressRegion}
            <br />
            {address.postalCode}
          </address>
          <p className="mt-3 text-sm text-muted">
            <a href={`tel:${siteConfig.telephoneE164}`} className="hover:text-brand-700">
              {siteConfig.telephone}
            </a>
            <br />
            <a href={`mailto:${siteConfig.email}`} className="hover:text-brand-700">
              {siteConfig.email}
            </a>
          </p>
        </div>

        <nav aria-label="Footer" className="text-sm">
          <p className="mb-3 font-medium">Explore</p>
          <ul className="space-y-2 text-muted">
            {primaryNav.map((item) => (
              <li key={item.path}>
                <Link href={item.path} className="hover:text-brand-700">
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="text-sm">
          <p className="mb-3 font-medium">Accreditations</p>
          <ul className="space-y-2 text-muted">
            {siteConfig.accreditations.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
          {/* Display-only CQC rating (never in JSON-LD — hard rule #4). */}
          <CqcBadge />
        </div>

        <div className="text-sm">
          <p className="mb-3 font-medium">Our group</p>
          <p className="text-muted">
            Sister home:{" "}
            <a
              href={siteConfig.sisterHome.url}
              className="hover:text-brand-700"
              rel="noopener"
            >
              {siteConfig.sisterHome.name}
            </a>
            , {siteConfig.sisterHome.locality}
          </p>
        </div>
      </Container>

      <div className="border-t border-brand-100">
        <Container className="py-5 text-xs text-muted">
          <div className="flex flex-col justify-between gap-2 sm:flex-row">
            <p>
              © {siteConfig.legalName}. Registered care home in {address.addressLocality}.
            </p>
            <p className="flex gap-4">
              <Link href="/privacy-policy/" className="hover:text-brand-700">
                Privacy
              </Link>
              <Link href="/cookie-policy/" className="hover:text-brand-700">
                Cookies
              </Link>
              <Link href="/terms-and-conditions/" className="hover:text-brand-700">
                Terms
              </Link>
              <CookieSettingsButton className="hover:text-brand-700" />
            </p>
          </div>
          <p className="mt-4 flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 border-t border-brand-100 pt-4 text-center">
            This site was built by
            <a
              href="https://trgdigital.co.uk"
              target="_blank"
              rel="noopener"
              aria-label="TRG Digital"
              className="inline-flex items-center transition-opacity hover:opacity-70"
            >
              <Image
                src="https://trmwjilicdxgrzbwzchf.supabase.co/storage/v1/object/public/blog/site/brand/trg-digital.png"
                alt="TRG Digital"
                width={600}
                height={139}
                className="h-4 w-auto"
              />
            </a>
            a specialist care sector marketing agency
          </p>
        </Container>
      </div>
    </footer>
  );
}
