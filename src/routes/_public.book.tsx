import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_public/book")({
  head: () => ({ meta: [
    { title: "Book an appointment | Kem's Creation" },
    { name: "description", content: "Online appointment and consultation booking for Kem's Creation in Badagry, Lagos is coming soon." },
    { property: "og:title", content: "Book an appointment | Kem's Creation" },
    { property: "og:description", content: "Online booking for Kem's Creation is coming soon." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: BookPage,
});

function BookPage() {
  return <section className="mx-auto max-w-3xl px-5 py-20 sm:px-8 lg:py-28">
    <p className="text-xs font-semibold uppercase tracking-widest text-accent">Appointments & consultations</p>
    <h1 className="mt-4 font-display text-4xl font-bold leading-tight sm:text-5xl">Online booking is coming soon.</h1>
    <p className="mt-6 text-base leading-7 text-muted-foreground">We're preparing a simple way to request a fitting or consultation online. It isn't available yet, so no request can be sent from this page.</p>
    <div className="mt-8 flex flex-wrap gap-3"><Button asChild size="lg"><Link to="/clothing">Explore clothing</Link></Button><Button asChild size="lg" variant="outline"><Link to="/about">Opening hours</Link></Button></div>
  </section>;
}
