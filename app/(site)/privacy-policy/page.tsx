import type { Metadata } from "next";
import { LegalView, legalMetadata } from "@/components/site/LegalView";

export function generateMetadata(): Promise<Metadata> {
  return legalMetadata("/privacy-policy/", "privacy-policy");
}

export default function PrivacyPolicyPage() {
  return <LegalView slug="privacy-policy" />;
}
