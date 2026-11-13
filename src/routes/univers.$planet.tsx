import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { HudFrame } from "@/components/HudFrame";
import { PlanetOrb } from "@/components/PlanetOrb";
import { useUnlocked } from "@/hooks/use-unlocked";
import { warp } from "@/lib/cosmos-events";
import {
  COUNTDOWN_END_SYMBOL,
  COUNTDOWN_START,
  getPlanet,
  getPlanetIndex,
  PLANETS,
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

  const index = getPlanetIndex(planet.slug);
  const prev = PLANETS[(index - 1 + PLANETS.length) % PLANETS.length];
  const next = PLANETS[(index + 1) % PLANETS.length];
  const num = String(index + 1).padStart(2, "0");

  return (
    <main
      key={planet.slug}
      className={`screen-in relative flex min-h-screen items-center justify-center px-4 py-16 planet-${index + 1}`}
    >
      <HudFrame
        topLeft={`ARCHIVE ${num}/05 · ${planet.code}`}
        topRight="TRANSMISSION DÉCHIFFRÉE"
        bottomLeft="SIGNAL STABLE · 100%"
        bottomRight="ORIGINE · SYSTÈME DOUDOU"
      />

      <div className="grid w-full max-w-5xl items-center gap-10 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="text-center">
          <div className="archive-orb-wrap">
            <span className="archive-orb-ring" />
            <span className="archive-orb-ring" />
            <div className="archive-orb-float">
              <PlanetOrb planet={planet} index={index} size="clamp(120px, 18vw, 200px)" />
            </div>
          </div>
          <div className="hud-mono mt-4">{planet.code}</div>
        </div>

        <article className="hud-box rise-in p-[clamp(24px,5vw,44px)] text-center md:text-left">
          <div className="eyebrow">ARCHIVES DE NOTRE GALAXIE · {num}</div>
          <h1 className="my-3 text-[clamp(38px,6vw,60px)] leading-none">{planet.name}</h1>
          <div className="hud-divider my-5" />
          <p className="archive-text serif-italic my-4 text-blush">{planet.intro}</p>
          <p className="archive-text my-4">{planet.body}</p>
          <PlanetExtra planet={planet} />
          <div className="hud-divider my-6" />
          <div className="flex flex-col items-center gap-4">
            <div className="flex w-full flex-wrap items-center justify-between gap-3">
              {prev && (
                <Link
                  to="/univers/$planet"
                  params={{ planet: prev.slug }}
                  className="nav-chip hud-mono hud-mono-bright"
                  onClick={() => warp(0.3, 450)}
                >
                  ← {prev.name}
                </Link>
              )}
              {next && (
                <Link
                  to="/univers/$planet"
                  params={{ planet: next.slug }}
                  className="nav-chip hud-mono hud-mono-bright"
                  onClick={() => warp(0.3, 450)}
                >
                  {next.name} →
                </Link>
              )}
            </div>
            <Link to="/univers" className="cosmic-btn cosmic-btn-ghost" onClick={() => warp(0.3, 450)}>
              ◎ Retour au système solaire
            </Link>
          </div>
        </article>
      </div>
    </main>
  );
}

function PlanetExtra({ planet }: { planet: Planet }) {
  const extra = planet.extra;
  if (!extra) return null;
  if (extra.kind === "note") return <div className="archive-note mt-4">✦ {extra.text}</div>;
  if (extra.kind === "reveal") return <Reveal button={extra.button} message={extra.message} />;
  return <Countdown />;
}

function Reveal({ button, message }: { button: string; message: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-5">
      <button type="button" className="cosmic-btn" onClick={() => setOpen(true)} disabled={open}>
        {button}
      </button>
      {open && <p className="archive-text rise-in mt-5 text-rose">{message}</p>}
    </div>
  );
}

const DIAL_R = 60;
const DIAL_C = 2 * Math.PI * DIAL_R;

function Countdown() {
  const [count, setCount] = useState(COUNTDOWN_START);
  const [running, setRunning] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current);
    },
    [],
  );

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
          warp(0.5, 700);
        }
        return next;
      });
    }, 900);
  }

  const done = count <= 0;
  const progress = 1 - count / COUNTDOWN_START;

  return (
    <div className="mt-5 text-center">
      <div className="archive-note">UNE DERNIÈRE SURPRISE T’ATTEND</div>
      <div className="countdown-dial">
        <svg viewBox="0 0 132 132" aria-hidden>
          <circle className="countdown-track" cx="66" cy="66" r={DIAL_R} />
          <circle
            className="countdown-progress"
            cx="66"
            cy="66"
            r={DIAL_R}
            strokeDasharray={DIAL_C}
            strokeDashoffset={DIAL_C * (1 - progress)}
          />
        </svg>
        <span key={count} className="countdown countdown-pop" aria-live="polite">
          {done ? COUNTDOWN_END_SYMBOL : count}
        </span>
      </div>
      <button
        type="button"
        className="cosmic-btn cosmic-btn-primary"
        onClick={start}
        disabled={running || done}
      >
        Lancer le compte à rebours
      </button>
      {done && <p className="archive-text rise-in mt-5">{SURPRISE_MESSAGE}</p>}
    </div>
  );
}
