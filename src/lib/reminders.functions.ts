import { createServerFn } from "@tanstack/react-start";
import { getRequestUrl } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Owner-only manual trigger of the daily reminder routine. */
export const runReminderCheck = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isOwner } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "owner" });
    if (!isOwner) throw new Response("Forbidden", { status: 403 });
    const { runReminders } = await import("./reminders.server");
    return runReminders(getRequestUrl().origin);
  });
