"use client";

import { useState } from "react";
import { PlayerProfile } from "@/lib/types";

export default function LoginScreen({
  profile,
  onLogin,
  onBack,
}: {
  profile: PlayerProfile;
  onLogin: (name: string) => void;
  onBack: () => void;
}) {
  const [name, setName] = useState(profile.displayName === "Người Chơi" ? "" : profile.displayName);

  return (
    <main className="flex min-h-dvh flex-col items-center gap-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6 pt-12 text-white">
      <button onClick={onBack} className="self-start text-xs text-amber-300 underline">
        ← Quay lại
      </button>
      <h1 className="text-xl font-bold text-amber-300">Đăng Nhập</h1>
      <p className="max-w-xs text-center text-[11px] text-slate-400">
        Đây là đăng nhập cục bộ trên máy bạn (chưa có tài khoản/mật khẩu thật vì game chưa nối máy chủ). Tên bạn nhập
        ở đây chỉ lưu trong trình duyệt này.
      </p>
      <div className="flex w-full max-w-xs flex-col gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nhập tên hiển thị"
          className="rounded-lg border border-amber-600 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-amber-400"
          maxLength={20}
        />
        <button
          onClick={() => name.trim() && onLogin(name.trim())}
          disabled={!name.trim()}
          className="rounded-lg bg-amber-500 py-2.5 font-semibold text-slate-900 disabled:opacity-40"
        >
          Đăng nhập
        </button>
      </div>
    </main>
  );
}
