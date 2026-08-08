export type SkillArchetype = "burst" | "shield" | "heal" | "multi";

export interface SkillTier {
  tier: 1 | 2 | 3;
  cost: number; // pips required (1, 2, or 3)
  name: string;
  desc: string;
}

export const SKILL_SETS: Record<SkillArchetype, SkillTier[]> = {
  burst: [
    { tier: 1, cost: 1, name: "Đạn Xuyên", desc: "Sát thương nhỏ ngay lập tức" },
    { tier: 2, cost: 2, name: "Đạn Nổ", desc: "Sát thương vừa, mạnh hơn" },
    { tier: 3, cost: 3, name: "Mưa Đạn", desc: "Sát thương cực lớn" },
  ],
  shield: [
    { tier: 1, cost: 1, name: "Khiên Nhỏ", desc: "Dựng khiên chắn nhẹ" },
    { tier: 2, cost: 2, name: "Khiên Vững", desc: "Khiên chắc + phản đòn nhẹ" },
    { tier: 3, cost: 3, name: "Pháo Đài", desc: "Khiên khổng lồ + phản đòn mạnh" },
  ],
  heal: [
    { tier: 1, cost: 1, name: "Băng Bó", desc: "Hồi máu nhỏ" },
    { tier: 2, cost: 2, name: "Sơ Cứu", desc: "Hồi máu kha khá" },
    { tier: 3, cost: 3, name: "Hồi Sinh", desc: "Hồi máu lớn + khiên nhẹ" },
  ],
  multi: [
    { tier: 1, cost: 1, name: "Combo Nhẹ", desc: "Sát thương nhỏ + hồi chút máu" },
    { tier: 2, cost: 2, name: "Combo Vừa", desc: "Sát thương + hồi máu khá hơn" },
    { tier: 3, cost: 3, name: "Combo Mạnh", desc: "Sát thương lớn + hồi máu + khiên" },
  ],
};

export function skillArchetypeFor(atk: number, def: number, mp: number): SkillArchetype {
  if (atk >= 17) return "burst";
  if (def >= 7) return "shield";
  if (mp >= 110) return "heal";
  return "multi";
}
