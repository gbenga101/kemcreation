import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, ClipboardList, MessageSquareMore, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/owner/")({ head: () => ({ meta: [
  { title: "Owner overview preview | Kem's Creation" },
  { name: "description", content: "A Stage 1 preview of the Kem's Creation owner workspace. No live appointments or customer records are connected." },
  { property: "og:title", content: "Owner overview preview | Kem's Creation" },
  { property: "og:description", content: "An operational workspace preview with no live customer information." },
  { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
] }), component: OwnerOverview });

function EmptySection({ icon: Icon, title, description }: { icon: typeof CalendarDays; title: string; description: string }) {
  return <Card className="shadow-none"><CardContent className="flex min-h-44 flex-col items-start justify-center p-6"><Icon aria-hidden="true" className="mb-4 size-5 text-accent" /><h3 className="text-base font-semibold">{title}</h3><p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{description}</p></CardContent></Card>;
}
function OwnerOverview() {
  return <><div className="max-w-3xl"><p className="text-xs font-semibold uppercase tracking-widest text-accent">Owner overview</p><h1 className="mt-3 font-display text-5xl leading-none sm:text-6xl">A clearer day starts here.</h1><p className="mt-4 text-base leading-7 text-muted-foreground">A place for appointments, follow-ups and the details that help you prepare. This is an interface preview, not a live schedule.</p></div><div className="mt-8 flex gap-3 border-l-2 border-accent bg-surface p-4"><ShieldAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-accent" /><div><p className="text-sm font-semibold">Stage 1 preview — no live business data</p><p className="mt-1 text-sm leading-6 text-muted-foreground">Appointments, customer details and follow-ups are not connected. This page is not an authenticated owner workspace yet; do not enter private customer information.</p></div></div><section className="mt-12"><div className="mb-5 flex items-center justify-between gap-4"><h2 className="font-display text-3xl sm:text-4xl">Needs attention</h2><span className="text-xs uppercase tracking-widest text-muted-foreground">No records connected</span></div><EmptySection icon={ClipboardList} title="Nothing to review yet" description="New requests and schedule issues will appear here once appointments are introduced." /></section><div className="mt-10 grid gap-9 md:grid-cols-2"><section><h2 className="mb-5 font-display text-3xl sm:text-4xl">Today</h2><EmptySection icon={CalendarDays} title="No schedule connected" description="Today's appointments will be shown here when a booking system is in place." /></section><section><h2 className="mb-5 font-display text-3xl sm:text-4xl">Follow-up</h2><EmptySection icon={MessageSquareMore} title="No follow-ups connected" description="Follow-up work will be visible here in a later stage." /></section></div><section className="mt-10 border-t border-border pt-8"><h2 className="font-display text-3xl sm:text-4xl">Upcoming</h2><p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">There is no upcoming schedule to display. No sample customer records have been added.</p><Button asChild variant="outline" className="mt-5"><Link to="/owner/appointments">View appointment workspace <ArrowRight /></Link></Button></section></>;
}
