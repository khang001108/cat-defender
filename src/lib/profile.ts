import { PlayerProfile } from "./types";

const KEY = "cat_defender_profile_v1";

export function defaultProfile(): PlayerProfile {
  return {
    displayName: "Người Chơi",
    loggedIn: false,
    notificationsEnabled: true,
    gold: 100,
    upgradeLevels: {},
  };
}

export function loadProfile(): PlayerProfile {
  if (typeof window === "undefined") return defaultProfile();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return defaultProfile();
    return { ...defaultProfile(), ...JSON.parse(raw) };
  } catch {
    return defaultProfile();
  }
}

export function saveProfile(profile: PlayerProfile) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(profile));
}
