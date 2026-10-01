import { MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppointmentStatusBadge } from "@/components/ui/appointment-status";
import { serviceTitle, formatTime } from "@/lib/booking";
import { badgeStatus, prettyDate, useSetStatus, whatsappLink, type DbStatus, type OwnerAppointment } from "@/lib/owner";

const nextActions: Partial<Record<DbStatus, { status: DbStatus; label: string; variant?: "outline" }[]>> = {
  pending: [{ status: "confirmed", label: "Confirm appointment" }, { status: "cancelled", label: "Decline / Cancel", variant: "outline" }],
  confirmed: [{ status: "completed", label: "Mark completed" }, { status: "no_show", label: "No-show", variant: "outline" }, { status: "cancelled", label: "Cancel", variant: "outline" }],
};

export function OwnerAppointmentCard({ a, compact = false }: { a: OwnerAppointment; compact?: boolean }) {
  const setStatus = useSetStatus();
  const c = a.customers;
  return <article className="border border-border bg-card p-5">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0"><h3 className="text-base font-semibold">{c?.full_name ?? "Unknown customer"}</h3><p className="mt-1 text-sm text-muted-foreground">{serviceTitle(a.service_type)}</p></div>
      <AppointmentStatusBadge status={badgeStatus(a.status) as never} />
    </div>
    <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
      <div><dt className="text-xs uppercase tracking-widest text-muted-foreground">When</dt><dd>{prettyDate(a.appointment_date)}, {formatTime(a.appointment_time.slice(0, 5))}</dd></div>
      {c && <div><dt className="text-xs uppercase tracking-widest text-muted-foreground">Phone</dt><dd className="flex flex-wrap items-center gap-3">{c.phone}<a href={`tel:${c.phone}`} className="inline-flex items-center gap-1 text-accent underline-offset-4 hover:underline"><Phone className="size-3.5" aria-hidden="true" />Call</a><a href={whatsappLink(c.phone)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-accent underline-offset-4 hover:underline"><MessageCircle className="size-3.5" aria-hidden="true" />WhatsApp</a></dd></div>}
      {!compact && a.occasion && <div><dt className="text-xs uppercase tracking-widest text-muted-foreground">Occasion</dt><dd>{a.occasion}</dd></div>}
      {!compact && a.event_date && <div><dt className="text-xs uppercase tracking-widest text-muted-foreground">Event date</dt><dd>{prettyDate(a.event_date)}</dd></div>}
      {!compact && c?.email && <div><dt className="text-xs uppercase tracking-widest text-muted-foreground">Email</dt><dd className="break-all">{c.email}</dd></div>}
      <div><dt className="text-xs uppercase tracking-widest text-muted-foreground">Reference</dt><dd>{a.reference}</dd></div>
    </dl>
    {!compact && a.notes && <p className="mt-4 border-l-2 border-accent bg-surface p-3 text-sm leading-6">{a.notes}</p>}
    {nextActions[a.status] && <div className="mt-5 flex flex-wrap gap-2">{nextActions[a.status]!.map((n) => <Button key={n.status} size="sm" variant={n.variant} disabled={setStatus.isPending} onClick={() => setStatus.mutate({ id: a.id, status: n.status })}>{n.label}</Button>)}</div>}
    {setStatus.isError && <p className="mt-3 text-sm text-destructive">Couldn't update this appointment. Please try again.</p>}
  </article>;
}
