import type { Metadata } from "next";
import { LegalView, legalMetadata } from "@/components/site/LegalView";

export function generateMetadata(): Promise<Metadata> {
  return legalMetadata("/cookie-policy/", "cookie-policy");
}

export default function CookiePolicyPage() {
  return <LegalView slug="cookie-policy" />;
}
