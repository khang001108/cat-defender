"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Board, createBoard, cloneBoard, swapCells, findMatches, resolveMatches, findBestMove, clearRandomArea, absorbAllOfType } from "@/lib/board";
import { CatDefinition, EnemyDefinition, TileType } from "@/lib/types";
import { SKILLS_BY_CAT, SkillTier } from "@/lib/skills";
import { BattleMap } from "@/lib/maps";
import Match3Grid, { Burst, ExternalSwapSignal } from "./Match3Grid";
import { FloatingNumber, Bullet, ImpactHit, Toast } from "./Effects";
import { TileIcon } from "./TileIcon";
import AnimatedSprite from "./AnimatedSprite";

type Phase = "fighting" | "victory" | "defeat";
type Side = "player" | "enemy";
type CatPose = "idle" | "shoot" | "dead";
type EnemyPose = "idle" | "attack" | "dead";

const ENEMY_MAX_MP = 100;
const MAX_TIME = 180; // 3 minutes total for the whole match — the hard cap energy tiles can refill up to
const TIME_PER_ENERGY_TILE = 4; // seconds gained per matched energy tile
const SKILL_TILES_PER_PIP = 3; // matching this many "skill" tiles in one group grants 1 pip
const MAX_PIPS = 3;
const HINT_DELAY = 10000; // show a hint after 10s of player inactivity

const SKILL_LEGEND: { type: TileType; name: string; desc: string }[] = [
  { type: "attack", name: "Bắn", desc: "Gây sát thương" },
  { type: "heal", name: "Hồi Máu", desc: "Hồi máu bản thân" },
  { type: "gold", name: "Năng Lượng", desc: "Cộng thời gian" },
  { type: "defense", name: "Khiên", desc: "Giảm sát thương" },
];

