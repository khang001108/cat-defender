"use client";

import { useState } from "react";
import { PlayerProfile } from "@/lib/types";

export default function SettingsScreen({
  profile,
  onSave,
  onBack,
}: {
  profile: PlayerProfile;
  onSave: (p: PlayerProfile) => void;
  onBack: () => void;
}) {
  const [name, setName] = useState(profile.displayName);
  const [accountName, setAccountName] = useState("");
  const [password, setPassword] = useState("");
  const [notifications, setNotifications] = useState(profile.notificationsEnabled);

  function handleSave() {
    onSave({ ...profile, displayName: name.trim() || profile.displayName, notificationsEnabled: notifications });
  }

  return (
    <main className="flex min-h-dvh flex-col items-center gap-5 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6 pt-12 text-white">
      <button onClick={onBack} className="self-start text-xs text-amber-300 underline">
        ← Quay lại
      </button>
      <h1 className="text-xl font-bold text-amber-300">Cài Đặt</h1>

      <div className="flex w-full max-w-xs flex-col gap-4">
        <Field label="Tên người chơi">
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={20} className="w-full rounded-lg border border-amber-600 bg-slate-900 px-3 py-2 text-sm text-white outline-none" />
        </Field>

        <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-3">
          <p className="mb-2 text-[11px] font-semibold text-slate-300">
            Tài khoản (chưa hoạt động — cần kết nối máy chủ thật để đổi tên đăng nhập/mật khẩu an toàn)
          </p>
          <Field label="Tên tài khoản">
            <input value={accountName} onChange={(e) => setAccountName(e.target.value)} disabled className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-500" placeholder="Cần đăng nhập máy chủ" />
          </Field>
          <div className="mt-2">
            <Field label="Mật khẩu mới">
              <input value={password} onChange={(e) => setPassword(e.target.value)} disabled type="password" className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-500" placeholder="Cần đăng nhập máy chủ" />
            </Field>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900/60 p-3">
          <div>
            <p className="text-sm font-semibold text-amber-200">Thông báo lời mời chơi</p>
            <p className="text-[10px] text-slate-400">Bật/tắt khi có người mời đấu (cần multiplayer thật)</p>
          </div>
          <button
            onClick={() => setNotifications((v) => !v)}
            className={`h-6 w-11 shrink-0 rounded-full transition ${notifications ? "bg-amber-500" : "bg-slate-700"}`}
          >
            <span className={`block h-5 w-5 rounded-full bg-white transition ${notifications ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
        </div>

        <button onClick={handleSave} className="rounded-lg bg-amber-500 py-2.5 font-semibold text-slate-900">
          Lưu thay đổi
        </button>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] text-slate-400">{label}</span>
      {children}
    </label>
  );
}
