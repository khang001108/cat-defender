"use client";

import { useEffect, useRef, useState } from "react";
import { Board, createBoard, cloneBoard, swapCells, findMatches, resolveMatches, findBestMove } from "@/lib/board";
import { BattleLogEntry, CatDefinition, EnemyDefinition, TileType } from "@/lib/types";
import Match3Grid, { Burst } from "./Match3Grid";
import { FloatingNumber, Bullet } from "./Effects";
import { TileIcon } from "./TileIcon";
import AnimatedSprite from "./AnimatedSprite";

type Phase = "fighting" | "victory" | "defeat";
type Side = "player" | "enemy";
type CatPose = "idle" | "shoot" | "dead";
type EnemyPose = "idle" | "attack" | "dead";

const ENEMY_MAX_MP = 100;
const DISPLAY_MAX_TIME = 30; // seconds, just for the bar-fill percentage
const TIME_PER_ENERGY_TILE = 4; // seconds gained per matched energy tile

const SKILL_LEGEND: { type: TileType; name: string; desc: string }[] = [
  { type: "attack", name: "Bắn", desc: "Gây sát thương" },
  { type: "heal", name: "Hồi Máu", desc: "Hồi máu bản thân" },
  { type: "mana", name: "Năng Lượng", desc: "Cộng thời gian" },
  { type: "defense", name: "Khiên", desc: "Giảm sát thương" },
];

