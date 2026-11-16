import { useEffect, useRef, useState } from "react";

import { Burst, RevealWords } from "@/components/experiences/Reveal";
import { duckAmbience } from "@/lib/ambience";
import { FILM_FINALE, FILM_MUSIC, FILM_POSTER, FILM_POSTER_CAPTION, FILM_SCENES, type FilmScene } from "@/lib/experiences";

type Phase = "poster" | "playing" | "finale";
const MUSIC_VOLUME = 0.55;
const FINALE_STEP_MS = 3200;

/** Cross-fades the film score when a scene asks for another track. */
function useScore(active: boolean, track: string, paused: boolean) {
  const ref = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    if (!active) return;
    const prev = ref.current;
    if (prev && prev.dataset["src"] === track) return;
    const next = new Audio(track);
    next.dataset["src"] = track;
    next.loop = true;
    next.volume = 0;
    void next.play().catch(() => undefined);
    ref.current = next;
    let v = 0;
    const id = window.setInterval(() => {
      v = Math.min(MUSIC_VOLUME, v + 0.05);
      next.volume = v;
      if (prev) prev.volume = Math.max(0, prev.volume - 0.06);
      if (v >= MUSIC_VOLUME && (!prev || prev.volume <= 0)) {
        prev?.pause();
        window.clearInterval(id);
      }
    }, 120);
    return () => window.clearInterval(id);
  }, [active, track]);
  useEffect(() => {
    const a = ref.current;
    if (!a || !active) return;
    if (paused) a.pause();
    else void a.play().catch(() => undefined);
  }, [paused, active]);
  useEffect(() => {
    if (active) return;
    ref.current?.pause();
    ref.current = null;
  }, [active]);
  useEffect(() => () => ref.current?.pause(), []);
}

function SceneView({ scene, on, paused, onEnd }: { scene: FilmScene; on: boolean; paused: boolean; onEnd: () => void }) {
  const vid = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = vid.current;
    if (!v) return;
    if (on && !paused) void v.play().catch(() => undefined);
    else v.pause();
  }, [on, paused]);
  useEffect(() => {
    if (on && vid.current) vid.current.currentTime = 0;
  }, [on]);
  // Stills: advance after `seconds` (paused time does not count).
  const left = useRef(scene.seconds * 1000);
  useEffect(() => {
    if (!on) left.current = scene.seconds * 1000;
  }, [on, scene.seconds]);
  useEffect(() => {
    if (scene.video || !on || paused) return;
    const started = Date.now();
    const t = window.setTimeout(onEnd, left.current);
    return () => {
      window.clearTimeout(t);
      left.current -= Date.now() - started;
    };
  }, [on, paused, scene.video, onEnd]);

  return (
    <figure className={`film-scene ${on ? "is-on" : ""} ${paused ? "is-paused" : ""}`} aria-hidden={!on}>
      {scene.video ? (
        <video ref={vid} src={scene.video} poster={scene.img} playsInline preload="auto" onEnded={onEnd} onLoadedData={(e) => (e.currentTarget.volume = 0.6)} />
      ) : (
        <img src={scene.img} alt="" width={1920} height={1080} style={{ animationDuration: `${scene.seconds + 2}s` }} />
      )}
    </figure>
  );
}

