import { useEffect, useRef } from "react";

import { WARP_EVENT, type WarpDetail } from "@/lib/cosmos-events";

type Star = { x: number; y: number; z: number; color: number; twinkle: number };
type Meteor = { x: number; y: number; vx: number; vy: number; life: number };

const BASE_SPEED = 0.00045;

/** 3D starfield on canvas: depth, twinkle, pointer parallax, shooting stars and hyperspace warp. */
export function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const css = getComputedStyle(document.documentElement);
    const palette = ["--star-1", "--star-2", "--star-3", "--star-4"].map(
      (v) => css.getPropertyValue(v).trim() || "white",
    );
    const meteorColor = css.getPropertyValue("--star-1").trim() || "white";

    let w = 0;
    let h = 0;
    let dpr = 1;
    let stars: Star[] = [];
    const meteors: Meteor[] = [];
    let speed = BASE_SPEED;
    let target = BASE_SPEED;
    let warpUntil = 0;
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    let raf = 0;

    const spawn = (z = Math.random()): Star => ({
      x: (Math.random() * 2 - 1) * 1.4,
      y: (Math.random() * 2 - 1) * 1.4,
      z: Math.max(0.02, z),
      color: Math.floor(Math.random() * palette.length),
      twinkle: Math.random() * Math.PI * 2,
    });

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(900, Math.floor((w * h) / 1800));
      stars = Array.from({ length: count }, () => spawn());
    };

    const onWarp = (e: Event) => {
      const { strength, duration } = (e as CustomEvent<WarpDetail>).detail;
      target = BASE_SPEED + 0.045 * strength;
      warpUntil = performance.now() + duration;
    };
    const onPointer = (e: PointerEvent) => {
      pointer.tx = (e.clientX / w - 0.5) * 2;
      pointer.ty = (e.clientY / h - 0.5) * 2;
    };

    const frame = (t: number) => {
      if (t > warpUntil) target = BASE_SPEED;
      speed += (target - speed) * 0.06;
      pointer.x += (pointer.tx - pointer.x) * 0.04;
      pointer.y += (pointer.ty - pointer.y) * 0.04;

      const cx = w / 2 - pointer.x * 24;
      const cy = h / 2 - pointer.y * 24;
      const f = Math.max(w, h) * 0.55;
      const streak = speed > 0.003;

      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        const pz = s.z;
        if (!reduce) s.z -= speed;
        if (s.z <= 0.02) {
          Object.assign(s, spawn(1));
          continue;
        }
        const sx = cx + (s.x / s.z) * f;
        const sy = cy + (s.y / s.z) * f;
        if (sx < -50 || sx > w + 50 || sy < -50 || sy > h + 50) {
          Object.assign(s, spawn(1));
          continue;
        }
        const depth = 1 - s.z;
        const tw = reduce ? 1 : 0.65 + 0.35 * Math.sin(t * 0.002 + s.twinkle);
        ctx.globalAlpha = Math.min(1, depth * 1.3) * tw;
        ctx.fillStyle = palette[s.color] ?? "white";
        ctx.strokeStyle = palette[s.color] ?? "white";
        if (streak) {
          const px = cx + (s.x / pz) * f;
          const py = cy + (s.y / pz) * f;
          ctx.lineWidth = Math.max(0.6, depth * 2.2);
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(sx, sy);
          ctx.stroke();
        } else {
          const r = Math.max(0.35, depth * 1.7);
          ctx.beginPath();
          ctx.arc(sx, sy, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (!reduce && !streak && Math.random() < 0.004 && meteors.length < 2) {
        meteors.push({
          x: Math.random() * w * 0.8 + w * 0.2,
          y: Math.random() * h * 0.35,
          vx: -(6 + Math.random() * 5),
          vy: 2.5 + Math.random() * 2,
          life: 1,
        });
      }
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        if (!m) continue;
        m.x += m.vx;
        m.y += m.vy;
        m.life -= 0.012;
        const grad = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * 14, m.y - m.vy * 14);
        grad.addColorStop(0, meteorColor);
        grad.addColorStop(1, "transparent");
        ctx.globalAlpha = Math.max(0, m.life);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x - m.vx * 14, m.y - m.vy * 14);
        ctx.stroke();
        if (m.life <= 0) meteors.splice(i, 1);
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    };

    resize();
    raf = requestAnimationFrame(frame);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointer);
    window.addEventListener(WARP_EVENT, onWarp);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener(WARP_EVENT, onWarp);
    };
  }, []);

  return <canvas ref={ref} className="cosmos-canvas" aria-hidden />;
}
