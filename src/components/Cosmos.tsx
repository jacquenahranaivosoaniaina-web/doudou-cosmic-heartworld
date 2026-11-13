import { useEffect, useState } from "react";

type Heart = { left: string; top: string; delay: string };

/** Ambient background: rotating nebula, drifting stars and floating hearts. */
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
      <div className="cosmos-stars" aria-hidden />
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
