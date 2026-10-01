import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { runReminderCheck } from "@/lib/reminders.functions";

export function ReminderCheckButton() {
  const run = useServerFn(runReminderCheck);
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const go = async () => {
    setBusy(true); setMsg(null);
    try {
      const r = await run();
      setMsg({ ok: true, text: `Processed reminders: ${r.checked} upcoming appointment${r.checked === 1 ? "" : "s"} checked — ${r.sent} emailed, ${r.noEmail} without email${r.failed ? `, ${r.failed} failed` : ""}.` });
      qc.invalidateQueries({ queryKey: ["owner"] });
    } catch {
      setMsg({ ok: false, text: "Couldn't run the reminder check. Please try again." });
    } finally { setBusy(false); }
  };
  return <div className="flex flex-wrap items-center gap-3">
    <Button size="sm" variant="outline" onClick={go} disabled={busy}><RefreshCw className={busy ? "size-4 animate-spin" : "size-4"} aria-hidden="true" />{busy ? "Checking…" : "Run Reminder Check Now"}</Button>
    {msg && <p role="status" className={msg.ok ? "text-sm text-muted-foreground" : "text-sm text-destructive"}>{msg.text}</p>}
  </div>;
}
