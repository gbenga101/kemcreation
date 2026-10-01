import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_public/clothing")({
  head: () => ({ meta: [
    { title: "Clothing | Kem's Creation" },
    { name: "description", content: "Explore Kem's Creation's ready-to-wear, bespoke, African wear, corporate wear, occasion wear, and clothing for women and girls." },
    { property: "og:title", content: "Clothing | Kem's Creation" },
    { property: "og:description", content: "Explore women's ready-to-wear and bespoke clothing from Kem's Creation in Badagry, Lagos." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }), component: ClothingPage,
});

const categories = [
  { name: "Ready-to-wear", detail: "Women's clothing, ready for your wardrobe." },
  { name: "Bespoke & custom", detail: "Clothing created around your individual requirements." },
  { name: "Native & African wear", detail: "Styles in native and African wear." },
  { name: "Corporate wear", detail: "Women's clothing for professional settings." },
  { name: "Occasion & wedding", detail: "Outfits for important occasions and celebrations." },
  { name: "Clothing for girls", detail: "Clothing for young children." },
];
function ClothingPage() {
  return <><section className="border-b border-border bg-surface"><div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12 lg:py-24"><p className="text-xs font-semibold uppercase tracking-widest text-accent">Kem's Creation / Clothing</p><h1 className="mt-4 max-w-3xl font-display text-6xl font-semibold leading-none sm:text-7xl">What we make.</h1><p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground">Women's ready-to-wear and bespoke clothing, across everyday dressing, work and occasions.</p></div></section><section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-12 lg:py-20"><div className="grid gap-x-12 sm:grid-cols-2">{categories.map((item) => <article key={item.name} className="flex min-h-40 flex-col justify-center border-b border-border py-7 sm:min-h-48 sm:py-9"><h2 className="font-display text-4xl font-semibold leading-tight">{item.name}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{item.detail}</p></article>)}</div><p className="mt-7 max-w-2xl text-sm leading-7 text-muted-foreground">Specific styles, pricing and availability are discussed directly with the business. An online enquiry and appointment experience is planned, but is not available at this stage.</p></section></>;
}
