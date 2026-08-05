import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { CookieConsent } from "@/components/site/CookieConsent";
import { AccessibilityBar } from "@/components/site/AccessibilityBar";
import { AgentTools } from "@/components/site/AgentTools";
import { AvailabilityBadgeServer } from "@/components/site/AvailabilityBadgeServer";
import { HideOnHome } from "@/components/site/HideOnHome";
import { Container } from "@/components/site/ui";
import { getSetting } from "@/lib/data/settings";
import { siteConfig } from "@/lib/site-config";

// The read-aloud welcome is managed in the TRG platform admin
// (trgdigital.co.uk/admin/websites). Read it from there, cached.
async function fetchPlatformIntro(): Promise<string> {
  try {
    const res = await fetch(
      `https://www.trgdigital.co.uk/api/accessibility-config?site=${siteConfig.platformSlug}`,
      { next: { revalidate: 300 } },
    );
    if (!res.ok) return "";
    const j = (await res.json()) as { intro?: string };
    return typeof j.intro === "string" ? j.intro.trim() : "";
  } catch {
    return "";
  }
}

// Public site chrome (header + footer). Admin lives outside this group.
export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Platform-managed welcome read aloud first by the accessibility bar, with a
  // local DB setting as a fallback when the platform can't be reached.
  const [platformIntro, localIntro] = await Promise.all([
    fetchPlatformIntro(),
    getSetting("listenIntro"),
  ]);
  const listenIntro = platformIntro || localIntro;

  return (
    <>
      {/* Keyboard / screen-reader skip link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>

      {/* Accessibility bar */}
      <div className="border-b border-brand-100 bg-brand-50/70">
        <Container className="py-1.5">
          <AccessibilityBar listenIntro={listenIntro} />
        </Container>
      </div>

      <Header />
      {/* Live room-availability badge on every page except the homepage (which
          carries it in its hero). SSR so the count is crawlable. */}
      <HideOnHome>
        <Container className="pt-6">
          <AvailabilityBadgeServer />
        </Container>
      </HideOnHome>
      <div id="main-content" className="flex-1">
        {children}
      </div>
      <Footer />
      <CookieConsent />
      <AgentTools />
    </>
  );
}
