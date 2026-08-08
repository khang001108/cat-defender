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
}: {
  board: Board;
  onSwap: (r1: number, c1: number, r2: number, c2: number) => void;
  disabled?: boolean;
  bursts?: Burst[];
}) {
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const size = board.length;

  function handleClick(r: number, c: number) {
    if (disabled) return;
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
      onSwap(sr, sc, r, c);
      setSelected(null);
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
            return (
              <button
                key={`${r}-${c}`}
                onClick={() => handleClick(r, c)}
                disabled={disabled}
                style={isSelected ? ({ "--tile-glow": TILE_COLORS[tile].glow } as React.CSSProperties) : undefined}
                className={`flex aspect-square items-center justify-center rounded-lg bg-slate-800 p-1.5 transition-transform ${
                  isSelected ? "tile-selected scale-95" : "hover:scale-105"
                } disabled:opacity-60`}
              >
                <TileIcon type={tile} className="h-full w-full" />
              </button>
            );
          })
        )}
      </div>

      {/* Impact bursts overlay, positioned over the matched grid cells */}
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
