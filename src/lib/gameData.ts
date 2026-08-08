import { CatDefinition, EnemyDefinition, UpgradeItem } from "./types";

function catSprite(key: string) {
  return {
    idle: { src: `/sprites/${key}_idle.png`, frames: 10 },
    shoot: { src: `/sprites/${key}_shoot.png`, frames: 10 },
    dead: { src: `/sprites/${key}_idle.png`, frames: 10 },
  };
}

export const CATS: CatDefinition[] = (
  [
    { id: "cat1", name: "Kem", role: "Nổ diện rộng ngẫu nhiên trên bàn cờ", hp: 120, mp: 100, atk: 14, def: 6, gunHeightPercent: 60 },
    { id: "cat2", name: "Zin", role: "Sát thương nhân đôi cực mạnh", hp: 115, mp: 105, atk: 15, def: 5, gunHeightPercent: 60 },
    { id: "cat3", name: "Bo", role: "Chuyên gia dựng khiên", hp: 130, mp: 95, atk: 12, def: 7, gunHeightPercent: 58 },
    { id: "cat4", name: "Su", role: "Hồi máu dồi dào", hp: 100, mp: 115, atk: 17, def: 4, gunHeightPercent: 58 },
    { id: "cat5", name: "Mun", role: "Phá bàn cờ diện rộng", hp: 118, mp: 100, atk: 14, def: 6, gunHeightPercent: 58 },
    { id: "cat6", name: "Sóc", role: "Tặng thêm lượt đánh", hp: 128, mp: 92, atk: 12, def: 8, gunHeightPercent: 35 },
    { id: "cat7", name: "Tia", role: "Khiên miễn nhiễm sát thương", hp: 112, mp: 108, atk: 15, def: 5, gunHeightPercent: 35 },
    { id: "cat8", name: "Mực", role: "Triệu hồi mèo đấm bốc", hp: 92, mp: 112, atk: 19, def: 3, gunHeightPercent: 36 },
    { id: "cat9", name: "Cáo", role: "Phản đòn & độc dược", hp: 95, mp: 110, atk: 18, def: 4, gunHeightPercent: 48 },
    { id: "cat10", name: "Kiên", role: "Hút máu địch", hp: 122, mp: 102, atk: 14, def: 6, gunHeightPercent: 48 },
    { id: "cat11", name: "Tuyết", role: "Bắn liên hoàn", hp: 105, mp: 130, atk: 15, def: 5, gunHeightPercent: 60 },
    { id: "cat12", name: "Rừng", role: "Hồi máu vượt ngưỡng", hp: 110, mp: 108, atk: 16, def: 5, gunHeightPercent: 60 },
    { id: "cat13", name: "Hổ", role: "Tấn công dồn dập", hp: 108, mp: 106, atk: 17, def: 5, gunHeightPercent: 58 },
    { id: "cat14", name: "Kim", role: "Toàn diện: máu, khiên, lượt", hp: 135, mp: 90, atk: 12, def: 8, gunHeightPercent: 56 },
    { id: "cat15", name: "Vương", role: "Buff sát thương cực đại", hp: 140, mp: 120, atk: 18, def: 7, gunHeightPercent: 58 },
  ] as Omit<CatDefinition, "sprite">[]
).map((c) => ({
  ...c,
  sprite: catSprite(c.id),
}));

function regSprite(key: string) {
  return {
    idle: { src: `/sprites/${key}_idle.png`, frames: 10 },
    attack: { src: `/sprites/${key}_attack.png`, frames: 9 },
    dead: { src: `/sprites/${key}_dead.png`, frames: 10 },
  };
}
function bossSprite(key: string) {
  return {
    idle: { src: `/sprites/${key}_idle.png`, frames: 10 },
    attack: { src: `/sprites/${key}_attack.png`, frames: 10 },
    dead: { src: `/sprites/${key}_dead.png`, frames: 10 },
  };
}

