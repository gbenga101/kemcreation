import { useEffect, useState } from "react";
import { BellRing, CheckCircle2, Clock, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { serviceTitle } from "@/lib/booking";
import { cn } from "@/lib/utils";
import { FOLLOW_UPS, prettyDate, useSetFollowUp, whatsappLink, type FollowUp, type OwnerAppointment } from "@/lib/owner";

export function FollowUpBadge({ status }: { status: FollowUp }) {
  if (status === "none") return null;
  const base = "inline-flex items-center gap-1.5 rounded-sm px-2 py-1 text-xs font-medium";
  if (status === "follow_up_due") return <span className={cn(base, "bg-status-pending text-status-pending-foreground")}><BellRing aria-hidden className="size-3.5" />Follow-up due</span>;
  if (status === "waiting_client") return <span className={cn(base, "bg-status-rescheduled text-status-rescheduled-foreground")}><Clock aria-hidden className="size-3.5" />Waiting on client</span>;
  return <span className={cn(base, "bg-status-confirmed text-status-confirmed-foreground")}><CheckCircle2 aria-hidden className="size-3.5" />Follow-up done</span>;
}

export function followUpMessage(a: OwnerAppointment) {
  const name = a.customers?.full_name ?? "there";
  return `Hello ${name}, this is Kem's Creation regarding your ${serviceTitle(a.service_type)} appointment on ${prettyDate(a.appointment_date)}. Just checking in regarding your fitting / fabric preparations. Please let us know if you have any questions or need to make adjustments!`;
}

export function FollowUpPanel({ a }: { a: OwnerAppointment }) {
  const m = useSetFollowUp();
  const [note, setNote] = useState(a.follow_up_notes ?? "");
  const [sent, setSent] = useState(false);
  useEffect(() => setNote(a.follow_up_notes ?? ""), [a.follow_up_notes]);
  const phone = a.customers?.phone;
  const dirty = note.trim() !== (a.follow_up_notes ?? "");
  return <div className="mt-5 border-t border-border pt-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">Follow-up</p>
      <div className="flex flex-wrap items-center gap-2">
        <label className="sr-only" htmlFor={`fu-${a.id}`}>Follow-up state</label>
        <select id={`fu-${a.id}`} value={a.follow_up_status} disabled={m.isPending} onChange={(e) => m.mutate({ id: a.id, follow_up_status: e.target.value as FollowUp })} className="min-h-9 rounded-sm border border-input bg-background px-2 text-sm">
          {FOLLOW_UPS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
        </select>
        {phone && <Button asChild size="sm" variant="outline"><a href={`${whatsappLink(phone)}?text=${encodeURIComponent(followUpMessage(a))}`} target="_blank" rel="noreferrer" onClick={() => setSent(true)}><MessageCircle aria-hidden className="size-4" />WhatsApp Follow-Up</a></Button>}
        {a.follow_up_status !== "completed" && <Button size="sm" variant={sent ? "default" : "ghost"} disabled={m.isPending} onClick={() => m.mutate({ id: a.id, follow_up_status: "completed" })}><CheckCircle2 aria-hidden className="size-4" />Mark done</Button>}
      </div>
    </div>
    <div className="mt-3 flex gap-2">
      <label className="sr-only" htmlFor={`fun-${a.id}`}>Private follow-up note</label>
      <input id={`fun-${a.id}`} value={note} maxLength={300} onChange={(e) => setNote(e.target.value)} placeholder="Private note, e.g. waiting for lace delivery" className="min-h-9 flex-1 rounded-sm border border-input bg-background px-3 text-sm" />
      {dirty && <Button size="sm" disabled={m.isPending} onClick={() => m.mutate({ id: a.id, follow_up_notes: note.trim() || null })}>Save note</Button>}
    </div>
    {m.isError && <p className="mt-2 text-sm text-destructive">Couldn't update the follow-up. Please try again.</p>}
  </div>;
}
