import { useEffect, useSyncExternalStore } from "react";

import { getAmbience, getServerAmbience, initAmbience, subscribeAmbience, toggleAmbience } from "@/lib/ambience";

/** Small floating button to turn the romantic background music on or off. */
export function MusicToggle() {
  const { on, playing } = useSyncExternalStore(subscribeAmbience, getAmbience, getServerAmbience);
  useEffect(() => initAmbience(), []);
  return (
    <button
      type="button"
      className={`music-toggle ${on && playing ? "is-playing" : ""}`}
      onClick={toggleAmbience}
      aria-label={on ? "Couper la musique" : "Mettre la musique"}
      aria-pressed={on}
    >
      <span className="music-toggle-icon" aria-hidden>{on ? "♫" : "♪"}</span>
      <span className="music-eq" aria-hidden><i /><i /><i /></span>
      {!on && <span className="music-off" aria-hidden />}
    </button>
  );
}
