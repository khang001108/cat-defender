"use client";

import { useEffect, useState } from "react";
import { CATS, ENEMIES, UPGRADES } from "@/lib/gameData";
import { MAPS } from "@/lib/maps";
import { CatDefinition, EnemyDefinition, PlayerProfile } from "@/lib/types";
import { loadProfile, saveProfile } from "@/lib/profile";
import BattleScreen from "@/components/BattleScreen";
import AnimatedSprite from "@/components/AnimatedSprite";
import MainMenu from "@/components/MainMenu";
import LoginScreen from "@/components/LoginScreen";
import SettingsScreen from "@/components/SettingsScreen";
import InfoScreen from "@/components/InfoScreen";
import MultiplayerScreen from "@/components/MultiplayerScreen";
import ShopScreen from "@/components/ShopScreen";
import CatPreviewModal from "@/components/CatPreviewModal";

type View =
  | "menu" | "login" | "settings" | "info" | "multiplayer" | "shop"
  | "teamSize" | "catPick" | "mapPick" | "battle" | "result" | "stub";

export default function Home() {
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [view, setView] = useState<View>("menu");
  const [stubLabel, setStubLabel] = useState("");

  const [teamSize, setTeamSize] = useState(1);
  const [pickedCats, setPickedCats] = useState<CatDefinition[]>([]);
  const [previewCat, setPreviewCat] = useState<CatDefinition | null>(null);
  const [map, setMap] = useState(MAPS[0]);
  const [enemyTeam, setEnemyTeam] = useState<EnemyDefinition[]>([]);
  const [lastResult, setLastResult] = useState<boolean | null>(null);

  useEffect(() => {
    setProfile(loadProfile());
    setReady(true);
  }, []);

  function updateProfile(p: PlayerProfile) {
    setProfile(p);
    saveProfile(p);
  }

  function effectiveCat(c: CatDefinition): CatDefinition {
    if (!profile) return c;
    let atk = c.atk, def = c.def, hp = c.hp;
    for (const u of UPGRADES) {
      const lvl = profile.upgradeLevels[u.id] ?? 0;
      if (lvl === 0) continue;
      if (u.stat === "atk") atk += u.amount * lvl;
      if (u.stat === "def") def += u.amount * lvl;
      if (u.stat === "hp") hp += u.amount * lvl;
    }
    return { ...c, atk, def, hp };
  }

  if (!ready || !profile) return null;

  if (view === "menu") {
    return (
      <MainMenu
        profile={profile}
        onNavigate={(dest) => {
          if (dest === "solo") setView("teamSize");
          else if (dest === "friends" || dest === "download") {
            setStubLabel(dest === "friends" ? "Bạn Bè" : "Tải Về");
            setView("stub");
          } else setView(dest as View);
        }}
      />
    );
  }

  if (view === "login") {
    return (
      <LoginScreen
        profile={profile}
        onBack={() => setView("menu")}
        onLogin={(name) => {
          updateProfile({ ...profile, displayName: name, loggedIn: true });
          setView("menu");
        }}
      />
    );
  }

  if (view === "settings") {
    return <SettingsScreen profile={profile} onBack={() => setView("menu")} onSave={(p) => { updateProfile(p); setView("menu"); }} />;
  }

  if (view === "info") {
    return <InfoScreen onBack={() => setView("menu")} />;
  }

  if (view === "multiplayer") {
    return <MultiplayerScreen onBack={() => setView("menu")} onPlayVsBots={() => setView("teamSize")} />;
  }

  if (view === "shop") {
    return (
      <ShopScreen
        profile={profile}
        onBack={() => setView("menu")}
        onBuy={(id) => {
          const u = UPGRADES.find((x) => x.id === id);
          if (!u) return;
          const level = profile.upgradeLevels[id] ?? 0;
          const cost = u.baseCost * (level + 1);
          if (profile.gold < cost) return;
          updateProfile({
            ...profile,
            gold: profile.gold - cost,
            upgradeLevels: { ...profile.upgradeLevels, [id]: level + 1 },
          });
        }}
      />
    );
  }

  if (view === "stub") {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6 text-white">
        <button onClick={() => setView("menu")} className="absolute left-6 top-8 text-xs text-amber-300 underline">
          ← Quay lại
        </button>
        <p className="text-xl font-bold text-amber-300">{stubLabel}</p>
        <p className="max-w-xs text-center text-sm text-slate-400">
          {stubLabel === "Bạn Bè"
            ? "Xem bạn bè đang online cần kết nối máy chủ thật — chưa khả dụng ở bản demo này."
            : "Icon tải về dùng khi đăng ở store thật (Google Play/App Store) — chưa áp dụng cho bản web demo này."}
        </p>
      </main>
    );
  }

  if (view === "teamSize") {
    return (
      <main className="flex min-h-dvh flex-col items-center gap-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6 pt-12 text-white">
        <button onClick={() => setView("menu")} className="self-start text-xs text-amber-300 underline">
          ← Menu chính
        </button>
        <h1 className="text-xl font-bold text-amber-300">Chọn Thể Thức</h1>
        <div className="flex w-full max-w-xs flex-col gap-3">
          {[1, 2, 3].map((n) => (
            <button
              key={n}
              onClick={() => {
                setTeamSize(n);
                setPickedCats([]);
                setView("catPick");
              }}
              className="rounded-xl border border-amber-600 bg-slate-900 py-4 text-center font-bold text-amber-200 hover:bg-slate-800"
            >
              {n === 1 ? "1 vs 1" : n === 2 ? "2 vs 2" : "3 vs 3"}
              <p className="mt-1 text-[11px] font-normal text-slate-400">Bạn + {n - 1} bot đội bạn, đấu theo lượt</p>
            </button>
          ))}
        </div>
      </main>
    );
  }

  if (view === "catPick") {
    return (
      <main className="flex min-h-dvh flex-col items-center gap-4 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6 pt-10 text-white">
        <button onClick={() => setView("teamSize")} className="self-start text-xs text-amber-300 underline">
          ← Đổi thể thức
        </button>
        <h2 className="text-center text-lg font-bold text-amber-300">
          Chọn {teamSize} mèo ({pickedCats.length}/{teamSize})
        </h2>
        <p className="-mt-2 text-[10px] text-slate-500">Chạm vào 1 mèo để xem trước hoạt ảnh &amp; kỹ năng</p>
        <div className="grid grid-cols-3 gap-2.5 pb-4">
          {CATS.map((c) => {
            const picked = pickedCats.some((p) => p.id === c.id);
            const ec = effectiveCat(c);
            return (
              <button
                key={c.id}
                onClick={() => setPreviewCat(c)}
                className={`flex flex-col items-center gap-1 overflow-hidden rounded-xl border p-2 ${picked ? "border-amber-400 bg-amber-900/30" : "border-slate-700 bg-slate-900"}`}
              >
                <AnimatedSprite src={c.sprite.idle.src} frames={c.sprite.idle.frames} fps={8} className="h-16 w-16 bg-contain bg-center bg-no-repeat" />
                <span className="text-center text-[11px] font-semibold leading-tight text-amber-200">{c.name}</span>
                <span className="text-[9px] text-slate-500">HP {ec.hp} · ATK {ec.atk}</span>
              </button>
            );
          })}
        </div>
        {previewCat && (
          <CatPreviewModal
            cat={effectiveCat(previewCat)}
            picked={pickedCats.some((p) => p.id === previewCat.id)}
            onToggle={() => {
              const picked = pickedCats.some((p) => p.id === previewCat.id);
              if (picked) setPickedCats((arr) => arr.filter((p) => p.id !== previewCat.id));
              else if (pickedCats.length < teamSize) setPickedCats((arr) => [...arr, previewCat]);
              setPreviewCat(null);
            }}
            onClose={() => setPreviewCat(null)}
          />
        )}
        {pickedCats.length === teamSize && (
          <button
            onClick={() => {
              const shuffled = [...ENEMIES].sort(() => Math.random() - 0.5).slice(0, teamSize);
              setEnemyTeam(shuffled);
              setView("mapPick");
            }}
            className="fixed bottom-6 rounded-lg bg-amber-500 px-6 py-3 font-bold text-slate-900 shadow-xl"
          >
            Tiếp tục →
          </button>
        )}
      </main>
    );
  }

  if (view === "mapPick") {
    return (
      <main className="flex min-h-dvh flex-col items-center gap-4 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6 pt-10 text-white">
        <button onClick={() => setView("catPick")} className="self-start text-xs text-amber-300 underline">
          ← Đổi mèo
        </button>
        <h2 className="text-lg font-bold text-amber-300">Chọn Bản Đồ</h2>
        <div className="flex w-full max-w-sm flex-col gap-3 pb-4">
          {MAPS.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                setMap(m);
                setView("battle");
              }}
              className="overflow-hidden rounded-xl border border-amber-600 bg-slate-900 hover:bg-slate-800"
            >
              <img src={m.thumb} alt={m.name} className="h-28 w-full object-cover" />
              <p className="p-2 text-sm font-semibold text-amber-200">{m.name}</p>
            </button>
          ))}
        </div>
      </main>
    );
  }

  if (view === "battle") {
    const finalCatTeam = pickedCats.map(effectiveCat);
    return (
      <main className="min-h-dvh bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
        <BattleScreen
          catTeam={finalCatTeam}
          enemyTeam={enemyTeam}
          map={map}
          onExit={() => setView("menu")}
          onResult={(won) => {
            if (won) updateProfile({ ...profile, gold: profile.gold + 30 + teamSize * 10 });
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
        {lastResult && <p className="text-sm text-amber-100">+{30 + teamSize * 10} vàng</p>}
        <div className="flex gap-3">
          <button onClick={() => setView("teamSize")} className="rounded-lg bg-amber-500 px-4 py-2 font-semibold text-slate-900">
            Đấu tiếp
          </button>
          <button onClick={() => setView("menu")} className="rounded-lg border border-amber-600 px-4 py-2 font-semibold text-amber-200">
            Menu chính
          </button>
        </div>
      </main>
    );
  }

  return null;
}
