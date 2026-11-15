import { useState, type CSSProperties } from "react";

import { Burst } from "@/components/experiences/Reveal";
import {
  CHALLENGES,
  PENALTY_GOALS_TO_WIN,
  PENALTY_REWARD,
  PENALTY_SHOTS,
  QUIZ,
  SECRET_CHEAT,
  WHO_LABEL,
  type Who,
} from "@/lib/experiences";

type Tab = "quiz" | "defis" | "penalty";
const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: "quiz", icon: "🧠", label: "Qui connaît le mieux l’autre ?" },
  { id: "defis", icon: "🎴", label: "Défis du duo" },
  { id: "penalty", icon: "⚽", label: "Séance de penalties" },
];

function Quiz() {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<Who | null>(null);
  const [score, setScore] = useState(0);
  const q = QUIZ[idx];
  const done = idx >= QUIZ.length;

  function pick(w: Who) {
    if (!q || picked) return;
    setPicked(w);
    if (w === q.answer) setScore((s) => s + 1);
  }

  if (done) {
    const perfect = score >= QUIZ.length - 1;
    return (
      <div className="riddle-end rise-in">
        <div className="riddle-trophy">{perfect ? "🏆" : score >= QUIZ.length / 2 ? "🥈" : "🎈"}</div>
        <h3 className="exp-title">{score} / {QUIZ.length}</h3>
        <p className="serif-italic text-blush text-xl">
          {perfect ? "Tu me connais par cœur. Trophée du meilleur copain du monde !" : "On a encore plein de choses à découvrir l’un sur l’autre ❤️"}
        </p>
        <button type="button" className="cosmic-btn mt-5" onClick={() => { setIdx(0); setScore(0); setPicked(null); }}>↺ Rejouer</button>
      </div>
    );
  }
  if (!q) return null;
  const right = picked === q.answer;
  return (
    <div key={idx} className="rise-in text-center">
      <div className="hud-mono hud-mono-bright">QUESTION {idx + 1}/{QUIZ.length} · SCORE {score}</div>
      <div className="quiz-icon">{q.icon}</div>
      <p className="riddle-q">{q.question}</p>
      <div className="who-row">
        {(Object.keys(WHO_LABEL) as Who[]).map((w) => (
          <button
            key={w}
            type="button"
            className={`answer-btn who-btn ${picked && w === q.answer ? "is-right" : ""} ${picked === w && !right ? "is-wrong" : ""}`}
            onClick={() => pick(w)}
            disabled={!!picked}
          >
            {WHO_LABEL[w]}
            {picked === w && right && <Burst id={idx + 1} />}
          </button>
        ))}
      </div>
      <div className="riddle-feedback justify-center" aria-live="polite">
        {picked && (
          <>
            <span className={right ? "text-rose" : "text-muted-foreground"}>
              {right ? "✦ Exactement ce que j’aurais répondu !" : `Raté ! Ma réponse : ${WHO_LABEL[q.answer]}`}
            </span>
            <button type="button" className="cosmic-btn cosmic-btn-ghost" onClick={() => { setIdx(idx + 1); setPicked(null); }}>
              Suivante →
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function Challenges() {
  const [flipped, setFlipped] = useState<number[]>([]);
  return (
    <div>
      <p className="mb-5 text-center text-sm text-muted-foreground">Retourne une carte… et relève le défi avec moi.</p>
      <div className="flip-grid">
        {CHALLENGES.map((c, i) => {
          const on = flipped.includes(i);
          return (
            <button
              key={c.text}
              type="button"
              className={`flip ${on ? "is-flipped" : ""}`}
              onClick={() => setFlipped((f) => (on ? f.filter((x) => x !== i) : [...f, i]))}
              aria-label={on ? c.text : `Défi ${c.theme}`}
            >
              <span className="flip-inner">
                <span className="flip-face flip-front">
                  <span className="flip-icon">{c.icon}</span>
                  <span className="hud-mono hud-mono-bright">{c.theme}</span>
                </span>
                <span className="flip-face flip-back">{c.text}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const ZONES = ["Gauche", "Centre", "Droite"] as const;
type Shot = { zone: number; keeper: number; goal: boolean };

function Penalty() {
  const [shots, setShots] = useState<Shot[]>([]);
  const last = shots[shots.length - 1];
  const goals = shots.filter((s) => s.goal).length;
  const over = shots.length >= PENALTY_SHOTS;
  const won = goals >= PENALTY_GOALS_TO_WIN;

  function shoot(zone: number) {
    if (over) return;
    const keeper = Math.floor(Math.random() * 3);
    setShots((s) => [...s, { zone, keeper, goal: keeper !== zone }]);
  }

  return (
    <div className="text-center">
      <p className="mb-4 text-sm text-muted-foreground">
        Marque {PENALTY_GOALS_TO_WIN} buts sur {PENALTY_SHOTS} tirs pour gagner ta récompense. Choisis où tirer !
      </p>
      <div className="pitch">
        <div className="goal">
          {ZONES.map((z, i) => (
            <button key={z} type="button" className="goal-zone" onClick={() => shoot(i)} disabled={over} aria-label={`Tirer à ${z.toLowerCase()}`}>
              <span className="hud-mono">{z}</span>
            </button>
          ))}
          <span key={`k${shots.length}`} className="keeper" style={{ left: `${(last ? last.keeper : 1) * 33.33 + 16.66}%` }} aria-hidden>
            🧤
          </span>
        </div>
        <span
          key={`b${shots.length}`}
          className={`ball ${last ? "is-shot" : ""}`}
          style={last ? ({ "--bx": `${(last.zone - 1) * 33}%` } as CSSProperties) : undefined}
          aria-hidden
        >
          ⚽
        </span>
      </div>
      <div className="shot-dots" aria-label={`${goals} buts`}>
        {Array.from({ length: PENALTY_SHOTS }, (_, i) => (
          <span key={i} className={`shot-dot ${shots[i] ? (shots[i]?.goal ? "is-goal" : "is-miss") : ""}`} />
        ))}
      </div>
      <div className="riddle-feedback justify-center" aria-live="polite">
        {last && !over && <span className={last.goal ? "text-rose" : "text-muted-foreground"}>{last.goal ? "BUUUT ! ⚽✨" : "Arrêté ! Encore…"}</span>}
      </div>
      {over && (
        <div className="rise-in mt-2">
          {won ? (
            <div className="reward">
              <Burst id="win" count={22} />
              <div className="eyebrow">🏆 VICTOIRE · {goals}/{PENALTY_SHOTS}</div>
              <p className="serif-italic mt-2 text-2xl text-blush">{PENALTY_REWARD}</p>
            </div>
          ) : (
            <p className="serif-italic text-xl text-blush">{goals} but{goals > 1 ? "s" : ""}… la revanche t’attend !</p>
          )}
          <button type="button" className="cosmic-btn mt-4" onClick={() => setShots([])}>↺ Nouvelle séance</button>
        </div>
      )}
    </div>
  );
}

export function PetitMondeExperience() {
  const [tab, setTab] = useState<Tab>("quiz");
  const [cheat, setCheat] = useState(false);
  return (
    <div className="exp-stack">
      <div className="tab-row" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`tab-card ${tab === t.id ? "is-on" : ""}`}
            onClick={() => setTab(t.id)}
          >
            <span className="tab-icon">{t.icon}</span>
            <span className="tab-label">{t.label}</span>
          </button>
        ))}
      </div>
      <section className="hud-box exp-card relative">
        {tab === "quiz" && <Quiz />}
        {tab === "defis" && <Challenges />}
        {tab === "penalty" && <Penalty />}
        <button type="button" className="hidden-egg" onClick={() => setCheat(true)} aria-label="Surprise cachée">🎮</button>
        {cheat && (
          <div className="egg-toast rise-in" role="status">
            <Burst id="egg" />
            {SECRET_CHEAT}
            <button type="button" className="ml-3 underline" onClick={() => setCheat(false)}>OK</button>
          </div>
        )}
      </section>
    </div>
  );
}
