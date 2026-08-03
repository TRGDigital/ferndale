"use client";

// Request a visit with a preferred date and time. Posts to the site's lead endpoint
// (/api/public/leads) with intent BOOK_VISIT and the preferences folded into the message.

import { useState } from "react";

type Status = "idle" | "submitting" | "ok" | "error";

const input =
  "w-full rounded-lg border border-brand-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20";

export function BookVisit() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError("");
    const fd = new FormData(e.currentTarget);
    const details = [
      fd.get("date") ? `Preferred date: ${fd.get("date")}` : "",
      fd.get("time") ? `Preferred time: ${fd.get("time")}` : "",
      fd.get("visitors") ? `Visiting: ${fd.get("visitors")}` : "",
      fd.get("message") ? `\n${fd.get("message")}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    try {
      const res = await fetch("/api/public/leads/", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          firstName: String(fd.get("firstName") ?? ""),
          lastName: String(fd.get("lastName") ?? ""),
          email: String(fd.get("email") ?? ""),
          phone: String(fd.get("phone") ?? ""),
          intent: "BOOK_VISIT",
          message: details || "Visit request",
          source: "book-a-visit",
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("ok");
    } catch {
      setStatus("error");
      setError("Sorry, something went wrong. Please call us on 01293 520368.");
    }
  }

  if (status === "ok") {
    return (
      <div className="rounded-xl bg-brand-50 p-6 text-center">
        <p className="font-serif text-2xl text-brand-700">Thank you</p>
        <p className="mt-2 leading-relaxed text-ink/80">
          We&rsquo;ve got your visit request and will be in touch shortly to confirm a time that
          suits you. You&rsquo;re also welcome to call us any time on 01293 520368.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-ink">First name</span>
          <input name="firstName" required className={input} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-ink">Last name</span>
          <input name="lastName" className={input} />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-ink">Email</span>
          <input type="email" name="email" required className={input} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-ink">Phone</span>
          <input name="phone" className={input} />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-ink">Preferred date</span>
          <input type="date" name="date" className={input} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-ink">Preferred time</span>
          <select name="time" defaultValue="" className={input}>
            <option value="">No preference</option>
            <option value="Morning">Morning</option>
            <option value="Afternoon">Afternoon</option>
            <option value="Either">Either</option>
          </select>
        </label>
      </div>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-ink">Who&rsquo;s visiting? (optional)</span>
        <input name="visitors" placeholder="e.g. me and my mum" className={input} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-ink">Anything you&rsquo;d like us to know? (optional)</span>
        <textarea name="message" rows={3} className={input} />
      </label>

      {status === "error" ? (
        <p role="alert" className="text-sm text-terracotta-600">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex items-center justify-center rounded-full bg-brand-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
      >
        {status === "submitting" ? "Sending…" : "Request my visit"}
      </button>
      <p className="text-center text-xs text-muted">
        We&rsquo;ll confirm your visit by phone or email. No obligation.
      </p>
    </form>
  );
}
