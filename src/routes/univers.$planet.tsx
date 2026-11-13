import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { useUnlocked } from "@/hooks/use-unlocked";
import {
  COUNTDOWN_END_SYMBOL,
  COUNTDOWN_START,
  getPlanet,
  SURPRISE_MESSAGE,
  type Planet,
} from "@/lib/universe";

export const Route = createFileRoute("/univers/$planet")({
  loader: ({ params }) => {
    const planet = getPlanet(params.planet);
    if (!planet) throw notFound();
    return { planet };
  },
  head: ({ loaderData }) => {
    const name = loaderData?.planet.name ?? "Planète";
    const intro = loaderData?.planet.intro ?? "Archives de notre galaxie.";
    return {
      meta: [
        { title: `${name} — Doudou, My Universe` },
        { name: "description", content: intro },
        { property: "og:title", content: `${name} — Doudou, My Universe` },
        { property: "og:description", content: intro },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: PlanetDetail,
});

function PlanetDetail() {
  const { planet } = Route.useLoaderData();
  const unlocked = useUnlocked();
  if (!unlocked) return null;

  return (
    <main className="screen-in flex min-h-screen items-center justify-center p-6 text-center">
      <article key={planet.slug} className="archive-panel">
        <div className="eyebrow">ARCHIVES DE NOTRE GALAXIE</div>
        <h2 className="m-3 text-[clamp(38px,6vw,58px)]">{planet.name}</h2>
        <p className="archive-text my-5">{planet.intro}</p>
        <p className="archive-text my-5">{planet.body}</p>
        <PlanetExtra planet={planet} />
        <div className="mt-6">
          <Link to="/univers" className="cosmic-btn cosmic-btn-ghost inline-block">
            ← Retour au système solaire
          </Link>
        </div>
      </article>
    </main>
  );
}

function PlanetExtra({ planet }: { planet: Planet }) {
  const extra = planet.extra;
  if (!extra) return null;
  if (extra.kind === "note") return <div className="archive-note">{extra.text}</div>;
  if (extra.kind === "reveal") return <Reveal button={extra.button} message={extra.message} />;
  return <Countdown />;
}

function Reveal({ button, message }: { button: string; message: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button type="button" className="cosmic-btn" onClick={() => setOpen(true)}>
        {button}
      </button>
      {open && <p className="archive-text screen-in mt-5 text-rose">{message}</p>}
    </div>
  );
}

function Countdown() {
  const [count, setCount] = useState(COUNTDOWN_START);
  const [running, setRunning] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearInterval(timer.current);
  }, []);

  function start() {
    if (running || count <= 0) return;
    setRunning(true);
    timer.current = setInterval(() => {
      setCount((n) => {
        const next = n - 1;
        if (next <= 0 && timer.current) {
          clearInterval(timer.current);
          timer.current = null;
          setRunning(false);
        }
        return next;
      });
    }, 900);
  }

  const done = count <= 0;

  return (
    <div>
      <div className="archive-note">UNE DERNIÈRE SURPRISE T’ATTEND</div>
      <div className="countdown" aria-live="polite">
        {done ? COUNTDOWN_END_SYMBOL : count}
      </div>
      <button type="button" className="cosmic-btn cosmic-btn-primary" onClick={start} disabled={running || done}>
        Lancer le compte à rebours
      </button>
      {done && <p className="archive-text screen-in mt-5">{SURPRISE_MESSAGE}</p>}
    </div>
  );
}
