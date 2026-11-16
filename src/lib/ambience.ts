/**
 * Romantic background music for the whole site. Browsers only allow sound after a tap,
 * so it starts on the first interaction unless she turned it off (remembered on this device).
 */
import ambiance from "@/assets/music/ambiance-etoiles.mp3.asset.json";
import berceuse from "@/assets/music/berceuse-etoiles.mp3.asset.json";

export const AMBIENCE_TRACKS = [ambiance.url, berceuse.url];
const PREF_KEY = "doudou-music";
const VOLUME = 0.35;

type State = { on: boolean; playing: boolean };
let state: State = { on: true, playing: false };
let audio: HTMLAudioElement | null = null;
let track = 0;
let ducked = false;
let armed = false;
const listeners = new Set<() => void>();

function set(next: Partial<State>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

function ensureAudio() {
  if (audio || typeof window === "undefined") return audio;
  audio = new Audio(AMBIENCE_TRACKS[track]);
  audio.volume = VOLUME;
  audio.preload = "auto";
  audio.addEventListener("ended", () => {
    track = (track + 1) % AMBIENCE_TRACKS.length;
    if (!audio) return;
    audio.src = AMBIENCE_TRACKS[track] ?? "";
    void audio.play().catch(() => undefined);
  });
  audio.addEventListener("play", () => set({ playing: true }));
  audio.addEventListener("pause", () => set({ playing: false }));
  return audio;
}

function play() {
  const a = ensureAudio();
  if (!a || ducked || !state.on) return;
  void a.play().catch(() => undefined);
}

/** Read her saved choice and start the music on the first tap/keypress. */
export function initAmbience() {
  if (armed || typeof window === "undefined") return;
  armed = true;
  try {
    set({ on: window.localStorage.getItem(PREF_KEY) !== "off" });
  } catch {
    /* storage unavailable: keep default */
  }
  const start = () => {
    window.removeEventListener("pointerdown", start);
    window.removeEventListener("keydown", start);
    play();
  };
  window.addEventListener("pointerdown", start);
  window.addEventListener("keydown", start);
}

export function toggleAmbience() {
  const on = !state.on;
  set({ on });
  try {
    window.localStorage.setItem(PREF_KEY, on ? "on" : "off");
  } catch {
    /* ignore */
  }
  if (on) play();
  else audio?.pause();
}

/** Pause the background music while the film (which has its own score) plays. */
export function duckAmbience(on: boolean) {
  ducked = on;
  if (on) audio?.pause();
  else play();
}

export function subscribeAmbience(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}
export const getAmbience = () => state;
const SERVER_STATE: State = { on: true, playing: false };
export const getServerAmbience = () => SERVER_STATE;
