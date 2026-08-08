"use client";

import Image from "next/image";
import { UPGRADES } from "@/lib/gameData";
import { PlayerProfile } from "@/lib/types";

export default function ShopScreen({
  profile,
  onBuy,
  onBack,
}: {
  profile: PlayerProfile;
  onBuy: (upgradeId: string) => void;
  onBack: () => void;
}) {
  return (
    <main className="flex min-h-dvh flex-col items-center gap-4 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6 pt-12 text-white">
      <button onClick={onBack} className="self-start text-xs text-amber-300 underline">
        ← Quay lại
      </button>
      <h1 className="text-xl font-bold text-amber-300">🛒 Cửa Hàng Nâng Cấp</h1>
      <p className="rounded-full border border-amber-600 bg-slate-900 px-3 py-1 text-xs font-semibold text-amber-200">Vàng: {profile.gold}</p>
      <p className="-mt-2 max-w-xs text-center text-[11px] text-slate-400">Nâng cấp áp dụng cho TẤT CẢ mèo, vĩnh viễn — thắng trận để kiếm thêm vàng.</p>

      <div className="grid w-full max-w-sm grid-cols-2 gap-3 pb-6">
        {UPGRADES.map((u) => {
          const level = profile.upgradeLevels[u.id] ?? 0;
          const cost = u.baseCost * (level + 1);
          const canBuy = profile.gold >= cost;
          return (
            <div key={u.id} className="flex flex-col items-center gap-1 rounded-xl border border-amber-700/50 bg-slate-900 p-3">
              <Image src={u.icon} alt={u.name} width={56} height={56} className="h-14 w-14 object-contain" />
              <p className="text-center text-[12px] font-semibold text-amber-200">{u.name}</p>
              <p className="text-center text-[10px] text-slate-400">
                +{u.amount} {u.stat.toUpperCase()} · Lv.{level}
              </p>
              <button
                onClick={() => onBuy(u.id)}
                disabled={!canBuy}
                className="mt-1 w-full rounded-lg bg-amber-500 py-1.5 text-[11px] font-semibold text-slate-900 disabled:opacity-40"
              >
                🪙 {cost}
              </button>
            </div>
          );
        })}
      </div>
    </main>
  );
}
