"use client";

import { useEffect, useRef, useState } from "react";
import { Board, createBoard, cloneBoard, swapCells, findMatches, resolveMatches, BOARD_SIZE } from "@/lib/board";
import { BattleLogEntry, CatDefinition, EnemyDefinition, TileType } from "@/lib/types";
import Match3Grid, { Burst } from "./Match3Grid";
import { FloatingNumber } from "./Effects";
import { TileIcon } from "./TileIcon";
import AnimatedSprite from "./AnimatedSprite";

type Phase = "fighting" | "victory" | "defeat";
type CatPose = "idle" | "shoot" | "dead";
type EnemyPose = "idle" | "attack" | "dead";

const SKILL_LEGEND: { type: TileType; name: string; desc: string }[] = [
  { type: "attack", name: "Bắn", desc: "Gây sát thương" },
  { type: "heal", name: "Hồi Máu", desc: "Hồi máu bản thân" },
  { type: "mana", name: "Đạn Đặc Biệt", desc: "Tích năng lượng" },
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
  const [mp, setMp] = useState(0);
  const maxMp = cat.mp;
  const [enemyHp, setEnemyHp] = useState(enemy.hp);
  const [shield, setShield] = useState(0);
  const [score, setScore] = useState(0);
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState<Phase>("fighting");
  const [round, setRound] = useState(1);
  const [autoBattle, setAutoBattle] = useState(false);
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
  const pendingScore = useRef(0);

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

  async function handleSwap(r1: number, c1: number, r2: number, c2: number) {
    if (busy || phase !== "fighting") return;
    const test = cloneBoard(board);
    swapCells(test, r1, c1, r2, c2);
    if (findMatches(test).length === 0) return;

    setBusy(true);
    let working = test;
    const totals: Record<TileType, number> = { attack: 0, defense: 0, mana: 0, heal: 0, gold: 0 };

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { board: nextBoard, counts, clearedCells } = resolveMatches(working);
      const changed = Object.values(counts).some((v) => v > 0);
      if (!changed) break;
      (Object.keys(counts) as TileType[]).forEach((k) => (totals[k] += counts[k]));
      spawnBursts(clearedCells);
      working = nextBoard;
      setBoard(working);
      await sleep(160 / speed);
    }

    applyPlayerTurn(totals);
    setBoard(working);
    setRound((r) => r + 1);

    await sleep(400 / speed);
    setBusy(false);
  }

  function applyPlayerTurn(totals: Record<TileType, number>) {
    let dmg = 0;
    let healAmt = 0;
    let shieldGain = 0;
    let mpGain = 0;
    let scoreGain = 0;

    if (totals.attack > 0) dmg += Math.round(totals.attack * cat.atk * 0.5);
    if (totals.defense > 0) shieldGain += totals.defense * 3;
    if (totals.heal > 0) healAmt += totals.heal * 6;
    if (totals.mana > 0) mpGain += totals.mana * 10;
    if (totals.gold > 0) scoreGain += totals.gold * 4;

    let skillFired = false;
    setMp((prev) => {
      let n = prev + mpGain;
      if (n >= maxMp) {
        n -= maxMp;
        skillFired = true;
      }
      return Math.min(maxMp, Math.max(0, n));
    });
    if (skillFired) dmg += Math.round(cat.atk * 3);

    if (dmg > 0) {
      playCatPose("shoot", skillFired ? 650 : 400);
      setTimeout(
        () => {
          setEnemyHurt(true);
          setEnemyHitTick((t) => t + 1);
          setTimeout(() => setEnemyHurt(false), 400 / speed);
          spawnFloater(dmg, skillFired ? "crit" : "damage", "enemy");
        },
        skillFired ? 280 : 140
      );
      setEnemyHp((h) => {
        const nh = Math.max(0, h - dmg);
        pushLog(skillFired ? `Đạn đặc biệt gây ${dmg} sát thương!` : `Bạn bắn, gây ${dmg} sát thương.`, "player");
        if (nh <= 0) finishBattle(true);
        return nh;
      });
    }
    if (healAmt > 0) {
      setHp((h) => Math.min(cat.hp, h + healAmt));
      pushLog(`Bạn hồi ${healAmt} máu.`, "player");
      spawnFloater(healAmt, "heal", "cat");
    }
    if (shieldGain > 0) {
      setShield((s) => s + shieldGain);
      pushLog(`Bạn dựng khiên +${shieldGain}.`, "player");
    }
    if (scoreGain > 0) {
      pendingScore.current += scoreGain;
      setScore((s) => s + scoreGain);
      pushLog(`+${scoreGain} điểm.`, "player");
    }

    setTimeout(() => enemyCounterattack(), 500 / speed);
  }

  function enemyCounterattack() {
    setPhase((p) => {
      if (p === "fighting") playEnemyPose("attack", 500);
      return p;
    });
    setShield((currentShield) => {
      const rawDmg = enemy.atk + Math.round(Math.random() * 4);
      const mitigated = Math.max(1, rawDmg - currentShield - cat.def);
      setTimeout(
        () => {
          setHp((h) => {
            const nh = Math.max(0, h - mitigated);
            pushLog(`${enemy.name} phản công, gây ${mitigated} sát thương.`, "enemy");
            if (nh <= 0) finishBattle(false);
            else {
              setCatHurt(true);
              setCatHitTick((t) => t + 1);
              setTimeout(() => setCatHurt(false), 400 / speed);
            }
            return nh;
          });
          spawnFloater(mitigated, "damage", "cat");
        },
        250 / speed
      );
      return Math.max(0, currentShield - rawDmg);
    });
  }

  function finishBattle(won: boolean) {
    setPhase(won ? "victory" : "defeat");
    if (won) playEnemyPose("dead", 99999);
    else playCatPose("dead", 99999);
  }

  useEffect(() => {
    if (!autoBattle || busy || phase !== "fighting") return;
    const t = setTimeout(() => {
      const move = findAnyValidMove(board);
      if (move) handleSwap(move[0], move[1], move[2], move[3]);
    }, 550 / speed);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoBattle, busy, phase, board, speed]);

  const catSprite =
    catPose === "shoot" && cat.sprite.shoot
      ? cat.sprite.shoot
      : catPose === "dead"
      ? cat.sprite.dead
      : cat.sprite.idle;
  const enemySprite =
    enemyPose === "attack" && enemy.sprite.attack
      ? enemy.sprite.attack
      : enemyPose === "dead"
      ? enemy.sprite.dead
      : enemy.sprite.idle;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-2 overflow-x-hidden p-3">
      <div className="flex items-center justify-between gap-1">
        <button onClick={onExit} className="shrink-0 text-xs text-amber-300 underline">
          ← Thoát
        </button>
        <span className="shrink-0 rounded-full border border-amber-600 bg-slate-900 px-2.5 py-0.5 text-[10px] font-semibold text-amber-300">
          Hiệp {round}
        </span>
        <div className="flex shrink-0 gap-1">
          <button
            onClick={() => setAutoBattle((a) => !a)}
            className={`rounded px-2 py-1 text-[10px] font-semibold ${autoBattle ? "bg-amber-500 text-slate-900" : "bg-slate-800 text-amber-300"}`}
          >
            Tự Động
          </button>
          <button
            onClick={() => setSpeed((s) => (s === 1 ? 2 : 1))}
            className={`rounded px-2 py-1 text-[10px] font-semibold ${speed === 2 ? "bg-amber-500 text-slate-900" : "bg-slate-800 text-amber-300"}`}
          >
            x{speed}
          </button>
        </div>
      </div>

      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-amber-700/50 bg-slate-900/80 p-2">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-amber-400 bg-slate-800">
            <AnimatedSprite src={cat.sprite.idle.src} frames={cat.sprite.idle.frames} fps={10} className="h-full w-full scale-150 bg-center" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-semibold text-amber-200">{cat.name}</p>
            <Bar color="bg-red-500" value={hp} max={cat.hp} />
            <Bar color="bg-sky-500" value={mp} max={maxMp} />
          </div>
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-red-700/50 bg-slate-900/80 p-2">
          <div className="min-w-0 flex-1 text-right">
            <p className="truncate text-[11px] font-semibold text-red-200">{enemy.name}</p>
            <Bar color="bg-red-500" value={enemyHp} max={enemy.hp} align="right" />
          </div>
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-red-500 bg-slate-800">
            <AnimatedSprite src={enemy.sprite.idle.src} frames={enemy.sprite.idle.frames} fps={10} className="h-full w-full scale-150 bg-center" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 rounded-xl border border-amber-700/30 bg-slate-950/40 p-2">
        <div className="relative z-10 flex h-24 w-24 shrink-0 items-center justify-center overflow-visible">
          <div className="h-full w-full overflow-hidden">
            <div key={catHitTick} className={`h-full w-full ${catHurt ? "anim-hurt" : catPose === "shoot" ? "anim-attack-right" : ""}`}>
              <AnimatedSprite
                key={catPlayKey}
                src={catSprite.src}
                frames={catSprite.frames}
                fps={catPose === "idle" ? 8 : 14}
                loop={catPose === "idle"}
                className="h-full w-full bg-center bg-no-repeat"
              />
            </div>
          </div>
          {floaters
            .filter((f) => f.target === "cat")
            .map((f) => (
              <FloatingNumber key={f.id} value={f.value} kind={f.kind} style={{ left: "50%", top: "0%", transform: "translateX(-50%)" }} />
            ))}
        </div>
        {shield > 0 && <span className="shrink-0 text-xs text-sky-300">🛡 +{shield}</span>}
        <div className="shrink-0 text-2xl">🔫</div>
        <div className="relative z-10 flex h-24 w-24 shrink-0 items-center justify-center overflow-visible rounded-lg border border-red-700/40 bg-slate-900/60">
          <div className="h-full w-full overflow-hidden">
            <div key={enemyHitTick} className={`h-full w-full ${enemyHurt ? "anim-hurt" : enemyPose === "attack" ? "anim-attack-left" : ""}`}>
              <AnimatedSprite
                key={enemyPlayKey}
                src={enemySprite.src}
                frames={enemySprite.frames}
                fps={enemyPose === "idle" ? 8 : 14}
                loop={enemyPose === "idle"}
                facing="left"
                className="h-full w-full bg-center bg-no-repeat"
              />
            </div>
          </div>
          {floaters
            .filter((f) => f.target === "enemy")
            .map((f) => (
              <FloatingNumber key={f.id} value={f.value} kind={f.kind} style={{ left: "50%", top: "0%", transform: "translateX(-50%)" }} />
            ))}
        </div>
      </div>

      <Match3Grid board={board} onSwap={handleSwap} disabled={busy || phase !== "fighting" || autoBattle} bursts={bursts} />

      <div className="grid grid-cols-4 gap-1.5">
        {SKILL_LEGEND.map((s) => (
          <div key={s.type} className="min-w-0 rounded-lg border border-amber-700/30 bg-slate-900/60 p-1.5 text-center">
            <TileIcon type={s.type} className="mx-auto h-6 w-6" />
            <p className="truncate text-[9px] font-semibold text-amber-200">{s.name}</p>
            <p className="truncate text-[8px] text-slate-400">{s.desc}</p>
          </div>
        ))}
      </div>

      <div className="max-h-20 space-y-0.5 overflow-y-auto rounded-lg bg-slate-950/60 p-2 text-[11px]">
        {log.map((l) => (
          <div key={l.id} className={l.kind === "player" ? "text-sky-300" : l.kind === "enemy" ? "text-red-300" : "text-amber-300"}>
            {l.text}
          </div>
        ))}
      </div>

      {phase !== "fighting" && (
        <div className="rounded-xl border border-amber-500 bg-slate-900 p-4 text-center">
          <p className="mb-2 text-lg font-bold text-amber-300">{phase === "victory" ? "🎉 Chiến thắng!" : "💀 Thất bại"}</p>
          {phase === "victory" && <p className="mb-3 text-sm text-amber-100">Điểm: {score}</p>}
          <button onClick={() => onResult(phase === "victory")} className="rounded-lg bg-amber-500 px-4 py-2 font-semibold text-slate-900">
            Tiếp tục
          </button>
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

function findAnyValidMove(board: Board): [number, number, number, number] | null {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (c < BOARD_SIZE - 1) {
        const test = cloneBoard(board);
        swapCells(test, r, c, r, c + 1);
        if (findMatches(test).length > 0) return [r, c, r, c + 1];
      }
      if (r < BOARD_SIZE - 1) {
        const test = cloneBoard(board);
        swapCells(test, r, c, r + 1, c);
        if (findMatches(test).length > 0) return [r, c, r + 1, c];
      }
    }
  }
  return null;
}

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}
