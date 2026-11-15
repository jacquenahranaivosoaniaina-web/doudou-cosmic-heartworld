import { useEffect, useState } from "react";

import { Burst, RevealWords } from "@/components/experiences/Reveal";
import { RIDDLES, STORY_SCENES } from "@/lib/experiences";

const SCENE_MS = 6500;

/** Cinematic slideshow of our first meeting, drawn from our real photos. */
function StoryCinema() {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);
  const last = STORY_SCENES.length - 1;
  const scene = STORY_SCENES[i];

  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => {
      if (i < last) setI(i + 1);
      else setPlaying(false);
    }, SCENE_MS);
    return () => clearTimeout(t);
  }, [i, playing, last]);

  function go(n: number) {
    setI(Math.max(0, Math.min(last, n)));
  }

  return (
    <section className="story" aria-label="Notre histoire en images">
      <div className="story-screen">
        {STORY_SCENES.map((s, k) => (
          <figure key={s.img} className={`story-scene ${k === i ? "is-on" : ""}`} aria-hidden={k !== i}>
            <img src={s.img} alt={s.caption} width={1280} height={960} loading={k < 2 ? "eager" : "lazy"} />
          </figure>
        ))}
        <span className="story-letterbox story-letterbox-top" />
        <span className="story-letterbox story-letterbox-bottom" />
        {scene && (
          <div key={i} className="story-caption">
            <div className="hud-mono hud-mono-bright">{scene.chapter}</div>
            <h3 className="story-title">{scene.title}</h3>
            <p className="story-text">
              <RevealWords text={scene.caption} delay={500} step={110} />
            </p>
          </div>
        )}
        <div className="story-progress">
          {STORY_SCENES.map((s, k) => (
            <button
              key={s.img}
              type="button"
              aria-label={`${s.chapter} : ${s.title}`}
              className={`story-seg ${k < i ? "is-done" : ""} ${k === i ? "is-on" : ""} ${k === i && playing ? "is-playing" : ""}`}
              style={{ animationDuration: `${SCENE_MS}ms` }}
              onClick={() => go(k)}
            >
              <i />
            </button>
          ))}
        </div>
      </div>
      <div className="story-controls">
        <button type="button" className="nav-chip hud-mono hud-mono-bright" onClick={() => go(i - 1)} disabled={i === 0}>
          ← Avant
        </button>
        <button
          type="button"
          className="nav-chip hud-mono hud-mono-bright"
          onClick={() => {
            if (!playing && i === last) setI(0);
            setPlaying((p) => !p);
          }}
        >
          {playing ? "❚❚ Pause" : i === last ? "↺ Revoir" : "▶ Lecture"}
        </button>
        <button type="button" className="nav-chip hud-mono hud-mono-bright" onClick={() => go(i + 1)} disabled={i === last}>
          Après →
        </button>
      </div>
    </section>
  );
}

/** Five riddles about our first meeting, with a celebration on each right answer. */
function Riddles() {
  const [idx, setIdx] = useState(0);
  const [found, setFound] = useState<number | null>(null);
  const [wrong, setWrong] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [burst, setBurst] = useState(0);
  const done = idx >= RIDDLES.length;
  const riddle = RIDDLES[idx];

  function pick(o: number) {
    if (!riddle || found !== null) return;
    if (o === riddle.answer) {
      setFound(o);
      if (!wrong.length) setScore((s) => s + 1);
      setBurst((b) => b + 1);
    } else {
      setWrong((w) => [...w, o]);
    }
  }
  function next() {
    setIdx((n) => n + 1);
    setFound(null);
    setWrong([]);
  }
  function restart() {
    setIdx(0);
    setFound(null);
    setWrong([]);
    setScore(0);
  }

  return (
    <section className="hud-box exp-card" aria-label="Énigmes de notre rencontre">
      <div className="exp-head">
        <span className="eyebrow">✦ 5 ÉNIGMES DE NOTRE RENCONTRE</span>
        <span className="hud-mono hud-mono-bright">{done ? "TERMINÉ" : `${idx + 1} / ${RIDDLES.length}`}</span>
      </div>
      {done ? (
        <div className="riddle-end rise-in">
          <div className="riddle-trophy">🏆</div>
          <h3 className="exp-title">{score} / {RIDDLES.length} du premier coup</h3>
          <p className="serif-italic text-blush text-xl">
            {score === RIDDLES.length ? "Tu te souviens de tout… comme moi." : "Chaque détail de notre histoire compte."}
          </p>
          <button type="button" className="cosmic-btn mt-5" onClick={restart}>↺ Rejouer</button>
        </div>
      ) : (
        riddle && (
          <div key={idx} className="rise-in">
            <p className="riddle-q">{riddle.question}</p>
            <div className="answer-grid">
              {riddle.options.map((opt, o) => {
                const state = found === o ? "is-right" : wrong.includes(o) ? "is-wrong" : "";
                return (
                  <button key={opt} type="button" className={`answer-btn ${state}`} onClick={() => pick(o)} disabled={found !== null || wrong.includes(o)}>
                    {opt}
                    {found === o && <Burst id={burst} />}
                  </button>
                );
              })}
            </div>
            <div className="riddle-feedback" aria-live="polite">
              {found !== null ? (
                <>
                  <span className="text-rose">✦ Bonne réponse ! {riddle.success}</span>
                  <button type="button" className="cosmic-btn cosmic-btn-ghost" onClick={next}>
                    {idx === RIDDLES.length - 1 ? "Voir mon score" : "Énigme suivante →"}
                  </button>
                </>
              ) : wrong.length ? (
                <span className="text-muted-foreground">Presque… essaie encore, mon Roi.</span>
              ) : null}
            </div>
          </div>
        )
      )}
    </section>
  );
}

export function RencontreExperience() {
  return (
    <div className="exp-stack">
      <StoryCinema />
      <Riddles />
    </div>
  );
}
