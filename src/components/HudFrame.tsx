import type { ReactNode } from "react";

/** Galactic control-room frame: corner brackets plus top and bottom readouts. */
export function HudFrame({
  topLeft,
  topRight,
  bottomLeft,
  bottomRight,
}: {
  topLeft: ReactNode;
  topRight?: ReactNode;
  bottomLeft?: ReactNode;
  bottomRight?: ReactNode;
}) {
  return (
    <div className="hud-frame" aria-hidden>
      <span className="hud-corner hud-corner-tl" />
      <span className="hud-corner hud-corner-tr" />
      <span className="hud-corner hud-corner-bl" />
      <span className="hud-corner hud-corner-br" />
      <div className="hud-bar hud-bar-top">
        <span className="hud-live">
          <i className="hud-dot" /> {topLeft}
        </span>
        {topRight && <span className="hidden sm:inline">{topRight}</span>}
      </div>
      {(bottomLeft || bottomRight) && (
        <div className="hud-bar hud-bar-bottom">
          <span>{bottomLeft}</span>
          {bottomRight && <span className="hidden sm:inline">{bottomRight}</span>}
        </div>
      )}
    </div>
  );
}
