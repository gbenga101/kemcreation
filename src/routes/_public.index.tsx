import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, MapPin, MoveUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import fabricImage from "@/assets/editorial-fabric.jpg";

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
      <div className="absolute inset-0 -z-10 bg-editorial/65 sm:bg-editorial/55" aria-hidden="true" />
      <div className="mx-auto w-full max-w-7xl px-5 pb-12 pt-28 sm:px-8 sm:pb-16 lg:px-12 lg:pb-20"><p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-editorial-foreground/85">Badagry, Lagos · Women's fashion</p><h1 className="max-w-3xl font-display text-6xl leading-[0.95] sm:text-7xl lg:text-8xl">Kem's Creation<span className="text-secondary">.</span></h1><p className="mt-6 max-w-lg text-base leading-relaxed text-editorial-foreground/90 sm:text-lg">Ready-to-wear and bespoke clothing for the moments, places and people that matter to you.</p><Button asChild variant="light" size="lg" className="mt-8"><Link to="/clothing">Explore what we make <ArrowUpRight aria-hidden="true" /></Link></Button><p className="mt-8 text-xs text-editorial-foreground/75">Illustrative image — not a Kem's Creation garment</p></div>
    </section>
    <section className="border-b border-border bg-background"><div className="mx-auto grid max-w-7xl gap-6 px-5 py-10 sm:px-8 md:grid-cols-[1fr_auto] md:items-center lg:px-12"><div><p className="text-xs font-semibold uppercase tracking-widest text-accent">Made for your wardrobe</p><h2 className="mt-2 font-display text-4xl leading-tight sm:text-5xl">Clothing with a personal point of view.</h2></div><p className="max-w-md text-sm leading-7 text-muted-foreground md:text-base">From everyday pieces to clothing for celebrations, explore the categories Kem's Creation works across.</p></div></section>
    <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12 lg:py-24"><div className="mb-8 flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-widest text-accent">What we make</p><h2 className="mt-2 font-display text-4xl sm:text-5xl">Explore the collection</h2></div><Link to="/clothing" className="hidden items-center gap-2 text-sm font-medium text-accent underline underline-offset-4 sm:inline-flex">View all categories <ArrowRight className="size-4" /></Link></div><div className="grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">{[
      ["01", "Ready-to-wear", "Women's clothing for everyday dressing."],
      ["02", "Bespoke & custom", "Clothing made around your individual needs."],
      ["03", "Occasion wear", "Outfits for celebrations and weddings."],
    ].map(([number, title, description]) => <Link to="/clothing" key={title} className="group flex min-h-64 flex-col justify-between bg-card p-7 transition-colors hover:bg-surface sm:p-9"><span className="text-xs text-accent">{number} / 03</span><div><h3 className="font-display text-4xl leading-none">{title}</h3><p className="mt-4 text-sm leading-6 text-muted-foreground">{description}</p><MoveUpRight aria-hidden="true" className="mt-6 size-5 text-accent transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></div></Link>)}</div><Link to="/clothing" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-accent underline underline-offset-4 sm:hidden">View all categories <ArrowRight className="size-4" /></Link></section>
    <section className="bg-surface"><div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:px-8 md:grid-cols-[auto_1fr] md:items-center md:gap-12 lg:px-12 lg:py-20"><MapPin aria-hidden="true" className="size-9 text-accent" /><div><p className="text-xs font-semibold uppercase tracking-widest text-accent">Where we're based</p><h2 className="mt-2 font-display text-4xl sm:text-5xl">Badagry, Lagos.</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">Kem's Creation is based in Badagry and is open to delivery anywhere in Lagos. Exact visit details are not available online yet.</p><Link to="/about" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-accent underline underline-offset-4">More about us <ArrowRight className="size-4" /></Link></div></div></section>
  </>;
}
