export interface BattleMap {
  id: string;
  name: string;
  thumb: string;
  field: string;
}

export const MAPS: BattleMap[] = [
  { id: "map1", name: "Con Hẻm", thumb: "/sprites/map1_thumb.jpg", field: "/sprites/map1_field.jpg" },
  { id: "map2", name: "Hoàng Hôn", thumb: "/sprites/map2_thumb.jpg", field: "/sprites/map2_field.jpg" },
  { id: "map3", name: "Giao Lộ", thumb: "/sprites/map3_thumb.jpg", field: "/sprites/map3_field.jpg" },
  { id: "map4", name: "Khu Phố Cũ", thumb: "/sprites/map4_thumb.jpg", field: "/sprites/map4_field.jpg" },
  { id: "map5", name: "Công Viên", thumb: "/sprites/map5_thumb.jpg", field: "/sprites/map5_field.jpg" },
];

export interface LevelConfig {
  id: number;
  mapId: string;
  enemyStartIndex: number; // where this level's opponent(s) begin in the ENEMIES roster (gameData.ts)
}

// 10-level campaign for Solo mode — difficulty escalates by walking further into the ENEMIES
// roster (which is itself ordered from weakest regular zombie to the strongest boss).
export const LEVELS: LevelConfig[] = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  mapId: MAPS[i % MAPS.length].id,
  enemyStartIndex: i,
}));

