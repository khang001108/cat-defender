"use client";

import { useState } from "react";
import { Board, areAdjacent } from "@/lib/board";
import { TileType } from "@/lib/types";
import { TileIcon, TILE_COLORS } from "./TileIcon";
import { ImpactBurst } from "./Effects";

export interface Burst {
  id: number;
  r: number;
  c: number;
  type: TileType;
}

export default function Match3Grid({
  board,
  onSwap,
  disabled,
  bursts = [],
  fallingCells,
  updateTick = 0,
}: {
  board: Board;
  onSwap: (r1: number, c1: number, r2: number, c2: number) => void;
  disabled?: boolean;
  bursts?: Burst[];
  /** cells that were just freshly spawned this update — they play a drop-in animation */
  fallingCells?: { r: number; c: number }[];
  /** bump this whenever the board changes so falling cells replay their animation */
  updateTick?: number;
}) {
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [swapAnim, setSwapAnim] = useState<{ a: [number, number]; b: [number, number] } | null>(null);
  const size = board.length;

  const fallingSet = new Set((fallingCells ?? []).map((c) => `${c.r},${c.c}`));

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
        setSwapAnim(null);
      }, 160);
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
                } ${isSelected ? "tile-selected scale-95" : "hover:scale-105"} disabled:opacity-60`}
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
      </div>
    </div>
  );
}
