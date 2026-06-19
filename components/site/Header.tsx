import Link from "next/link";
import Image from "next/image";
import { SHOW_IMAGE_PLACEHOLDERS, isPlaceholderImage } from "@/lib/flags";

const LOGO_SRC = "/images/crossways-logo.png";
const LOGO_MISSING = SHOW_IMAGE_PLACEHOLDERS || isPlaceholderImage(LOGO_SRC);
import { primaryNav } from "@/lib/nav";
import { siteConfig } from "@/lib/site-config";
import { Container, ButtonLink } from "@/components/site/ui";
import { Icon } from "@/components/site/Icon";

// Server component. Mobile menu uses native <details> so it works without JS
// and stays accessible (no focus-trap to manage).
export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-brand-100 bg-cream/90 backdrop-blur">
      <Container className="flex items-center justify-between py-4">
        <Link href="/" aria-label="Ferndale Nursing Home, home">
          {LOGO_MISSING ? (
            <span className="flex items-center gap-2">
              <span className="font-serif text-lg font-semibold text-brand-700 sm:text-xl">
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
              width={175}
              height={40}
              priority
              className="h-9 w-auto sm:h-10"
            />
          )}
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
          {primaryNav.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className="text-sm text-ink/80 hover:text-brand-700"
            >
              {item.name}
            </Link>
          ))}
          <a
            href={`tel:${siteConfig.telephoneE164}`}
            className="flex items-center gap-1.5 text-sm font-semibold text-brand-700"
          >
            <Icon name="phone" className="h-4 w-4" />
            {siteConfig.telephone}
          </a>
          <ButtonLink href="/contact-us/">Book a visit</ButtonLink>
        </nav>

        {/* Mobile: prominent tap-to-call + menu */}
        <div className="flex items-center gap-2 md:hidden">
          <a
            href={`tel:${siteConfig.telephoneE164}`}
            aria-label={`Call us on ${siteConfig.telephone}`}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-brand-600 px-4 text-sm font-semibold text-white"
          >
            <Icon name="phone" className="h-4 w-4" />
            Call
          </a>
          <details className="relative">
            <summary
              className="flex min-h-[44px] cursor-pointer list-none items-center rounded-full border border-brand-200 px-4 text-sm font-medium"
              aria-label="Toggle menu"
            >
              Menu
            </summary>
            <div className="absolute right-0 z-50 mt-2 w-60 rounded-lg border border-brand-100 bg-cream p-2 shadow-lg">
              {primaryNav.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className="block rounded px-3 py-2.5 text-sm hover:bg-brand-50"
                >
                  {item.name}
                </Link>
              ))}
              <a
                href={`tel:${siteConfig.telephoneE164}`}
                className="mt-1 flex items-center gap-2 rounded bg-brand-50 px-3 py-2.5 text-sm font-semibold text-brand-700"
              >
                <Icon name="phone" className="h-4 w-4" />
                Call {siteConfig.telephone}
              </a>
            </div>
          </details>
        </div>
      </Container>
    </header>
  );
}
