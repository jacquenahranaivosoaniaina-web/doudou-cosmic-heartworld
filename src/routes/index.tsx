import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

import galaxy from "@/assets/galaxy.jpg";
import { HudFrame } from "@/components/HudFrame";
import { warp } from "@/lib/cosmos-events";
import { isSecretCode, markUnlocked, WRONG_CODE_MESSAGE } from "@/lib/universe";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Doudou, My Universe — Entre dans notre univers" },
      {
        name: "description",
        content:
          "Notre système solaire, notre histoire, notre aventure… Entre le code secret pour ouvrir les portes de notre univers.",
      },
      { property: "og:title", content: "Doudou, My Universe" },
      {
        property: "og:description",
        content:
          "Notre système solaire, notre histoire, notre aventure… Un univers rien qu'à nous deux.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(0);
  const [warping, setWarping] = useState(false);

  function enter(e: FormEvent) {
    e.preventDefault();
    if (warping) return;
    if (isSecretCode(code)) {
      markUnlocked();
      setWarping(true);
      warp(1, 1400);
      window.setTimeout(() => navigate({ to: "/univers" }), 1100);
    } else {
      setError(WRONG_CODE_MESSAGE);
      setShake((n) => n + 1);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden p-6 text-center">
      <HudFrame
        topLeft="DOUDOU-OS · LIAISON ÉTABLIE"
        topRight="SECTEUR ♡ · ORIGINE AOÛT 2021"
        bottomLeft={warping ? "SAUT HYPERSPATIAL EN COURS…" : "SIGNAL CHIFFRÉ · EN ATTENTE DU CODE"}
        bottomRight="COORD. 48°51′ N · ∞"
      />

      <div className="home-galaxy" aria-hidden>
        <img src={galaxy} alt="" width={1024} height={1024} />
      </div>
      <div className="home-rings" aria-hidden>
        <span className="home-ring" />
        <span className="home-ring" />
      </div>

      <form onSubmit={enter} className={warping ? "warping" : "screen-in"}>
        <div className="eyebrow rise-in">UNE EXPÉRIENCE • UN SEUL UNIVERS • NOUS DEUX</div>
        <h1 className="hero-title my-7">
          DOUDOU,<span className="hero-title-sub">MY UNIVERSE</span>
        </h1>
        <p className="serif-italic rise-in text-[22px] text-mist [animation-delay:200ms]">
          Notre système solaire, notre histoire, notre aventure…
        </p>
        <p className="rise-in mx-auto my-6 max-w-[430px] text-[13px] leading-[1.9] text-muted-foreground [animation-delay:350ms]">
          Bienvenue dans notre univers, Doudou.
          <br />
          Ici, chaque étoile raconte un morceau de notre histoire.
        </p>
        <div className="rise-in [animation-delay:500ms]">
          <div key={shake} className={shake ? "shake" : undefined}>
            <input
              className="cosmic-field"
              type="password"
              aria-label="Code secret"
              placeholder="ENTRER LE CODE SECRET"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError("");
              }}
              autoComplete="off"
            />
          </div>
          <button type="submit" className="cosmic-btn cosmic-btn-primary mt-3">
            Ouvrir les portes de notre univers ✦
          </button>
          <div role="alert" className="mt-3 h-5 text-[11px] text-destructive">
            {error}
          </div>
        </div>
      </form>

      {warping && <div className="warp-flash" aria-hidden />}
    </main>
  );
}
