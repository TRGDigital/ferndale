import type { Metadata } from "next";
import Script from "next/script";
import {
  Geist,
  Geist_Mono,
  Fraunces,
  Atkinson_Hyperlegible,
} from "next/font/google";
import "./globals.css";
import { AltMapProvider } from "@/components/AltMapProvider";
import { JsonLd } from "@/components/JsonLd";
import { getImageAltMap } from "@/lib/data/image-alts";
import {
  organizationSchema,
  webSiteSchema,
  siteNavigationSchema,
} from "@/lib/schema";
import { siteConfig } from "@/lib/site-config";
import { primaryNav } from "@/lib/nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// Highly legible font for the optional "readable" accessibility mode.
const atkinson = Atkinson_Hyperlegible({
  variable: "--font-atkinson",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Resilient so credential-less builds don't fail; tag-revalidated at runtime.
  const altMap = await getImageAltMap().catch(() => ({}));

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} ${atkinson.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {/* Apply the saved text size before paint (no flash). */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var d=document.documentElement,ls=localStorage;var k=ls.getItem('cw_textsize')||'base',m={base:'100%',lg:'112.5%',xl:'125%'};d.style.fontSize=m[k]||'100%';d.dataset.textsize=k;if(ls.getItem('cw_contrast')==='1')d.classList.add('hc');if(ls.getItem('cw_font')==='1')d.classList.add('readable');}catch(e){}})();`,
          }}
        />
        {/* Global, @id-cross-referenced structured data (LocalBusiness <-> WebSite). */}
        <JsonLd
          data={[
            organizationSchema(),
            webSiteSchema(),
            siteNavigationSchema([...primaryNav]),
          ]}
        />
        <AltMapProvider map={altMap}>{children}</AltMapProvider>

        {/* Google Analytics (GA4) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-TZGMHX8WQD"
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-TZGMHX8WQD');`}
        </Script>

        {/* CareBeds overlay (TRG Digital). Loads after the page is interactive,
            equivalent to a deferred script just before </body>. */}
        <Script
          src="https://lead-generation-landing-pages.vercel.app/embed.js"
          data-site="ferndale"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
