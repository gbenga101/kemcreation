import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import fabricImage from "@/assets/editorial-fabric.jpg";
import readyImage from "@/assets/cat-ready.jpg";
import bespokeImage from "@/assets/cat-bespoke.jpg";
import occasionImage from "@/assets/cat-occasion.jpg";

const categories = [
  { title: "Ready-to-wear", description: "Polished everyday pieces, ready for your wardrobe.", action: "Explore Ready-to-Wear", to: "/clothing" as const, image: readyImage, alt: "Illustrative image of a woman in a linen waistcoat and trousers" },
  { title: "Bespoke & custom", description: "Clothing shaped around your measurements and vision.", action: "Book Bespoke Fitting", to: "/book" as const, image: bespokeImage, alt: "Illustrative image of a tailor fitting a dress" },
  { title: "Occasion wear", description: "Native and celebration outfits for your big days.", action: "View Occasion Wear", to: "/clothing" as const, image: occasionImage, alt: "Illustrative image of a woman in lace with a gele" },
];

export const Route = createFileRoute("/_public/")({
  head: () => ({ meta: [
    { title: "Kem's Creation | Women's fashion in Badagry, Lagos" },
    { name: "description", content: "Discover ready-to-wear and bespoke women's clothing from Kem's Creation in Badagry, Lagos. Delivery available across Lagos." },
    { property: "og:title", content: "Kem's Creation | Women's fashion in Badagry, Lagos" },
    { property: "og:description", content: "Ready-to-wear and bespoke women's clothing, based in Badagry with delivery across Lagos." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: HomePage,
});

function HomePage() {
  return <>
    <section className="relative isolate flex min-h-[560px] items-end overflow-hidden bg-editorial text-editorial-foreground sm:min-h-[650px] lg:min-h-[680px]">
      <img src={fabricImage} alt="Illustrative textile composition; not a Kem's Creation product photograph" width={1536} height={1024} className="absolute inset-0 -z-20 h-full w-full object-cover object-[60%_center]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,color-mix(in_oklab,var(--editorial)_65%,transparent)_0%,color-mix(in_oklab,var(--editorial)_28%,transparent)_43%,transparent_82%)] max-sm:bg-[linear-gradient(0deg,color-mix(in_oklab,var(--editorial)_77%,transparent)_0%,color-mix(in_oklab,var(--editorial)_30%,transparent)_65%,transparent_100%)]" aria-hidden="true" />
      <div className="mx-auto w-full max-w-7xl px-5 pb-12 pt-28 sm:px-8 sm:pb-16 lg:px-12 lg:pb-20"><p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-editorial-foreground">Badagry, Lagos · Women's fashion</p><h1 className="max-w-3xl font-display text-5xl font-bold leading-[1.02] sm:text-6xl lg:text-7xl">Kem's Creation</h1><p className="mt-6 max-w-lg text-base leading-relaxed text-editorial-foreground sm:text-lg">Ready-to-wear and bespoke clothing for the moments, places and people that matter to you.</p><div className="mt-8 flex flex-wrap gap-3"><Button asChild variant="light" size="lg" className="border border-editorial-foreground/70"><Link to="/book">Book an appointment</Link></Button><Button asChild variant="outline" size="lg" className="border-editorial-foreground/70 bg-transparent text-editorial-foreground hover:bg-editorial-foreground/10 hover:text-editorial-foreground"><Link to="/clothing">Explore what we make</Link></Button></div><p className="mt-8 text-xs text-editorial-foreground">Illustrative image — not a Kem's Creation garment</p></div>
    </section>
    <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12 lg:py-24"><div className="mb-10 flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-widest text-accent">What we make</p><h2 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">Explore the collection</h2></div><Link to="/clothing" className="hidden text-sm font-medium text-accent underline underline-offset-4 hover:text-foreground sm:inline-flex">View all categories</Link></div><div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">{categories.map((c) => <article key={c.title} className="group"><Link to={c.to} className="block overflow-hidden rounded-lg bg-surface"><img src={c.image} alt={c.alt} width={768} height={1024} loading="lazy" className="aspect-[3/4] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" /></Link><h3 className="mt-5 font-display text-2xl font-bold">{c.title}</h3><p className="mt-1.5 text-sm leading-6 text-muted-foreground">{c.description}</p><Link to={c.to} className="mt-3 inline-flex text-sm font-medium text-accent underline decoration-accent/40 underline-offset-4 transition-colors hover:decoration-accent">{c.action}</Link></article>)}</div><p className="mt-8 text-xs text-muted-foreground">Illustrative images — not Kem's Creation garments.</p></section>
    <section className="bg-surface"><div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-12 lg:py-20"><div className="grid gap-8 rounded-lg border border-border bg-card p-7 sm:p-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] md:items-center md:gap-14"><div><p className="text-xs font-semibold uppercase tracking-widest text-accent">Our studio</p><h2 className="mt-3 font-display text-3xl font-bold leading-tight sm:text-4xl">Badagry, Lagos State</h2></div><div><p className="text-sm leading-7 text-muted-foreground md:text-base">Kem's Creation is based in Badagry. <span className="font-medium text-foreground">Delivery is available anywhere in Lagos.</span> Visit the studio at 18, First Ola-Oki Street, Ibereko, Olorunda LCDA, Badagry, Lagos 103101, Lagos State.</p><p className="mt-3 text-sm leading-7 text-muted-foreground md:text-base">Questions before booking? Call <a href="tel:+2348101067305" className="font-medium text-foreground underline underline-offset-4 hover:text-accent">+234 810 106 7305</a>.</p><div className="mt-6 flex flex-wrap items-center gap-5"><Button asChild><Link to="/book">Book a consultation</Link></Button><Link to="/about" className="text-sm font-medium text-accent underline underline-offset-4 hover:text-foreground">Opening hours</Link></div></div></div></div></section>
  </>;
}
