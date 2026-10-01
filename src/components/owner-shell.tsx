import { Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CalendarDays, CalendarOff, LayoutDashboard, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const navigation = [
  { to: "/owner" as const, label: "Overview", icon: LayoutDashboard },
  { to: "/owner/appointments" as const, label: "Appointments", icon: CalendarDays },
  { to: "/owner/availability" as const, label: "Availability", icon: CalendarOff },
];

export function OwnerShell() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  async function signOut() {
    await qc.cancelQueries(); qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/owner/login", replace: true });
  }
  return <div className="min-h-screen bg-background lg:grid lg:grid-cols-[244px_minmax(0,1fr)]">
    <aside className="border-b border-border bg-editorial text-editorial-foreground lg:min-h-screen lg:border-b-0 lg:border-r lg:border-border"><div className="mx-auto max-w-7xl px-5 py-5 sm:px-8 lg:px-6 lg:py-8">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 lg:block"><Link to="/owner" className="min-w-0 truncate font-display text-2xl font-semibold sm:text-3xl">Kem's Creation</Link><span className="shrink-0 border border-editorial-foreground/30 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest lg:mt-2 lg:inline-block">Owner</span></div>
      <nav aria-label="Owner navigation" className="mt-5 flex flex-wrap gap-2 lg:mt-12 lg:flex-col">{navigation.map(({ to, label, icon: Icon }) => <Link key={to} to={to} activeOptions={{ exact: true }} activeProps={{ className: "bg-editorial-foreground/15" }} className="inline-flex min-h-11 items-center gap-2 px-3 text-sm text-editorial-foreground transition-colors hover:bg-editorial-foreground/10"><Icon className="size-4 shrink-0" aria-hidden="true" />{label}</Link>)}
        <button type="button" onClick={signOut} className="inline-flex min-h-11 items-center gap-2 px-3 text-sm text-editorial-foreground/80 transition-colors hover:bg-editorial-foreground/10 lg:mt-6"><LogOut className="size-4 shrink-0" aria-hidden="true" />Sign out</button>
      </nav>
      <Link to="/" className="mt-8 hidden items-center gap-2 text-sm text-editorial-foreground/75 hover:text-editorial-foreground lg:inline-flex"><ArrowLeft className="size-4" /> Public site</Link>
    </div></aside>
    <main id="main-content" className="min-w-0"><div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-12 lg:py-12"><Outlet /></div></main>
  </div>;
}