export const ENEMIES: EnemyDefinition[] = [
  { id: "enemy1", name: "Zombie Cún Thường", level: 1, hp: 130, atk: 10, sprite: regSprite("enemy1") },
  { id: "enemy2", name: "Zombie Trái Tim", level: 2, hp: 150, atk: 11, sprite: regSprite("enemy2") },
  { id: "enemy3", name: "Zombie Nón Đỏ", level: 3, hp: 165, atk: 12, sprite: regSprite("enemy3") },
  { id: "enemy4", name: "Zombie Mũ Lưỡi Trai", level: 3, hp: 175, atk: 13, sprite: regSprite("enemy4") },
  { id: "enemy5", name: "Zombie Nón Công Trường", level: 4, hp: 185, atk: 13, sprite: regSprite("enemy5") },
  { id: "enemy6", name: "Zombie Nón Bảo Hộ", level: 4, hp: 195, atk: 14, sprite: regSprite("enemy6") },
  { id: "enemy7", name: "Zombie Băng Bó", level: 5, hp: 205, atk: 14, sprite: regSprite("enemy7") },
  { id: "enemy8", name: "Zombie Loa Đài", level: 5, hp: 215, atk: 15, sprite: regSprite("enemy8") },
  { id: "boss1", name: "Trùm Zombie Thùng Sắt", level: 6, hp: 320, atk: 18, sprite: bossSprite("boss1") },
  { id: "boss2", name: "Trùm Zombie Gai Nhọn", level: 7, hp: 350, atk: 19, sprite: bossSprite("boss2") },
  { id: "boss3", name: "Trùm Zombie Đấu Sĩ", level: 7, hp: 365, atk: 20, sprite: bossSprite("boss3") },
  { id: "boss4", name: "Trùm Zombie Gậy Bóng Chày", level: 8, hp: 385, atk: 21, sprite: bossSprite("boss4") },
  { id: "boss5", name: "Trùm Zombie Cơ Bắp", level: 8, hp: 400, atk: 22, sprite: bossSprite("boss5") },
  { id: "boss6", name: "Trùm Zombie Trống Trận", level: 9, hp: 420, atk: 23, sprite: bossSprite("boss6") },
  { id: "boss7", name: "Trùm Zombie Tối Thượng", level: 10, hp: 450, atk: 25, sprite: bossSprite("boss7") },
];

// Shop upgrades — permanent stat bonuses applied to every cat, bought with in-game gold earned
// from battles. Icons are the "Extra" power-up icons from the asset kit.
export const UPGRADES: UpgradeItem[] = [
  { id: "up1", name: "Tên Lửa", desc: "Tăng sát thương", icon: "/ui/addon1.png", stat: "atk", amount: 1, baseCost: 50 },
  { id: "up2", name: "Túi Vàng", desc: "Tăng sát thương", icon: "/ui/addon2.png", stat: "atk", amount: 1, baseCost: 60 },
  { id: "up3", name: "Nổ Diện Rộng", desc: "Tăng sát thương mạnh", icon: "/ui/addon3.png", stat: "atk", amount: 2, baseCost: 90 },
  { id: "up4", name: "Bom Lửa", desc: "Tăng sát thương mạnh", icon: "/ui/addon4.png", stat: "atk", amount: 2, baseCost: 90 },
  { id: "up5", name: "Mũ Bảo Hộ", desc: "Tăng phòng thủ", icon: "/ui/addon5.png", stat: "def", amount: 1, baseCost: 50 },
  { id: "up6", name: "Thùng TNT", desc: "Tăng máu tối đa", icon: "/ui/addon6.png", stat: "hp", amount: 8, baseCost: 55 },
  { id: "up7", name: "Găng Đấm", desc: "Tăng phòng thủ mạnh", icon: "/ui/addon7.png", stat: "def", amount: 2, baseCost: 90 },
  { id: "up8", name: "Bình Nước", desc: "Tăng máu tối đa mạnh", icon: "/ui/addon8.png", stat: "hp", amount: 15, baseCost: 90 },
];
