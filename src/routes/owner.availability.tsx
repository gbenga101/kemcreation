import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { slotsFor, formatTime } from "@/lib/booking";
import { lagosToday, prettyDate } from "@/lib/owner";

export const Route = createFileRoute("/owner/availability")({ head: () => ({ meta: [
  { title: "Availability | Kem's Creation owner" },
  { name: "description", content: "Block dates and times so customers can't book them." },
  { property: "og:title", content: "Availability | Kem's Creation owner" },
  { property: "og:description", content: "Private schedule controls for Kem's Creation." },
  { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  { name: "robots", content: "noindex" },
] }), component: AvailabilityPage });

type Block = { id: string; blocked_date: string; blocked_time: string | null; reason: string | null };

function AvailabilityPage() {
  const qc = useQueryClient();
  const today = lagosToday();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const blocks = useQuery({ queryKey: ["owner", "blocks"], queryFn: async () => {
    const { data, error } = await supabase.from("blocked_slots").select("id, blocked_date, blocked_time, reason").gte("blocked_date", today).order("blocked_date").order("blocked_time");
    if (error) throw error; return data as Block[];
  } });
  const add = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("blocked_slots").insert({ blocked_date: date, blocked_time: time || null, reason: reason.trim() || null });
      if (error) throw error;
    },
    onSuccess: () => { setTime(""); setReason(""); setErr(null); void qc.invalidateQueries({ queryKey: ["owner", "blocks"] }); },
    onError: (e: { code?: string }) => setErr(e.code === "23505" ? "That date or time is already blocked." : "Couldn't save. Please try again."),
  });
  const remove = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("blocked_slots").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["owner", "blocks"] }),
  });

  const slots = date ? slotsFor(new Date(`${date}T00:00:00`)) : [];
  return <>
    <p className="text-xs font-semibold uppercase tracking-widest text-accent">Owner / Availability</p>
    <h1 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">Availability</h1>
    <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Block a whole day or a single time for fabric sourcing, holidays or closures. Blocked times disappear from the public booking page straight away. Existing bookings are not cancelled automatically.</p>

    <form className="mt-8 grid gap-4 border border-border bg-card p-5 md:grid-cols-[1fr_1fr_2fr_auto] md:items-end" onSubmit={(e) => { e.preventDefault(); if (date) add.mutate(); }}>
      <div className="space-y-1.5"><Label htmlFor="bdate">Date</Label><Input id="bdate" type="date" min={today} required value={date} onChange={(e) => { setDate(e.target.value); setTime(""); }} /></div>
      <div className="space-y-1.5"><Label htmlFor="btime">Time</Label>
        <select id="btime" value={time} onChange={(e) => setTime(e.target.value)} disabled={!date || !slots.length} className="flex min-h-11 w-full rounded-sm border border-input bg-background px-3 text-sm">
          <option value="">Whole day</option>{slots.map((s) => <option key={s} value={s}>{formatTime(s)}</option>)}
        </select></div>
      <div className="space-y-1.5"><Label htmlFor="breason">Reason (optional)</Label><Input id="breason" maxLength={200} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Fabric sourcing" /></div>
      <Button type="submit" disabled={!date || add.isPending}>Block</Button>
      {date && !slots.length && <p className="text-sm text-muted-foreground md:col-span-4">The studio is already closed on Sundays.</p>}
      {err && <p role="alert" className="text-sm text-destructive md:col-span-4">{err}</p>}
    </form>

    <section className="mt-10"><h2 className="mb-4 font-display text-2xl font-semibold">Blocked dates & times</h2>
      {blocks.isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : blocks.data?.length ? <ul className="divide-y divide-border border border-border bg-card">{blocks.data.map((b) => <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-sm"><span><span className="font-medium">{prettyDate(b.blocked_date)}</span> · {b.blocked_time ? formatTime(b.blocked_time.slice(0, 5)) : "Whole day"}{b.reason && <span className="block text-muted-foreground">{b.reason}</span>}</span><Button size="sm" variant="outline" disabled={remove.isPending} onClick={() => remove.mutate(b.id)}>Unblock</Button></li>)}</ul> : <p className="border border-dashed border-border px-5 py-8 text-sm text-muted-foreground">Nothing blocked. All normal opening hours are bookable.</p>}
    </section>
  </>;
}