/** Our animated first-meeting film, then the 6-years message. */
export function FilmExperience({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<Phase>("poster");
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [step, setStep] = useState(0);
  const last = FILM_SCENES.length - 1;
  const scene = FILM_SCENES[Math.min(i, last)];
  const finaleSteps = 2 + FILM_FINALE.message.length;

  useScore(phase !== "poster", phase === "finale" ? FILM_MUSIC.final : FILM_MUSIC[scene?.music ?? "rencontre"], paused);

  useEffect(() => {
    duckAmbience(phase !== "poster");
    return () => duckAmbience(false);
  }, [phase]);

  useEffect(() => {
    if (phase !== "finale" || step >= finaleSteps) return;
    const t = window.setTimeout(() => setStep((s) => s + 1), step === 0 ? 900 : FINALE_STEP_MS);
    return () => window.clearTimeout(t);
  }, [phase, step, finaleSteps]);

  function next() {
    if (i < last) setI((n) => n + 1);
    else {
      setStep(0);
      setPhase("finale");
    }
  }
  function start() {
    setI(0);
    setStep(0);
    setPaused(false);
    setPhase("playing");
  }

  if (phase === "poster") {
    return (
      <div className="film-poster rise-in">
        <div className="eyebrow">✦ NOTRE HISTOIRE · LE FILM</div>
        <figure className="film-poster-frame">
          <img src={FILM_POSTER} alt="Nous deux en dessin animé, assis au bord de la rivière" width={784} height={1040} />
          <figcaption className="serif-italic">{FILM_POSTER_CAPTION}</figcaption>
        </figure>
        <button type="button" className="cosmic-btn cosmic-btn-primary" onClick={start}>
          ▶ Revivre notre première rencontre
        </button>
        <p className="text-xs text-muted-foreground">Monte le son 🔊</p>
      </div>
    );
  }

  return (
    <section className="film" aria-label="Mini-film : notre première rencontre">
      <div className="film-screen">
        {FILM_SCENES.map((s, k) => (
          <SceneView key={s.img} scene={s} on={phase === "playing" && k === i} paused={paused} onEnd={next} />
        ))}
        {phase === "finale" && (
          <figure className="film-scene is-on film-scene-hold" aria-hidden>
            <img src={FILM_SCENES[last]?.img} alt="" width={1920} height={1080} />
          </figure>
        )}
        <span className="story-letterbox story-letterbox-top" />
        <span className="story-letterbox story-letterbox-bottom" />

        {phase === "playing" && scene && (scene.kicker || scene.title || scene.text) && (
          <div key={i} className={`film-caption ${scene.title ? "film-caption-date" : ""}`}>
            {scene.kicker && <div className="hud-mono hud-mono-bright">{scene.kicker}</div>}
            {scene.title && <h3 className="film-date">{scene.title}</h3>}
            {scene.text && (
              <p className="story-text">
                <RevealWords text={scene.text} delay={scene.title ? 1400 : 700} step={110} />
              </p>
            )}
          </div>
        )}

        {phase === "finale" && (
          <div className="film-finale">
            {step >= 1 && <div className="film-finale-date rise-in">{FILM_FINALE.date}</div>}
            {step >= 2 && (
              <h3 className="film-finale-title rise-in">
                {FILM_FINALE.title}
                <Burst id="six" count={22} />
              </h3>
            )}
            <div className="film-finale-message">
              {FILM_FINALE.message.slice(0, Math.max(0, step - 2)).map((line, k, arr) => (
                <p key={line} className={`film-finale-line ${k === arr.length - 1 ? "is-current" : ""}`}>
                  {line}
                </p>
              ))}
            </div>
          </div>
        )}

        {phase === "playing" && (
          <div className="story-progress">
            {FILM_SCENES.map((s, k) => (
              <span key={s.img} className={`story-seg ${k < i ? "is-done" : ""} ${k === i ? "is-on" : ""}`}>
                <i />
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="story-controls">
        {phase === "playing" ? (
          <>
            <button type="button" className="nav-chip hud-mono hud-mono-bright" onClick={() => setPaused((p) => !p)}>
              {paused ? "▶ Lecture" : "❚❚ Pause"}
            </button>
            <button type="button" className="nav-chip hud-mono hud-mono-bright" onClick={() => { setStep(0); setPhase("finale"); }}>
              Passer ⏭
            </button>
          </>
        ) : step >= finaleSteps ? (
          <div className="flex flex-col items-center gap-3 rise-in">
            <button type="button" className="cosmic-btn cosmic-btn-primary" onClick={onDone}>
              Retourner dans notre univers ✦
            </button>
            <button type="button" className="nav-chip hud-mono hud-mono-bright" onClick={start}>↺ Revoir le film</button>
          </div>
        ) : (
          <button type="button" className="nav-chip hud-mono hud-mono-bright" onClick={() => setStep(finaleSteps)}>
            Tout afficher
          </button>
        )}
      </div>
    </section>
  );
}
