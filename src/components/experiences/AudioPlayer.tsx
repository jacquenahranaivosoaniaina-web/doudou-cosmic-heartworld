import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

import { mediaQuery } from "@/lib/media";

function fmt(s: number) {
  if (!Number.isFinite(s)) return "0:00";
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

/** Play/pause player for one of her own voice recordings, played exactly as uploaded. */
export function AudioPlayer({ src, title }: { src: string; title: string }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const a = ref.current;
    return () => a?.pause();
  }, []);

  function toggle() {
    const a = ref.current;
    if (!a) return;
    if (a.paused) void a.play();
    else a.pause();
  }

  return (
    <div className={`voice ${playing ? "is-playing" : ""}`}>
      <button type="button" className="voice-btn" onClick={toggle} aria-label={playing ? "Pause" : "Écouter"}>
        {playing ? "❚❚" : "▶"}
      </button>
      <div className="min-w-0 flex-1">
        <div className="voice-title">🎙️ {title}</div>
        <input
          className="voice-bar"
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={time}
          aria-label="Position de lecture"
          onChange={(e) => {
            if (ref.current) ref.current.currentTime = Number(e.target.value);
          }}
        />
      </div>
      <span className="voice-time">{fmt(time)} / {fmt(duration)}</span>
      <span className="voice-wave" aria-hidden><i /><i /><i /><i /><i /></span>
      <audio
        ref={ref}
        src={src}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
      />
    </div>
  );
}

/** Voice recordings attached to a planet; shows a gentle placeholder until one is uploaded. */
export function VoiceNotes({ planet, placeholder }: { planet: string; placeholder?: string }) {
  const { data } = useQuery(mediaQuery("audio"));
  const tracks = (data ?? []).filter((t) => t.planet === planet && t.src);
  if (!tracks.length) {
    return placeholder ? <div className="voice voice-empty">🎙️ {placeholder}</div> : null;
  }
  return (
    <div className="flex flex-col gap-3">
      {tracks.map((t) => (
        <AudioPlayer key={t.id} src={t.src ?? ""} title={t.title || "Message vocal"} />
      ))}
    </div>
  );
}
