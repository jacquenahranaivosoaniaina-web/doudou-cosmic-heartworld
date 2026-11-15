import { useEffect, useState } from "react";

import { Burst, RevealWords } from "@/components/experiences/Reveal";
import { ADVENTURES, CAPSULE, DREAMS, MAX_ADVENTURES } from "@/lib/experiences";

const ADVENTURE_KEY = "doudou-adventures";
const FLIGHT_MS = 1400;

function Spaceship() {
  return (
    <svg viewBox="0 0 40 64" className="ship-svg" aria-hidden>
      <path className="ship-flame" d="M14 50 Q20 66 26 50 Z" />
      <path className="ship-fin" d="M10 34 L2 50 L12 46 Z M30 34 L38 50 L28 46 Z" />
      <path className="ship-body" d="M20 2 C31 12 32 30 28 48 L12 48 C8 30 9 12 20 2 Z" />
      <circle className="ship-window" cx="20" cy="22" r="5" />
    </svg>
  );
}

/** A little spaceship flying between our dreams. */
function DreamJourney() {
  const [at, setAt] = useState<number | null>(null);
  const [shown, setShown] = useState<number | null>(null);
  const [visited, setVisited] = useState<number[]>([]);
  const [angle, setAngle] = useState(0);
  const pos = at === null ? { x: 4, y: 92 } : DREAMS[at] ?? { x: 4, y: 92 };

  function fly(i: number) {
    const to = DREAMS[i];
    if (!to || i === at) {
      setShown(i);
      return;
    }
    setAngle((Math.atan2(to.y - pos.y, to.x - pos.x) * 180) / Math.PI + 90);
    setAt(i);
    setShown(null);
    window.setTimeout(() => {
      setShown(i);
      setVisited((v) => (v.includes(i) ? v : [...v, i]));
    }, FLIGHT_MS);
  }
  const dream = shown === null ? null : DREAMS[shown];

  return (
    <section className="hud-box exp-card" aria-label="Le voyage vers nos rêves">
      <div className="exp-head">
        <span className="eyebrow">🚀 TOUCHE UNE DESTINATION</span>
        <span className="hud-mono hud-mono-bright">RÊVES VISITÉS {visited.length}/{DREAMS.length}</span>
      </div>
      <div className="dream-map">
        <svg className="dream-path" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          <polyline points={["4,92", ...DREAMS.map((d) => `${d.x},${d.y}`)].join(" ")} />
        </svg>
        {DREAMS.map((d, i) => (
          <button
            key={d.name}
            type="button"
            className={`dream ${visited.includes(i) ? "is-visited" : ""} ${at === i ? "is-here" : ""}`}
            style={{ left: `${d.x}%`, top: `${d.y}%`, animationDelay: `${i * -0.7}s` }}
            onClick={() => fly(i)}
          >
            <span className="dream-glow" />
            <span className="dream-icon">{d.icon}</span>
            <span className="dream-name">{d.name}</span>
          </button>
        ))}
        <span
          className="ship"
          style={{ left: `${pos.x}%`, top: `${pos.y}%`, transitionDuration: `${FLIGHT_MS}ms`, rotate: `${angle}deg` }}
          aria-hidden
        >
          <Spaceship />
        </span>
      </div>
      <div className="dream-message" aria-live="polite">
        {dream ? (
          <div key={dream.name} className="rise-in">
            <div className="hud-mono hud-mono-bright">{dream.icon} DESTINATION ATTEINTE</div>
            <h3 className="exp-title my-2">{dream.name}</h3>
            <p className="serif-italic text-xl text-blush"><RevealWords text={dream.message} delay={200} /></p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{at === null ? "Le vaisseau attend tes ordres, capitaine." : "Voyage en cours…"}</p>
        )}
      </div>
    </section>
  );
}

/** Pick our next adventures; the choice is remembered on this device. */
function AdventurePicker() {
  const [picked, setPicked] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(ADVENTURE_KEY);
      if (raw) {
        setPicked(JSON.parse(raw) as string[]);
        setSaved(true);
      }
    } catch {
      /* ignore */
    }
  }, []);
  function toggle(a: string) {
    setSaved(false);
    setPicked((p) => (p.includes(a) ? p.filter((x) => x !== a) : p.length >= MAX_ADVENTURES ? p : [...p, a]));
  }
  function save() {
    try {
      window.localStorage.setItem(ADVENTURE_KEY, JSON.stringify(picked));
    } catch {
      /* ignore */
    }
    setSaved(true);
  }
  return (
    <section className="hud-box exp-card" aria-label="Nos prochaines aventures">
      <div className="exp-head">
        <span className="eyebrow">🧭 CHOISIS NOS {MAX_ADVENTURES} PROCHAINES AVENTURES</span>
        <span className="hud-mono hud-mono-bright">{picked.length}/{MAX_ADVENTURES}</span>
      </div>
      <div className="chip-cloud">
        {ADVENTURES.map((a) => (
          <button key={a} type="button" className={`adv-chip ${picked.includes(a) ? "is-on" : ""}`} onClick={() => toggle(a)} aria-pressed={picked.includes(a)}>
            {a}
          </button>
        ))}
      </div>
      <div className="mt-6 text-center">
        {saved && picked.length ? (
          <div className="reward rise-in">
            <Burst id={picked.join()} />
            <div className="eyebrow">✦ MISSION ENREGISTRÉE</div>
            <p className="serif-italic mt-2 text-xl text-blush">{picked.join(" · ")}</p>
          </div>
        ) : (
          <button type="button" className="cosmic-btn cosmic-btn-primary" disabled={!picked.length} onClick={save}>
            Valider notre mission ✦
          </button>
        )}
      </div>
    </section>
  );
}

function TimeCapsule() {
  const [open, setOpen] = useState(false);
  return (
    <section className="hud-box exp-card text-center" aria-label="Capsule temporelle">
      <div className="eyebrow">⏳ CAPSULE TEMPORELLE · À OUVRIR EN {CAPSULE.openOn.toUpperCase()}</div>
      <button type="button" className={`capsule ${open ? "is-open" : ""}`} onClick={() => setOpen(true)} aria-label="Ouvrir la capsule">
        <span className="capsule-half capsule-top" />
        <span className="capsule-core" />
        <span className="capsule-half capsule-bottom" />
      </button>
      {open ? (
        <p className="capsule-message serif-italic rise-in">
          <RevealWords text={CAPSULE.message} delay={700} step={55} />
        </p>
      ) : (
        <button type="button" className="cosmic-btn" onClick={() => setOpen(true)}>Ouvrir la capsule maintenant</button>
      )}
    </section>
  );
}

export function AvenirExperience() {
  return (
    <div className="exp-stack">
      <DreamJourney />
      <AdventurePicker />
      <TimeCapsule />
    </div>
  );
}
