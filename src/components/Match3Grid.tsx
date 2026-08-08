"use client";

import { useEffect, useRef, useState } from "react";
import { Board, areAdjacent } from "@/lib/board";
import { TileType } from "@/lib/types";
import { TileIcon, TILE_COLORS } from "./TileIcon";
import { ImpactBurst, Trail } from "./Effects";

export interface Burst {
  id: number;
  r: number;
  c: number;
  type: TileType;
}

export interface ExternalSwapSignal {
  a: [number, number];
  b: [number, number];
  key: number;
}

export default function Match3Grid({
  board,
  onSwap,
  disabled,
  bursts = [],
  fallingCells,
  updateTick = 0,
  externalSwap,
  hint,
  bomb,
}: {
  board: Board;
  onSwap: (r1: number, c1: number, r2: number, c2: number) => void;
  disabled?: boolean;
  bursts?: Burst[];
  /** cells that were just freshly spawned this update — they play a drop-in animation */
  fallingCells?: { r: number; c: number }[];
  /** bump this whenever the board changes so falling cells replay their animation */
  updateTick?: number;
  /** the AI plays through this too, so its move slides visually just like the player's own swaps */
  externalSwap?: ExternalSwapSignal | null;
  /** cells to gently pulse as a hint after the player has been idle for a while */
  hint?: [number, number][] | null;
  /** the ticking bomb's current row/col, drawn as an overlay marker */
  bomb?: { row: number; col: number } | null;
}) {
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [swapAnim, setSwapAnim] = useState<{ a: [number, number]; b: [number, number] } | null>(null);
  const size = board.length;
  const invalidSwapFallback = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fallingSet = new Set((fallingCells ?? []).map((c) => `${c.r},${c.c}`));
  const hintSet = new Set((hint ?? []).map(([r, c]) => `${r},${c}`));

  useEffect(() => {
    if (!externalSwap) return;
    setSwapAnim({ a: externalSwap.a, b: externalSwap.b });
    if (invalidSwapFallback.current) clearTimeout(invalidSwapFallback.current);
    invalidSwapFallback.current = setTimeout(() => setSwapAnim(null), 800);
  }, [externalSwap]);

  // The swap-slide transform must stay in place until the REAL board data reflects the swap —
  // clearing it on a fixed timer (independent of when the parent actually updates `board`)
  // caused a visible snap-back-then-jump flicker. Instead, drop the transform exactly when the
  // board prop itself changes; a fallback timer only covers invalid moves (board never changes).
  useEffect(() => {
    setSwapAnim(null);
    if (invalidSwapFallback.current) {
      clearTimeout(invalidSwapFallback.current);
      invalidSwapFallback.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board]);

  function handleClick(r: number, c: number) {
    if (disabled || swapAnim) return;
    if (!selected) {
      setSelected([r, c]);
      return;
    }
    const [sr, sc] = selected;
    if (sr === r && sc === c) {
      setSelected(null);
      return;
    }
    if (areAdjacent(sr, sc, r, c)) {
      setSelected(null);
      setSwapAnim({ a: [sr, sc], b: [r, c] });
      setTimeout(() => {
        onSwap(sr, sc, r, c);
      }, 160);
      // Safety net: if the move turns out invalid, the board never changes, so make sure the
      // ghost transform still clears (snapping back) instead of staying stuck forever.
      if (invalidSwapFallback.current) clearTimeout(invalidSwapFallback.current);
      invalidSwapFallback.current = setTimeout(() => setSwapAnim(null), 800);
    } else {
      setSelected([r, c]);
    }
  }

  return (
    <div className="relative rounded-xl border border-amber-700/40 bg-slate-950/60 p-2">
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${size}, minmax(0,1fr))` }}>
        {board.map((row, r) =>
          row.map((tile, c) => {
            const isSelected = selected && selected[0] === r && selected[1] === c;
            const key = `${r},${c}`;
            const isFalling = fallingSet.has(key);
            const isHint = hintSet.has(key);

            let swapTransform = "";
            if (swapAnim) {
              const { a, b } = swapAnim;
              if (r === a[0] && c === a[1]) {
                swapTransform = `translate(${(b[1] - a[1]) * 100}%, ${(b[0] - a[0]) * 100}%)`;
              } else if (r === b[0] && c === b[1]) {
                swapTransform = `translate(${(a[1] - b[1]) * 100}%, ${(a[0] - b[0]) * 100}%)`;
              }
            }

            return (
              <button
                key={key}
                onClick={() => handleClick(r, c)}
                disabled={disabled}
                style={{
                  ...(isSelected ? ({ "--tile-glow": TILE_COLORS[tile].glow } as React.CSSProperties) : {}),
                  transform: swapTransform || undefined,
                  transition: swapTransform ? "transform 0.16s ease-in-out" : undefined,
                  zIndex: swapTransform ? 20 : undefined,
                }}
                className={`flex aspect-square items-center justify-center rounded-lg bg-slate-800 p-1.5 ${
                  swapTransform ? "" : "transition-transform"
                } ${isSelected ? "tile-selected scale-95" : "hover:scale-105"} ${isHint ? "hint-pulse" : ""} disabled:opacity-60`}
              >
                <div key={isFalling ? `${key}-${updateTick}` : key} className={isFalling ? "tile-drop-in" : ""} style={isFalling ? { animationDelay: `${r * 28}ms` } : undefined}>
                  <TileIcon type={tile} className="h-full w-full" />
                </div>
              </button>
            );
          })
        )}
      </div>

      <div className="pointer-events-none absolute inset-2">
        {bursts.map((b) => (
          <ImpactBurst
            key={b.id}
            type={b.type}
            style={{
              left: `${(b.c / size) * 100}%`,
              top: `${(b.r / size) * 100}%`,
              width: `${100 / size}%`,
              height: `${100 / size}%`,
            }}
          />
        ))}
        {bursts.map((b) => (
          <Trail
            key={`trail-${b.id}`}
            type={b.type}
            direction={b.type === "attack" ? "right" : "left"}
            style={{
              left: `${(b.c / size + 0.5 / size) * 100}%`,
              top: `${(b.r / size + 0.5 / size) * 100}%`,
            }}
          />
        ))}
        {bomb && (
          <div
            className="fx-bomb-pulse absolute flex items-center justify-center"
            style={{
              left: `${(bomb.col / size) * 100}%`,
              top: `${(bomb.row / size) * 100}%`,
              width: `${100 / size}%`,
              height: `${100 / size}%`,
            }}
          >
            <img src="/ui/addon6.png" alt="Bom" className="h-[85%] w-[85%] object-contain drop-shadow-[0_0_6px_rgba(251,146,60,0.9)]" />
          </div>
        )}
      </div>
    </div>
  );
}
