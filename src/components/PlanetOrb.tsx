import type { CSSProperties } from "react";

import type { Planet } from "@/lib/universe";

/** A shaded, slowly turning planet sphere, with optional ring and moon. */
export function PlanetOrb({
  planet,
  index,
  size,
  className = "",
}: {
  planet: Planet;
  index: number;
  size: number | string;
  className?: string;
}) {
  const style = { "--size": typeof size === "number" ? `${size}px` : size } as CSSProperties;
  return (
    <span
      className={`orb planet-${index + 1} ${planet.look.ring ? "orb-ringed" : ""} ${className}`}
      style={style}
    >
      <span className="orb-surface" />
      {planet.look.moon && (
        <span className="orb-moon-track">
          <span className="orb-moon" />
        </span>
      )}
    </span>
  );
}

/** The heart of the system: layered corona around a glowing core. */
export function Sun({ className = "" }: { className?: string }) {
  return (
    <span className={`sun ${className}`}>
      <span className="sun-corona" />
      <span className="sun-core" />
    </span>
  );
}
