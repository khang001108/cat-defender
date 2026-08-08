"use client";

export default function MultiplayerScreen({ onBack, onPlayVsBots }: { onBack: () => void; onPlayVsBots: () => void }) {
  return (
    <main className="flex min-h-dvh flex-col items-center gap-5 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6 pt-12 text-white">
      <button onClick={onBack} className="self-start text-xs text-amber-300 underline">
        ← Quay lại
      </button>
      <h1 className="text-xl font-bold text-amber-300">🌐 Multiplayer</h1>

      <div className="w-full max-w-xs rounded-xl border border-amber-600 bg-slate-900 p-4 text-center">
        <p className="text-sm text-slate-300">
          Chế độ nhiều người chơi thật (tạo phòng, mời bạn bè, đấu online) cần có <b>máy chủ backend</b> (lưu tài
          khoản, ghép trận, đồng bộ nước đi theo thời gian thực) — dự án hiện tại chưa có phần này.
        </p>
      </div>

      <div className="flex w-full max-w-xs flex-col gap-3 opacity-50">
        <button disabled className="rounded-lg border border-slate-700 bg-slate-900 py-2.5 font-semibold text-slate-500">
          🏠 Tạo phòng (cần backend)
        </button>
        <button disabled className="rounded-lg border border-slate-700 bg-slate-900 py-2.5 font-semibold text-slate-500">
          🔑 Tham gia phòng (cần backend)
        </button>
        <button disabled className="rounded-lg border border-slate-700 bg-slate-900 py-2.5 font-semibold text-slate-500">
          ✉️ Mời bạn bè (cần backend)
        </button>
      </div>

      <button onClick={onPlayVsBots} className="mt-2 rounded-lg bg-amber-500 px-5 py-2.5 font-semibold text-slate-900">
        Chơi thử với Bot ngay
      </button>
    </main>
  );
}
