import { createFileRoute } from "@tanstack/react-router";
import { authenticateCronRequest } from "@/integrations/supabase/cron-auth";
import { runReminders } from "@/lib/reminders.server";

export const Route = createFileRoute("/api/public/hooks/send-reminders")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const denied = await authenticateCronRequest(request);
        if (denied) return denied;
        try {
          const result = await runReminders(new URL(request.url).origin);
          return Response.json({ ok: true, ...result });
        } catch (e) {
          console.error("[reminders] cron run failed", e);
          return Response.json({ ok: false }, { status: 500 });
        }
      },
    },
  },
});
