import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";
const FROM = "Kem's Creation <onboarding@resend.dev>";
const DEFAULT_OWNER = "fagbenrogbengah@gmail.com";

const SERVICES: Record<string, string> = {
  bespoke: "Bespoke Tailoring & Measurement",
  ready_to_wear: "Ready-to-Wear Fitting",
  occasion: "Occasion & Wedding Consultation",
};

const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function fmtTime(t: string) {
  const [h = 0, m = 0] = t.split(":").map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")}${h < 12 ? "am" : "pm"}`;
}
function fmtDate(d: string) {
  return new Date(`${d}T00:00:00`).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function layout(title: string, rows: [string, string][], intro: string, outro = "") {
  const r = rows
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="padding:6px 12px 6px 0;color:#6b6460;vertical-align:top">${esc(k)}</td><td style="padding:6px 0;color:#1c1917">${esc(v)}</td></tr>`)
    .join("");
  return `<!doctype html><html><body style="margin:0;background:#ffffff;font-family:Arial,Helvetica,sans-serif">
<div style="max-width:560px;margin:0 auto;padding:28px 24px">
<p style="margin:0;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#7a2a3a">Kem's Creation</p>
<h1 style="margin:10px 0 14px;font-size:22px;color:#1c1917">${esc(title)}</h1>
<p style="margin:0 0 18px;font-size:14px;line-height:22px;color:#44403c">${intro}</p>
<table style="font-size:14px;border-collapse:collapse">${r}</table>
${outro ? `<p style="margin:20px 0 0;font-size:14px;line-height:22px;color:#44403c">${outro}</p>` : ""}
<p style="margin:28px 0 0;font-size:12px;color:#a8a29e">Kem's Creation · Badagry, Lagos State</p>
</div></body></html>`;
}

async function send(to: string, subject: string, html: string, key: string) {
  const lovable = process.env["LOVABLE_API_KEY"];
  const resend = process.env["RESEND_API_KEY"];
  if (!lovable || !resend) throw new Error("Email keys not configured");
  const res = await fetch(`${GATEWAY_URL}/emails`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${lovable}`,
      "X-Connection-Api-Key": resend,
      "Idempotency-Key": key,
    },
    body: JSON.stringify({ from: FROM, to: [to], subject, html }),
  });
  if (!res.ok) throw new Error(`Email failed [${res.status}]: ${await res.text()}`);
}

/** Sends owner alert + optional customer confirmation for a just-created booking. Never throws. */
export const sendBookingEmails = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ reference: z.string().trim().max(20), phone: z.string().trim().max(20) }).parse(d))
  .handler(async ({ data }) => {
    const result = { owner: false, customer: false };
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: id } = await supabaseAdmin.rpc("_match_booking" as never, { _ref: data.reference, _phone: data.phone } as never);
      if (!id) return result;
      const { data: a } = await supabaseAdmin
        .from("appointments")
        .select("reference, service_type, appointment_date, appointment_time, occasion, event_date, notes, created_at, customers(full_name, phone, email)")
        .eq("id", id as unknown as string)
        .single();
      if (!a) return result;
      // Only notify for freshly created bookings (prevents re-sending by replaying the call).
      if (Date.now() - new Date(a.created_at as string).getTime() > 15 * 60 * 1000) return result;
      const c = (a as unknown as { customers: { full_name: string; phone: string; email: string | null } }).customers;
      const service = SERVICES[a.service_type as string] ?? a.service_type;
      const when = `${fmtDate(a.appointment_date as string)} at ${fmtTime(a.appointment_time as string)}`;
      const rows: [string, string][] = [
        ["Reference", a.reference as string],
        ["Service", service as string],
        ["Date & time", when],
        ["Name", c.full_name],
        ["Phone", c.phone],
        ["Email", c.email ?? ""],
        ["Occasion", (a.occasion as string) ?? ""],
        ["Event date", a.event_date ? fmtDate(a.event_date as string) : ""],
        ["Notes", (a.notes as string) ?? ""],
      ];

      const owner = process.env["OWNER_NOTIFICATION_EMAIL"] || DEFAULT_OWNER;
      try {
        await send(owner, `New booking request ${a.reference} – ${c.full_name}`,
          layout("New booking request", rows, "A new appointment request is waiting for your review in the owner area."),
          `owner-${a.reference}`);
        result.owner = true;
      } catch (e) { console.error("[booking-email] owner alert failed", e); }

      if (c.email) {
        try {
          await send(c.email, `We received your booking request ${a.reference}`,
            layout(`Thank you, ${c.full_name.split(" ")[0]}`, rows.filter(([k]) => !["Phone", "Email"].includes(k)),
              "Your request has been received and is <strong>pending</strong> until Kem's Creation confirms it.",
              "We'll contact you on WhatsApp or by phone to confirm. The studio address and arrival details will be shared with your confirmation. Keep your booking reference handy if you need to make changes."),
            `customer-${a.reference}`);
          result.customer = true;
        } catch (e) { console.error("[booking-email] customer confirmation failed", e); }
      }
    } catch (e) {
      console.error("[booking-email] unexpected error", e);
    }
    return result;
  });
