import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/owner_/login")({
  ssr: false,
  head: () => ({ meta: [
    { title: "Owner sign-in | Kem's Creation" },
    { name: "description", content: "Private sign-in for the Kem's Creation owner workspace." },
    { property: "og:title", content: "Owner sign-in | Kem's Creation" },
    { property: "og:description", content: "Private sign-in for the owner of Kem's Creation." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [ownerExists, setOwnerExists] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "error" | "info"; text: string } | null>(null);

  useEffect(() => { void supabase.rpc("owner_exists").then(({ data }) => setOwnerExists(data !== false)); }, []);

  async function enter() {
    const { data: ok } = await supabase.rpc("claim_owner");
    if (!ok) { await supabase.auth.signOut(); setMsg({ kind: "error", text: "This account doesn't have access to the owner workspace." }); return; }
    navigate({ to: "/owner", replace: true });
  }

  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setMsg(null);
    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg({ kind: "error", text: "Email or password is incorrect." }); else await enter();
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/owner/login` } });
      if (error) setMsg({ kind: "error", text: error.message });
      else if (data.session) await enter();
      else setMsg({ kind: "info", text: "Check your email and click the confirmation link, then sign in here." });
    }
    setBusy(false);
  }

  return <div className="flex min-h-screen items-center justify-center bg-background px-5 py-12">
    <div className="w-full max-w-sm">
      <Link to="/" className="font-display text-3xl font-semibold">Kem's Creation</Link>
      <h1 className="mt-8 font-display text-2xl font-semibold">{mode === "signin" ? "Owner sign-in" : "Create the owner account"}</h1>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{mode === "signin" ? "Private access to appointments and schedule." : "The first account created becomes the only owner account."}</p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <div className="space-y-1.5"><Label htmlFor="email">Email</Label><Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div className="space-y-1.5"><Label htmlFor="password">Password</Label><Input id="password" type="password" minLength={8} autoComplete={mode === "signin" ? "current-password" : "new-password"} required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        {msg && <p role="alert" className={msg.kind === "error" ? "text-sm text-destructive" : "text-sm text-foreground"}>{msg.text}</p>}
        <Button type="submit" size="lg" className="w-full" disabled={busy}>{busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}</Button>
      </form>
      {!ownerExists && <button type="button" className="mt-5 text-sm text-accent underline underline-offset-4" onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setMsg(null); }}>{mode === "signin" ? "First time? Create the owner account" : "Already have an account? Sign in"}</button>}
    </div>
  </div>;
}
