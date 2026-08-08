import { TileType } from "@/lib/types";
import { TILE_COLORS } from "./TileIcon";

export function ImpactBurst({ type, style }: { type: TileType; style?: React.CSSProperties }) {
  const c = TILE_COLORS[type];
  return (
    <div className="pointer-events-none absolute" style={style}>
      <svg viewBox="0 0 60 60" className="fx-burst-flash h-full w-full" style={{ color: c.base }}>
        <path
          d="M30 2 L34 24 L58 30 L34 36 L30 58 L26 36 L2 30 L26 24 Z"
          fill="currentColor"
          opacity="0.95"
        />
        <circle cx="30" cy="30" r="7" fill="#fff" opacity="0.9" />
      </svg>
      <svg viewBox="0 0 60 60" className="fx-burst-ring absolute inset-0 h-full w-full" style={{ color: c.base }}>
        <circle cx="30" cy="30" r="16" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.8" />
      </svg>
    </div>
  );
}

export function Bullet({ direction, crit }: { direction: "right" | "left"; crit?: boolean }) {
  return (
    <div
      className={`pointer-events-none absolute top-1/2 z-20 -translate-y-1/2 ${direction === "right" ? "fx-bullet-right" : "fx-bullet-left"}`}
      style={
        {
          "--bullet-start": "8%",
          "--bullet-end": "88%",
          [direction === "right" ? "left" : "right"]: "8%",
        } as React.CSSProperties
      }
    >
      <div
        className={`h-2 rounded-full ${crit ? "w-8 bg-amber-400 shadow-[0_0_10px_3px_rgba(251,191,36,0.8)]" : "w-5 bg-yellow-300 shadow-[0_0_6px_2px_rgba(253,224,71,0.7)]"}`}
        style={{ transform: direction === "left" ? "scaleX(-1)" : undefined }}
      />
    </div>
  );
}

export function FloatingNumber({
  value,
  kind,
  style,
}: {
  value: number;
  kind: "damage" | "heal" | "crit";
  style?: React.CSSProperties;
}) {
  const color = kind === "heal" ? "#4ade80" : kind === "crit" ? "#f97316" : "#f87171";
  const text = kind === "heal" ? `+${value}` : `-${value}`;
  return (
    <div
      className="fx-number pointer-events-none absolute z-30 font-extrabold drop-shadow-lg"
      style={{ color, fontSize: kind === "crit" ? "22px" : "16px", ...style }}
    >
      {text}
      {kind === "crit" && <span className="ml-0.5 text-[10px] align-top text-amber-300">CRIT</span>}
    </div>
  );
}
