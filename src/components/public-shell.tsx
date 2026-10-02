import { useState } from "react";
import { Link, Outlet } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const links = [{ to: "/" as const, label: "Home" }, { to: "/clothing" as const, label: "Clothing" }, { to: "/about" as const, label: "About" }];

export function PublicShell() {
  const [open, setOpen] = useState(false);
  return <div className="min-h-screen bg-background">
    <header className="relative z-20 border-b border-border bg-background">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-4 sm:px-8 lg:px-12">
        <Link to="/" onClick={() => setOpen(false)} className="min-w-0 font-display text-3xl font-semibold leading-none text-foreground sm:text-4xl" aria-label="Kem's Creation home">Kem's Creation</Link>
        <nav aria-label="Primary navigation" className="hidden items-center gap-9 md:flex">{links.map((link) => <Link key={link.to} to={link.to} activeProps={{ className: "text-accent" }} activeOptions={{ exact: true }} className="text-sm font-medium text-foreground transition-colors hover:text-accent">{link.label}</Link>)}<Link to="/manage-booking" activeProps={{ className: "text-accent" }} className="text-sm font-medium text-foreground transition-colors hover:text-accent">Manage booking</Link><Button asChild><Link to="/book">Book Appointment</Link></Button></nav>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</Button>
      </div>
      {open && <nav aria-label="Mobile navigation" className="border-t border-border bg-background px-5 py-3 md:hidden">{links.map((link) => <Link key={link.to} to={link.to} onClick={() => setOpen(false)} className="block border-b border-border py-3 text-base font-medium">{link.label}</Link>)}<Link to="/manage-booking" onClick={() => setOpen(false)} className="block border-b border-border py-3 text-base font-medium">Manage booking</Link><Button asChild size="lg" className="mt-4 w-full"><Link to="/book" onClick={() => setOpen(false)}>Book Appointment</Link></Button></nav>}
    </header>
    <main id="main-content"><Outlet /></main>
    <footer className="bg-editorial text-editorial-foreground"><div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-2 lg:px-12"><div><p className="font-display text-4xl font-semibold">Kem's Creation</p><p className="mt-3 max-w-sm text-sm leading-relaxed text-editorial-foreground/75">Women's ready-to-wear and bespoke clothing. Studio in Badagry, Lagos State, Nigeria. Delivery available across all of Lagos State.</p></div><div className="flex flex-col items-start gap-3 md:items-end"><Link to="/clothing" className="text-sm underline-offset-4 hover:underline">Explore clothing</Link><Link to="/about" className="text-sm underline-offset-4 hover:underline">About & opening hours</Link><Link to="/manage-booking" className="text-sm underline-offset-4 hover:underline">Manage your booking</Link></div></div><div className="mx-auto max-w-7xl border-t border-editorial-foreground/20 px-5 py-5 text-xs text-editorial-foreground/65 sm:px-8 lg:px-12">© {new Date().getFullYear()} Kem's Creation. Temporary website identity.</div></footer>
  </div>;
}
