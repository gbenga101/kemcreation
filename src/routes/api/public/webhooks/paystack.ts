import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";
import { DEPOSIT } from "@/lib/booking";

export const Route = createFileRoute("/api/public/webhooks/paystack")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["PAYSTACK_TEST_SECRET_KEY"];
        if (!secret) return new Response("Not configured", { status: 500 });
        const body = await request.text();
        const signature = request.headers.get("x-paystack-signature") ?? "";
        const expected = createHmac("sha512", secret).update(body).digest("hex");
        const sig = Buffer.from(signature);
        const exp = Buffer.from(expected);
        if (sig.length !== exp.length || !timingSafeEqual(sig, exp)) {
          return new Response("Invalid signature", { status: 401 });
        }
        try {
          const event = JSON.parse(body) as { event?: string; data?: { reference?: string; status?: string; amount?: number; currency?: string } };
          if (
            event.event === "charge.success" &&
            event.data?.status === "success" &&
            event.data.amount === DEPOSIT.kobo &&
            event.data.currency === "NGN" &&
            event.data.reference
          ) {
            const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
            await supabaseAdmin.from("appointments").update({ payment_status: "paid" }).eq("reference", event.data.reference.toUpperCase());
          }
        } catch (e) {
          console.error("[paystack-webhook] error", e);
        }
        return new Response("ok");
      },
    },
  },
});
