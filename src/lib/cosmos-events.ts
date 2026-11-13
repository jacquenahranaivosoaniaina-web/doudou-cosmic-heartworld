/** Tiny event bridge so any page can push the starfield into hyperspace. */
export const WARP_EVENT = "cosmos:warp";

export type WarpDetail = { strength: number; duration: number };

export function warp(strength = 1, duration = 1200) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<WarpDetail>(WARP_EVENT, { detail: { strength, duration } }));
}
