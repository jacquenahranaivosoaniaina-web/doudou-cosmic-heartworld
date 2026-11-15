import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

import { HudFrame } from "@/components/HudFrame";
import { supabase } from "@/integrations/supabase/client";
import { MEDIA_BUCKET, mediaQuery, type MediaItem, type MediaKind } from "@/lib/media";
import { PLANETS } from "@/lib/universe";

export const Route = createFileRoute("/_authenticated/atelier")({
  head: () => ({
    meta: [
      { title: "Atelier — Doudou, My Univers" },
      { name: "description", content: "Ajouter, remplacer ou retirer les photos, légendes et messages vocaux de l’univers." },
      { property: "og:title", content: "Atelier — Doudou, My Univers" },
      { property: "og:description", content: "Gestion privée des souvenirs de l’univers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Atelier,
});

function safeName(file: File) {
  const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin";
  return `${crypto.randomUUID()}.${(ext ?? "bin").toLowerCase().replace(/[^a-z0-9]/g, "")}`;
}

async function uploadFile(folder: string, file: File) {
  const path = `${folder}/${safeName(file)}`;
  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, { contentType: file.type });
  if (error) throw error;
  return path;
}

function useOwner() {
  return useQuery({
    queryKey: ["is-owner"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return { owner: false, email: "" };
      const { data } = await supabase.rpc("has_role", { _user_id: u.user.id, _role: "admin" });
      return { owner: !!data, email: u.user.email ?? "" };
    },
  });
}

function Atelier() {
  const owner = useOwner();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState<MediaKind>("photo");

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <main className="relative min-h-screen px-4 pb-16 pt-16 sm:px-8">
      <HudFrame topLeft="ATELIER · GESTION DE L’UNIVERS" topRight={owner.data?.email} />
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="eyebrow">✦ L’ATELIER</div>
            <h1 className="mt-2 text-5xl">Nos souvenirs</h1>
            <p className="mt-2 text-sm text-muted-foreground">Les changements apparaissent tout de suite dans l’univers.</p>
          </div>
          <div className="flex gap-2">
            <Link to="/univers/$planet" params={{ planet: "nos-souvenirs" }} className="nav-chip hud-mono hud-mono-bright">Voir la galerie</Link>
            <button type="button" className="nav-chip hud-mono" onClick={signOut}>Se déconnecter</button>
          </div>
        </div>

        {owner.isPending && <p className="hud-mono">Vérification de l’accès…</p>}
        {owner.data && !owner.data.owner && (
          <div className="hud-box p-8 text-center">
            <p className="serif-italic text-2xl text-blush">Cet atelier est réservé à la gardienne de l’univers.</p>
            <p className="mt-3 text-sm text-muted-foreground">Ce compte n’a pas le droit de modifier les souvenirs.</p>
          </div>
        )}
        {owner.data?.owner && (
          <>
            <div className="tab-row mb-6" role="tablist">
              {([
                ["photo", "📸", "Photos & légendes"],
                ["secret", "✦", "Étoiles secrètes"],
                ["audio", "🎙️", "Messages vocaux"],
              ] as const).map(([id, icon, label]) => (
                <button key={id} type="button" role="tab" aria-selected={tab === id} className={`tab-card ${tab === id ? "is-on" : ""}`} onClick={() => setTab(id)}>
                  <span className="tab-icon">{icon}</span>
                  <span className="tab-label">{label}</span>
                </button>
              ))}
            </div>
            <Manager kind={tab} />
          </>
        )}
      </div>
    </main>
  );
}

const ACCEPT: Record<MediaKind, string> = { photo: "image/*", secret: "image/*", audio: "audio/*" };

function Manager({ kind }: { kind: MediaKind }) {
  const qc = useQueryClient();
  const { data: items = [], isPending } = useQuery(mediaQuery(kind));
  const [error, setError] = useState("");
  const refresh = () => qc.invalidateQueries({ queryKey: ["media", kind] });

  async function run(task: () => Promise<unknown>) {
    setError("");
    try {
      await task();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Une erreur est survenue.");
    }
    await refresh();
  }

  async function remove(item: MediaItem) {
    if (!window.confirm("Retirer ce souvenir de l’univers ?")) return;
    await run(async () => {
      const { error: err } = await supabase.from("media_items").delete().eq("id", item.id);
      if (err) throw err;
      if (item.storage_path) await supabase.storage.from(MEDIA_BUCKET).remove([item.storage_path]);
    });
  }

  async function move(i: number, d: -1 | 1) {
    const a = items[i];
    const b = items[i + d];
    if (!a || !b) return;
    await run(async () => {
      const r1 = await supabase.from("media_items").update({ sort_order: b.sort_order === a.sort_order ? a.sort_order + d : b.sort_order }).eq("id", a.id);
      const r2 = await supabase.from("media_items").update({ sort_order: a.sort_order }).eq("id", b.id);
      if (r1.error) throw r1.error;
      if (r2.error) throw r2.error;
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <AddForm kind={kind} nextOrder={(items.at(-1)?.sort_order ?? 0) + 1} onDone={refresh} />
      {error && <div role="alert" className="text-sm text-destructive">{error}</div>}
      {isPending && <p className="hud-mono">Chargement…</p>}
      {!isPending && !items.length && <p className="text-center text-sm text-muted-foreground">Rien ici pour l’instant.</p>}
      {items.map((item, i) => (
        <ItemRow
          key={item.id}
          item={item}
          kind={kind}
          first={i === 0}
          last={i === items.length - 1}
          onMove={(d) => move(i, d)}
          onRemove={() => remove(item)}
          run={run}
        />
      ))}
    </div>
  );
}

function PlanetSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select className="atelier-input" value={value} onChange={(e) => onChange(e.target.value)} aria-label="Planète">
      {PLANETS.map((p) => (
        <option key={p.slug} value={p.slug}>{p.name}</option>
      ))}
    </select>
  );
}

function AddForm({ kind, nextOrder, onDone }: { kind: MediaKind; nextOrder: number; onDone: () => void }) {
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [planet, setPlanet] = useState("mon-univers");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const needsFile = kind !== "secret";

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (needsFile && !file) return;
    setBusy(true);
    setMsg("");
    try {
      const storage_path = file ? await uploadFile(kind, file) : null;
      const { error } = await supabase.from("media_items").insert({
        kind,
        title,
        caption,
        storage_path,
        planet: kind === "audio" ? planet : null,
        sort_order: nextOrder,
      });
      if (error) throw error;
      setTitle("");
      setCaption("");
      setFile(null);
      (e.target as HTMLFormElement).reset();
      setMsg("Ajouté à l’univers ✦");
      onDone();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "L’ajout n’a pas fonctionné.");
    }
    setBusy(false);
  }

  const label = kind === "photo" ? "Ajouter une photo" : kind === "secret" ? "Ajouter une étoile secrète" : "Ajouter un message vocal";
  return (
    <form onSubmit={submit} className="hud-box atelier-form">
      <div className="eyebrow">＋ {label.toUpperCase()}</div>
      {needsFile && (
        <input className="atelier-input" type="file" accept={ACCEPT[kind]} required onChange={(e) => setFile(e.target.files?.[0] ?? null)} aria-label="Fichier" />
      )}
      {kind === "secret" && (
        <input className="atelier-input" type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} aria-label="Photo (facultative)" />
      )}
      <input className="atelier-input" placeholder={kind === "audio" ? "Titre (ex. Mon message pour toi)" : "Titre"} value={title} onChange={(e) => setTitle(e.target.value)} required={kind !== "photo"} />
      {kind !== "audio" && (
        <textarea className="atelier-input" rows={2} placeholder={kind === "photo" ? "Légende romantique" : "Le souvenir secret"} value={caption} onChange={(e) => setCaption(e.target.value)} required />
      )}
      {kind === "audio" && <PlanetSelect value={planet} onChange={setPlanet} />}
      <div className="flex items-center gap-3">
        <button type="submit" className="cosmic-btn" disabled={busy}>{busy ? "Envoi…" : "Ajouter"}</button>
        <span className="text-xs text-muted-foreground" role="status">{msg}</span>
      </div>
    </form>
  );
}