export default function BattleScreen({
  cat,
  enemy,
  onExit,
  onResult,
}: {
  cat: CatDefinition;
  enemy: EnemyDefinition;
  onExit: () => void;
  onResult: (won: boolean) => void;
}) {
  const [board, setBoard] = useState<Board>(() => createBoard());
  const [hp, setHp] = useState(cat.hp);
  const [timeBank, setTimeBank] = useState(Math.round(cat.mp / 5));
  const [shield, setShield] = useState(0);
  const [enemyHp, setEnemyHp] = useState(enemy.hp);
  const [enemyMp, setEnemyMp] = useState(0);
  const [enemyShield, setEnemyShield] = useState(0);
  const [score, setScore] = useState(0);

  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState<Phase>("fighting");
  const [round, setRound] = useState(1);
  const [turn, setTurn] = useState<Side>("player");
  const [pendingCredits, setPendingCredits] = useState(1);
  const [speed, setSpeed] = useState<1 | 2>(1);

  const [log, setLog] = useState<BattleLogEntry[]>([{ id: 0, text: `${enemy.name} xuất hiện!`, kind: "system" }]);
  const logId = useRef(1);

  const [catPose, setCatPose] = useState<CatPose>("idle");
  const [catPlayKey, setCatPlayKey] = useState(0);
  const [catHitTick, setCatHitTick] = useState(0);
  const [catHurt, setCatHurt] = useState(false);

  const [enemyPose, setEnemyPose] = useState<EnemyPose>("idle");
  const [enemyPlayKey, setEnemyPlayKey] = useState(0);
  const [enemyHurt, setEnemyHurt] = useState(false);
  const [enemyHitTick, setEnemyHitTick] = useState(0);

  const [bursts, setBursts] = useState<Burst[]>([]);
  const burstId = useRef(0);
  const [floaters, setFloaters] = useState<
    { id: number; value: number; kind: "damage" | "heal" | "crit"; target: "cat" | "enemy" }[]
  >([]);
  const floaterId = useRef(0);
  const [bullets, setBullets] = useState<{ id: number; direction: "left" | "right"; crit: boolean }[]>([]);
  const bulletId = useRef(0);

  const [fallingCells, setFallingCells] = useState<{ r: number; c: number }[]>([]);
  const [updateTick, setUpdateTick] = useState(0);

  function spawnBursts(cells: { r: number; c: number; type: TileType }[]) {
    const fresh = cells.map((c) => ({ id: burstId.current++, r: c.r, c: c.c, type: c.type }));
    setBursts((b) => [...b, ...fresh]);
    fresh.forEach((b) => setTimeout(() => setBursts((cur) => cur.filter((x) => x.id !== b.id)), 550 / speed));
  }

  function spawnFloater(value: number, kind: "damage" | "heal" | "crit", target: "cat" | "enemy") {
    const id = floaterId.current++;
    setFloaters((f) => [...f, { id, value, kind, target }]);
    setTimeout(() => setFloaters((f) => f.filter((x) => x.id !== id)), 1100);
  }

  function spawnBullet(direction: "left" | "right", crit: boolean) {
    const id = bulletId.current++;
    setBullets((b) => [...b, { id, direction, crit }]);
    setTimeout(() => setBullets((b) => b.filter((x) => x.id !== id)), 350);
  }

  function pushLog(text: string, kind: BattleLogEntry["kind"]) {
    setLog((l) => [...l.slice(-30), { id: logId.current++, text, kind }]);
  }

  function playCatPose(p: CatPose, duration = 500) {
    setCatPose(p);
    setCatPlayKey((k) => k + 1);
    if (p !== "dead") setTimeout(() => setCatPose((cur) => (cur === p ? "idle" : cur)), duration / speed);
  }
  function playEnemyPose(p: EnemyPose, duration = 500) {
    setEnemyPose(p);
    setEnemyPlayKey((k) => k + 1);
    if (p !== "dead") setTimeout(() => setEnemyPose((cur) => (cur === p ? "idle" : cur)), duration / speed);
  }

  // ---- Time bank: ticks down continuously during the player's turn. Turns changing hands does
  // NOT refill it — only matching energy tiles does. Hits 0 -> instant defeat. ----
  useEffect(() => {
    if (turn !== "player" || phase !== "fighting" || busy) return;
    const interval = setInterval(() => {
      setTimeBank((t) => Math.max(0, t - 0.1));
    }, 100);
    return () => clearInterval(interval);
  }, [turn, phase, busy]);

  useEffect(() => {
    if (timeBank <= 0 && phase === "fighting") {
      pushLog("Hết thời gian! Bạn thua trận.", "system");
      finishBattle(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeBank]);

  // ---- AI turn trigger ----
  useEffect(() => {
    if (turn !== "enemy" || phase !== "fighting" || busy) return;
    const t = setTimeout(() => {
      const move = findBestMove(board, { attack: 3, mana: 1 });
      if (!move) return;
      const test = cloneBoard(board);
      swapCells(test, move[0], move[1], move[2], move[3]);
      processCascade(test, "enemy");
    }, 700 / speed);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn, phase, busy, board]);

  async function handleSwap(r1: number, c1: number, r2: number, c2: number) {
    if (busy || phase !== "fighting" || turn !== "player") return;
    const test = cloneBoard(board);
    swapCells(test, r1, c1, r2, c2);
    if (findMatches(test).length === 0) return;
    await processCascade(test, "player");
  }

  async function processCascade(startBoard: Board, actingSide: Side) {
    setBusy(true);
    let working = startBoard;
    const totals: Record<TileType, number> = { attack: 0, defense: 0, mana: 0, heal: 0, gold: 0 };
    let maxSize = 0;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { board: nextBoard, counts, clearedCells, maxMatchSize, newCells } = resolveMatches(working);
      const changed = Object.values(counts).some((v) => v > 0);
      if (!changed) break;
      (Object.keys(counts) as TileType[]).forEach((k) => (totals[k] += counts[k]));
      maxSize = Math.max(maxSize, maxMatchSize);
      spawnBursts(clearedCells);
      working = nextBoard;
      setBoard(working);
      setFallingCells(newCells);
      setUpdateTick((t) => t + 1);
      await sleep(190 / speed);
    }

    setRound((r) => r + 1);
    applyTurnEffects(totals, actingSide, maxSize);
    await sleep(350 / speed);
    setBusy(false);
  }

  function applyTurnEffects(totals: Record<TileType, number>, side: Side, maxSize: number) {
    const isPlayer = side === "player";
    const atk = isPlayer ? cat.atk : enemy.atk;
    const def = isPlayer ? 0 : cat.def; // defense reduces damage taken BY the player from the enemy

    let dmg = 0;
    let healAmt = 0;
    let shieldGain = 0;
    let mpGain = 0;
    let scoreGain = 0;

    if (totals.attack > 0) dmg += Math.round(totals.attack * atk * 0.5);
    if (totals.defense > 0) shieldGain += totals.defense * 3;
    if (totals.heal > 0) healAmt += totals.heal * 6;
    if (totals.gold > 0) scoreGain += totals.gold * 4;

    // Energy tiles behave differently per side: the player's energy directly refills their
    // battle-long time bank (turns changing hands does NOT refill it, only this does); the
    // enemy still uses the classic charge-to-special mechanic.
    if (totals.mana > 0) {
      if (isPlayer) {
        const timeGain = totals.mana * TIME_PER_ENERGY_TILE;
        setTimeBank((t) => t + timeGain);
        pushLog(`Nạp năng lượng: +${timeGain}s thời gian!`, "player");
      } else {
        mpGain += totals.mana * 10;
      }
    }

    let skillFired = false;
    if (!isPlayer) {
      setEnemyMp((prev) => {
        let n = prev + mpGain;
        if (n >= ENEMY_MAX_MP) {
          n -= ENEMY_MAX_MP;
          skillFired = true;
        }
        return Math.min(ENEMY_MAX_MP, Math.max(0, n));
      });
    }
    if (skillFired) dmg += Math.round(atk * 3);

    if (dmg > 0) {
      const finalDmg = Math.max(1, dmg - (isPlayer ? 0 : def));
      if (isPlayer) {
        playCatPose("shoot", skillFired ? 650 : 400);
      } else {
        playEnemyPose("attack", skillFired ? 650 : 400);
      }
      setTimeout(
        () => {
          spawnBullet(isPlayer ? "right" : "left", skillFired);
        },
        isPlayer ? 120 : 180
      );
      setTimeout(
        () => {
          if (isPlayer) {
            setEnemyHurt(true);
            setEnemyHitTick((t) => t + 1);
            setTimeout(() => setEnemyHurt(false), 400 / speed);
          } else {
            setCatHurt(true);
            setCatHitTick((t) => t + 1);
            setTimeout(() => setCatHurt(false), 400 / speed);
          }
          spawnFloater(finalDmg, skillFired ? "crit" : "damage", isPlayer ? "enemy" : "cat");
        },
        (isPlayer ? 120 : 180) + 260
      );

      if (isPlayer) {
        setEnemyShield((s) => {
          const mitigated = Math.max(1, finalDmg - s);
          setEnemyHp((h) => {
            const nh = Math.max(0, h - mitigated);
            pushLog(skillFired ? `Đạn năng lượng gây ${mitigated} sát thương!` : `Bạn bắn, gây ${mitigated} sát thương.`, "player");
            if (nh <= 0) finishBattle(true);
            return nh;
          });
          return Math.max(0, s - finalDmg);
        });
      } else {
        setShield((s) => {
          const mitigated = Math.max(1, finalDmg - s);
          setHp((h) => {
            const nh = Math.max(0, h - mitigated);
            pushLog(
              skillFired ? `${enemy.name} tung đòn năng lượng, gây ${mitigated} sát thương!` : `${enemy.name} bắn, gây ${mitigated} sát thương.`,
              "enemy"
            );
            if (nh <= 0) finishBattle(false);
            return nh;
          });
          return Math.max(0, s - finalDmg);
        });
      }
    }

    if (healAmt > 0) {
      if (isPlayer) {
        setHp((h) => Math.min(cat.hp, h + healAmt));
        spawnFloater(healAmt, "heal", "cat");
        pushLog(`Bạn hồi ${healAmt} máu.`, "player");
      } else {
        setEnemyHp((h) => Math.min(enemy.hp, h + healAmt));
        spawnFloater(healAmt, "heal", "enemy");
        pushLog(`${enemy.name} hồi ${healAmt} máu.`, "enemy");
      }
    }
    if (shieldGain > 0) {
      if (isPlayer) {
        setShield((s) => s + shieldGain);
        pushLog(`Bạn dựng khiên +${shieldGain}.`, "player");
      } else {
        setEnemyShield((s) => s + shieldGain);
        pushLog(`${enemy.name} dựng khiên +${shieldGain}.`, "enemy");
      }
    }
    if (scoreGain > 0 && isPlayer) {
      setScore((s) => s + scoreGain);
      pushLog(`+${scoreGain} điểm.`, "player");
    }

    // ---- Bonus-turn accounting ----
    const bonus = maxSize >= 5 ? 2 : maxSize === 4 ? 1 : 0;
    setPendingCredits((prevCredits) => {
      const remaining = Math.max(0, prevCredits - 1) + bonus;
      if (bonus > 0) pushLog(`Ghép ${maxSize} viên — ${side === "player" ? "bạn" : enemy.name} được +${bonus} lượt!`, "system");
      if (remaining > 0) {
        return remaining; // same side continues
      }
      setTurn(side === "player" ? "enemy" : "player");
      return 1;
    });
  }

  function finishBattle(won: boolean) {
    setPhase(won ? "victory" : "defeat");
    if (won) playEnemyPose("dead", 99999);
    else playCatPose("dead", 99999);
  }

  const catSprite = catPose === "shoot" && cat.sprite.shoot ? cat.sprite.shoot : cat.sprite.idle;
  const enemySprite = enemyPose === "attack" && enemy.sprite.attack ? enemy.sprite.attack : enemy.sprite.idle;
  const catDefeated = phase === "defeat";
  const enemyDefeated = phase === "victory";

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-2 overflow-x-hidden p-3">
      <div className="flex items-center justify-between gap-1">
        <button onClick={onExit} className="shrink-0 text-xs text-amber-300 underline">
          ← Thoát
        </button>
        <span className="shrink-0 rounded-full border border-amber-600 bg-slate-900 px-2.5 py-0.5 text-[10px] font-semibold text-amber-300">
          Hiệp {round}
        </span>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
            turn === "player" ? "bg-sky-600 text-white" : "bg-red-600 text-white"
          }`}
        >
          {turn === "player" ? "Lượt của bạn" : "Lượt đối thủ"}
        </span>
        <button
          onClick={() => setSpeed((s) => (s === 1 ? 2 : 1))}
          className={`shrink-0 rounded px-2 py-1 text-[10px] font-semibold ${speed === 2 ? "bg-amber-500 text-slate-900" : "bg-slate-800 text-amber-300"}`}
        >
          x{speed}
        </button>
      </div>

      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 flex-col gap-1 rounded-xl border border-amber-700/50 bg-slate-900/80 p-2">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-amber-400 bg-slate-800">
              <AnimatedSprite src={cat.sprite.idle.src} frames={cat.sprite.idle.frames} fps={10} className="h-full w-full scale-150" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-semibold text-amber-200">{cat.name}</p>
              <Bar color="bg-red-500" value={hp} max={cat.hp} />
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="shrink-0 text-[10px] text-amber-300">⏱</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">
              <div
                className={`h-full transition-all duration-150 ${timeBank <= 5 ? "bg-red-500" : "bg-amber-400"}`}
                style={{ width: `${Math.min(100, (timeBank / DISPLAY_MAX_TIME) * 100)}%` }}
              />
            </div>
            <span className={`shrink-0 text-[10px] font-semibold ${timeBank <= 5 ? "text-red-400" : "text-amber-200"}`}>
              {timeBank.toFixed(1)}s
            </span>
          </div>
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-red-700/50 bg-slate-900/80 p-2">
          <div className="min-w-0 flex-1 text-right">
            <p className="truncate text-[11px] font-semibold text-red-200">{enemy.name}</p>
            <Bar color="bg-red-500" value={enemyHp} max={enemy.hp} align="right" />
          </div>
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-red-500 bg-slate-800">
            <AnimatedSprite src={enemy.sprite.idle.src} frames={enemy.sprite.idle.frames} fps={10} className="h-full w-full scale-150" />
          </div>
        </div>
      </div>

      <div
        className="relative flex items-center justify-between gap-2 overflow-hidden rounded-xl border border-amber-700/30 bg-slate-950/40 bg-cover bg-center p-2"
        style={{ backgroundImage: "url(/sprites/battle_bg.jpg)" }}
      >
        <div className="absolute inset-0 bg-slate-950/25" />
        <div className="relative z-10 flex h-24 w-24 shrink-0 items-center justify-center overflow-visible">
          <div className="h-full w-full overflow-hidden">
            <div key={catHitTick} className={`h-full w-full ${catHurt ? "anim-hurt" : catPose === "shoot" ? "anim-attack-right" : ""}`}>
              <div className={`h-full w-full ${catDefeated ? "anim-dead" : ""}`}>
                <AnimatedSprite
                  key={catPlayKey}
                  src={catSprite.src}
                  frames={catSprite.frames}
                  fps={catPose === "idle" ? 8 : 14}
                  loop={catPose === "idle" && !catDefeated}
                  className="h-full w-full"
                />
              </div>
            </div>
          </div>
          {floaters
            .filter((f) => f.target === "cat")
            .map((f) => (
              <FloatingNumber key={f.id} value={f.value} kind={f.kind} style={{ left: "50%", top: "0%", transform: "translateX(-50%)" }} />
            ))}
        </div>
        {shield > 0 && <span className="relative z-10 shrink-0 text-xs text-sky-300">🛡 +{shield}</span>}
        {enemyShield > 0 && <span className="relative z-10 shrink-0 text-xs text-red-300">🛡 +{enemyShield}</span>}
        <div className="relative z-10 flex h-24 w-24 shrink-0 items-center justify-center overflow-visible rounded-lg border border-red-700/40 bg-slate-900/50">
          <div className="h-full w-full overflow-hidden">
            <div key={enemyHitTick} className={`h-full w-full ${enemyHurt ? "anim-hurt" : enemyPose === "attack" ? "anim-attack-left" : ""}`}>
              <div className={`h-full w-full ${enemyDefeated ? "anim-dead" : ""}`}>
                <AnimatedSprite
                  key={enemyPlayKey}
                  src={enemySprite.src}
                  frames={enemySprite.frames}
                  fps={enemyPose === "idle" ? 8 : 14}
                  loop={enemyPose === "idle" && !enemyDefeated}
                  className="h-full w-full"
                />
              </div>
            </div>
          </div>
          {floaters
            .filter((f) => f.target === "enemy")
            .map((f) => (
              <FloatingNumber key={f.id} value={f.value} kind={f.kind} style={{ left: "50%", top: "0%", transform: "translateX(-50%)" }} />
            ))}
        </div>
        {bullets.map((b) => (
          <Bullet key={b.id} direction={b.direction} crit={b.crit} />
        ))}
      </div>

      <div className="max-h-20 space-y-0.5 overflow-y-auto rounded-lg bg-slate-950/60 p-2 text-[11px]">
        {log.map((l) => (
          <div key={l.id} className={l.kind === "player" ? "text-sky-300" : l.kind === "enemy" ? "text-red-300" : "text-amber-300"}>
            {l.text}
          </div>
        ))}
      </div>

      <Match3Grid
        board={board}
        onSwap={handleSwap}
        disabled={busy || phase !== "fighting" || turn !== "player"}
        bursts={bursts}
        fallingCells={fallingCells}
        updateTick={updateTick}
      />

      <div className="grid grid-cols-4 gap-1.5">
        {SKILL_LEGEND.map((s) => (
          <div key={s.type} className="min-w-0 rounded-lg border border-amber-700/30 bg-slate-900/60 p-1.5 text-center">
            <TileIcon type={s.type} className="mx-auto h-6 w-6" />
            <p className="truncate text-[9px] font-semibold text-amber-200">{s.name}</p>
            <p className="truncate text-[8px] text-slate-400">{s.desc}</p>
          </div>
        ))}
      </div>

      {phase !== "fighting" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
          <div className="w-full max-w-xs rounded-xl border border-amber-500 bg-slate-900 p-5 text-center shadow-2xl">
            <p className="mb-2 text-xl font-bold text-amber-300">{phase === "victory" ? "🎉 Chiến thắng!" : "💀 Thất bại"}</p>
            {phase === "victory" && <p className="mb-3 text-sm text-amber-100">Điểm: {score}</p>}
            <button onClick={() => onResult(phase === "victory")} className="rounded-lg bg-amber-500 px-5 py-2 font-semibold text-slate-900">
              Tiếp tục
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Bar({ color, value, max, align }: { color: string; value: number; max: number; align?: "right" }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-slate-800 ${align === "right" ? "ml-auto" : ""}`}>
      <div className={`h-full ${color} transition-all duration-300`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}
