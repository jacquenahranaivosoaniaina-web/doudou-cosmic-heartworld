import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

import { isSecretCode, markUnlocked, WRONG_CODE_MESSAGE } from "@/lib/universe";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Doudou, My Universe — Entre dans notre univers" },
      {
        name: "description",
        content: "Notre système solaire, notre histoire, notre aventure… Entre le code secret pour ouvrir les portes de notre univers.",
      },
      { property: "og:title", content: "Doudou, My Universe" },
      {
        property: "og:description",
        content: "Notre système solaire, notre histoire, notre aventure… Un univers rien qu'à nous deux.",
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

  function enter(e: FormEvent) {
    e.preventDefault();
    if (isSecretCode(code)) {
      markUnlocked();
      navigate({ to: "/univers" });
    } else {
      setError(WRONG_CODE_MESSAGE);
    }
  }

  return (
    <main className="screen-in flex min-h-screen items-center justify-center p-6 text-center">
      <form onSubmit={enter}>
        <div className="eyebrow">UNE EXPÉRIENCE • UN SEUL UNIVERS • NOUS DEUX</div>
        <h1 className="hero-title my-7">
          DOUDOU,<span className="hero-title-sub">MY UNIVERSE</span>
        </h1>
        <p className="serif-italic text-[22px] text-mist">
          Notre système solaire, notre histoire, notre aventure…
        </p>
        <p className="mx-auto my-6 max-w-[430px] text-[13px] leading-[1.9] text-muted-foreground">
          Bienvenue dans notre univers, Doudou.
          <br />
          Ici, chaque étoile raconte un morceau de notre histoire.
        </p>
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
        <button type="submit" className="cosmic-btn cosmic-btn-primary mt-3">
          Ouvrir les portes de notre univers ✦
        </button>
        <div role="alert" className="mt-2 h-5 text-[11px] text-destructive">
          {error}
        </div>
      </form>
    </main>
  );
}
