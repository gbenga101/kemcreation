import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { OwnerAppointmentCard } from "@/components/owner-appointment-card";
import { lagosToday, useAppointments, type DbStatus } from "@/lib/owner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/owner/appointments")({ head: () => ({ meta: [
  { title: "Appointments | Kem's Creation owner" },
  { name: "description", content: "Review, confirm and update Kem's Creation appointments." },
  { property: "og:title", content: "Appointments | Kem's Creation owner" },
  { property: "og:description", content: "Private appointment management for Kem's Creation." },
  { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  { name: "robots", content: "noindex" },
] }), component: AppointmentsPage });

type F = "all" | "deadlines" | DbStatus;
const filters: { id: F; label: string }[] = [
  { id: "all", label: "All" }, { id: "deadlines", label: "Upcoming Event Deadlines" }, { id: "pending", label: "Pending" }, { id: "confirmed", label: "Confirmed" }, { id: "completed", label: "Completed" }, { id: "cancelled", label: "Cancelled" },
];

function AppointmentsPage() {
  const [filter, setFilter] = useState<F>("all");
  const { data = [], isLoading, isError } = useAppointments();
  const today = lagosToday();
  const list = filter === "all" ? data
    : filter === "deadlines" ? data.filter((a) => a.event_date && a.event_date >= today && !["cancelled", "no_show"].includes(a.status)).sort((x, y) => x.event_date!.localeCompare(y.event_date!))
    : data.filter((a) => a.status === filter);
  return <>
    <p className="text-xs font-semibold uppercase tracking-widest text-accent">Owner / Appointments</p>
    <h1 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">Appointments</h1>
    <div role="group" aria-label="Filter by status" className="mt-6 flex flex-wrap gap-2">{filters.map((f) => <button key={f.id} type="button" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)} className={cn("min-h-10 border px-4 text-sm transition-colors", filter === f.id ? "border-foreground bg-foreground text-background" : "border-border bg-card hover:border-foreground")}>{f.label}</button>)}</div>
    <div className="mt-6 grid gap-4">
      {isError && <p className="text-sm text-destructive">Couldn't load appointments. Please refresh.</p>}
      {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : list.length ? list.map((a) => <OwnerAppointmentCard key={a.id} a={a} />) : <p className="border border-dashed border-border px-5 py-8 text-sm text-muted-foreground">No appointments in this view.</p>}
    </div>
  </>;
}
