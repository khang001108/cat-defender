"use client";

import { useState } from "react";
import { CATS, ENEMIES } from "@/lib/gameData";
import { CatDefinition, EnemyDefinition } from "@/lib/types";
import BattleScreen from "@/components/BattleScreen";
import AnimatedSprite from "@/components/AnimatedSprite";

type View = "select" | "enemySelect" | "battle" | "result";

export default function Home() {
  const [view, setView] = useState<View>("select");
  const [cat, setCat] = useState<CatDefinition | null>(null);
  const [enemy, setEnemy] = useState<EnemyDefinition | null>(null);
  const [lastResult, setLastResult] = useState<boolean | null>(null);

  if (view === "select") {
    return (
      <main className="flex min-h-dvh flex-col items-center gap-5 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6 pt-10 text-white">
        <h1 className="text-center text-2xl font-bold text-amber-300">🐱 Cat Defender: Ghép 3 Bắn Súng</h1>
        <p className="max-w-sm text-center text-sm text-slate-300">
          Chọn 1 trong {CATS.length} boss mèo, ghép 3 biểu tượng để bắn, phòng thủ, hồi máu và nạp năng lượng
          kéo dài đồng hồ thời gian. Đấu solo với zombie do máy điều khiển, đánh theo lượt trên cùng 1 bàn cờ.
        </p>
        <div className="grid grid-cols-3 gap-2.5 pb-6">
          {CATS.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setCat(c);
                setView("enemySelect");
              }}
              className="flex flex-col items-center gap-1 overflow-hidden rounded-xl border border-amber-600 bg-slate-900 p-2 hover:bg-slate-800"
            >
              <AnimatedSprite src={c.sprite.idle.src} frames={c.sprite.idle.frames} fps={8} className="h-16 w-16 bg-contain bg-center bg-no-repeat" />
              <span className="text-center text-[11px] font-semibold text-amber-200 leading-tight">{c.name}</span>
              <span className="text-center text-[9px] leading-tight text-slate-500">
                HP {c.hp} · ATK {c.atk}
              </span>
            </button>
          ))}
        </div>
      </main>
    );
  }

  if (view === "enemySelect" && cat) {
    return (
      <main className="flex min-h-dvh flex-col items-center gap-4 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6 pt-10 text-white">
        <button onClick={() => setView("select")} className="self-start text-xs text-amber-300 underline">
          ← Đổi mèo
        </button>
        <h2 className="text-center text-xl font-bold text-amber-300">Chọn đối thủ</h2>
        <p className="-mt-2 text-center text-[11px] text-slate-400">{ENEMIES.length} zombie — càng xuống dưới càng khó</p>
        <div className="flex w-full max-w-xs flex-col gap-2.5 pb-6">
          {ENEMIES.map((e) => (
            <button
              key={e.id}
              onClick={() => {
                setEnemy(e);
                setView("battle");
              }}
              className="flex items-center gap-3 overflow-hidden rounded-xl border border-red-700 bg-slate-900 p-2.5 hover:bg-slate-800"
            >
              <div className="h-14 w-14 shrink-0 overflow-hidden">
                <AnimatedSprite src={e.sprite.idle.src} frames={e.sprite.idle.frames} fps={8} className="h-full w-full bg-contain bg-center bg-no-repeat" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-red-200">{e.name}</p>
                <p className="text-[11px] text-slate-400">
                  Lv.{e.level} · HP {e.hp} · ATK {e.atk}
                </p>
              </div>
            </button>
          ))}
        </div>
      </main>
    );
  }

  if (view === "battle" && cat && enemy) {
    return (
      <main className="min-h-dvh bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
        <BattleScreen
          cat={cat}
          enemy={enemy}
          onExit={() => setView("enemySelect")}
          onResult={(won) => {
            setLastResult(won);
            setView("result");
          }}
        />
      </main>
    );
  }

  if (view === "result") {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6 text-white">
        <p className="text-3xl">{lastResult ? "🎉" : "💀"}</p>
        <h2 className="text-xl font-bold text-amber-300">{lastResult ? "Chiến thắng!" : "Thất bại"}</h2>
        <div className="flex gap-3">
          <button
            onClick={() => setView("enemySelect")}
            className="rounded-lg bg-amber-500 px-4 py-2 font-semibold text-slate-900"
          >
            Đấu tiếp
          </button>
          <button
            onClick={() => setView("select")}
            className="rounded-lg border border-amber-600 px-4 py-2 font-semibold text-amber-200"
          >
            Đổi mèo
          </button>
        </div>
      </main>
    );
  }

  return null;
}
