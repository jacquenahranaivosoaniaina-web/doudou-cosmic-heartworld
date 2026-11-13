import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type CSSProperties } from "react";

import galaxy from "@/assets/galaxy.jpg";
import { HudFrame } from "@/components/HudFrame";
import { PlanetOrb, Sun } from "@/components/PlanetOrb";
import { useUnlocked } from "@/hooks/use-unlocked";
import { warp } from "@/lib/cosmos-events";
import { PLANETS } from "@/lib/universe";

export const Route = createFileRoute("/univers/")({
  head: () => ({
    meta: [
      { title: "Notre système solaire — Doudou, My Universe" },
      {
        name: "description",
        content:
          "Cinq mondes, cinq fragments de notre histoire. Touche une planète pour t'en approcher.",
      },
      { property: "og:title", content: "Notre système solaire — Doudou, My Universe" },
      { property: "og:description", content: "Cinq mondes, cinq fragments de notre histoire." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SolarSystem,
});

function SolarSystem() {
  const unlocked = useUnlocked();
  const [active, setActive] = useState<number | null>(null);
  if (!unlocked) return null;

  const focused = active === null ? null : PLANETS[active];

  return (
    <main className="screen-in relative flex min-h-screen flex-col items-center justify-center px-4 py-16 text-center">
      <HudFrame
        topLeft="CARTE STELLAIRE · SYSTÈME DOUDOU"
        topRight="5 MONDES · 1 SOLEIL · ∞ AMOUR"
        bottomLeft={focused ? `CIBLE VERROUILLÉE · ${focused.code}` : "BALAYAGE ORBITAL ACTIF"}
        bottomRight="DISTANCE ENTRE NOUS · 0"
      />

      <div className="eyebrow">BIENVENUE CHEZ NOUS</div>
      <h1 className="m-3 text-[clamp(38px,6vw,64px)]">Notre système solaire</h1>
      <p className="serif-italic text-[19px] text-haze">
        Cinq mondes, cinq fragments de notre histoire.
      </p>

      <div className="mt-6 grid w-full max-w-6xl items-center gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className={`solar-stage ${active !== null ? "solar-paused" : ""}`}>
          <div className="solar-plane">
            <img
              className="solar-galaxy"
              src={galaxy}
              alt=""
              aria-hidden
              width={1024}
              height={1024}
            />
            <span className="asteroid-belt" aria-hidden />
            {PLANETS.map((planet, i) => {
              const style = {
                "--orbit": `${planet.look.orbit * 100}%`,
                "--period": `${planet.look.period}s`,
                // Spread planets around their orbits instead of lining them up.
                "--phase": `${-planet.look.period * ((i * 0.37) % 1)}s`,
                "--size": `${planet.look.size}px`,
              } as CSSProperties;
              return (
                <div
                  key={planet.slug}
                  className={`orbit planet-${i + 1} ${active === i ? "is-active" : ""}`}
                  style={style}
                >
                  <div className="planet-holder">
                    <Link
                      to="/univers/$planet"
                      params={{ planet: planet.slug }}
                      className={`planet-link planet-${i + 1} ${active === i ? "is-active" : ""}`}
                      aria-label={planet.name}
                      onMouseEnter={() => setActive(i)}
                      onMouseLeave={() => setActive(null)}
                      onFocus={() => setActive(i)}
                      onBlur={() => setActive(null)}
                      onClick={() => warp(0.35, 500)}
                    >
                      <span className="planet-target" />
                      <PlanetOrb planet={planet} index={i} size={planet.look.size} />
                    </Link>
                    <span className="planet-label">{planet.name}</span>
                  </div>
                </div>
              );
            })}
            <div className="solar-sun">
              <Sun />
            </div>
          </div>
        </div>

        <aside className="hud-box mx-auto w-full max-w-sm p-4 text-left lg:max-w-none">
          <div className="hud-mono hud-mono-bright mb-3 flex items-center justify-between">
            <span>Index des mondes</span>
            <span>05</span>
          </div>
          <div className="hud-divider mb-2" />
          <nav className="flex flex-col gap-1">
            {PLANETS.map((planet, i) => (
              <Link
                key={planet.slug}
                to="/univers/$planet"
                params={{ planet: planet.slug }}
                className={`star-map-item planet-${i + 1} ${active === i ? "is-active" : ""}`}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                onClick={() => warp(0.35, 500)}
              >
                <PlanetOrb planet={planet} index={i} size={22} />
                <span>
                  <span className="hud-mono block text-[8px]">{planet.code}</span>
                  <span className="font-serif text-lg text-foreground">{planet.name}</span>
                </span>
              </Link>
            ))}
          </nav>
          <div className="hud-divider my-3" />
          <p className="serif-italic min-h-[3em] text-[15px] leading-snug text-mist">
            {focused ? focused.intro : "Survole un monde pour lire son signal…"}
          </p>
        </aside>
      </div>

      <div className="eyebrow mt-6">TOUCHE UNE PLANÈTE POUR T'EN APPROCHER</div>
    </main>
  );
}
