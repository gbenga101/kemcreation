const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";
const FROM = "Kem's Creation <onboarding@resend.dev>";
const SERVICES: Record<string, string> = {
  bespoke: "Bespoke Tailoring & Measurement",
  ready_to_wear: "Ready-to-Wear Fitting",
  occasion: "Occasion & Wedding Consultation",
};
const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const fmtTime = (t: string) => {
  const [h = 0, m = 0] = t.split(":").map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")}${h < 12 ? "am" : "pm"}`;
};
const fmtDate = (d: string) =>
  new Date(`${d}T00:00:00`).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

export type ReminderResult = { checked: number; sent: number; noEmail: number; failed: number };

/** Reminds customers about confirmed/rescheduled visits tomorrow (Lagos time, ~24–48h ahead). Each appointment at most once. */
export async function runReminders(siteOrigin: string): Promise<ReminderResult> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Lagos" });
  const t = new Date(`${today}T00:00:00Z`); t.setUTCDate(t.getUTCDate() + 1);
  const tomorrow = t.toISOString().slice(0, 10);

  const { data, error } = await supabaseAdmin
    .from("appointments")
    .select("id, reference, service_type, appointment_date, appointment_time, customers(full_name, phone, email)")
    .in("status", ["confirmed", "rescheduled"])
    .eq("appointment_date", tomorrow)
    .is("reminder_sent_at" as never, null);
  if (error) throw error;

  const res: ReminderResult = { checked: data?.length ?? 0, sent: 0, noEmail: 0, failed: 0 };
  for (const a of (data ?? []) as unknown as { id: string; reference: string; service_type: string; appointment_date: string; appointment_time: string; customers: { full_name: string; phone: string; email: string | null } | null }[]) {
    try {
      const c = a.customers;
      if (c?.email) {
        const link = `${siteOrigin}/manage-booking?ref=${encodeURIComponent(a.reference)}&phone=${encodeURIComponent(c.phone)}`;
        const html = `<!doctype html><html><body style="margin:0;background:#ffffff;font-family:Arial,Helvetica,sans-serif">
<div style="max-width:560px;margin:0 auto;padding:28px 24px">
<p style="margin:0;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#7a2a3a">Kem's Creation</p>
<h1 style="margin:10px 0 14px;font-size:22px;color:#1c1917">See you tomorrow, ${esc(c.full_name.split(" ")[0])}</h1>
<p style="margin:0 0 14px;font-size:14px;line-height:22px;color:#44403c">This is a friendly reminder of your <strong>${esc(SERVICES[a.service_type] ?? a.service_type)}</strong> appointment on <strong>${esc(fmtDate(a.appointment_date))} at ${esc(fmtTime(a.appointment_time))}</strong>.</p>
<p style="margin:0 0 14px;font-size:14px;line-height:22px;color:#44403c">Our studio is in Badagry, Lagos State. Please arrive 5–10 minutes before your slot, and bring any preferred inspiration fabrics or style references.</p>
<p style="margin:0 0 14px;font-size:14px;line-height:22px;color:#44403c">Reference: <strong>${esc(a.reference)}</strong></p>
<p style="margin:20px 0 0"><a href="${esc(link)}" style="display:inline-block;background:#1c1917;color:#ffffff;padding:12px 20px;text-decoration:none;font-size:14px">Manage your booking</a></p>
<p style="margin:28px 0 0;font-size:12px;color:#a8a29e">Kem's Creation · Badagry, Lagos State</p>
</div></body></html>`;
        const r = await fetch(`${GATEWAY_URL}/emails`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env["LOVABLE_API_KEY"]}`,
            "X-Connection-Api-Key": process.env["RESEND_API_KEY"] ?? "",
            "Idempotency-Key": `reminder-${a.id}-${a.appointment_date}`,
          },
          body: JSON.stringify({ from: FROM, to: [c.email], subject: `Reminder: Your Kem's Creation Appointment Tomorrow - ${a.reference}`, html }),
        });
        if (!r.ok) throw new Error(`Email failed [${r.status}]: ${await r.text()}`);
        res.sent++;
      } else res.noEmail++;
      await supabaseAdmin.from("appointments").update({ reminder_sent_at: new Date().toISOString() } as never).eq("id", a.id);
    } catch (e) {
      res.failed++;
      console.error("[reminders] failed for", a.reference, e);
    }
  }
  return res;
}
