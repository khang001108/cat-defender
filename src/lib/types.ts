export type TileType = "attack" | "defense" | "mana" | "heal" | "gold";

export interface SpriteSet {
  idle: { src: string; frames: number };
  walk?: { src: string; frames: number };
  shoot?: { src: string; frames: number };
  attack?: { src: string; frames: number };
  dead: { src: string; frames: number };
}

export interface CatDefinition {
  id: string;
  name: string;
  role: string;
  hp: number;
  mp: number;
  atk: number;
  def: number;
  sprite: SpriteSet;
}

export interface EnemyDefinition {
  id: string;
  name: string;
  level: number;
  hp: number;
  atk: number;
  sprite: SpriteSet;
}

export interface BattleLogEntry {
  id: number;
  text: string;
  kind: "player" | "enemy" | "system";
}

export interface UpgradeItem {
  id: string;
  name: string;
  desc: string;
  icon: string;
  stat: "atk" | "def" | "hp";
  amount: number;
  baseCost: number;
}

export interface PlayerProfile {
  displayName: string;
  loggedIn: boolean;
  notificationsEnabled: boolean;
  gold: number;
  upgradeLevels: Record<string, number>;
  highestLevelUnlocked: number;
}
