"use client";

import { useState } from "react";
import { CatDefinition } from "@/lib/types";
import { SKILLS_BY_CAT } from "@/lib/skills";
import AnimatedSprite from "./AnimatedSprite";

type Pose = "idle" | "shoot" | "dead";

export default function CatPreviewModal({
  cat,
  picked,
  onToggle,
  onClose,
}: {
  cat: CatDefinition;
  picked: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const [pose, setPose] = useState<Pose>("idle");
  const skills = SKILLS_BY_CAT[cat.id];
  const sprite = pose === "shoot" && cat.sprite.shoot ? cat.sprite.shoot : cat.sprite.idle;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4" onClick={onClose}>
      <div
        className="flex max-h-[85vh] w-full max-w-sm flex-col gap-3 overflow-y-auto rounded-2xl border border-amber-600 bg-slate-900 p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-amber-300">{cat.name}</h2>
          <button onClick={onClose} className="text-slate-400">
            ✕
          </button>
        </div>
        <p className="-mt-2 text-[11px] text-slate-400">{cat.role}</p>

        <div className="flex items-center justify-center rounded-xl border border-slate-700 bg-slate-950/60 py-4">
          <div className={pose === "dead" ? "anim-dead" : ""}>
            <AnimatedSprite key={pose} src={sprite.src} frames={sprite.frames} fps={pose === "idle" ? 8 : 14} loop={pose !== "dead"} className="h-28 w-28" />
          </div>
        </div>

        <div className="flex justify-center gap-2">
          {(["idle", "shoot", "dead"] as Pose[]).map((p) => (
            <button
              key={p}
              onClick={() => setPose(p)}
              className={`rounded-full px-3 py-1 text-[11px] font-semibold ${pose === p ? "bg-amber-500 text-slate-900" : "bg-slate-800 text-amber-200"}`}
            >
              {p === "idle" ? "Đứng yên" : p === "shoot" ? "Bắn" : "Gục ngã"}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2 rounded-lg border border-slate-700 bg-slate-950/40 p-2 text-center text-[10px] text-slate-300">
          <div>
            HP<div className="font-bold text-amber-200">{cat.hp}</div>
          </div>
          <div>
            ATK<div className="font-bold text-amber-200">{cat.atk}</div>
          </div>
          <div>
            DEF<div className="font-bold text-amber-200">{cat.def}</div>
          </div>
        </div>

        <p className="text-xs font-semibold text-purple-300">Kỹ năng riêng</p>
        <div className="flex flex-col gap-1.5">
          {skills.map((s) => (
            <div key={s.tier} className="rounded-lg border border-purple-700/50 bg-purple-950/30 p-2">
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-bold text-purple-200">
                  Cấp {s.tier}: {s.name}
                </p>
                <span className="text-[10px] text-purple-300">{s.cost} pip</span>
              </div>
              <p className="text-[10px] text-slate-400">{s.desc}</p>
            </div>
          ))}
        </div>

        <button
          onClick={onToggle}
          className={`mt-1 rounded-lg py-2.5 font-bold ${picked ? "border border-red-600 text-red-300" : "bg-amber-500 text-slate-900"}`}
        >
          {picked ? "Bỏ chọn" : "Chọn mèo này"}
        </button>
      </div>
    </div>
  );
}
