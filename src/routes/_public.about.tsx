import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_public/about")({
  head: () => ({ meta: [
    { title: "Our studio & story | Kem's Creation" },
    { name: "description", content: "Kem's Creation is a women's fashion business in Badagry, Lagos State, with delivery across Lagos. See our opening hours and how it works." },
    { property: "og:title", content: "Our studio & story | Kem's Creation" },
    { property: "og:description", content: "Personalized fit and dedicated craftsmanship from Badagry, Lagos State." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }), component: AboutPage,
});

const hours = [["Monday", "9:00 AM – 6:00 PM"], ["Tuesday", "9:00 AM – 6:00 PM"], ["Wednesday", "9:00 AM – 6:00 PM"], ["Thursday", "10:30 AM – 6:30 PM"], ["Friday", "9:00 AM – 6:00 PM"], ["Saturday", "10:30 AM – 6:30 PM"], ["Sunday", "Closed"]];
const steps = [
  ["Book Your Slot", "Choose an appointment time that works for your schedule using our online booking."],
  ["Measurement & Consultation", "Meet at our Badagry studio to discuss style inspiration, fabric and precise measurements."],
  ["Fitting & Delivery", "Come in for your personalized fitting or receive your finished garment anywhere in Lagos."],
];

function AboutPage() {
  return <>
    <section className="bg-editorial text-editorial-foreground"><div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
      <p className="text-xs font-semibold uppercase tracking-widest text-editorial-foreground/70">Kem's Creation / Our story</p>
      <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-tight sm:text-6xl">Personalized Fit. Dedicated Craftsmanship.</h1>
      <p className="mt-6 max-w-2xl text-base leading-7 text-editorial-foreground/80">Kem's Creation is a dedicated women's fashion business based in Badagry, Lagos State. Our philosophy is simple: <em>automate coordination, not craftsmanship</em> — so booking your visit is seamless, while every garment still receives careful cutting, fitting and finishing by hand.</p>
    </div></section>

    <section className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:gap-20 lg:px-12 lg:py-24">
      <div>
        <span className="inline-block rounded-sm bg-secondary px-2.5 py-1 text-xs font-medium">Studio in Badagry, Lagos State</span>
        <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">Visiting the studio</h2>
        <p className="mt-4 max-w-md text-base leading-7 text-muted-foreground">Visit the studio for fittings and consultations at:</p>
        <p className="mt-2 max-w-md font-medium text-foreground">18, First Ola-Oki Street, Ibereko, Olorunda LCDA, Badagry, Lagos 103101, Lagos State</p>
        <a href="tel:+2348101067305" className="mt-3 inline-block text-sm font-medium text-accent underline underline-offset-4 hover:text-foreground">+234 810 106 7305</a>
        <div className="mt-8 border-l-2 border-accent bg-surface px-5 py-4">
          <p className="font-display text-lg font-semibold">Outside Badagry?</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">We deliver anywhere across Lagos State.</p>
        </div>
        <div className="mt-8 overflow-hidden rounded-lg border border-border">
          <iframe title="Map of 18 First Ola-Oki Street, Ibereko, Badagry" src="https://www.google.com/maps?q=18%20First%20Ola-Oki%20Street%2C%20Ibereko%2C%20Badagry%2C%20Lagos&z=15&output=embed" loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="aspect-[4/3] w-full border-0" />
        </div>
        <Button asChild variant="outline" className="mt-4"><a href="https://www.google.com/maps/dir/?api=1&destination=18%20First%20Ola-Oki%20Street%2C%20Ibereko%2C%20Badagry%2C%20Lagos" target="_blank" rel="noopener noreferrer">Get Directions on Google Maps</a></Button>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">Opening hours</p>
        <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">When we're open</h2>
        <dl className="mt-7 border-t border-border">{hours.map(([day, time]) => <div key={day} className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 border-b border-border py-4 text-sm sm:text-base"><dt className="font-medium">{day}</dt><dd className={day === "Sunday" ? "text-muted-foreground italic" : "text-muted-foreground"}>{time}</dd></div>)}</dl>
      </div>
    </section>

    <section className="border-t border-border bg-surface"><div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
      <p className="text-xs font-semibold uppercase tracking-widest text-accent">How it works</p>
      <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">The Kem's Creation journey</h2>
      <ol className="mt-10 grid gap-10 md:grid-cols-3">{steps.map(([t, d], i) => <li key={t} className="border-t-2 border-accent pt-5"><p className="text-sm font-medium text-accent">Step {i + 1}</p><h3 className="mt-1 font-display text-xl font-bold">{t}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{d}</p></li>)}</ol>
    </div></section>

    <section className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-5 py-16 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">
      <h2 className="font-display text-3xl font-bold">Ready to create your next outfit?</h2>
      <Button asChild size="lg"><Link to="/book">Book an Appointment</Link></Button>
    </section>
  </>;
}
