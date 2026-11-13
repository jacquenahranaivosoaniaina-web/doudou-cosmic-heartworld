export const SECRET_CODE = "DOUDOU";
export const WRONG_CODE_MESSAGE = "Ce code ne semble pas être le bon. Essaie encore, mon Roi.";
const UNLOCK_KEY = "doudou-universe-unlocked";

export function isSecretCode(input: string): boolean {
  return input.trim().toUpperCase() === SECRET_CODE;
}

export function markUnlocked() {
  try {
    window.sessionStorage.setItem(UNLOCK_KEY, "1");
  } catch {
    /* storage unavailable: gate stays per-page */
  }
}

export function readUnlocked(): boolean {
  try {
    return window.sessionStorage.getItem(UNLOCK_KEY) === "1";
  } catch {
    return false;
  }
}

export type PlanetExtra =
  | { kind: "note"; text: string }
  | { kind: "reveal"; button: string; message: string }
  | { kind: "countdown" };

export type Planet = {
  slug: string;
  name: string;
  intro: string;
  body: string;
  extra?: PlanetExtra;
};

export const PLANETS: Planet[] = [
  {
    slug: "notre-rencontre",
    name: "Notre rencontre",
    intro: "Tout a commencé par un simple regard.",
    body: "Une cour d’université, un stylo noir, un regard… et le début de nous. En août 2021, nos chemins ont commencé à écrire une seule histoire.",
  },
  {
    slug: "nos-souvenirs",
    name: "Nos souvenirs",
    intro: "Chaque instant avec toi devient précieux.",
    body: "Nos sourires, nos retrouvailles après les cours et ces petits instants qui deviennent de grands souvenirs.",
    extra: { kind: "note", text: "La galerie de nos photos personnelles sera intégrée ici." },
  },
  {
    slug: "notre-petit-monde",
    name: "Notre petit monde",
    intro: "Notre bonheur, à notre façon.",
    body: "Un petit monde à nous, fait de complicité, de rires et de détails que nous seuls pouvons comprendre.",
    extra: { kind: "reveal", button: "Découvrir un défi", message: "Petit défi de notre duo à découvrir bientôt !" },
  },
  {
    slug: "notre-avenir",
    name: "Notre avenir",
    intro: "Tant de rêves à vivre ensemble.",
    body: "Des projets, des voyages, des rêves… et encore tant de pages à écrire ensemble.",
    extra: { kind: "reveal", button: "Mission secrète", message: "Imagine notre prochaine aventure à deux." },
  },
  {
    slug: "mon-univers",
    name: "Mon univers",
    intro: "Parmi des milliards d’étoiles, je te choisis, toi.",
    body: "Parmi des milliards d’étoiles, c’est toi que je choisis. Aujourd’hui, demain et dans tous les univers possibles.",
    extra: { kind: "countdown" },
  },
];

export const COUNTDOWN_START = 5;
export const COUNTDOWN_END_SYMBOL = "👟";
export const SURPRISE_MESSAGE = "Une surprise t’attend, mon Roi. ❤️";

export function getPlanet(slug: string): Planet | undefined {
  return PLANETS.find((p) => p.slug === slug);
}