function ItemRow({
  item,
  kind,
  first,
  last,
  onMove,
  onRemove,
  run,
}: {
  item: MediaItem;
  kind: MediaKind;
  first: boolean;
  last: boolean;
  onMove: (d: -1 | 1) => void;
  onRemove: () => void;
  run: (task: () => Promise<unknown>) => Promise<void>;
}) {
  const [title, setTitle] = useState(item.title);
  const [caption, setCaption] = useState(item.caption);
  const [planet, setPlanet] = useState(item.planet ?? "mon-univers");
  const dirty = title !== item.title || caption !== item.caption || planet !== (item.planet ?? "mon-univers");

  function save() {
    return run(async () => {
      const { error } = await supabase
        .from("media_items")
        .update({ title, caption, planet: kind === "audio" ? planet : item.planet })
        .eq("id", item.id);
      if (error) throw error;
    });
  }

  function replace(file: File) {
    return run(async () => {
      const storage_path = await uploadFile(kind, file);
      const { error } = await supabase.from("media_items").update({ storage_path, url: null }).eq("id", item.id);
      if (error) throw error;
      if (item.storage_path) await supabase.storage.from(MEDIA_BUCKET).remove([item.storage_path]);
    });
  }

  return (
    <div className="hud-box atelier-row">
      <div className="atelier-thumb">
        {kind === "audio" ? (
          item.src ? <audio controls src={item.src} preload="none" className="w-full" /> : <span>🎙️</span>
        ) : item.src ? (
          <img src={item.src} alt={item.title} loading="lazy" />
        ) : (
          <span>✦</span>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <input className="atelier-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre" aria-label="Titre" />
        {kind !== "audio" && (
          <textarea className="atelier-input" rows={2} value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Légende" aria-label="Légende" />
        )}
        {kind === "audio" && <PlanetSelect value={planet} onChange={setPlanet} />}
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="nav-chip hud-mono hud-mono-bright" disabled={!dirty} onClick={save}>Enregistrer</button>
          <label className="nav-chip hud-mono hud-mono-bright cursor-pointer">
            Remplacer le fichier
            <input type="file" accept={ACCEPT[kind]} className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) void replace(f); }} />
          </label>
          <button type="button" className="nav-chip hud-mono" disabled={first} onClick={() => onMove(-1)} aria-label="Monter">↑</button>
          <button type="button" className="nav-chip hud-mono" disabled={last} onClick={() => onMove(1)} aria-label="Descendre">↓</button>
          <button type="button" className="nav-chip hud-mono text-destructive" onClick={onRemove}>Retirer</button>
        </div>
      </div>
    </div>
  );
}
