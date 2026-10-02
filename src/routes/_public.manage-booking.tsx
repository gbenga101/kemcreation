import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { format, addDays, startOfDay } from "date-fns";
import { CalendarDays, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { TextField } from "@/components/ui/field";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { AppointmentStatusBadge } from "@/components/ui/appointment-status";
import { StageStepper, stageLabel } from "@/components/production";
import { cn } from "@/lib/utils";
import { serviceTitle, slotsFor, formatTime, toISODate, errorMessages, DEPOSIT } from "@/lib/booking";
import { initDeposit, verifyDeposit } from "@/lib/payments.functions";

type Search = { ref?: string | undefined; phone?: string | undefined; paid?: string | undefined };

export const Route = createFileRoute("/_public/manage-booking")({
  validateSearch: (s: Record<string, unknown>): Search => (console.info("[validate]", JSON.stringify(s)), ({
    ref: typeof s["ref"] === "string" ? s["ref"] : undefined,
    phone: typeof s["phone"] === "string" ? s["phone"] : s["phone"] != null ? String(s["phone"]) : undefined,
    paid: typeof s["paid"] === "string" ? s["paid"] : undefined,
  }),
  head: () => ({ meta: [
    { title: "Manage your booking | Kem's Creation" },
    { name: "description", content: "Check, reschedule or cancel your Kem's Creation appointment using your booking reference." },
    { property: "og:title", content: "Manage your booking | Kem's Creation" },
    { property: "og:description", content: "Look up, reschedule or cancel your appointment with Kem's Creation." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: ManagePage,
});

type Booking = { reference: string; service_type: string; appointment_date: string; appointment_time: string; occasion: string | null; event_date: string | null; notes: string | null; status: string; full_name: string; production_stage: string; payment_status: string };

const badgeFor = (s: string) => {
  const map: Record<string, Parameters<typeof AppointmentStatusBadge>[0]["status"]> = {
    pending: "pending", confirmed: "confirmed", rescheduled: "rescheduled", cancelled: "cancelled", completed: "completed", no_show: "no-show", reschedule_requested: "reschedule requested",
  };
  return map[s] ?? "pending";
};
const statusLabel: Record<string, string> = { pending: "Pending confirmation" };
const notFoundMsg = "We couldn't find an appointment matching that reference code and phone number. Please check the details and try again.";
const prettyWhen = (d: string, t: string) => `${format(new Date(`${d}T00:00`), "EEEE d MMMM yyyy")} at ${formatTime(t.slice(0, 5))}`;

function ManagePage() {
  const search = Route.useSearch();
  const [ref, setRef] = useState(search.ref ?? "");
  const [phone, setPhone] = useState(search.phone ?? "");
  const [creds, setCreds] = useState<{ ref: string; phone: string } | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const auto = useRef(false);
  const verified = useRef(false);

  async function lookup(r: string, p: string) {
    const cleanRef = r.trim().toUpperCase(), cleanPhone = p.replace(/[\s-]/g, "");
    if (!cleanRef || !cleanPhone) { setError("Please enter both your booking reference and phone number."); return; }
    setLoading(true); setError(null);
    const { data, error: e } = await supabase.rpc("lookup_booking" as never, { _ref: cleanRef, _phone: cleanPhone } as never);
    setLoading(false);
    const row = ((data as Booking[] | null) ?? [])[0];
    if (e || !row) { setBooking(null); setError(notFoundMsg); return; }
    setBooking(row); setCreds({ ref: cleanRef, phone: cleanPhone });
  }

  useEffect(() => {
    if (!auto.current && search.ref && search.phone) { auto.current = true; void lookup(search.ref, search.phone); }
  }, [search.ref, search.phone]);

  // Returning from Paystack: confirm the payment against Paystack's API before trusting it.
  useEffect(() => {
    console.info("[verify-debug]", JSON.stringify({ paid: search.paid, hasBooking: !!booking, verified: verified.current }));
    if (!search.paid || !booking || verified.current) return;
    verified.current = true;
    void (async () => {
      if (booking.payment_status === "paid") { setNotice("Payment confirmed — thank you! Your deposit has been received."); return; }
      const r = await verifyDeposit({ data: { reference: booking.reference } });
      if (r.paid) setNotice("Payment confirmed — thank you! Your deposit has been received.");
      else setNotice("We couldn't confirm your payment yet. If you completed it just now, please refresh this page in a moment.");
    })();
  }, [booking, search.paid]);

  return <section className="mx-auto max-w-2xl px-5 py-14 sm:px-8 lg:py-20">
    <p className="text-xs font-semibold uppercase tracking-widest text-accent">Your appointment</p>
    <h1 className="mt-3 font-display text-3xl font-bold leading-tight sm:text-4xl">Manage your booking</h1>

    {!booking ? <>
      <p className="mt-4 text-muted-foreground">Enter the booking reference you received and the phone number you booked with.</p>
      <form className="mt-8 space-y-5" noValidate onSubmit={(e) => { e.preventDefault(); void lookup(ref, phone); }}>
        <TextField id="ref" label="Booking reference code" placeholder="e.g. KC-07F19D" autoCapitalize="characters" autoComplete="off" value={ref} onChange={(e) => setRef(e.target.value.toUpperCase())} />
        <TextField id="phone" label="Phone number" type="tel" inputMode="tel" autoComplete="tel" placeholder="08012345678 or +2348012345678" value={phone} onChange={(e) => setPhone(e.target.value)} />
        {error && <p role="alert" className="rounded-sm border border-destructive/40 bg-card p-3 text-sm text-destructive">{error}</p>}
        <Button type="submit" size="lg" disabled={loading}>{loading ? "Searching…" : "Find My Booking"}</Button>
      </form>
    </> : creds && <Details booking={booking} creds={creds} notice={notice}
      onChanged={(msg) => { setNotice(msg); void lookup(creds.ref, creds.phone); }}
      onReset={() => { setBooking(null); setNotice(null); }} />}
  </section>;
}

function Details({ booking: b, creds, notice, onChanged, onReset }: { booking: Booking; creds: { ref: string; phone: string }; notice: string | null; onChanged: (m: string) => void; onReset: () => void }) {
  const [copied, setCopied] = useState(false);
  const [resOpen, setResOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const closed = ["cancelled", "completed", "no_show"].includes(b.status);

  async function cancel() {
    setBusy(true); setActionError(null);
    const { error } = await supabase.rpc("cancel_booking" as never, { _ref: creds.ref, _phone: creds.phone } as never);
    setBusy(false); setCancelOpen(false);
    if (error) { setActionError("We couldn't cancel this appointment. Please try again."); return; }
    onChanged("Your appointment has been cancelled.");
  }

  return <div className="mt-8 space-y-6">
    {notice && <p role="status" className="border-l-2 border-accent bg-surface p-4 text-sm">{notice}</p>}
    {actionError && <p role="alert" className="rounded-sm border border-destructive/40 p-3 text-sm text-destructive">{actionError}</p>}
    <div className="rounded-md border border-border bg-card">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border p-5">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Booking reference</p>
          <p className="mt-1 font-display text-3xl font-bold tracking-wider">{b.reference}</p>
          <button type="button" onClick={() => { void navigator.clipboard.writeText(b.reference); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            className="mt-2 inline-flex min-h-9 items-center gap-1.5 text-sm text-accent underline-offset-4 hover:underline">
            {copied ? <Check aria-hidden className="size-4" /> : <Copy aria-hidden className="size-4" />}{copied ? "Copied" : "Copy Reference"}
          </button>
        </div>
        <span title={statusLabel[b.status]}><AppointmentStatusBadge status={badgeFor(b.status)} /></span>
      </div>
      <dl className="grid gap-4 p-5 text-sm sm:grid-cols-2">
        <div><dt className="text-muted-foreground">Name</dt><dd className="mt-1 font-medium">{b.full_name}</dd></div>
        <div><dt className="text-muted-foreground">Service</dt><dd className="mt-1 font-medium">{serviceTitle(b.service_type)}</dd></div>
        <div className="sm:col-span-2"><dt className="text-muted-foreground">Date & time</dt><dd className="mt-1 font-medium">{prettyWhen(b.appointment_date, b.appointment_time)}</dd></div>
        {b.occasion && <div><dt className="text-muted-foreground">Occasion</dt><dd className="mt-1 font-medium">{b.occasion}</dd></div>}
        {b.event_date && <div><dt className="text-muted-foreground">Event date</dt><dd className="mt-1 font-medium">{format(new Date(`${b.event_date}T00:00`), "d MMMM yyyy")}</dd></div>}
        <div><dt className="text-muted-foreground">Deposit</dt><dd className="mt-1 font-medium">{b.payment_status === "paid" ? `Paid (${DEPOSIT.label} demo amount)` : `Due — ${DEPOSIT.label} (demo amount)`}</dd></div>
        {b.notes && <div className="sm:col-span-2"><dt className="text-muted-foreground">Notes</dt><dd className="mt-1 whitespace-pre-line break-words">{b.notes}</dd></div>}
      </dl>
    </div>

    {b.status !== "cancelled" && b.status !== "no_show" && <div className="rounded-md border border-border bg-card p-5">
      <p className="font-display text-lg font-semibold">Garment progress</p>
      <p className="mt-1 text-sm text-muted-foreground">Current stage: <span className="font-medium text-foreground">{stageLabel(b.production_stage)}</span></p>
      <StageStepper stage={b.production_stage} service={b.service_type} className="mt-4" />
      {b.production_stage === "fitting_ready" && <p className="mt-4 border-l-2 border-accent bg-surface p-3 text-sm">Your outfit is ready for a fitting! We look forward to seeing you at our Badagry studio.</p>}
      {b.production_stage === "completed" && <p className="mt-4 border-l-2 border-accent bg-surface p-3 text-sm">Your order is completed and ready for pickup or delivery across Lagos.</p>}
    </div>}

    {b.status === "cancelled" && <p className="border-l-2 border-border bg-surface p-4 text-sm leading-6">
      This appointment was cancelled. If you would like to book a new appointment, you can visit the <Link to="/book" className="text-accent underline underline-offset-4">booking page</Link>.
    </p>}

    <div className="border-l-2 border-accent bg-surface p-4 text-sm leading-6">
      <p className="font-semibold">Studio visit</p>
      <p className="text-muted-foreground">Our studio is in Badagry, Lagos State. Delivery is available across Lagos.</p>
      <p className="mt-3 text-muted-foreground">For custom fittings and measurements, please arrive 5–10 minutes before your slot. Bring any preferred inspiration fabrics or style references.</p>
    </div>

    {!closed && b.payment_status !== "paid" && <div className="border-l-2 border-accent bg-surface p-4 text-sm leading-6">
      <p className="font-semibold">Deposit — {DEPOSIT.label} (demo amount)</p>
      <p className="text-muted-foreground">A deposit holds your appointment once it is confirmed. {DEPOSIT.demoNote}</p>
      <DepositPay reference={b.reference} onChanged={onChanged} />
    </div>}

    <div className="flex flex-wrap items-center gap-4 border-t border-border pt-6">
      <Button variant="outline" size="lg" disabled={closed} onClick={() => setResOpen(true)}><CalendarDays aria-hidden className="size-4" />Reschedule Appointment</Button>
      <button type="button" disabled={closed} onClick={() => setCancelOpen(true)} className="min-h-11 text-sm text-destructive underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:opacity-50 disabled:no-underline">Cancel Appointment</button>
      <button type="button" onClick={onReset} className="ml-auto min-h-11 text-sm text-muted-foreground underline-offset-4 hover:underline">Look up another booking</button>
    </div>

    <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel your appointment?</AlertDialogTitle>
          <AlertDialogDescription>Are you sure you want to cancel your appointment {b.reference} for {format(new Date(`${b.appointment_date}T00:00`), "EEEE d MMMM yyyy")}? This will release your reserved slot back to the public calendar.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Keep Appointment</AlertDialogCancel>
          <AlertDialogAction disabled={busy} onClick={(e) => { e.preventDefault(); void cancel(); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{busy ? "Cancelling…" : "Yes, Cancel Appointment"}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <RescheduleDialog open={resOpen} onOpenChange={setResOpen} creds={creds} current={b}
      onDone={(d, t) => { setResOpen(false); onChanged(`Your appointment has been successfully rescheduled to ${prettyWhen(d, t)}.`); }} />
  </div>;
}

function RescheduleDialog({ open, onOpenChange, creds, current, onDone }: { open: boolean; onOpenChange: (o: boolean) => void; creds: { ref: string; phone: string }; current: Booking; onDone: (d: string, t: string) => void }) {
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState<string | null>(null);
  const [booked, setBooked] = useState<string[]>([]);
  const [blockedDays, setBlockedDays] = useState<Date[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => { if (open) { setDate(undefined); setTime(null); setErr(null); void supabase.rpc("get_blocked_days").then(({ data }) => setBlockedDays(((data as string[] | null) ?? []).map((d) => new Date(`${d}T00:00:00`)))); } }, [open]);
  async function loadBooked(d: Date) {
    setLoading(true);
    const { data } = await supabase.rpc("get_booked_slots", { _date: toISODate(d) });
    setBooked(((data as string[] | null) ?? []).map((t) => t.slice(0, 5)));
    setLoading(false);
  }
  useEffect(() => { if (date) void loadBooked(date); }, [date]);

  const today = startOfDay(new Date()); const now = new Date();
  const slots = date ? slotsFor(date).filter((t) => {
    if (toISODate(date) !== toISODate(now)) return true;
    const [h = 0, m = 0] = t.split(":").map(Number);
    return h * 60 + m > now.getHours() * 60 + now.getMinutes();
  }) : [];
  const isCurrent = (t: string) => !!date && toISODate(date) === current.appointment_date && current.appointment_time.slice(0, 5) === t;

  async function save() {
    if (!date || !time) return;
    setSaving(true); setErr(null);
    const d = toISODate(date);
    const { error } = await supabase.rpc("reschedule_booking" as never, { _ref: creds.ref, _phone: creds.phone, _date: d, _time: time } as never);
    setSaving(false);
    if (error) {
      const key = Object.keys(errorMessages).find((k) => error.message.includes(k));
      setErr((key && errorMessages[key]) || "We couldn't reschedule this appointment. Please try again.");
      setTime(null); void loadBooked(date); return;
    }
    onDone(d, time);
  }

  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle className="font-display">Choose a new date and time</DialogTitle>
        <DialogDescription>Open Monday–Saturday. Closed on Sundays. Your current time is released once you confirm.</DialogDescription>
      </DialogHeader>
      <div className="grid gap-6 md:grid-cols-[auto_1fr]">
        <Calendar mode="single" selected={date} onSelect={(d) => { setDate(d); setTime(null); }}
          disabled={[{ before: today }, { after: addDays(today, 90) }, { dayOfWeek: [0] }, ...blockedDays]}
          className="w-fit rounded-md border border-border bg-card" />
        <div>
          {!date ? <p className="text-sm text-muted-foreground">Select a date to see available times.</p> : <>
            <p className="text-sm font-medium">{format(date, "EEEE d MMMM")}</p>
            {loading ? <p className="mt-3 text-sm text-muted-foreground">Checking available times…</p>
              : slots.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">No times left on this day. Please pick another date.</p>
              : <div className="mt-3 grid grid-cols-3 gap-2">
                {slots.map((t) => { const taken = booked.includes(t) || isCurrent(t); return <button key={t} type="button" disabled={taken} onClick={() => setTime(t)} aria-pressed={time === t}
                  className={cn("min-h-11 rounded-sm border text-sm transition-colors", taken ? "cursor-not-allowed border-border text-muted-foreground line-through opacity-60" : time === t ? "border-accent bg-accent text-accent-foreground" : "border-border bg-card hover:border-accent")}>
                  {formatTime(t)}<span className="sr-only">{isCurrent(t) ? " (your current time)" : taken ? " (taken)" : ""}</span></button>; })}
              </div>}
          </>}
        </div>
      </div>
      {err && <p role="alert" className="rounded-sm border border-destructive/40 p-3 text-sm text-destructive">{err}</p>}
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Keep current time</Button>
        <Button onClick={save} disabled={!date || !time || saving}>{saving ? "Saving…" : "Confirm new time"}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>;
}

function DepositPay({ reference, onChanged }: { reference: string; onChanged: (m: string) => void }) {
  const [email, setEmail] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function pay() {
    if (!/^\S+@\S+\.\S+$/.test(email)) { setErr("Please enter a valid email address."); return; }
    setBusy(true); setErr(null);
    const r = await initDeposit({ data: { reference, email, origin: window.location.origin } });
    if (r.ok && typeof r.authorizationUrl === "string") { window.location.assign(r.authorizationUrl); return; }
    setBusy(false);
    if (r.ok) {
      const v = await verifyDeposit({ data: { reference } });
      if (v.paid) onChanged("Payment confirmed — thank you! Your deposit has been received.");
      else setErr("We couldn't confirm the payment. Please refresh this page in a moment.");
    } else {
      setErr("We couldn't start the payment. Please try again or pay at the studio.");
    }
  }

  return <div className="mt-3">
    <TextField id="deposit-pay-email" label="Email for the payment receipt" type="email" autoComplete="email" value={email} onChange={(e) => { setEmail(e.target.value); setErr(null); }} error={err ?? undefined} />
    <Button className="mt-4" size="lg" onClick={pay} disabled={busy}>{busy ? "Starting…" : `Pay Deposit Online (${DEPOSIT.label} — Test Mode)`}</Button>
  </div>;
}
