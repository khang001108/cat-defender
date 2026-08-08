"use client";

import Image from "next/image";
import { PlayerProfile } from "@/lib/types";

export default function MainMenu({
  profile,
  onNavigate,
}: {
  profile: PlayerProfile;
  onNavigate: (dest: "solo" | "multiplayer" | "shop" | "settings" | "info" | "login" | "friends" | "download") => void;
}) {
  return (
    <main className="flex min-h-dvh flex-col items-center gap-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6 pt-12 text-white">
      <Image src="/ui/logo.png" alt="Cat Defender" width={260} height={110} className="w-56 drop-shadow-xl" />

      <button
        onClick={() => onNavigate(profile.loggedIn ? "settings" : "login")}
        className="flex items-center gap-2 rounded-full border border-amber-600 bg-slate-900 px-3 py-1.5"
      >
        <span className="h-2 w-2 rounded-full" style={{ background: profile.loggedIn ? "#4ade80" : "#94a3b8" }} />
        <span className="text-xs font-semibold text-amber-200">{profile.displayName}</span>
        <span className="text-[10px] text-slate-400">{profile.loggedIn ? "(đã đăng nhập)" : "(khách)"}</span>
      </button>

      <div className="flex w-full max-w-xs flex-col gap-3">
        <MenuButton label="⚔️ Chiến Đơn" sub="1v1 / 2v2 / 3v3 vs Bot" onClick={() => onNavigate("solo")} primary />
        <MenuButton label="🌐 Multiplayer" sub="Tạo phòng / Tham gia" onClick={() => onNavigate("multiplayer")} />
        <MenuButton label="🛒 Cửa Hàng" sub={`Vàng: ${profile.gold}`} onClick={() => onNavigate("shop")} />
        <MenuButton label="⚙️ Cài Đặt" onClick={() => onNavigate("settings")} />
        <MenuButton label="ℹ️ Thông Tin" onClick={() => onNavigate("info")} />
      </div>

      <div className="mt-2 flex gap-6">
        <button onClick={() => onNavigate("download")} className="flex flex-col items-center gap-1 text-slate-300">
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-600 bg-slate-900 text-xl">⬇️</span>
          <span className="text-[10px]">Tải về</span>
        </button>
        <button onClick={() => onNavigate("friends")} className="flex flex-col items-center gap-1 text-slate-300">
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-600 bg-slate-900 text-xl">👥</span>
          <span className="text-[10px]">Bạn bè</span>
        </button>
      </div>
    </main>
  );
}

function MenuButton({ label, sub, onClick, primary }: { label: string; sub?: string; onClick: () => void; primary?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center rounded-xl border py-3 text-center transition ${
        primary ? "border-amber-400 bg-amber-500 text-slate-900 hover:bg-amber-400" : "border-slate-700 bg-slate-900 text-amber-200 hover:bg-slate-800"
      }`}
    >
      <span className="text-base font-bold">{label}</span>
      {sub && <span className={`text-[11px] ${primary ? "text-slate-800" : "text-slate-400"}`}>{sub}</span>}
    </button>
  );
}
