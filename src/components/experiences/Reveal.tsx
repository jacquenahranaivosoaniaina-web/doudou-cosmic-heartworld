import { useEffect, useRef, useState, type CSSProperties } from "react";

/** Words fade in one after another. */
export function RevealWords({ text, delay = 0, step = 70, className = "" }: { text: string; delay?: number; step?: number; className?: string }) {
  return (
    <span className={className}>
      {text.split(" ").map((w, i) => (
        <span key={`${w}-${i}`} className="word-in" style={{ animationDelay: `${delay + i * step}ms` }}>
          {w}{" "}
        </span>
      ))}
    </span>
  );
}

/** True once the element has scrolled into view. */
export function useInView<T extends Element>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const io = new IntersectionObserver(([e]) => e?.isIntersecting && setSeen(true), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, [seen]);
  return { ref, seen };
}

const SHAPES = ["♥", "✦", "♡", "✧"];
/** Celebration burst of hearts and stars; change `id` to replay it. */
export function Burst({ id, count = 16 }: { id: number | string; count?: number }) {
  if (!id) return null;
  return (
    <span key={id} className="burst" aria-hidden>
      {Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2;
        const dist = 60 + ((i * 37) % 50);
        const style = {
          "--dx": `${Math.cos(angle) * dist}px`,
          "--dy": `${Math.sin(angle) * dist}px`,
          animationDelay: `${(i % 4) * 30}ms`,
        } as CSSProperties;
        return (
          <span key={i} className="burst-bit" style={style}>
            {SHAPES[i % SHAPES.length]}
          </span>
        );
      })}
    </span>
  );
}
