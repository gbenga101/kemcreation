import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { format, addDays, startOfDay } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { TextField, LongTextField } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { services, serviceTitle, occasions, slotsFor, formatTime, toISODate, detailsSchema, errorMessages, DEPOSIT, type Details, type ServiceId } from "@/lib/booking";
import { sendBookingEmails } from "@/lib/notify.functions";
import { initDeposit } from "@/lib/payments.functions";
import { z } from "zod";

export const Route = createFileRoute("/_public/book")({
  head: () => ({ meta: [
    { title: "Book an appointment | Kem's Creation" },
    { name: "description", content: "Request a bespoke, ready-to-wear or occasion wear appointment with Kem's Creation in Badagry, Lagos." },
    { property: "og:title", content: "Book an appointment | Kem's Creation" },
    { property: "og:description", content: "Request a fitting or consultation with Kem's Creation in Badagry, Lagos." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: BookPage,
});

const steps = ["Service", "Date & time", "Your details", "Review"];
const emptyDetails: Details = { fullName: "", phone: "", email: "", occasion: "", eventDate: "", notes: "" };

function BookPage() {
  const [step, setStep] = useState(0);
  const [service, setService] = useState<ServiceId | null>(null);
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState<string | null>(null);
  const [booked, setBooked] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [blockedDays, setBlockedDays] = useState<Date[]>([]);
  useEffect(() => { void supabase.rpc("get_blocked_days").then(({ data }) => setBlockedDays(((data as string[] | null) ?? []).map((d) => new Date(`${d}T00:00:00`)))); }, []);
  const [details, setDetails] = useState<Details>(emptyDetails);
  const [errors, setErrors] = useState<Partial<Record<keyof Details, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [payChoice, setPayChoice] = useState<"studio" | "online">("studio");
  const [payEmail, setPayEmail] = useState("");
  const [payError, setPayError] = useState<string | null>(null);
  const [depositFailed, setDepositFailed] = useState(false);

  async function loadBooked(d: Date) {
    setLoadingSlots(true);
    const { data } = await supabase.rpc("get_booked_slots", { _date: toISODate(d) });
    setBooked(((data as string[] | null) ?? []).map((t) => t.slice(0, 5)));
    setLoadingSlots(false);
  }
  useEffect(() => { if (date) void loadBooked(date); }, [date]);
  useEffect(() => { window.scrollTo({ top: 0 }); }, [step, reference]);

  const today = startOfDay(new Date());
  const now = new Date();
  const slots = date ? slotsFor(date).filter((t) => {
    if (toISODate(date) !== toISODate(now)) return true;
    const [h = 0, m = 0] = t.split(":").map(Number);
    return h * 60 + m > now.getHours() * 60 + now.getMinutes();
  }) : [];

  function validateDetails() {
    const r = detailsSchema.safeParse(details);
    if (r.success) { setErrors({}); return true; }
    const e: Partial<Record<keyof Details, string>> = {};
    for (const issue of r.error.issues) { const k = issue.path[0] as keyof Details; e[k] ??= issue.message; }
    setErrors(e);
    return false;
  }

  async function submit() {
    if (!service || !date || !time) return;
    const payEmailToUse = details.email || payEmail;
    if (payChoice === "online") {
      if (!payEmailToUse) { setPayError("An email address is needed to take the payment."); return; }
      if (!z.string().email().safeParse(payEmailToUse).success) { setPayError("Please enter a valid email address."); return; }
    }
    const parsed = detailsSchema.parse(details);
    setSubmitting(true); setSubmitError(null);
    const { data, error } = await supabase.rpc("create_booking", {
      _service: service, _date: toISODate(date), _time: time, _full_name: parsed.fullName, _phone: parsed.phone,
      _email: parsed.email, _occasion: parsed.occasion, _event_date: parsed.eventDate || null, _notes: parsed.notes,
    } as never);
    setSubmitting(false);
    if (error) {
      const key = Object.keys(errorMessages).find((k) => error.message.includes(k));
      setSubmitError((key && errorMessages[key]) || "Something went wrong and your request was not sent. Please try again.");
      if (key === "slot_taken" || key === "invalid_date") { setTime(null); void loadBooked(date); }
      return;
    }
    const ref = data as string;
    // A payment problem never blocks the booking: it still saves and shows the reference.
    if (payChoice === "online") {
      const r = await initDeposit({ data: { reference: ref, email: payEmailToUse, origin: window.location.origin } });
      if (r.ok && typeof r.authorizationUrl === "string") {
        // Send the owner alert before navigating away to Paystack's checkout.
        await sendBookingEmails({ data: { reference: ref, phone: parsed.phone } }).catch(() => {});
        window.location.assign(r.authorizationUrl);
        return;
      }
      setDepositFailed(true);
    }
    setReference(ref);
    // Fire-and-forget: email problems never affect the booking.
    sendBookingEmails({ data: { reference: ref, phone: parsed.phone } }).catch((e) => console.warn("Booking email not sent", e));
  }

  if (reference && service && date && time) return <Confirmation reference={reference} service={service} date={date} time={time} name={details.fullName} phone={details.phone} payChoice={payChoice} depositFailed={depositFailed} />;

  const set = (k: keyof Details) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setDetails({ ...details, [k]: e.target.value });

  return <section className="mx-auto max-w-3xl px-5 py-14 sm:px-8 lg:py-20">
    <p className="text-xs font-semibold uppercase tracking-widest text-accent">Appointments & consultations</p>
    <h1 className="mt-3 font-display text-3xl font-bold leading-tight sm:text-4xl">Request an appointment</h1>

    <p className="mt-5 border-l-2 border-border bg-surface px-4 py-3 text-sm text-muted-foreground">Already booked with us? <Link to="/manage-booking" className="font-medium text-accent underline underline-offset-4 hover:no-underline">Manage or reschedule your appointment here →</Link></p>

    <ol className="mt-8 grid grid-cols-4 gap-2" aria-label="Booking steps">
      {steps.map((s, i) => <li key={s} aria-current={i === step ? "step" : undefined} className="space-y-2">
        <div className={cn("h-1 rounded-full", i <= step ? "bg-accent" : "bg-border")} />
        <p className={cn("text-xs", i === step ? "font-semibold text-foreground" : "text-muted-foreground")}><span className="sm:hidden">{i + 1}</span><span className="hidden sm:inline">{i + 1}. {s}</span></p>
      </li>)}
    </ol>
    <p className="mt-2 text-sm text-muted-foreground sm:hidden">Step {step + 1} of 4: {steps[step]}</p>

    <div className="mt-10">
      {step === 0 && <fieldset>
        <legend className="font-display text-xl font-semibold">What would you like to book?</legend>
        <div className="mt-5 grid gap-3">
          {services.map((s) => <button key={s.id} type="button" onClick={() => setService(s.id)} aria-pressed={service === s.id}
            className={cn("rounded-md border bg-card p-5 text-left transition-colors hover:border-accent", service === s.id ? "border-accent ring-1 ring-accent" : "border-border")}>
            <span className="block font-semibold">{s.title}</span>
            <span className="mt-1 block text-sm text-muted-foreground">{s.detail}</span>
          </button>)}
        </div>
      </fieldset>}

      {step === 1 && <div>
        <h2 className="font-display text-xl font-semibold">Choose a date and time</h2>
        <p className="mt-1 text-sm text-muted-foreground">Open Monday–Saturday. Closed on Sundays.</p>
        <div className="mt-5 grid gap-8 md:grid-cols-[auto_1fr]">
          <Calendar mode="single" selected={date} onSelect={(d) => { setDate(d); setTime(null); }}
            disabled={[{ before: today }, { after: addDays(today, 90) }, { dayOfWeek: [0] }, ...blockedDays]}
            className="w-fit rounded-md border border-border bg-card" />
          <div>
            {!date ? <p className="text-sm text-muted-foreground">Select a date to see available times.</p>
              : <>
                <p className="text-sm font-medium">{format(date, "EEEE d MMMM")}</p>
                {loadingSlots ? <p className="mt-3 text-sm text-muted-foreground">Checking available times…</p>
                  : slots.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">No times left on this day. Please pick another date.</p>
                  : <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {slots.map((t) => { const taken = booked.includes(t); return <button key={t} type="button" disabled={taken} onClick={() => setTime(t)} aria-pressed={time === t}
                      className={cn("min-h-11 rounded-sm border text-sm transition-colors", taken ? "cursor-not-allowed border-border text-muted-foreground line-through opacity-60" : time === t ? "border-accent bg-accent text-accent-foreground" : "border-border bg-card hover:border-accent")}>
                      {formatTime(t)}<span className="sr-only">{taken ? " (taken)" : ""}</span></button>; })}
                  </div>}
              </>}
          </div>
        </div>
      </div>}

      {step === 2 && <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); if (validateDetails()) setStep(3); }} noValidate id="details-form">
        <h2 className="font-display text-xl font-semibold">Your details</h2>
        <TextField id="fullName" label="Full name" required autoComplete="name" value={details.fullName} onChange={set("fullName")} error={errors.fullName} />
        <TextField id="phone" label="Phone number" required type="tel" autoComplete="tel" inputMode="tel" placeholder="08012345678" hint="We'll use this to confirm your appointment." value={details.phone} onChange={set("phone")} error={errors.phone} />
        <TextField id="email" label="Email (optional)" type="email" autoComplete="email" value={details.email} onChange={set("email")} error={errors.email} />
        <div className="space-y-2">
          <Label htmlFor="occasion" className="text-sm font-medium">Occasion (optional)</Label>
          <select id="occasion" value={details.occasion} onChange={set("occasion")} className="min-h-11 w-full rounded-sm border border-input bg-background px-3 text-sm">
            <option value="">Choose an occasion</option>
            {occasions.map((o) => <option key={o}>{o}</option>)}
          </select>
        </div>
        <TextField id="eventDate" label="Event date (optional)" type="date" min={toISODate(today)} hint="Helps us plan around your deadline." value={details.eventDate} onChange={set("eventDate")} />
        <LongTextField id="notes" label="Notes or style preferences (optional)" rows={4} value={details.notes} onChange={set("notes")} error={errors.notes} />
      </form>}

      {step === 3 && service && date && time && <div>
        <h2 className="font-display text-xl font-semibold">Review your request</h2>
        <dl className="mt-5 divide-y divide-border rounded-md border border-border bg-card">
          <Row label="Service" value={serviceTitle(service)} edit={() => setStep(0)} />
          <Row label="Date & time" value={`${format(date, "EEEE d MMMM yyyy")} at ${formatTime(time)}`} edit={() => setStep(1)} />
          <Row label="Name" value={details.fullName} edit={() => setStep(2)} />
          <Row label="Phone" value={details.phone} edit={() => setStep(2)} />
          {details.email && <Row label="Email" value={details.email} edit={() => setStep(2)} />}
          {details.occasion && <Row label="Occasion" value={details.occasion} edit={() => setStep(2)} />}
          {details.eventDate && <Row label="Event date" value={format(new Date(details.eventDate + "T00:00"), "d MMMM yyyy")} edit={() => setStep(2)} />}
          {details.notes && <Row label="Notes" value={details.notes} edit={() => setStep(2)} />}
        </dl>
        <div className="mt-6 border-l-2 border-accent bg-surface p-4 text-sm leading-6">
          <p className="font-semibold">Location</p>
          <p className="text-muted-foreground">Our studio is in Badagry, Lagos. The exact address and arrival details will be shared when Kem's Creation confirms your appointment.</p>
        </div>
        <div className="mt-4 border-l-2 border-accent bg-surface p-4 text-sm leading-6">
          <p className="font-semibold">Consultation deposit — {DEPOSIT.label}</p>
          <p className="text-muted-foreground">A deposit holds your appointment once it is confirmed. {DEPOSIT.demoNote}</p>
          <fieldset className="mt-3 space-y-1">
            <legend className="sr-only">How would you like to pay the deposit?</legend>
            <label className="flex min-h-11 items-center gap-3">
              <input type="radio" name="deposit" value="studio" checked={payChoice === "studio"} onChange={() => setPayChoice("studio")} className="size-4" />
              <span>Pay the deposit at the studio</span>
            </label>
            <label className="flex min-h-11 items-center gap-3">
              <input type="radio" name="deposit" value="online" checked={payChoice === "online"} onChange={() => setPayChoice("online")} className="size-4" />
              <span>Pay the deposit online now (test payment — no real money will be charged)</span>
            </label>
          </fieldset>
          {payChoice === "online" && !details.email.trim() && <div className="mt-2 max-w-sm">
            <TextField id="depositEmail" label="Email for the payment receipt" type="email" autoComplete="email" value={payEmail} onChange={(e) => { setPayEmail(e.target.value); setPayError(null); }} error={payError ?? undefined} />
          </div>}
          {payChoice === "online" && details.email.trim() && payError && <p role="alert" className="mt-2 text-destructive">{payError}</p>}
        </div>
        {submitError && <p role="alert" className="mt-5 rounded-sm border border-destructive/40 p-3 text-sm text-destructive">{submitError}</p>}
      </div>}
    </div>

    <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
      {step > 0 ? <Button variant="outline" size="lg" onClick={() => setStep(step - 1)} disabled={submitting}>Back</Button> : <span />}
      {step === 0 && <Button size="lg" disabled={!service} onClick={() => setStep(1)}>Continue</Button>}
      {step === 1 && <Button size="lg" disabled={!date || !time} onClick={() => setStep(2)}>Continue</Button>}
      {step === 2 && <Button size="lg" type="submit" form="details-form">Review</Button>}
      {step === 3 && <Button size="lg" onClick={submit} disabled={submitting}>{submitting ? "Sending…" : "Send booking request"}</Button>}
    </div>
  </section>;
}

function Row({ label, value, edit }: { label: string; value: string; edit: () => void }) {
  return <div className="grid grid-cols-[7rem_1fr_auto] gap-3 p-4 text-sm sm:grid-cols-[9rem_1fr_auto]">
    <dt className="text-muted-foreground">{label}</dt><dd className="break-words">{value}</dd>
    <button type="button" onClick={edit} className="text-accent underline-offset-4 hover:underline">Edit</button>
  </div>;
}

function Confirmation({ reference, service, date, time, name, phone, payChoice, depositFailed }: { reference: string; service: string; date: Date; time: string; name: string; phone: string; payChoice: "studio" | "online"; depositFailed: boolean }) {
  return <section className="mx-auto max-w-2xl px-5 py-16 sm:px-8 lg:py-24">
    <p className="text-xs font-semibold uppercase tracking-widest text-accent">Request received</p>
    <h1 className="mt-3 font-display text-3xl font-bold leading-tight sm:text-4xl">Thank you, {name.split(" ")[0]}.</h1>
    <p className="mt-4 text-muted-foreground">Your time is being held while Kem's Creation reviews your request. It is <strong className="text-foreground">pending</strong> until confirmed.</p>
    <div className="mt-8 rounded-md border border-border bg-card">
      <div className="border-b border-border p-5"><p className="text-xs uppercase tracking-widest text-muted-foreground">Booking reference</p><p className="mt-1 font-display text-3xl font-bold tracking-wider">{reference}</p></div>
      <dl className="grid gap-4 p-5 text-sm sm:grid-cols-2">
        <div><dt className="text-muted-foreground">Service</dt><dd className="mt-1 font-medium">{serviceTitle(service)}</dd></div>
        <div><dt className="text-muted-foreground">Date & time</dt><dd className="mt-1 font-medium">{format(date, "EEE d MMM yyyy")}, {formatTime(time)}</dd></div>
        <div><dt className="text-muted-foreground">Name</dt><dd className="mt-1 font-medium">{name}</dd></div>
        <div><dt className="text-muted-foreground">Phone</dt><dd className="mt-1 font-medium">{phone}</dd></div>
      </dl>
    </div>
    {depositFailed && <p className="mt-4 border-l-2 border-accent bg-surface p-4 text-sm">We couldn't start the online payment. Your booking is saved — you can pay the {DEPOSIT.label} (demo amount) deposit at the studio or from the Manage your booking page.</p>}
    {payChoice === "studio" && !depositFailed && <p className="mt-4 border-l-2 border-accent bg-surface p-4 text-sm"><strong className="font-semibold">Deposit: {DEPOSIT.label} (demo amount)</strong> — due at the studio when you visit.</p>}
    <h2 className="mt-10 font-display text-xl font-semibold">What happens next</h2>
    <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
      <li>Kem's Creation will contact you on WhatsApp or by phone to confirm your appointment.</li>
      <li>The studio address and arrival details will be shared with your confirmation.</li>
      <li>Bring any inspiration photos, fabric or event details that will help.</li>
      <li>Keep your booking reference handy in case you need to make changes.</li>
    </ol>
    <div className="mt-10 border-l-2 border-accent bg-surface p-5">
      <p className="font-display text-lg font-semibold">Need to make a change later?</p>
      <p className="mt-1 text-sm text-muted-foreground">Check your status, reschedule or cancel any time with your reference and phone number.</p>
      <Button asChild size="lg" className="mt-4"><Link to="/manage-booking" search={{ ref: reference, phone: phone.replace(/[\s-]/g, "") }}>Manage Your Booking</Link></Button>
    </div>
    <div className="mt-8 flex flex-wrap gap-3"><Button asChild size="lg" variant="outline"><Link to="/">Back to home</Link></Button><Button asChild size="lg" variant="outline"><Link to="/clothing">Explore clothing</Link></Button></div>
  </section>;
}
