import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_public/about")({
  head: () => ({ meta: [
    { title: "About & opening hours | Kem's Creation" },
    { name: "description", content: "Kem's Creation is a women's fashion business in Badagry, Lagos, offering ready-to-wear and bespoke clothing with delivery across Lagos." },
    { property: "og:title", content: "About & opening hours | Kem's Creation" },
    { property: "og:description", content: "Learn about Kem's Creation in Badagry, Lagos, and see the business's confirmed opening hours." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }), component: AboutPage,
});
const hours = [["Monday", "9:00am–6:00pm"], ["Tuesday", "9:00am–6:00pm"], ["Wednesday", "9:00am–6:00pm"], ["Thursday", "10:30am–6:30pm"], ["Friday", "9:00am–6:00pm"], ["Saturday", "10:30am–6:30pm"]];
function AboutPage() {
  return <><section className="bg-editorial text-editorial-foreground"><div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12 lg:py-24"><p className="text-xs font-semibold uppercase tracking-widest text-editorial-foreground/70">Kem's Creation / About</p><h1 className="mt-4 max-w-3xl font-display text-6xl font-semibold leading-none sm:text-7xl">Fashion, made personal.</h1><p className="mt-6 max-w-xl text-base leading-7 text-editorial-foreground/80">Kem's Creation makes and sells women's clothing, including ready-to-wear pieces and bespoke work.</p></div></section><section className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:gap-24 lg:px-12 lg:py-24"><div><p className="text-xs font-semibold uppercase tracking-widest text-accent">Badagry, Lagos</p><h2 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">Based in Badagry.</h2><p className="mt-4 max-w-md text-base leading-8 text-muted-foreground">Kem's Creation is based in Badagry, Lagos State. Delivery is available anywhere in Lagos.</p><p className="mt-5 max-w-md border-l-2 border-accent pl-4 text-sm leading-7 text-muted-foreground">A street address and visit instructions have not yet been provided for this site. Online appointments are not available yet.</p><Link to="/clothing" className="mt-7 inline-flex text-sm font-medium text-accent underline underline-offset-4 hover:text-foreground">Explore clothing</Link></div><div><p className="text-xs font-semibold uppercase tracking-widest text-accent">Confirmed working hours</p><h2 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">Opening hours.</h2><dl className="mt-7 border-t border-border">{hours.map(([day, time]) => <div key={day} className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 border-b border-border py-4 text-sm sm:text-base"><dt className="font-medium">{day}</dt><dd className="text-muted-foreground">{time}</dd></div>)}</dl><p className="mt-4 text-xs text-muted-foreground">Sunday hours have not been supplied.</p></div></section></>;
}
