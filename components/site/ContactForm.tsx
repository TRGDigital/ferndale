"use client";

import { useState } from "react";

type Status = "idle" | "submitting" | "ok" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());
    try {
      const res = await fetch("/api/public/leads/", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...payload, source: "/contact-us/" }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("ok");
      setMessage("Thank you. We’ll be in touch shortly.");
      e.currentTarget.reset();
    } catch {
      setStatus("error");
      setMessage("Sorry, something went wrong. Please call us on 01444 416 841.");
    }
  }

  if (status === "ok") {
    return (
      <p role="status" className="rounded-xl bg-brand-50 p-6 text-brand-700">
        {message}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          First name
          <input name="firstName" required className="rounded border border-brand-200 px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Last name
          <input name="lastName" className="rounded border border-brand-200 px-3 py-2" />
        </label>
      </div>
      <label className="flex flex-col gap-1 text-sm">
        Email
        <input type="email" name="email" required className="rounded border border-brand-200 px-3 py-2" />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Phone
        <input name="phone" className="rounded border border-brand-200 px-3 py-2" />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        I’m interested in
        <select name="intent" className="rounded border border-brand-200 px-3 py-2">
          <option value="BOOK_VISIT">Booking a visit</option>
          <option value="BROCHURE">Requesting a brochure / more info</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Message
        <textarea name="message" rows={4} className="rounded border border-brand-200 px-3 py-2" />
      </label>

      {status === "error" ? (
        <p role="alert" className="text-sm text-terracotta-600">
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex items-center justify-center rounded-full bg-brand-600 px-6 py-3 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {status === "submitting" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
