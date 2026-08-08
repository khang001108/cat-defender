"use client";

import Image from "next/image";

export default function InfoScreen({ onBack }: { onBack: () => void }) {
  return (
    <main className="flex min-h-dvh flex-col items-center gap-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6 pt-12 text-white">
      <button onClick={onBack} className="self-start text-xs text-amber-300 underline">
        ← Quay lại
      </button>
      <Image src="/ui/logo.png" alt="Cat Defender" width={220} height={95} className="w-48" />
      <div className="w-full max-w-xs rounded-xl border border-amber-600 bg-slate-900 p-5 text-center">
        <p className="text-lg font-bold text-amber-300">Cat Defender</p>
        <p className="mt-3 text-sm text-slate-300">Trò chơi bản quyền do</p>
        <p className="text-xl font-bold text-amber-200">Ronin-Lap</p>
        <p className="text-sm text-slate-300">thực hiện.</p>
        <p className="mt-4 text-[11px] text-slate-500">
          Hình ảnh nhân vật &amp; hiệu ứng sử dụng bộ asset &quot;Cartoon Cat Defense&quot; (Craftpix), dùng theo giấy phép
          gốc của bộ asset.
        </p>
      </div>
    </main>
  );
}
