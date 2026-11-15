import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";

import { HudFrame } from "@/components/HudFrame";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Connexion à l’atelier — Doudou, My Univers" },
      { name: "description", content: "Espace privé pour gérer les photos, légendes et messages vocaux de l’univers." },
      { property: "og:title", content: "Atelier — Doudou, My Univers" },
      { property: "og:description", content: "Espace privé de gestion de l’univers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/atelier", replace: true });
    });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) navigate({ to: "/atelier", replace: true });
    });
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg("E-mail ou mot de passe incorrect.");
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth` },
      });
      if (error) setMsg(error.message);
      else if (!data.session) setMsg("Vérifie ta boîte mail pour confirmer ton compte ✉️");
    }
    setBusy(false);
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: `${window.location.origin}/auth` });
    if (result.error) setMsg("La connexion avec Google n’a pas abouti.");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-16">
      <HudFrame topLeft="ATELIER · ACCÈS PRIVÉ" />
      <form onSubmit={submit} className="hud-box rise-in w-full max-w-md p-8 text-center">
        <div className="eyebrow">✦ L’ATELIER DE L’UNIVERS</div>
        <h1 className="my-3 text-4xl">{mode === "in" ? "Connexion" : "Créer mon accès"}</h1>
        <p className="mb-6 text-xs text-muted-foreground">
          Le tout premier compte créé devient la gardienne de l’univers : lui seul peut modifier les photos et la voix.
        </p>
        <button type="button" className="google-btn" onClick={google}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>
          Continuer avec Google
        </button>
        <div className="my-5 hud-mono">— OU —</div>
        <input className="cosmic-field mb-3 tracking-normal" type="email" required placeholder="E-mail" aria-label="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        <input className="cosmic-field mb-4 tracking-normal" type="password" required minLength={6} placeholder="Mot de passe" aria-label="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "in" ? "current-password" : "new-password"} />
        <button type="submit" className="cosmic-btn cosmic-btn-primary" disabled={busy}>
          {mode === "in" ? "Entrer dans l’atelier" : "Créer mon accès"}
        </button>
        <div role="alert" className="mt-3 min-h-5 text-xs text-destructive">{msg}</div>
        <button type="button" className="mt-2 text-xs text-lavender underline" onClick={() => { setMode(mode === "in" ? "up" : "in"); setMsg(""); }}>
          {mode === "in" ? "Première visite ? Créer mon accès" : "J’ai déjà un accès"}
        </button>
      </form>
    </main>
  );
}
