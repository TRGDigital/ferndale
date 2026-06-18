import type { Metadata } from "next";
import { LegalView, legalMetadata } from "@/components/site/LegalView";

export function generateMetadata(): Promise<Metadata> {
  return legalMetadata("/terms-and-conditions/", "terms-and-conditions");
}

export default function TermsPage() {
  return <LegalView slug="terms-and-conditions" />;
}
