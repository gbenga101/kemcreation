import { z } from "zod";

export const services = [
  { id: "bespoke", title: "Bespoke Tailoring & Measurement", detail: "Custom styling, measurements and bespoke fittings." },
  { id: "ready_to_wear", title: "Ready-to-Wear Fitting", detail: "Try on or adjust ready-made pieces." },
  { id: "occasion", title: "Occasion & Wedding Consultation", detail: "Native, Aso Ebi and event outfits." },
] as const;
export type ServiceId = (typeof services)[number]["id"];
export const serviceTitle = (id: string) => services.find((s) => s.id === id)?.title ?? id;

export const occasions = ["Wedding", "Birthday", "Corporate", "Sunday Best", "Everyday", "Other"];

/** Verified hours. Mon/Tue/Wed/Fri 9:00–18:00, Thu/Sat 10:30–18:30, Sun closed. 30-minute slots. */
export function slotsFor(date: Date): string[] {
  const day = date.getDay();
  if (day === 0) return [];
  const [open, close] = day === 4 || day === 6 ? [630, 1110] : [540, 1080];
  const out: string[] = [];
  for (let m = open; m + 30 <= close; m += 30) out.push(`${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`);
  return out;
}

export function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")}${h < 12 ? "am" : "pm"}`;
}

export const toISODate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const phoneRegex = /^(\+234|234|0)[789][01]\d{8}$/;
export const detailsSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name").max(120, "Name is too long"),
  phone: z.string().trim().transform((v) => v.replace(/[\s-]/g, "")).pipe(z.string().regex(phoneRegex, "Enter a Nigerian number, e.g. 08012345678 or +2348012345678")),
  email: z.string().trim().max(255).refine((v) => v === "" || z.string().email().safeParse(v).success, "Enter a valid email or leave it blank"),
  occasion: z.string().max(60),
  eventDate: z.string(),
  notes: z.string().trim().max(1000, "Please keep notes under 1000 characters"),
});
export type Details = z.input<typeof detailsSchema>;

export const errorMessages: Record<string, string> = {
  slot_taken: "Sorry, that time was just taken. Please choose another time.",
  closed_day: "We're closed on that day. Please choose another date.",
  invalid_date: "That date or time has passed. Please choose another.",
  invalid_time: "Please choose one of the listed times.",
  invalid_phone: "Please check your phone number.",
  invalid_name: "Please enter your full name.",
};
