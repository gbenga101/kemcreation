import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { DEPOSIT } from "@/lib/booking";

const PAYSTACK_URL = "https://api.paystack.co";
const EMAIL_RE = /^\S+@\S+\.\S+$/;

/**
 * Starts a test-mode deposit payment for an existing booking.
 * Safe fallback: never throws — the caller shows the booking confirmation either way.
 */
export const initDeposit = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({
    reference: z.string().trim().min(4).max(20),
    email: z.string().trim().max(255).regex(EMAIL_RE, "Enter a valid email address"),
    origin: z.string().max(300),
  }).parse(d))
  .handler(async ({ data }) => {
    const key = process.env["PAYSTACK_TEST_SECRET_KEY"];
    if (!key) return { ok: false as const, error: "not_configured" as const };
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: a } = await supabaseAdmin
        .from("appointments")
        .select("id, reference, status, payment_status, customers(full_name, phone)")
        .eq("reference", data.reference.trim().toUpperCase())
        .single();
      if (!a) return { ok: false as const, error: "not_found" as const };
      if (["cancelled", "completed", "no_show"].includes(a.status as string)) return { ok: false as const, error: "not_found" as const };
      if (a.payment_status === "paid") return { ok: true as const, authorizationUrl: null };
      // Mark the deposit as taken (pending) the moment an online payment is started.
      if (a.payment_status !== "pending") {
        await supabaseAdmin.from("appointments").update({ payment_status: "pending" }).eq("id", a.id);
      }
      const c = (a as unknown as { customers: { full_name: string; phone: string } }).customers;
      const res = await fetch(`${PAYSTACK_URL}/transaction/initialize`, {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          amount: DEPOSIT.kobo,
          currency: "NGN",
          reference: a.reference,
          callback_url: `${data.origin}/manage-booking?ref=${encodeURIComponent(a.reference as string)}&phone=${encodeURIComponent(c?.phone ?? "")}&paid=return`,
          metadata: { booking_reference: a.reference, customer_name: c?.full_name ?? "" },
        }),
      });
      const body = (await res.json()) as { status?: boolean; message?: string; data?: { authorization_url?: string } };
      if (!res.ok || !body.status || !body.data?.authorization_url) {
        console.error("[paystack] initialize failed", res.status, body.message);
        return { ok: false as const, error: "init_failed" as const };
      }
      return { ok: true as const, authorizationUrl: body.data.authorization_url };
    } catch (e) {
      console.error("[paystack] initialize error", e);
      return { ok: false as const, error: "init_failed" as const };
    }
  });

/** Confirms a deposit against Paystack's API before marking it paid. Re-checking the same payment changes nothing. */
export const verifyDeposit = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ reference: z.string().trim().min(4).max(20) }).parse(d))
  .handler(async ({ data }) => {
    const key = process.env["PAYSTACK_TEST_SECRET_KEY"];
    if (!key) return { checked: false as const, paid: false as const };
    try {
      const res = await fetch(`${PAYSTACK_URL}/transaction/verify/${encodeURIComponent(data.reference.trim().toUpperCase())}`, {
        headers: { Authorization: `Bearer ${key}` },
      });
      const body = (await res.json()) as { status?: boolean; data?: { status?: string; amount?: number; currency?: string } };
      if (!res.ok || !body.status || !body.data) return { checked: true as const, paid: false as const };
      if (body.data.status === "success" && body.data.amount === DEPOSIT.kobo && body.data.currency === "NGN") {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        await supabaseAdmin.from("appointments").update({ payment_status: "paid" }).eq("reference", data.reference.trim().toUpperCase());
        return { checked: true as const, paid: true as const };
      }
      return { checked: true as const, paid: false as const };
    } catch (e) {
      console.error("[paystack] verify error", e);
      return { checked: false as const, paid: false as const };
    }
  });
