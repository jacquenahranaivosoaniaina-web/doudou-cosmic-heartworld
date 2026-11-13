import { createFileRoute, Link } from "@tanstack/react-router";

import { useUnlocked } from "@/hooks/use-unlocked";
import { PLANETS } from "@/lib/universe";

const ORBIT_SIZES = [
  { size: "98%", duration: "60s" },
  { size: "80%", duration: "48s" },
  { size: "62%", duration: "37s" },
  { size: "44%", duration: "27s" },
  { size: "27%", duration: "18s" },
];

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
  if (!unlocked) return null;

  return (
    <main className="screen-in flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="eyebrow">BIENVENUE CHEZ NOUS</div>
      <h1 className="m-3 text-[clamp(38px,6vw,62px)]">Notre système solaire</h1>
      <p className="serif-italic text-[19px] text-haze">
        Cinq mondes, cinq fragments de notre histoire.
      </p>
      <div className="solar-system">
        <div className="sun" aria-hidden />
        {PLANETS.map((planet, i) => {
          const orbit = ORBIT_SIZES[i] ?? { size: "50%", duration: "30s" };
          return (
            <div
              key={planet.slug}
              className="orbit"
              style={{
                width: orbit.size,
                height: orbit.size,
                animationDuration: orbit.duration,
                // Spread planets around their orbits instead of lining them up at the start.
                animationDelay: `calc(${orbit.duration} * -${(i * 0.37) % 1})`,
              }}
            >
              <Link
                to="/univers/$planet"
                params={{ planet: planet.slug }}
                className={`planet planet-${i + 1}`}
                aria-label={planet.name}
              />
              <span className="planet-label">{planet.name}</span>
            </div>
          );
        })}
      </div>
      <div className="eyebrow">TOUCHE UNE PLANÈTE POUR T'EN APPROCHER</div>
    </main>
  );
}
