import { TileType } from "./types";

export interface SkillEffectSpec {
  shots?: number; // fire N attack "hits" back to back, each using the cat's normal attack formula
  damageMult?: number; // multiplies the damage from this cast
  areaClear?: { size: number; times: number }; // detonate a random NxN area on the board, `times` times
  absorbType?: TileType; // consume every tile of this type currently on the board
  shield?: number;
  healFlat?: number;
  healPercentOfMax?: number; // heals this % of max HP — can overheal past 100% up to overhealCapPercent
  overhealCapPercent?: number;
  extraTurns?: number;
  fullBlockHits?: number; // the next N enemy hits are completely negated
  reflect?: { turns: number; mult: number }; // reflects incoming damage back at the enemy
  poison?: { percent: number; turns: number }; // enemy loses this % of max HP per turn, for N turns
  lifestealPercent?: number; // drains this % of the enemy's CURRENT hp to the caster
  buffDamageMult?: { mult: number; turns: number }; // all match-3 attack damage multiplied for N turns
  buffNextAttackMult?: number; // just the very next attack match is multiplied
  summonBoxingCat?: { turns: number };
}

export interface SkillTier {
  tier: 1 | 2 | 3;
  cost: number;
  name: string;
  desc: string;
  effect: SkillEffectSpec;
}

