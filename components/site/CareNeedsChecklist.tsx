"use client";

// A gentle, private self-check for families wondering whether a loved one might need more care.
// Client-side only, nothing is stored. Not a diagnosis — a prompt to talk to us or a GP.

import { useState } from "react";
import { EnquiryButton } from "@/components/site/EnquiryDialog";

const QUESTIONS = [
  "Are everyday tasks like washing, dressing or cooking becoming harder for them to manage?",
  "Have there been falls, or do you worry about their safety at home?",
  "Are they struggling to take their medication correctly or on time?",
  "Is keeping the home clean, warm and looked after becoming difficult?",
  "Are you concerned they aren't eating well or regularly?",
  "Do they seem lonely, low or increasingly isolated?",
  "Is memory loss or confusion starting to affect daily life?",
  "Is caring for them taking a real toll on you or the wider family?",
];

const OPTIONS = [
  { label: "Often", score: 2 },
  { label: "Sometimes", score: 1 },
  { label: "Rarely", score: 0 },
];

const PILL =
  "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors";

export function CareNeedsChecklist() {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const answered = QUESTIONS.every((_, i) => answers[i] !== undefined);
  const score = Object.values(answers).reduce((a, b) => a + b, 0);
  const band = score >= 9 ? "high" : score >= 4 ? "medium" : "low";

  const RESULT = {
    high: {
      title: "It may be time to consider more support",
      body: "You've noticed several signs that everyday life is becoming a struggle. That doesn't mean a care home is the only answer, but it does suggest it's worth talking things through properly. The right support, whether that's care at home, respite or a move to a home like Ferndale, can bring safety, company and peace of mind.",
    },
    medium: {
      title: "A little extra help could make a real difference",
      body: "You've spotted a few signs worth keeping an eye on. Many families find that a bit of support at this stage, from home care to the occasional respite stay, helps their loved one stay well and independent for longer. We're always happy to talk through the options with no pressure.",
    },
    low: {
      title: "Things seem manageable for now",
      body: "From your answers, your loved one seems to be coping well day to day, which is reassuring. It's still worth staying alert to changes over time. Whenever you'd like to understand the options, or just talk something through, we're here to help.",
    },
  }[band];

  if (submitted) {
    return (
      <div>
        <p className="text-sm font-semibold text-muted">
          You noted signs in{" "}
          <span className="text-brand-700">
            {Object.values(answers).filter((s) => s > 0).length} of {QUESTIONS.length}
          </span>{" "}
          areas.
        </p>
        <h3 className="mt-1 font-serif text-2xl text-brand-700">{RESULT.title}</h3>
        <p className="mt-3 leading-relaxed text-ink/80">{RESULT.body}</p>

        <div className="mt-6 rounded-xl bg-brand-50 p-5">
          <p className="text-sm font-semibold text-brand-700">What you can do next</p>
          <ul className="mt-2 space-y-1.5 text-sm text-ink/80">
            <li>• Talk it through with us, honestly and with no pressure.</li>
            <li>• Come and visit Ferndale to see what daily life could look like.</li>
            <li>• If health or memory is a worry, it's always worth speaking to a GP too.</li>
          </ul>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <EnquiryButton variant="solid">Talk to our team</EnquiryButton>
          <button
            type="button"
            onClick={() => {
              setAnswers({});
              setSubmitted(false);
            }}
            className="text-sm text-muted underline hover:text-ink"
          >
            Start again
          </button>
        </div>

        <p className="mt-6 border-t border-brand-100 pt-4 text-xs leading-relaxed text-muted">
          This checklist is a guide to help you reflect, not a medical or care assessment. It doesn't
          collect or store any personal details. Always speak to a GP about any health concern.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm leading-relaxed text-ink/80">
        Answer honestly for the person you&rsquo;re thinking about. There are no right or wrong
        answers, and nothing is saved.
      </p>
      <div className="mt-5 space-y-4">
        {QUESTIONS.map((q, i) => (
          <div key={i} className="rounded-2xl border border-brand-100 bg-white p-5">
            <p className="text-sm font-medium text-ink">
              <span className="text-muted">{i + 1}. </span>
              {q}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {OPTIONS.map((opt) => {
                const selected = answers[i] === opt.score;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setAnswers((a) => ({ ...a, [i]: opt.score }))}
                    className={`${PILL} ${
                      selected
                        ? "border-brand-600 bg-brand-600 text-white"
                        : "border-brand-200 bg-white text-ink hover:border-brand-400"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <button
          type="button"
          onClick={() => answered && setSubmitted(true)}
          disabled={!answered}
          className="inline-flex items-center justify-center rounded-full bg-brand-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
        >
          See what this suggests
        </button>
        {!answered ? (
          <p className="mt-2 text-xs text-muted">
            Please answer all {QUESTIONS.length} questions to see your result.
          </p>
        ) : null}
      </div>
    </div>
  );
}
