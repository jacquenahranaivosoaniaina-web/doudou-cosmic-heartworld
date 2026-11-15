import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, type CSSProperties } from "react";

import { Burst, RevealWords, useInView } from "@/components/experiences/Reveal";
import { mediaQuery, type MediaItem } from "@/lib/media";

/* Repeating pattern that makes the gallery feel scattered rather than a grid. */
const SIZES = ["memory-lg", "memory-md", "memory-sm", "memory-md", "memory-lg", "memory-sm"];
const TILTS = [-4, 3, -2, 5, -3, 2, -5];
const SHIFTS = [0, 40, -20, 60, 10, -30, 30];
const STAR_SPOTS = [
  { top: "6%", left: "48%" },
  { top: "34%", left: "4%" },
  { top: "58%", left: "94%" },
  { top: "86%", left: "40%" },
  { top: "20%", left: "88%" },
  { top: "72%", left: "12%" },
];

function MemoryCard({ item, index, onOpen }: { item: MediaItem; index: number; onOpen: () => void }) {
  const { ref, seen } = useInView<HTMLDivElement>();
  const style = {
    "--tilt": `${TILTS[index % TILTS.length]}deg`,
    "--shift": `${SHIFTS[index % SHIFTS.length]}px`,
    "--float-delay": `${(index % 5) * -1.3}s`,
  } as CSSProperties;
  return (
    <div ref={ref} className={`memory ${SIZES[index % SIZES.length]} ${seen ? "is-seen" : ""}`} style={style}>
      <button type="button" className="memory-frame" onClick={onOpen} aria-label={`Agrandir : ${item.caption || item.title}`}>
        {item.src && <img src={item.src} alt={item.caption || item.title} loading="lazy" />}
        <span className="memory-sheen" />
        <span className="memory-sparkle" />
        <span className="memory-sparkle" />
        <span className="memory-sparkle" />
      </button>
      {seen && item.caption && (
        <p className="memory-caption serif-italic">
          <RevealWords text={`« ${item.caption} »`} delay={350} />
        </p>
      )}
    </div>
  );
}

function Overlay({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);
  return (
    <div className="overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="overlay-inner" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="overlay-close" onClick={onClose} aria-label="Fermer">✕</button>
        {children}
      </div>
    </div>
  );
}

export function SouvenirsExperience() {
  const photos = useQuery(mediaQuery("photo"));
  const secrets = useQuery(mediaQuery("secret"));
  const [open, setOpen] = useState<number | null>(null);
  const [secret, setSecret] = useState<MediaItem | null>(null);
  const [found, setFound] = useState<string[]>([]);
  const list = (photos.data ?? []).filter((p) => p.src);
  const stars = (secrets.data ?? []).slice(0, STAR_SPOTS.length);
  const current = open === null ? null : list[open];

  function step(d: number) {
    if (open === null || !list.length) return;
    setOpen((open + d + list.length) % list.length);
  }

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="exp-stack">
      <div className="exp-head justify-center gap-6 text-center">
        <span className="eyebrow">TOUCHE UN SOUVENIR POUR L’AGRANDIR</span>
        {stars.length > 0 && (
          <span className="hud-mono hud-mono-bright">✦ ÉTOILES SECRÈTES {found.length}/{stars.length}</span>
        )}
      </div>

      {photos.isPending && <div className="memory-loading">Les souvenirs arrivent des étoiles…</div>}
      {photos.isError && <div className="archive-note">Les souvenirs n’ont pas pu se charger. Réessaie dans un instant.</div>}

      <div className="memory-field">
        {list.map((item, i) => (
          <MemoryCard key={item.id} item={item} index={i} onOpen={() => setOpen(i)} />
        ))}
        {stars.map((s, i) => (
          <button
            key={s.id}
            type="button"
            className={`secret-star ${found.includes(s.id) ? "is-found" : ""}`}
            style={STAR_SPOTS[i]}
            aria-label="Étoile secrète"
            onClick={() => {
              setSecret(s);
              setFound((f) => (f.includes(s.id) ? f : [...f, s.id]));
            }}
          >
            ✦
          </button>
        ))}
      </div>

      {current && (
        <Overlay onClose={() => setOpen(null)}>
          <figure key={current.id} className="lightbox">
            <img src={current.src ?? ""} alt={current.caption || current.title} />
            <figcaption className="lightbox-caption serif-italic">
              <RevealWords text={`« ${current.caption} »`} delay={300} step={90} />
            </figcaption>
          </figure>
          {list.length > 1 && (
            <div className="lightbox-nav">
              <button type="button" className="nav-chip hud-mono hud-mono-bright" onClick={() => step(-1)}>← Précédent</button>
              <span className="hud-mono">{(open ?? 0) + 1} / {list.length}</span>
              <button type="button" className="nav-chip hud-mono hud-mono-bright" onClick={() => step(1)}>Suivant →</button>
            </div>
          )}
        </Overlay>
      )}

      {secret && (
        <Overlay onClose={() => setSecret(null)}>
          <div className="hud-box secret-card rise-in">
            <Burst id={secret.id} count={20} />
            <div className="eyebrow">✦ SOUVENIR SECRET</div>
            <h3 className="exp-title my-3">{secret.title}</h3>
            {secret.src && <img className="secret-img" src={secret.src} alt={secret.title} />}
            <p className="serif-italic text-blush text-xl">
              <RevealWords text={secret.caption} delay={250} />
            </p>
          </div>
        </Overlay>
      )}
    </div>
  );
}
