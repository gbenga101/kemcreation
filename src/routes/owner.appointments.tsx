import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { OwnerAppointmentCard } from "@/components/owner-appointment-card";
import { ReminderCheckButton } from "@/components/reminder-check";
import { lagosToday, needsFollowUp, useAppointments, type DbStatus } from "@/lib/owner";
import { cn } from "@/lib/utils";

type F = "all" | "deadlines" | "follow_up" | "paid_deposit" | DbStatus;
const filters: { id: F; label: string }[] = [
  { id: "all", label: "All" }, { id: "follow_up", label: "Needs Follow-Up" }, { id: "deadlines", label: "Upcoming Event Deadlines" }, { id: "pending", label: "Pending" }, { id: "confirmed", label: "Confirmed" }, { id: "completed", label: "Completed" }, { id: "cancelled", label: "Cancelled" }, { id: "paid_deposit", label: "Paid Deposits" },
];

export const Route = createFileRoute("/owner/appointments")({
  validateSearch: (s: Record<string, unknown>): { filter?: F } => {
    const f = s["filter"];
    return filters.some((x) => x.id === f) ? { filter: f as F } : {};
  },
  head: () => ({ meta: [
  { title: "Appointments | Kem's Creation owner" },
  { name: "description", content: "Review, confirm and update Kem's Creation appointments." },
  { property: "og:title", content: "Appointments | Kem's Creation owner" },
  { property: "og:description", content: "Private appointment management for Kem's Creation." },
  { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  { name: "robots", content: "noindex" },
] }), component: AppointmentsPage });

function AppointmentsPage() {
  const filter = Route.useSearch().filter ?? "all";
  const navigate = useNavigate({ from: "/owner/appointments" });
  const setFilter = (f: F) => navigate({ search: f === "all" ? {} : { filter: f }, replace: true });
  const { data = [], isLoading, isError } = useAppointments();
  const today = lagosToday();
  const list = filter === "all" ? data
    : filter === "follow_up" ? data.filter(needsFollowUp)
    : filter === "deadlines" ? data.filter((a) => a.event_date && a.event_date >= today && !["cancelled", "no_show"].includes(a.status)).sort((x, y) => x.event_date!.localeCompare(y.event_date!))
    : filter === "paid_deposit" ? data.filter((a) => a.payment_status === "paid")
    : data.filter((a) => a.status === filter);
  return <>
    <p className="text-xs font-semibold uppercase tracking-widest text-accent">Owner / Appointments</p>
    <h1 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">Appointments</h1>
    <div className="mt-4 border-l-2 border-border pl-4"><p className="mb-2 text-xs text-muted-foreground">Reminders go out automatically every morning at 8:00 (Lagos time) for tomorrow's confirmed visits.</p><ReminderCheckButton /></div>
    <div role="group" aria-label="Filter by status" className="mt-6 flex flex-wrap gap-2">{filters.map((f) => <button key={f.id} type="button" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)} className={cn("min-h-10 border px-4 text-sm transition-colors", filter === f.id ? "border-foreground bg-foreground text-background" : "border-border bg-card hover:border-foreground")}>{f.label}</button>)}</div>
    <div className="mt-6 grid gap-4">
      {isError && <p className="text-sm text-destructive">Couldn't load appointments. Please refresh.</p>}
      {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : list.length ? list.map((a) => <OwnerAppointmentCard key={a.id} a={a} />) : <p className="border border-dashed border-border px-5 py-8 text-sm text-muted-foreground">No appointments in this view.</p>}
    </div>
  </>;
}
