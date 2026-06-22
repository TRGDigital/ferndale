// Registry of the interactive tools on the site. Add an entry here and it
// appears automatically on the /tools/ page and the home-page tool strip.
// `icon` is a key from Icon.tsx; `tool` is the TRG tools.js data-tool value.

export type SiteTool = {
  name: string;
  href: string;
  description: string;
  icon: string;
  tool: string;
};

export const tools: SiteTool[] = [
  {
    name: "Care funding calculator",
    href: "/funding-calculator/",
    description:
      "Get a quick guide to the cost of nursing care and the financial support you may be entitled to, then see how funding works in West Sussex.",
    icon: "calculator",
    tool: "funding",
  },
  {
    name: "Deferred payment calculator",
    href: "/deferred-payment-calculator/",
    description:
      "See how you could use the value of your home to help pay for care now and repay later, with a deferred payment agreement.",
    icon: "home",
    tool: "dpa",
  },
  {
    name: "Funded Nursing Care checker",
    href: "/funded-nursing-care/",
    description:
      "Check whether the NHS could pay a weekly contribution toward your nursing care through NHS-funded Nursing Care (FNC).",
    icon: "activity",
    tool: "fnc",
  },
  {
    name: "NHS Continuing Healthcare checker",
    href: "/nhs-continuing-healthcare/",
    description:
      "See whether you might be eligible for NHS Continuing Healthcare (CHC), where the NHS funds the full cost of your care.",
    icon: "shield",
    tool: "chc-checker",
  },
  {
    name: "CHC Decision Support Tool guide",
    href: "/chc-decision-support-tool/",
    description:
      "Understand the Decision Support Tool the NHS uses to assess Continuing Healthcare, and what each care domain means.",
    icon: "puzzle",
    tool: "chc-dst",
  },
  {
    name: "Local council & funding",
    href: "/local-council-funding/",
    description:
      "Find your local council and the adult social care funding it offers, and see how funding works for Ferndale in West Sussex.",
    icon: "pin",
    tool: "la-lookup",
  },
];