export default function BattleScreen({
  catTeam,
  enemyTeam,
  map,
  onExit,
  onResult,
}: {
  catTeam: CatDefinition[];
  enemyTeam: EnemyDefinition[];
  map: BattleMap;
  onExit: () => void;
  onResult: (won: boolean) => void;
}) {
  const [board, setBoard] = useState<Board>(() => createBoard());
  const [activeCatIdx, setActiveCatIdx] = useState(0);
  const [activeEnemyIdx, setActiveEnemyIdx] = useState(0);
  const [catHpArr, setCatHpArr] = useState(() => catTeam.map((c) => c.hp));
  const [enemyHpArr, setEnemyHpArr] = useState(() => enemyTeam.map((e) => e.hp));

  const cat = catTeam[activeCatIdx];
  const enemy = enemyTeam[activeEnemyIdx];
  const hp = catHpArr[activeCatIdx];
  const enemyHp = enemyHpArr[activeEnemyIdx];

  const [timeBank, setTimeBank] = useState(MAX_TIME);
  const [enemyTimeBank, setEnemyTimeBank] = useState(MAX_TIME);
  const [shield, setShield] = useState(0);
  const [enemyShield, setEnemyShield] = useState(0);
  const [enemyMp, setEnemyMp] = useState(0);
  const [skillPips, setSkillPips] = useState(0);
  const [skillMenuOpen, setSkillMenuOpen] = useState(false);
  const [fullBlockHits, setFullBlockHits] = useState(0);
  const [reflectStatus, setReflectStatus] = useState<{ turnsLeft: number; mult: number } | null>(null);
  const [poisonStatus, setPoisonStatus] = useState<{ percent: number; turnsLeft: number } | null>(null);
  const [buffDamageMult, setBuffDamageMult] = useState<{ mult: number; turnsLeft: number } | null>(null);
  const [buffNextAttackMult, setBuffNextAttackMult] = useState<number | null>(null);
  const [boxingCatTurns, setBoxingCatTurns] = useState(0);
  const [score, setScore] = useState(0);
  const [paused, setPaused] = useState(false);

  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState<Phase>("fighting");
  const [round, setRound] = useState(1);
  const [turn, setTurn] = useState<Side>("player");
  const [pendingCredits, setPendingCredits] = useState(1);
  const [speed, setSpeed] = useState<1 | 2>(1);

  const [toast, setToast] = useState<{ id: number; text: string; kind: "player" | "enemy" | "system" } | null>(null);
  const toastId = useRef(0);

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
  const [impacts, setImpacts] = useState<number[]>([]);
  const impactId = useRef(0);

  const [fallingCells, setFallingCells] = useState<{ r: number; c: number }[]>([]);
  const [updateTick, setUpdateTick] = useState(0);
  const [externalSwap, setExternalSwap] = useState<ExternalSwapSignal | null>(null);
  const externalSwapKey = useRef(0);

  const [hint, setHint] = useState<[number, number][] | null>(null);
  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const skillTiers = SKILLS_BY_CAT[cat.id];

  function showToast(text: string, kind: "player" | "enemy" | "system") {
    const id = toastId.current++;
    setToast({ id, text, kind });
    setTimeout(() => setToast((t) => (t?.id === id ? null : t)), 1600);
  }

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
  function spawnImpact() {
    const id = impactId.current++;
    setImpacts((i) => [...i, id]);
    setTimeout(() => setImpacts((i) => i.filter((x) => x !== id)), 500);
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

  // ---- Time banks: tick down only during that side's own turn; switching turns never refills
  // them — only matching energy tiles does, capped at MAX_TIME. Hitting 0 is an instant loss. ----
  useEffect(() => {
    if (turn !== "player" || phase !== "fighting" || busy || paused) return;
    const interval = setInterval(() => setTimeBank((t) => Math.max(0, t - 0.1)), 100);
    return () => clearInterval(interval);
  }, [turn, phase, busy, paused]);

  useEffect(() => {
    if (turn !== "enemy" || phase !== "fighting" || busy || paused) return;
    const interval = setInterval(() => setEnemyTimeBank((t) => Math.max(0, t - 0.1)), 100);
    return () => clearInterval(interval);
  }, [turn, phase, busy, paused]);

  useEffect(() => {
    if (timeBank <= 0 && phase === "fighting") {
      showToast("Hết thời gian! Bạn thua trận.", "system");
      finishBattle(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeBank]);

  useEffect(() => {
    if (enemyTimeBank <= 0 && phase === "fighting") {
      showToast("Địch hết thời gian! Bạn thắng!", "system");
      finishBattle(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enemyTimeBank]);

  // ---- Poison ticks once at the start of the enemy's turn, before they act ----
  useEffect(() => {
    if (turn !== "enemy" || phase !== "fighting") return;
    setPoisonStatus((p) => {
      if (!p || p.turnsLeft <= 0) return null;
      const dmg = Math.max(1, Math.round((enemy.hp * p.percent) / 100));
      setTimeout(() => {
        spawnFloater(dmg, "damage", "enemy");
        applyDamage(true, dmg, "Trúng độc!");
      }, 150);
      const left = p.turnsLeft - 1;
      return left > 0 ? { ...p, turnsLeft: left } : null;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn]);

  // ---- AI turn: picks a move, plays the SAME visual swap animation the player sees ----
  useEffect(() => {
    if (turn !== "enemy" || phase !== "fighting" || busy || paused) return;
    const t = setTimeout(() => {
      const move = findBestMove(board, { attack: 3, mana: 1 });
      if (!move) return;
      externalSwapKey.current++;
      setExternalSwap({ a: [move[0], move[1]], b: [move[2], move[3]], key: externalSwapKey.current });
      setTimeout(() => {
        const test = cloneBoard(board);
        swapCells(test, move[0], move[1], move[2], move[3]);
        processCascade(test, "enemy");
      }, 200 / speed);
    }, 700 / speed);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn, phase, busy, board, paused]);

  // ---- Hint: if the player sits idle for 10s on their own turn, gently highlight a move ----
  useEffect(() => {
    if (hintTimer.current) clearTimeout(hintTimer.current);
    setHint(null);
    if (turn !== "player" || phase !== "fighting" || busy || paused) return;
    hintTimer.current = setTimeout(() => {
      const move = findBestMove(board);
      if (move) setHint([[move[0], move[1]], [move[2], move[3]]]);
    }, HINT_DELAY);
    return () => {
      if (hintTimer.current) clearTimeout(hintTimer.current);
    };
  }, [turn, phase, busy, paused, board]);

  async function handleSwap(r1: number, c1: number, r2: number, c2: number) {
    if (busy || phase !== "fighting" || turn !== "player" || paused) return;
    const test = cloneBoard(board);
    swapCells(test, r1, c1, r2, c2);
    if (findMatches(test).length === 0) return;
    setHint(null);
    await processCascade(test, "player");
  }

  async function processCascade(startBoard: Board, actingSide: Side) {
    setBusy(true);
    let working = startBoard;
    const totals: Record<TileType, number> = { attack: 0, defense: 0, mana: 0, heal: 0, gold: 0 };
    let maxSize = 0;
    let skillPipsGained = 0;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { board: nextBoard, counts, clearedCells, maxMatchSize, newCells } = resolveMatches(working);
      const changed = Object.values(counts).some((v) => v > 0);
      if (!changed) break;
      (Object.keys(counts) as TileType[]).forEach((k) => (totals[k] += counts[k]));
      if (counts.mana > 0) skillPipsGained += Math.floor(counts.mana / SKILL_TILES_PER_PIP) || (counts.mana >= 3 ? 1 : 0);
      maxSize = Math.max(maxSize, maxMatchSize);
      spawnBursts(clearedCells);
      working = nextBoard;
      setBoard(working);
      setFallingCells(newCells);
      setUpdateTick((t) => t + 1);
      await sleep(250 / speed);
    }

    setRound((r) => r + 1);
    applyTurnEffects(totals, actingSide, maxSize, skillPipsGained);
    await sleep(350 / speed);
    setBusy(false);
  }

  function applyTurnEffects(totals: Record<TileType, number>, side: Side, maxSize: number, skillPipsGained: number) {
    const isPlayer = side === "player";
    const atk = isPlayer ? cat.atk : enemy.atk;
    const def = isPlayer ? 0 : cat.def;

    let dmg = 0;
    let healAmt = 0;
    let shieldGain = 0;
    let mpGain = 0;

    if (totals.attack > 0) {
      let base = Math.round(totals.attack * atk * 0.5);
      if (isPlayer) {
        if (buffNextAttackMult) {
          base *= buffNextAttackMult;
          setBuffNextAttackMult(null);
          showToast("Đòn buff x" + buffNextAttackMult + "!", "player");
        } else if (buffDamageMult) {
          base = Math.round(base * buffDamageMult.mult);
        }
      }
      dmg += base;
    }
    if (totals.defense > 0) shieldGain += totals.defense * 3;
    if (totals.heal > 0) healAmt += totals.heal * 6;

    if (totals.gold > 0) {
      const timeGain = totals.gold * TIME_PER_ENERGY_TILE;
      if (isPlayer) setTimeBank((t) => Math.min(MAX_TIME, t + timeGain));
      else setEnemyTimeBank((t) => Math.min(MAX_TIME, t + timeGain));
      showToast(`+${timeGain}s thời gian!`, isPlayer ? "player" : "enemy");
    }

    if (isPlayer && skillPipsGained > 0) {
      setSkillPips((p) => Math.min(MAX_PIPS, p + skillPipsGained));
      showToast(`+${skillPipsGained} điểm Skill!`, "player");
    }

    let skillFired = false;
    if (!isPlayer) {
      if (totals.mana > 0) mpGain += totals.mana * 10;
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
        setTimeout(() => spawnBullet("right", skillFired), 120);
      } else {
        playEnemyPose("attack", skillFired ? 650 : 400);
        setTimeout(() => spawnImpact(), 260);
      }
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
      applyDamage(isPlayer, finalDmg, skillFired ? `${isPlayer ? "Bạn" : enemy.name} tung đòn năng lượng!` : null);
    }

    if (healAmt > 0) {
      if (isPlayer) {
        setCatHpArr((arr) => arr.map((v, i) => (i === activeCatIdx ? Math.min(cat.hp, v + healAmt) : v)));
        spawnFloater(healAmt, "heal", "cat");
      } else {
        setEnemyHpArr((arr) => arr.map((v, i) => (i === activeEnemyIdx ? Math.min(enemy.hp, v + healAmt) : v)));
        spawnFloater(healAmt, "heal", "enemy");
      }
      showToast(`+${healAmt} máu`, isPlayer ? "player" : "enemy");
    }
    if (shieldGain > 0) {
      if (isPlayer) setShield((s) => s + shieldGain);
      else setEnemyShield((s) => s + shieldGain);
      showToast(`Khiên +${shieldGain}`, isPlayer ? "player" : "enemy");
    }

    // Boxing-cat ally: punches once per player move while summoned, scaled by the biggest match made
    if (isPlayer && boxingCatTurns > 0 && maxSize >= 3) {
      const punchMult = maxSize === 3 ? 3 : maxSize === 4 ? 3 : 5;
      const punchDmg = Math.max(1, Math.round(cat.atk * 0.3 * punchMult));
      setTimeout(() => {
        spawnFloater(punchDmg, "crit", "enemy");
        applyDamage(true, punchDmg, `Mèo đấm bốc ra đòn x${punchMult}!`);
      }, 550 / speed);
    }

    const bonus = maxSize >= 5 ? 2 : maxSize === 4 ? 1 : 0;
    setPendingCredits((prevCredits) => {
      const remaining = Math.max(0, prevCredits - 1) + bonus;
      if (bonus > 0) showToast(`Ghép ${maxSize} viên! +${bonus} lượt`, "system");
      if (remaining > 0) return remaining;
      if (side === "player") {
        setBuffDamageMult((b) => (b && b.turnsLeft > 1 ? { ...b, turnsLeft: b.turnsLeft - 1 } : null));
        setBoxingCatTurns((t) => Math.max(0, t - 1));
      }
      setTurn(side === "player" ? "enemy" : "player");
      return 1;
    });
  }

  function applyDamage(byPlayer: boolean, amount: number, note: string | null) {
    if (byPlayer) {
      setEnemyShield((s) => {
        const mitigated = Math.max(1, amount - s);
        setEnemyHpArr((arr) => {
          const nh = Math.max(0, arr[activeEnemyIdx] - mitigated);
          const next = arr.map((v, i) => (i === activeEnemyIdx ? nh : v));
          if (note) showToast(note, "player");
          if (nh <= 0) handleEnemyKO();
          return next;
        });
        return Math.max(0, s - amount);
      });
      return;
    }

    // Incoming damage to the player — full-block and reflect are checked first
    if (fullBlockHits > 0) {
      setFullBlockHits((h) => h - 1);
      showToast("Chặn đứng hoàn toàn!", "player");
      spawnFloater(0, "damage", "cat");
      return;
    }
    if (reflectStatus && reflectStatus.turnsLeft > 0) {
      const reflected = Math.round(amount * reflectStatus.mult);
      setReflectStatus((r) => (r ? { ...r, turnsLeft: r.turnsLeft - 1 } : r));
      showToast(`Phản đòn ${reflected} sát thương!`, "player");
      applyDamage(true, reflected, null);
      return;
    }

    setShield((s) => {
      const mitigated = Math.max(1, amount - s);
      setCatHpArr((arr) => {
        const nh = Math.max(0, arr[activeCatIdx] - mitigated);
        const next = arr.map((v, i) => (i === activeCatIdx ? nh : v));
        if (note) showToast(note, "enemy");
        if (nh <= 0) handleCatKO();
        return next;
      });
      return Math.max(0, s - amount);
    });
  }

  function handleCatKO() {
    if (activeCatIdx + 1 < catTeam.length) {
      showToast(`${cat.name} gục ngã! Đưa tiếp viện vào!`, "system");
      setTimeout(() => {
        setActiveCatIdx((i) => i + 1);
        setShield(0);
        setSkillPips(0);
        setBoard(createBoard());
      }, 600);
    } else {
      finishBattle(false);
    }
  }
  function handleEnemyKO() {
    if (activeEnemyIdx + 1 < enemyTeam.length) {
      showToast(`Hạ gục ${enemy.name}! Địch tiếp theo xuất hiện!`, "system");
      setTimeout(() => {
        setActiveEnemyIdx((i) => i + 1);
        setEnemyShield(0);
        setEnemyMp(0);
        setBoard(createBoard());
      }, 600);
    } else {
      finishBattle(true);
    }
  }

  function useSkill(tier: SkillTier) {
    if (skillPips < tier.cost || busy || phase !== "fighting" || turn !== "player" || paused) return;
    setSkillPips((p) => p - tier.cost);
    playCatPose("shoot", 500);
    showToast(`${cat.name} dùng ${tier.name}!`, "player");

    const e = tier.effect;

    // ---- Multi-shot direct attacks ----
    if (e.shots) {
      for (let i = 0; i < e.shots; i++) {
        setTimeout(() => {
          const dmg = Math.round(cat.atk * 0.9 * (e.damageMult ?? 1));
          spawnBullet("right", (e.damageMult ?? 1) > 1);
          setTimeout(() => {
            setEnemyHurt(true);
            setEnemyHitTick((t) => t + 1);
            setTimeout(() => setEnemyHurt(false), 300 / speed);
            spawnFloater(dmg, (e.damageMult ?? 1) > 1 ? "crit" : "damage", "enemy");
            applyDamage(true, dmg, null);
          }, 220);
        }, i * 260);
      }
    }

    // ---- Random area detonation(s) on the board ----
    if (e.areaClear) {
      const { size, times } = e.areaClear;
      for (let i = 0; i < times; i++) {
        setTimeout(() => {
          setBoard((b) => {
            const { cleared, board: nb } = clearRandomArea(b, size);
            spawnBursts(cleared);
            const totals: Record<TileType, number> = { attack: 0, defense: 0, mana: 0, heal: 0, gold: 0 };
            cleared.forEach((c) => (totals[c.type] += 1));
            resolveAreaTotals(totals);
            return nb;
          });
        }, i * 480);
      }
    }

    // ---- Absorb every tile of one type currently on the board ----
    if (e.absorbType) {
      setBoard((b) => {
        const { cleared, board: nb } = absorbAllOfType(b, e.absorbType!);
        spawnBursts(cleared);
        const totals: Record<TileType, number> = { attack: 0, defense: 0, mana: 0, heal: 0, gold: 0 };
        cleared.forEach((c) => (totals[c.type] += 1));
        resolveAreaTotals(totals, e.damageMult);
        return nb;
      });
    }

    if (e.shield) setShield((s) => s + e.shield!);
    if (e.healFlat) {
      setCatHpArr((arr) => arr.map((v, i) => (i === activeCatIdx ? Math.min(cat.hp, v + e.healFlat!) : v)));
      spawnFloater(e.healFlat, "heal", "cat");
    }
    if (e.healPercentOfMax) {
      const cap = e.overhealCapPercent ? (cat.hp * e.overhealCapPercent) / 100 : cat.hp;
      const amount = Math.round((cat.hp * e.healPercentOfMax) / 100);
      setCatHpArr((arr) => arr.map((v, i) => (i === activeCatIdx ? Math.min(cap, v + amount) : v)));
      spawnFloater(amount, "heal", "cat");
    }
    if (e.extraTurns) {
      setPendingCredits((p) => p + e.extraTurns!);
      showToast(`+${e.extraTurns} lượt!`, "player");
    }
    if (e.fullBlockHits) setFullBlockHits((h) => h + e.fullBlockHits!);
    if (e.reflect) setReflectStatus({ turnsLeft: e.reflect.turns, mult: e.reflect.mult });
    if (e.poison) setPoisonStatus({ percent: e.poison.percent, turnsLeft: e.poison.turns });
    if (e.lifestealPercent) {
      const amount = Math.max(1, Math.round((enemyHp * e.lifestealPercent) / 100));
      setTimeout(() => {
        spawnFloater(amount, "damage", "enemy");
        applyDamage(true, amount, null);
        setCatHpArr((arr) => arr.map((v, i) => (i === activeCatIdx ? Math.min(cat.hp, v + amount) : v)));
        spawnFloater(amount, "heal", "cat");
      }, 200);
    }
    if (e.buffDamageMult) setBuffDamageMult({ mult: e.buffDamageMult.mult, turnsLeft: e.buffDamageMult.turns });
    if (e.buffNextAttackMult) setBuffNextAttackMult(e.buffNextAttackMult);
    if (e.summonBoxingCat) {
      setBoxingCatTurns(e.summonBoxingCat.turns);
      showToast("Mèo đấm bốc xuất hiện!", "player");
    }
  }

  // Resolves the totals from an area-clear/absorb skill through the normal damage/heal/shield math
  function resolveAreaTotals(totals: Record<TileType, number>, extraMult = 1) {
    if (totals.attack > 0) {
      const dmg = Math.round(totals.attack * cat.atk * 0.5 * extraMult);
      setTimeout(() => {
        setEnemyHurt(true);
        setEnemyHitTick((t) => t + 1);
        setTimeout(() => setEnemyHurt(false), 300 / speed);
        spawnFloater(dmg, extraMult > 1 ? "crit" : "damage", "enemy");
        applyDamage(true, dmg, null);
      }, 150);
    }
    if (totals.defense > 0) setShield((s) => s + totals.defense * 3);
    if (totals.heal > 0) {
      const heal = totals.heal * 6;
      setCatHpArr((arr) => arr.map((v, i) => (i === activeCatIdx ? Math.min(cat.hp, v + heal) : v)));
      spawnFloater(heal, "heal", "cat");
    }
    if (totals.mana > 0) {
      const t = totals.mana * TIME_PER_ENERGY_TILE;
      setTimeBank((tb) => Math.min(MAX_TIME, tb + t));
    }
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
        <button onClick={() => setPaused(true)} className="shrink-0 overflow-hidden rounded-full">
          <Image src="/ui/icon_settings.png" alt="Tạm dừng" width={26} height={26} />
        </button>
      </div>

      {/* Team rosters */}
      {(catTeam.length > 1 || enemyTeam.length > 1) && (
        <div className="flex items-center justify-between px-1">
          <div className="flex gap-1">
            {catTeam.map((c, i) => (
              <div key={c.id} className={`h-6 w-6 overflow-hidden rounded-full border-2 ${i === activeCatIdx ? "border-amber-400" : "border-slate-700 opacity-50"} ${catHpArr[i] <= 0 ? "grayscale opacity-30" : ""}`}>
                <AnimatedSprite src={c.sprite.idle.src} frames={c.sprite.idle.frames} fps={6} className="h-full w-full scale-150" />
              </div>
            ))}
          </div>
          <div className="flex gap-1">
            {enemyTeam.map((e, i) => (
              <div key={e.id} className={`h-6 w-6 overflow-hidden rounded-full border-2 ${i === activeEnemyIdx ? "border-red-400" : "border-slate-700 opacity-50"} ${enemyHpArr[i] <= 0 ? "grayscale opacity-30" : ""}`}>
                <AnimatedSprite src={e.sprite.idle.src} frames={e.sprite.idle.frames} fps={6} className="h-full w-full scale-150" />
              </div>
            ))}
          </div>
        </div>
      )}

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
                className={`h-full transition-all duration-150 ${timeBank <= 20 ? "bg-red-500" : "bg-amber-400"}`}
                style={{ width: `${Math.min(100, (timeBank / MAX_TIME) * 100)}%` }}
              />
            </div>
            <span className={`shrink-0 text-[10px] font-semibold tabular-nums ${timeBank <= 20 ? "text-red-400" : "text-amber-200"}`}>{formatTime(timeBank)}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="shrink-0 text-[9px] text-purple-300">Skill</span>
            {[1, 2, 3].map((p) => (
              <span key={p} className={`h-2.5 flex-1 rounded-full ${skillPips >= p ? "skill-pip-fill bg-purple-400" : "bg-slate-800"}`} />
            ))}
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1 rounded-xl border border-red-700/50 bg-slate-900/80 p-2">
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1 text-right">
              <p className="truncate text-[11px] font-semibold text-red-200">{enemy.name}</p>
              <Bar color="bg-red-500" value={enemyHp} max={enemy.hp} align="right" />
            </div>
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-red-500 bg-slate-800">
              <AnimatedSprite src={enemy.sprite.idle.src} frames={enemy.sprite.idle.frames} fps={10} className="h-full w-full scale-150" />
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className={`shrink-0 text-[10px] font-semibold tabular-nums ${enemyTimeBank <= 20 ? "text-red-400" : "text-amber-200"}`}
            >
              {formatTime(enemyTimeBank)}
            </span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">
              <div
                className={`h-full transition-all duration-150 ${enemyTimeBank <= 20 ? "bg-red-500" : "bg-amber-400"}`}
                style={{ width: `${Math.min(100, (enemyTimeBank / MAX_TIME) * 100)}%`, marginLeft: "auto" }}
              />
            </div>
            <span className="shrink-0 text-[10px] text-amber-300">⏱</span>
          </div>
        </div>
      </div>

      {/* Active buff/status icons live below both status cards, not inside them */}
      {(fullBlockHits > 0 ||
        (reflectStatus && reflectStatus.turnsLeft > 0) ||
        buffDamageMult ||
        buffNextAttackMult ||
        boxingCatTurns > 0 ||
        (poisonStatus && poisonStatus.turnsLeft > 0)) && (
        <div className="flex flex-wrap items-center gap-1.5 px-1">
          {fullBlockHits > 0 && <StatusBadge icon="🛡️" label={`x${fullBlockHits}`} title="Miễn sát thương" />}
          {reflectStatus && reflectStatus.turnsLeft > 0 && <StatusBadge icon="🔁" label={`${reflectStatus.turnsLeft}`} title="Phản đòn" />}
          {buffDamageMult && <StatusBadge icon="🔥" label={`x${buffDamageMult.mult}·${buffDamageMult.turnsLeft}`} title="Tăng sát thương" />}
          {buffNextAttackMult && <StatusBadge icon="⚡" label={`x${buffNextAttackMult}`} title="Đòn tiếp theo tăng sát thương" />}
          {boxingCatTurns > 0 && <StatusBadge icon="🥊" label={`${boxingCatTurns}`} title="Mèo đấm bốc hỗ trợ" />}
          {poisonStatus && poisonStatus.turnsLeft > 0 && <StatusBadge icon="☠️" label={`Địch ${poisonStatus.turnsLeft}`} title="Địch trúng độc" />}
        </div>
      )}

      <div
        className="relative flex min-h-[170px] items-center justify-between gap-2 overflow-hidden rounded-xl border border-amber-700/30 bg-cover bg-center p-2"
        style={{ backgroundImage: `url(${map.field})` }}
      >
        <div className="absolute inset-0 bg-slate-950/20" />
        <span
          className={`absolute left-1/2 top-2 z-20 -translate-x-1/2 rounded-full px-3 py-1 text-[11px] font-bold shadow-lg ${
            turn === "player" ? "bg-sky-600 text-white" : "bg-red-600 text-white"
          }`}
        >
          {turn === "player" ? "Lượt của bạn" : "Lượt đối thủ"}
        </span>
        {toast && <Toast key={toast.id} text={toast.text} kind={toast.kind} />}
        <div className="relative z-10 flex h-24 w-24 shrink-0 items-center justify-center overflow-visible">
          <div className="h-full w-full overflow-hidden">
            <div key={catHitTick} className={`h-full w-full ${catHurt ? "anim-hurt" : catPose === "shoot" ? "anim-attack-right" : ""}`}>
              <div className={`h-full w-full ${catDefeated ? "anim-dead" : ""}`}>
                <AnimatedSprite key={catPlayKey} src={catSprite.src} frames={catSprite.frames} fps={catPose === "idle" ? 8 : 14} loop={catPose === "idle" && !catDefeated} className="h-full w-full" />
              </div>
            </div>
          </div>
          {floaters.filter((f) => f.target === "cat").map((f) => (
            <FloatingNumber key={f.id} value={f.value} kind={f.kind} style={{ left: "50%", top: "0%", transform: "translateX(-50%)" }} />
          ))}
          {boxingCatTurns > 0 && (
            <div className="absolute -bottom-1 -right-3 z-20 h-10 w-10 overflow-hidden drop-shadow-lg">
              <AnimatedSprite src="/sprites/catboxing_idle.png" frames={10} fps={8} className="h-full w-full scale-150" />
            </div>
          )}
        </div>
        {shield > 0 && <span className="relative z-10 shrink-0 text-xs text-sky-300">🛡 +{shield}</span>}
        {enemyShield > 0 && <span className="relative z-10 shrink-0 text-xs text-red-300">🛡 +{enemyShield}</span>}
        <div className="relative z-10 flex h-32 w-32 shrink-0 items-center justify-center overflow-visible">
          <div className="h-full w-full overflow-hidden">
            <div key={enemyHitTick} className={`h-full w-full ${enemyHurt ? "anim-hurt" : enemyPose === "attack" ? "anim-attack-left" : ""}`}>
              <div className={`h-full w-full ${enemyDefeated ? "anim-dead" : ""}`}>
                <AnimatedSprite key={enemyPlayKey} src={enemySprite.src} frames={enemySprite.frames} fps={enemyPose === "idle" ? 8 : 14} loop={enemyPose === "idle" && !enemyDefeated} className="h-full w-full" />
              </div>
            </div>
          </div>
          {floaters.filter((f) => f.target === "enemy").map((f) => (
            <FloatingNumber key={f.id} value={f.value} kind={f.kind} style={{ left: "50%", top: "0%", transform: "translateX(-50%)" }} />
          ))}
        </div>
        {bullets.map((b) => (
          <Bullet key={b.id} direction={b.direction} crit={b.crit} />
        ))}
        {impacts.map((id) => (
          <ImpactHit key={id} />
        ))}
      </div>

      {/* Single skill button right under the battlefield map — tap to reveal the 3 tiers */}
      <div className="relative">
        <button
          onClick={() => setSkillMenuOpen((v) => !v)}
          disabled={skillPips === 0}
          className={`flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 font-bold transition ${
            skillPips > 0 ? "border-purple-500 bg-purple-900/50 text-purple-100 hover:bg-purple-800/60" : "border-slate-700 bg-slate-900/40 text-slate-500"
          }`}
        >
          <span>⚡ Kỹ Năng</span>
          <span className="flex gap-1">
            {[1, 2, 3].map((p) => (
              <span key={p} className={`h-2 w-2 rounded-full ${skillPips >= p ? "bg-purple-300" : "bg-slate-700"}`} />
            ))}
          </span>
        </button>
        {skillMenuOpen && (
          <div className="absolute inset-x-0 top-full z-30 mt-1 grid grid-cols-3 gap-1.5 rounded-xl border border-purple-600 bg-slate-950 p-2 shadow-2xl">
            {skillTiers.map((tier) => {
              const usable = skillPips >= tier.cost && turn === "player" && phase === "fighting" && !busy && !paused;
              return (
                <button
                  key={tier.tier}
                  onClick={() => {
                    useSkill(tier);
                    setSkillMenuOpen(false);
                  }}
                  disabled={!usable}
                  className={`rounded-lg border p-1.5 text-center transition ${
                    usable ? "border-purple-500 bg-purple-900/40 hover:bg-purple-800/50" : "border-slate-700 bg-slate-900/40 opacity-50"
                  }`}
                >
                  <p className="truncate text-[10px] font-bold text-purple-200">{tier.name}</p>
                  <p className="truncate text-[8px] text-slate-400">{tier.desc}</p>
                  <p className="mt-0.5 text-[9px] text-purple-300">{tier.cost} pip</p>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <Match3Grid
        board={board}
        onSwap={handleSwap}
        disabled={busy || phase !== "fighting" || turn !== "player" || paused}
        bursts={bursts}
        fallingCells={fallingCells}
        updateTick={updateTick}
        externalSwap={externalSwap}
        hint={hint}
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
          <div className="flex w-full max-w-xs flex-col items-center gap-4">
            <Image
              src={phase === "victory" ? "/ui/win_popup.png" : "/ui/lose_popup.png"}
              alt={phase === "victory" ? "You Win" : "You Lose"}
              width={phase === "victory" ? 1375 : 1073}
              height={phase === "victory" ? 602 : 472}
              className="w-full drop-shadow-2xl"
            />
            {phase === "victory" && <p className="-mt-2 text-sm font-semibold text-amber-200">Điểm: {score}</p>}
            <button
              onClick={() => onResult(phase === "victory")}
              className="relative flex h-14 w-48 items-center justify-center"
              style={{ backgroundImage: "url(/ui/btn_orange.png)", backgroundSize: "100% 100%", backgroundRepeat: "no-repeat" }}
            >
              <span className="text-base font-bold text-white drop-shadow">Tiếp tục</span>
            </button>
          </div>
        </div>
      )}

      {paused && phase === "fighting" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
          <div className="flex w-full max-w-xs flex-col items-center gap-5">
            <div className="flex h-24 w-full items-center justify-center" style={{ backgroundImage: "url(/ui/bg_paused.png)", backgroundSize: "100% 100%", backgroundRepeat: "no-repeat" }}>
              <span className="text-2xl font-bold text-amber-100">Tạm dừng</span>
            </div>
            <button onClick={() => setPaused(false)} className="relative flex h-14 w-48 items-center justify-center" style={{ backgroundImage: "url(/ui/btn_green.png)", backgroundSize: "100% 100%", backgroundRepeat: "no-repeat" }}>
              <span className="text-base font-bold text-white drop-shadow">Tiếp tục</span>
            </button>
            <button onClick={onExit} className="relative flex h-14 w-48 items-center justify-center" style={{ backgroundImage: "url(/ui/btn_orange.png)", backgroundSize: "100% 100%", backgroundRepeat: "no-repeat" }}>
              <span className="text-base font-bold text-white drop-shadow">Thoát trận</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ icon, label, title }: { icon: string; label: string; title: string }) {
  return (
    <span title={title} className="flex items-center gap-0.5 rounded-full border border-slate-600 bg-slate-950/80 px-1.5 py-0.5 text-[9px] font-semibold text-slate-200">
      <span>{icon}</span>
      <span>{label}</span>
    </span>
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

function formatTime(seconds: number): string {
  const s = Math.max(0, seconds);
  const m = Math.floor(s / 60);
  const rem = Math.floor(s % 60);
  return `${m}:${rem.toString().padStart(2, "0")}`;
}

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}