// One unique 3-tier skill kit per cat, matching each cat's id.
export const SKILLS_BY_CAT: Record<string, SkillTier[]> = {
  cat1: [
    { tier: 1, cost: 1, name: "Song Đạn", desc: "Bắn 2 phát liên tiếp", effect: { shots: 2 } },
    { tier: 2, cost: 2, name: "Nổ Nhỏ", desc: "Nổ ngẫu nhiên 2x2, 2 lần", effect: { areaClear: { size: 2, times: 2 } } },
    { tier: 3, cost: 3, name: "Đại Bác", desc: "Nổ ngẫu nhiên 4x4, 5 lần", effect: { areaClear: { size: 4, times: 5 } } },
  ],
  cat2: [
    { tier: 1, cost: 1, name: "Tinh Chuẩn", desc: "1 phát, sát thương x2", effect: { shots: 1, damageMult: 2 } },
    { tier: 2, cost: 2, name: "Song Sát", desc: "2 phát, sát thương x2", effect: { shots: 2, damageMult: 2 } },
    { tier: 3, cost: 3, name: "Hút Đạn", desc: "Hút hết ô Bắn trên bàn cờ, x2 sát thương", effect: { absorbType: "attack", damageMult: 2 } },
  ],
  cat3: [
    { tier: 1, cost: 1, name: "Khiên Nhỏ", desc: "+15 khiên", effect: { shield: 15 } },
    { tier: 2, cost: 2, name: "Khiên Lớn", desc: "+50 khiên", effect: { shield: 50 } },
    { tier: 3, cost: 3, name: "Hút Khiên", desc: "Hút hết ô Khiên trên bàn cờ", effect: { absorbType: "defense" } },
  ],
  cat4: [
    { tier: 1, cost: 1, name: "Hồi Nhỏ", desc: "+20 máu", effect: { healFlat: 20 } },
    { tier: 2, cost: 2, name: "Hồi Lớn", desc: "+50 máu", effect: { healFlat: 50 } },
    { tier: 3, cost: 3, name: "Hút Máu", desc: "Hút hết ô Hồi Máu trên bàn cờ", effect: { absorbType: "heal" } },
  ],
  cat5: [
    { tier: 1, cost: 1, name: "Chấn Động", desc: "Nổ ngẫu nhiên 3x3, 3 lần", effect: { areaClear: { size: 3, times: 3 } } },
    { tier: 2, cost: 2, name: "Địa Chấn", desc: "Nổ ngẫu nhiên 4x4, 3 lần", effect: { areaClear: { size: 4, times: 3 } } },
    { tier: 3, cost: 3, name: "Tận Thế", desc: "Nổ ngẫu nhiên 5x5, 3 lần", effect: { areaClear: { size: 5, times: 3 } } },
  ],
  cat6: [
    { tier: 1, cost: 1, name: "Nhanh Tay", desc: "+1 lượt", effect: { extraTurns: 1 } },
    { tier: 2, cost: 2, name: "Chớp Nhoáng", desc: "+2 lượt", effect: { extraTurns: 2 } },
    { tier: 3, cost: 3, name: "Thần Tốc", desc: "+3 lượt", effect: { extraTurns: 3 } },
  ],
  cat7: [
    { tier: 1, cost: 1, name: "Lá Chắn", desc: "Miễn sát thương 1 lần", effect: { fullBlockHits: 1 } },
    { tier: 2, cost: 2, name: "Song Chắn", desc: "Miễn sát thương 2 lần", effect: { fullBlockHits: 2 } },
    { tier: 3, cost: 3, name: "Bất Khả Xâm Phạm", desc: "Miễn sát thương 3 lần", effect: { fullBlockHits: 3 } },
  ],
  cat8: [
    { tier: 1, cost: 1, name: "Dưỡng Sức", desc: "+15 máu", effect: { healFlat: 15 } },
    { tier: 2, cost: 2, name: "Tăng Tốc", desc: "+1 lượt đánh", effect: { extraTurns: 1 } },
    { tier: 3, cost: 3, name: "Triệu Hồi", desc: "Gọi mèo đấm bốc hỗ trợ 3 lượt", effect: { summonBoxingCat: { turns: 3 } } },
  ],
  cat9: [
    { tier: 1, cost: 1, name: "Phản Đòn", desc: "Phản sát thương địch 1 lượt", effect: { reflect: { turns: 1, mult: 1 } } },
    { tier: 2, cost: 2, name: "Phản Đòn Mạnh", desc: "Phản sát thương x2", effect: { reflect: { turns: 1, mult: 2 } } },
    { tier: 3, cost: 3, name: "Độc Dược", desc: "Địch mất 10% HP mỗi lượt, 3 lượt", effect: { poison: { percent: 10, turns: 3 } } },
  ],
  cat10: [
    { tier: 1, cost: 1, name: "Khiên Săn", desc: "+15 khiên", effect: { shield: 15 } },
    { tier: 2, cost: 2, name: "Hút Máu", desc: "Hút 5% HP địch về mình", effect: { lifestealPercent: 5 } },
    { tier: 3, cost: 3, name: "Bão Đạn", desc: "Nổ ngẫu nhiên 4x4, 5 lần", effect: { areaClear: { size: 4, times: 5 } } },
  ],
  cat11: [
    { tier: 1, cost: 1, name: "Bồi Lượt", desc: "+1 lượt bắn", effect: { extraTurns: 1 } },
    { tier: 2, cost: 2, name: "Mưa Đạn Nhỏ", desc: "Nổ ngẫu nhiên 2x2, 4 lần", effect: { areaClear: { size: 2, times: 4 } } },
    { tier: 3, cost: 3, name: "Liên Hoàn Đạn", desc: "Bắn liên tiếp 6 lần, x2 sát thương", effect: { shots: 6, damageMult: 2 } },
  ],
  cat12: [
    { tier: 1, cost: 1, name: "Khiên Rừng", desc: "+20 khiên", effect: { shield: 20 } },
    { tier: 2, cost: 2, name: "Sức Sống", desc: "Hồi 20% máu tối đa (có thể vượt lên 120%)", effect: { healPercentOfMax: 20, overhealCapPercent: 120 } },
    { tier: 3, cost: 3, name: "Đại Sinh Tồn", desc: "Hồi 50% máu tối đa (có thể vượt lên 150%)", effect: { healPercentOfMax: 50, overhealCapPercent: 150 } },
  ],
  cat13: [
    { tier: 1, cost: 1, name: "Song Trảo", desc: "Tấn công 2 lần", effect: { shots: 2 } },
    { tier: 2, cost: 2, name: "Ngũ Trảo", desc: "Tấn công 5 lần", effect: { shots: 5 } },
    { tier: 3, cost: 3, name: "Cuồng Phong", desc: "Hút hết ô Hồi Máu trên bàn cờ hóa sát thương", effect: { absorbType: "heal" } },
  ],
  cat14: [
    { tier: 1, cost: 1, name: "Bồi Dưỡng", desc: "+20 máu", effect: { healFlat: 20 } },
    { tier: 2, cost: 2, name: "Trang Bị", desc: "+20 khiên", effect: { shield: 20 } },
    { tier: 3, cost: 3, name: "Toàn Lực", desc: "+5 lượt", effect: { extraTurns: 5 } },
  ],
  cat15: [
    { tier: 1, cost: 1, name: "Chỉ Huy", desc: "+1 lượt", effect: { extraTurns: 1 } },
    { tier: 2, cost: 2, name: "Hạ Lệnh", desc: "Đòn Bắn tiếp theo x3 sát thương", effect: { buffNextAttackMult: 3 } },
    { tier: 3, cost: 3, name: "Vương Quyền", desc: "x6 sát thương trong 3 lượt", effect: { buffDamageMult: { mult: 6, turns: 3 } } },
  ],
};
