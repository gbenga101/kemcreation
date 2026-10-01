import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import catReady from "@/assets/cat-ready.jpg";
import catBespoke from "@/assets/cat-bespoke.jpg";
import catOccasion from "@/assets/cat-occasion.jpg";

export const Route = createFileRoute("/_public/clothing")({
  head: () => ({ meta: [
    { title: "Clothing collection | Kem's Creation" },
    { name: "description", content: "Ready-to-wear, bespoke tailoring, native & African wear, corporate wear, occasion & wedding wear and girls' clothing from Kem's Creation, Badagry." },
    { property: "og:title", content: "Clothing collection | Kem's Creation" },
    { property: "og:description", content: "Curated women's fashion crafted in Badagry and delivered across Lagos." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }), component: ClothingPage,
});

const categories: { name: string; detail: string; img?: string }[] = [
  { name: "Ready-to-Wear", detail: "Effortless elegance and everyday statement silhouettes crafted for immediate comfort and refined daily styling.", img: catReady },
  { name: "Bespoke & Custom Tailoring", detail: "One-on-one tailored garments made to your exact measurements, fabric choice, and personal silhouette.", img: catBespoke },
  { name: "Native & African Wear", detail: "Timeless traditional elegance featuring rich Ankara prints, intricate laces, and bespoke African styles for cultural pride." },
  { name: "Female Corporate Wear", detail: "Sharp, contemporary blazers, bespoke trousers, and structured dresses designed for confidence in the workplace." },
  { name: "Occasion & Wedding Wear", detail: "Show-stopping gowns, bridal party outfits, and celebratory attire crafted to make milestone events unforgettable.", img: catOccasion },
  { name: "Children's & Young Girls' Wear", detail: "Exquisitely tailored, playful, and comfortable traditional and occasion outfits for young girls." },
];

function ClothingPage() {
  return <>
    <section className="border-b border-border bg-surface"><div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
      <p className="text-xs font-semibold uppercase tracking-widest text-accent">Kem's Creation / Clothing</p>
      <h1 className="mt-4 max-w-4xl font-display text-4xl font-bold leading-tight sm:text-6xl">Curated Fashion, Tailored for Every Moment</h1>
      <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground">From everyday ready-to-wear pieces to bespoke native attire and celebratory occasion wear. Crafted with precision in Badagry, delivered across Lagos.</p>
    </div></section>
    <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
      <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => <article key={c.name} className="flex flex-col">
          {c.img
            ? <img src={c.img} alt="" loading="lazy" width={768} height={1024} className="aspect-[3/4] w-full rounded-lg object-cover" />
            : <div className="flex aspect-[3/4] w-full items-end rounded-lg bg-surface p-6"><p className="font-display text-2xl font-semibold text-muted-foreground">{c.name}</p></div>}
          <span className="mt-5 self-start rounded-sm bg-secondary px-2.5 py-1 text-xs font-medium">Delivery available across Lagos</span>
          <h2 className="mt-3 font-display text-2xl font-bold">{c.name}</h2>
          <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{c.detail}</p>
          <Button asChild variant="outline" className="mt-5 self-start"><Link to="/book">Book Consultation / Fitting</Link></Button>
        </article>)}
      </div>
      <p className="mt-10 text-xs text-muted-foreground">Illustrative images — not Kem's Creation garments. Categories without a photo are awaiting real images of Kem's work.</p>
    </section>
    <section className="bg-editorial text-editorial-foreground"><div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-5 py-14 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">
      <h2 className="font-display text-3xl font-bold">Looking for a custom style not listed here?</h2>
      <Button asChild size="lg" variant="secondary"><Link to="/book">Schedule a Custom Fitting</Link></Button>
    </div></section>
  </>;
}
