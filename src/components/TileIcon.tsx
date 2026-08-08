import { TileType } from "@/lib/types";

export const TILE_COLORS: Record<TileType, { base: string; light: string; dark: string; glow: string }> = {
  attack: { base: "#ef4444", light: "#fca5a5", dark: "#7f1d1d", glow: "rgba(239,68,68,0.85)" },
  defense: { base: "#3b82f6", light: "#93c5fd", dark: "#1e3a8a", glow: "rgba(59,130,246,0.85)" },
  mana: { base: "#a855f7", light: "#d8b4fe", dark: "#4c1d75", glow: "rgba(168,85,247,0.85)" },
  heal: { base: "#ec4899", light: "#f9a8d4", dark: "#831843", glow: "rgba(236,72,153,0.85)" },
  gold: { base: "#f59e0b", light: "#fde68a", dark: "#78350f", glow: "rgba(245,158,11,0.85)" },
};

function DiamondBase({ id, colors }: { id: string; colors: (typeof TILE_COLORS)[TileType] }) {
  return (
    <>
      <defs>
        <radialGradient id={`grad-${id}`} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor={colors.light} />
          <stop offset="55%" stopColor={colors.base} />
          <stop offset="100%" stopColor={colors.dark} />
        </radialGradient>
      </defs>
      <rect
        x="9"
        y="9"
        width="30"
        height="30"
        rx="7"
        transform="rotate(45 24 24)"
        fill={`url(#grad-${id})`}
        stroke={colors.light}
        strokeWidth="1.4"
      />
      {/* corner glint */}
      <path d="M17 17 L21 13" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" opacity="0.55" />
    </>
  );
}

export function TileIcon({ type, className }: { type: TileType; className?: string }) {
  const colors = TILE_COLORS[type];
  const gradId = `tile-${type}`;

  switch (type) {
    case "attack":
      return (
        <svg viewBox="0 0 48 48" className={className}>
          <DiamondBase id={gradId} colors={colors} />
          <g transform="rotate(45 24 24)">
            <rect x="22" y="10" width="4.5" height="18" rx="1.2" fill="#f1f5f9" stroke="#64748b" strokeWidth="1" />
            <rect x="20.5" y="27" width="7.5" height="3" rx="1" fill="#cbd5e1" />
            <rect x="16" y="28.5" width="16" height="3" rx="1.2" fill={colors.light} stroke="#fff" strokeWidth="0.5" />
            <rect x="22" y="31" width="4.5" height="7" rx="1.2" fill={colors.dark} />
          </g>
        </svg>
      );
    case "defense":
      return (
        <svg viewBox="0 0 48 48" className={className}>
          <DiamondBase id={gradId} colors={colors} />
          <path
            d="M24 13 L33 16.5 V24 C33 30.5 29.5 35 24 37.5 C18.5 35 15 30.5 15 24 V16.5 Z"
            fill="#eff6ff"
            stroke="#f1f5f9"
            strokeWidth="1"
          />
          <path d="M24 17 L29.5 19.2 V24 C29.5 28.3 27.2 31.2 24 33 C20.8 31.2 18.5 28.3 18.5 24 V19.2 Z" fill={colors.base} opacity="0.85" />
        </svg>
      );
    case "mana":
      return (
        <svg viewBox="0 0 48 48" className={className}>
          <DiamondBase id={gradId} colors={colors} />
          <path
            d="M24 14 C29 14 33 18 33 23 C33 26 31 28.5 28.5 29.5 M24 34 C19 34 15 30 15 25 C15 22 17 19.5 19.5 18.5"
            fill="none"
            stroke="#f5f3ff"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <path d="M28.5 29.5 L32 28.5 L30.5 32" fill="none" stroke="#f5f3ff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M19.5 18.5 L16 19.5 L17.5 16" fill="none" stroke="#f5f3ff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "heal":
      return (
        <svg viewBox="0 0 48 48" className={className}>
          <DiamondBase id={gradId} colors={colors} />
          <path
            d="M24 33 C24 33 14 26.5 14 19.5 C14 15.5 17.2 13 20.3 13 C22.1 13 23.4 13.9 24 15.1 C24.6 13.9 25.9 13 27.7 13 C30.8 13 34 15.5 34 19.5 C34 26.5 24 33 24 33 Z"
            fill="#fff0f6"
            stroke="#fff"
            strokeWidth="1"
          />
          <path d="M24 18 V27 M19.5 22.5 H28.5" stroke={colors.base} strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      );
    case "gold":
      return (
        <svg viewBox="0 0 48 48" className={className}>
          <DiamondBase id={gradId} colors={colors} />
          <path
            d="M24 12 L26.7 20 L35 20 L28.3 25 L30.8 33 L24 28.2 L17.2 33 L19.7 25 L13 20 L21.3 20 Z"
            fill="#fffbeb"
            stroke="#fff"
            strokeWidth="0.8"
          />
        </svg>
      );
  }
}
