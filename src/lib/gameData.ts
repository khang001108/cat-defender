import { CatDefinition, EnemyDefinition } from "./types";

export const CATS: CatDefinition[] = [
  {
    id: "cat1",
    name: "Mèo Cam",
    role: "Cân bằng, dễ chơi",
    hp: 120,
    mp: 100,
    atk: 14,
    def: 6,
    sprite: {
      idle: { src: "/sprites/cat1_idle.png", frames: 10 },
      shoot: { src: "/sprites/cat1_shoot.png", frames: 10 },
      dead: { src: "/sprites/cat1_idle.png", frames: 10 },
    },
  },
  {
    id: "cat9",
    name: "Mèo Xám Mũ Phớt",
    role: "Sát thương cao, máu thấp",
    hp: 95,
    mp: 110,
    atk: 18,
    def: 4,
    sprite: {
      idle: { src: "/sprites/cat9_idle.png", frames: 10 },
      shoot: { src: "/sprites/cat9_shoot.png", frames: 10 },
      dead: { src: "/sprites/cat9_idle.png", frames: 10 },
    },
  },
  {
    id: "cat11",
    name: "Mèo Trắng",
    role: "Tốc độ nhanh, hồi chiêu tốt",
    hp: 105,
    mp: 130,
    atk: 15,
    def: 5,
    sprite: {
      idle: { src: "/sprites/cat11_idle.png", frames: 10 },
      shoot: { src: "/sprites/cat11_shoot.png", frames: 10 },
      dead: { src: "/sprites/cat11_idle.png", frames: 10 },
    },
  },
  {
    id: "cat14",
    name: "Mèo Vàng Mũ Sắt",
    role: "Máu cao, phòng thủ tốt",
    hp: 135,
    mp: 90,
    atk: 12,
    def: 8,
    sprite: {
      idle: { src: "/sprites/cat14_idle.png", frames: 10 },
      shoot: { src: "/sprites/cat14_shoot.png", frames: 10 },
      dead: { src: "/sprites/cat14_idle.png", frames: 10 },
    },
  },
];

export const ENEMIES: EnemyDefinition[] = [
  {
    id: "enemy1",
    name: "Zombie Cún Thường",
    level: 1,
    hp: 130,
    atk: 10,
    sprite: {
      idle: { src: "/sprites/enemy1_idle.png", frames: 10 },
      walk: { src: "/sprites/enemy1_walk.png", frames: 9 },
      attack: { src: "/sprites/enemy1_attack.png", frames: 9 },
      dead: { src: "/sprites/enemy1_dead.png", frames: 10 },
    },
  },
  {
    id: "boss1",
    name: "Trùm Zombie Thùng Sắt",
    level: 5,
    hp: 320,
    atk: 18,
    sprite: {
      idle: { src: "/sprites/boss1_idle.png", frames: 10 },
      attack: { src: "/sprites/boss1_attack.png", frames: 10 },
      dead: { src: "/sprites/boss1_dead.png", frames: 10 },
    },
  },
];
