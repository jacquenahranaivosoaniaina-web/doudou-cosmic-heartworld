import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import type { ComponentType } from "react";

import { AvenirExperience } from "@/components/experiences/Avenir";
import { VoiceNotes } from "@/components/experiences/AudioPlayer";
import { FinaleExperience } from "@/components/experiences/Finale";
import { PetitMondeExperience } from "@/components/experiences/PetitMonde";
import { RencontreExperience } from "@/components/experiences/Rencontre";
import { SouvenirsExperience } from "@/components/experiences/Souvenirs";
import { HudFrame } from "@/components/HudFrame";
import { PlanetOrb } from "@/components/PlanetOrb";
import { useUnlocked } from "@/hooks/use-unlocked";
import { warp } from "@/lib/cosmos-events";
import { getPlanet, getPlanetIndex, PLANETS } from "@/lib/universe";

/** Each planet is its own interactive experience. */
const EXPERIENCES: Record<string, ComponentType> = {
  "notre-rencontre": RencontreExperience,
  "nos-souvenirs": SouvenirsExperience,
  "notre-petit-monde": PetitMondeExperience,
  "notre-avenir": AvenirExperience,
  "mon-univers": FinaleExperience,
};

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
        { title: `${name} — Doudou, My Univers` },
        { name: "description", content: intro },
        { property: "og:title", content: `${name} — Doudou, My Univers` },
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
  const Experience = EXPERIENCES[planet.slug];

  return (
    <main key={planet.slug} className={`screen-in relative min-h-screen px-4 pb-20 pt-16 sm:px-8 planet-${index + 1}`}>
      <HudFrame
        topLeft={`ARCHIVE ${num}/05 · ${planet.code}`}
        topRight="TRANSMISSION DÉCHIFFRÉE"
        bottomLeft="SIGNAL STABLE · 100%"
        bottomRight="ORIGINE · SYSTÈME DOUDOU"
      />

      <div className="mx-auto w-full max-w-5xl">
        <header className="planet-head rise-in">
          <div className="planet-head-orb">
            <span className="archive-orb-ring" />
            <div className="archive-orb-float">
              <PlanetOrb planet={planet} index={index} size="clamp(64px, 12vw, 104px)" />
            </div>
          </div>
          <div>
            <div className="eyebrow">ARCHIVES DE NOTRE GALAXIE · {num}</div>
            <h1 className="my-2 text-[clamp(36px,6vw,58px)] leading-none">{planet.name}</h1>
            <p className="serif-italic text-[clamp(18px,2.4vw,22px)] text-blush">{planet.intro}</p>
          </div>
        </header>

        {Experience && <Experience />}

        {planet.slug !== "mon-univers" && (
          <div className="mx-auto mt-8 max-w-xl">
            <VoiceNotes planet={planet.slug} />
          </div>
        )}

        <nav className="mt-12 flex flex-col items-center gap-4">
          <div className="flex w-full max-w-xl flex-wrap items-center justify-between gap-3">
            {prev && (
              <Link to="/univers/$planet" params={{ planet: prev.slug }} className="nav-chip hud-mono hud-mono-bright" onClick={() => warp(0.3, 450)}>
                ← {prev.name}
              </Link>
            )}
            {next && (
              <Link to="/univers/$planet" params={{ planet: next.slug }} className="nav-chip hud-mono hud-mono-bright" onClick={() => warp(0.3, 450)}>
                {next.name} →
              </Link>
            )}
          </div>
          <Link to="/univers" className="cosmic-btn cosmic-btn-ghost" onClick={() => warp(0.3, 450)}>
            ◎ Retour au système solaire
          </Link>
        </nav>
      </div>
    </main>
  );
}
