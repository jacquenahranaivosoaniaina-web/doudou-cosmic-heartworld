import { useEffect, useState } from "react";

import nebula from "@/assets/nebula.jpg";
import { Starfield } from "@/components/Starfield";

type Heart = { left: string; top: string; delay: string };

/** Ambient background: nebula photo, 3D starfield, floating hearts and a faint HUD scanline. */
export function Cosmos() {
  const [hearts, setHearts] = useState<Heart[]>([]);

  useEffect(() => {
    setHearts(
      Array.from({ length: 8 }, () => ({
        left: `${8 + Math.random() * 84}vw`,
        top: `${10 + Math.random() * 80}vh`,
        delay: `${Math.random() * 12}s`,
      })),
    );
  }, []);

  return (
    <>
      <div className="cosmos-nebula" aria-hidden />
      <img className="cosmos-photo" src={nebula} alt="" aria-hidden width={1920} height={1088} />
      <Starfield />
      <div className="cosmos-vignette" aria-hidden />
      <div className="hud-scan" aria-hidden />
      {hearts.map((h, i) => (
        <span
          key={i}
          className="cosmos-heart"
          aria-hidden
          style={{ left: h.left, top: h.top, animationDelay: h.delay }}
        >
          ♡
        </span>
      ))}
    </>
  );
}
