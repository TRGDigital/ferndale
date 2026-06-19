import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { CookieConsent } from "@/components/site/CookieConsent";
import { AccessibilityBar } from "@/components/site/AccessibilityBar";
import { AgentTools } from "@/components/site/AgentTools";
import { Container } from "@/components/site/ui";

// Public site chrome (header + footer). Admin lives outside this group.
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
          <AccessibilityBar />
        </Container>
      </div>

      <Header />
      <div id="main-content" className="flex-1">
        {children}
      </div>
      <Footer />
      <CookieConsent />
      <AgentTools />
    </>
  );
}
