// Direct lead-notification email via the SendGrid v3 API (no dependency, uses
// fetch). Sent to LEAD_NOTIFY_EMAILS (falls back to ADMIN_EMAILS). Requires
// SENDGRID_API_KEY and a verified sender in SENDGRID_FROM. Returns a result so
// callers can surface success/failure instead of failing silently.

type LeadLike = {
  name: string;
  email?: string | null;
  phone?: string | null;
  message?: string | null;
  intent?: string | null;
  source?: string | null;
  createdAt?: Date | string | null;
  meta?: unknown;
};

export type LeadEmailResult = { ok: boolean; reason?: string };

const esc = (s: string) => s.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]!));

export async function sendLeadNotification(lead: LeadLike): Promise<LeadEmailResult> {
  const key = process.env.SENDGRID_API_KEY;
  const from = process.env.SENDGRID_FROM;
  const toList = (process.env.LEAD_NOTIFY_EMAILS ?? process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!key) return { ok: false, reason: "nokey" };
  if (!from) return { ok: false, reason: "nofrom" };
  if (toList.length === 0) return { ok: false, reason: "noto" };

  const site = process.env.SITE_NAME ?? "the website";
  const meta = (lead.meta ?? {}) as { position?: string | null };
  const lines = [
    `Name: ${lead.name}`,
    lead.email ? `Email: ${lead.email}` : null,
    lead.phone ? `Phone: ${lead.phone}` : null,
    lead.intent ? `Type: ${lead.intent}` : null,
    meta.position ? `Position: ${meta.position}` : null,
    lead.source ? `Source: ${lead.source}` : null,
    lead.message ? `\nMessage:\n${lead.message}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const subject = `New enquiry — ${lead.name}${lead.intent ? ` (${lead.intent})` : ""} · ${site}`;
  const text = `New enquiry from ${site}\n\n${lines}\n`;
  const html = `<h2 style="margin:0 0 12px">New enquiry · ${esc(site)}</h2><pre style="font:14px/1.6 -apple-system,Segoe UI,sans-serif;white-space:pre-wrap;margin:0">${esc(lines)}</pre>`;

  try {
    const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({
        personalizations: [{ to: toList.map((email) => ({ email })) }],
        from: { email: from, name: site },
        ...(lead.email ? { reply_to: { email: lead.email, name: lead.name } } : {}),
        subject,
        content: [
          { type: "text/plain", value: text },
          { type: "text/html", value: html },
        ],
      }),
    });
    return res.ok ? { ok: true } : { ok: false, reason: `sg${res.status}` };
  } catch {
    return { ok: false, reason: "network" };
  }
}
