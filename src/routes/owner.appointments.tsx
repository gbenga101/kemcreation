import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/owner/appointments")({ head: () => ({ meta: [
  { title: "Appointments preview | Kem's Creation" },
  { name: "description", content: "A non-operational preview of the Kem's Creation appointment workspace. No appointments are connected." },
  { property: "og:title", content: "Appointments preview | Kem's Creation" },
  { property: "og:description", content: "The appointment workspace will be connected in a later stage." },
  { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
] }), component: AppointmentsPage });
function AppointmentsPage() {
  return <><p className="text-xs font-semibold uppercase tracking-widest text-accent">Owner / Appointments</p><h1 className="mt-3 font-display text-5xl leading-none sm:text-6xl">Appointments.</h1><p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">A dedicated place for the schedule when the booking workflow is built.</p><div className="mt-10 border border-border bg-card px-6 py-16 text-center sm:py-20"><CalendarDays aria-hidden="true" className="mx-auto size-9 text-accent" /><h2 className="mt-5 font-display text-3xl">No appointments connected</h2><p className="mx-auto mt-3 max-w-md text-sm leading-7 text-muted-foreground">Booking, availability and appointment records are not part of this stage. This page does not show real or demo bookings.</p><Button asChild variant="outline" className="mt-6"><Link to="/owner"><ArrowLeft /> Back to overview</Link></Button></div></>;
}
