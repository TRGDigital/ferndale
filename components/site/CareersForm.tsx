"use client";

// Job application form. Posts multipart/form-data to /api/public/careers with
// an optional CV file (stored privately); saved as a CAREERS lead.

import { useState } from "react";
import { siteConfig } from "@/lib/site-config";

type Status = "idle" | "submitting" | "ok" | "error";

const POSITIONS = [
  "Care Assistant",
  "Senior Care Assistant",
  "Chef / Kitchen Assistant",
  "Activities Coordinator",
  "Housekeeping",
  "Administrator",
  "Other",
];

const MAX_CV_BYTES = 4 * 1024 * 1024;

export function CareersForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    const cv = fd.get("cv");
    if (cv instanceof File && cv.size > MAX_CV_BYTES) {
      setStatus("error");
      setMessage("Your CV must be 4MB or smaller.");
      return;
    }

    setStatus("submitting");
    try {
      // Trailing slash avoids a 308 redirect that would corrupt the multipart body.
      const res = await fetch("/api/public/careers/", {
        method: "POST",
        body: fd, // multipart — let the browser set the boundary
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("ok");
      setMessage("Thank you for your application. We’ll be in touch.");
      form.reset();
    } catch {
      setStatus("error");
      setMessage(
        `Sorry, something went wrong. Please email your CV to ${siteConfig.email}.`,
      );
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
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-4"
      {...({
        "webmcp-tool": "submit_job_application",
        "webmcp-description":
          "Apply for a role or register interest in working here (name, email, phone, message and optional CV)",
      } as Record<string, string>)}
    >
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
        Position you’re interested in
        <select name="position" className="rounded border border-brand-200 px-3 py-2">
          {POSITIONS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Tell us about yourself
        <textarea name="message" rows={4} className="rounded border border-brand-200 px-3 py-2" />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Upload your CV{" "}
        <span className="text-xs text-muted">(PDF or Word, max 4MB, optional)</span>
        <input
          type="file"
          name="cv"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="rounded border border-brand-200 px-3 py-2 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-brand-50 file:px-3 file:py-1 file:text-brand-700"
        />
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
        {status === "submitting" ? "Sending…" : "Submit application"}
      </button>
    </form>
  );
}
