"use client";

// A friendly "what will care cost?" estimator for Ferndale. Client-side only. Fees are a guide the
// family can adjust to their own quote; the means-test bands use the England 2024/25 thresholds.

import { useState } from "react";
import { EnquiryButton } from "@/components/site/EnquiryDialog";

const UPPER = 23250;
const LOWER = 14250;
const AA = { none: 0, lower: 72.65, higher: 108.55 };
const DEFAULT_FEE = { nursing: 1600, respite: 1650 };

const gbp = (n: number) =>
  `£${Math.round(n).toLocaleString("en-GB")}`;

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-ink">{label}</span>
      {hint ? <span className="mt-0.5 block text-xs text-muted">{hint}</span> : null}
      <span className="mt-1.5 block">{children}</span>
    </label>
  );
}

function Money({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <span className="relative block">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">£</span>
      <input
        inputMode="numeric"
        value={value ? value.toLocaleString("en-GB") : ""}
        onChange={(e) => onChange(Number(e.target.value.replace(/[^0-9]/g, "")) || 0)}
        placeholder="0"
        className="w-full rounded-lg border border-brand-200 py-2.5 pl-7 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
      />
    </span>
  );
}

const seg =
  "flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors";

export function CostEstimator() {
  const [careType, setCareType] = useState<"nursing" | "respite">("nursing");
  const [fee, setFee] = useState(DEFAULT_FEE.nursing);
  const [feeTouched, setFeeTouched] = useState(false);
  const [savings, setSavings] = useState(0);
  const [ownsHome, setOwnsHome] = useState(false);
  const [propertyValue, setPropertyValue] = useState(0);
  const [aa, setAa] = useState<keyof typeof AA>("none");

  const setType = (t: "nursing" | "respite") => {
    setCareType(t);
    if (!feeTouched) setFee(DEFAULT_FEE[t]);
  };

  const capital = savings + (ownsHome ? propertyValue : 0);
  const band =
    capital > UPPER ? "self" : capital < LOWER ? "council" : "partial";
  const aaWeekly = AA[aa];

  const BAND = {
    self: {
      tone: "info" as const,
      title: "Likely a self-funder",
      body: "With savings and assets above £23,250, you would usually pay your own fees in full. Attendance Allowance can still help, and a Deferred Payment could let you use your home's value without selling now.",
    },
    partial: {
      tone: "good" as const,
      title: "The council may contribute",
      body: "Between £14,250 and £23,250, the council helps towards fees on a sliding scale, and you contribute the rest from your income and savings. It's well worth a financial assessment.",
    },
    council: {
      tone: "good" as const,
      title: "The council would fund most of your care",
      body: "Below £14,250, your savings aren't counted towards fees. You'd contribute from your income (such as pensions), keeping a weekly Personal Expenses Allowance, and the council funds the rest.",
    },
  }[band];

  const netWeekly = band === "self" ? Math.max(0, fee - aaWeekly) : fee;

  return (
    <div>
      {/* Care type */}
      <div className="flex rounded-xl border border-brand-100 bg-brand-50 p-1">
        <button
          type="button"
          onClick={() => setType("nursing")}
          className={`${seg} ${careType === "nursing" ? "bg-brand-600 text-white" : "text-ink/70 hover:text-ink"}`}
        >
          Nursing
        </button>
        <button
          type="button"
          onClick={() => setType("respite")}
          className={`${seg} ${careType === "respite" ? "bg-brand-600 text-white" : "text-ink/70 hover:text-ink"}`}
        >
          Respite
        </button>
      </div>

      <div className="mt-5 space-y-4">
        <Field
          label="Weekly fee"
          hint="A typical guide figure. Enter the fee from your quote for an accurate estimate."
        >
          <Money
            value={fee}
            onChange={(n) => {
              setFee(n);
              setFeeTouched(true);
            }}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Savings & investments">
            <Money value={savings} onChange={setSavings} />
          </Field>
          <Field label="Attendance Allowance">
            <select
              value={aa}
              onChange={(e) => setAa(e.target.value as keyof typeof AA)}
              className="w-full rounded-lg border border-brand-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="none">Not claiming / unsure</option>
              <option value="lower">Lower rate (£72.65/wk)</option>
              <option value="higher">Higher rate (£108.55/wk)</option>
            </select>
          </Field>
        </div>

        <label className="flex items-center justify-between rounded-lg border border-brand-200 bg-white px-4 py-3 text-sm">
          <span className="font-medium text-ink">Do they own their own home?</span>
          <input
            type="checkbox"
            checked={ownsHome}
            onChange={(e) => setOwnsHome(e.target.checked)}
            className="h-5 w-5 accent-brand-600"
          />
        </label>
        {ownsHome ? (
          <Field
            label="Approximate property value"
            hint="Your home may be disregarded if a partner still lives there — we can explain."
          >
            <Money value={propertyValue} onChange={setPropertyValue} />
          </Field>
        ) : null}
      </div>

      {/* Result */}
      <div className="mt-7 rounded-2xl bg-brand-700 p-6 text-center text-white">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-100">
          {careType === "respite" ? "Respite care" : "Nursing care"} · estimated cost
        </p>
        <p className="mt-1 font-serif text-5xl font-bold leading-none">{gbp(fee)}<span className="text-base font-normal text-brand-100">/wk</span></p>
        <p className="mt-2 text-sm text-brand-50">
          {gbp(fee * 4.333)}/month · {gbp(fee * 52)}/year
        </p>
      </div>

      <div
        className={`mt-4 rounded-2xl border p-5 ${
          BAND.tone === "good"
            ? "border-green-300 bg-green-50"
            : "border-brand-200 bg-brand-50"
        }`}
      >
        <p className="text-sm font-semibold text-brand-700">{BAND.title}</p>
        <p className="mt-1.5 text-sm leading-relaxed text-ink/80">{BAND.body}</p>
        {band === "self" && aaWeekly > 0 ? (
          <p className="mt-2 text-sm font-medium text-brand-700">
            After Attendance Allowance, roughly {gbp(netWeekly)}/week.
          </p>
        ) : null}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <EnquiryButton variant="solid">Get a personalised fee</EnquiryButton>
        <a href="/funding-calculator/" className="text-sm font-medium text-brand-700 underline">
          Explore who pays →
        </a>
      </div>

      <p className="mt-5 border-t border-brand-100 pt-4 text-xs leading-relaxed text-muted">
        An estimate based on the figures you enter and the England 2024/25 capital thresholds
        (£23,250 / £14,250), not financial advice or a quote. Please confirm your fee with us and your
        funding with your local authority.
      </p>
    </div>
  );
}
