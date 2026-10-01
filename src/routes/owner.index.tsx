import { createFileRoute, Link } from "@tanstack/react-router";
import { OwnerAppointmentCard } from "@/components/owner-appointment-card";
import { serviceTitle, formatTime } from "@/lib/booking";
import { addDaysISO, lagosToday, needsFollowUp, prettyDate, useAppointments } from "@/lib/owner";

export const Route = createFileRoute("/owner/")({ head: () => ({ meta: [
  { title: "Owner overview | Kem's Creation" },
  { name: "description", content: "Who is coming, what needs review, and what's next at Kem's Creation." },
  { property: "og:title", content: "Owner overview | Kem's Creation" },
  { property: "og:description", content: "Private owner command center for Kem's Creation." },
  { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  { name: "robots", content: "noindex" },
] }), component: OwnerOverview });

function Empty({ text }: { text: string }) {
  return <p className="border border-dashed border-border px-5 py-8 text-sm text-muted-foreground">{text}</p>;
}

function OwnerOverview() {
  const { data = [], isLoading, isError } = useAppointments();
  const today = lagosToday();
  const weekEnd = addDaysISO(today, 7);
  const st = (s: string) => s.toLowerCase();
  const active = (s: string) => ["confirmed", "rescheduled"].includes(st(s));
  const pending = data.filter((a) => st(a.status) === "pending");
  const todays = data.filter((a) => active(a.status) && a.appointment_date.slice(0, 10) === today);
  const upcoming = data.filter((a) => active(a.status) && a.appointment_date.slice(0, 10) >= today && a.appointment_date.slice(0, 10) <= weekEnd);
  const thisWeek = upcoming;
  const followUps = data.filter(needsFollowUp).length;

  return <>
    <p className="text-xs font-semibold uppercase tracking-widest text-accent">Owner overview</p>
    <h1 className="mt-3 font-display text-4xl font-semibold leading-tight sm:text-5xl">{prettyDate(today)}</h1>
    {isError && <p className="mt-6 text-sm text-destructive">Couldn't load appointments. Please refresh.</p>}
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[["Pending requests", pending.length], ["Confirmed today", todays.length], ["Upcoming this week", thisWeek.length]].map(([label, n]) =>
        <div key={label} className="border border-border bg-card p-5"><p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p><p className="mt-2 font-display text-4xl font-semibold">{isLoading ? "–" : n}</p></div>)}
      <Link to="/owner/appointments" search={{ filter: "follow_up" }} className="group border border-accent bg-surface p-5 transition-colors hover:bg-card"><p className="text-xs uppercase tracking-widest text-accent">Follow-ups due</p><p className="mt-2 font-display text-4xl font-semibold">{isLoading ? "–" : followUps}</p><p className="mt-1 text-xs text-muted-foreground underline-offset-4 group-hover:underline">View list →</p></Link>
    </div>

    <section className="mt-12"><h2 className="mb-4 font-display text-2xl font-semibold sm:text-3xl">New & pending requests</h2>
      {isLoading ? <Empty text="Loading…" /> : pending.length ? <div className="grid gap-4">{pending.map((a) => <OwnerAppointmentCard key={a.id} a={a} />)}</div> : <Empty text="No requests waiting for review." />}
    </section>

    <section className="mt-12"><h2 className="mb-4 font-display text-2xl font-semibold sm:text-3xl">Today's schedule</h2>
      {todays.length ? <ol className="divide-y divide-border border border-border bg-card">{todays.map((a) => <li key={a.id} className="grid grid-cols-[5.5rem_1fr] gap-4 px-5 py-4 text-sm"><span className="font-semibold">{formatTime(a.appointment_time.slice(0, 5))}</span><span><span className="font-medium">{a.customers?.full_name}</span><span className="block text-muted-foreground">{serviceTitle(a.service_type)}</span></span></li>)}</ol> : <Empty text="No confirmed visits today." />}
    </section>

    <section className="mt-12"><h2 className="mb-4 font-display text-2xl font-semibold sm:text-3xl">Upcoming appointments</h2>
      {upcoming.length ? <div className="grid gap-4 md:grid-cols-2">{upcoming.slice(0, 10).map((a) => <OwnerAppointmentCard key={a.id} a={a} compact />)}</div> : <Empty text="No upcoming confirmed appointments." />}
    </section>
  </>;
}
