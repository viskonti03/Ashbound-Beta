import { awakeningVoice } from "./awakeningVoices";
import type { Move, Unit } from "./types";
// Presentation only: action IDs and battle rules stay unchanged.
export const THEMES: Record<
  Unit["character"],
  { color: string; title: string; effect: string; sigil: string }
> = {
  dan: {
    color: "#f2a16b",
    title: "THE BLACK FLAME",
    effect: "flame",
    sigil: "焔",
  },
  afrodi: {
    color: "#b99aff",
    title: "BEYOND THE VEIL",
    effect: "void",
    sigil: "空",
  },
  blade: {
    color: "#92d9e8",
    title: "WORLDS WITHIN REACH",
    effect: "rift",
    sigil: "界",
  },
  drake: {
    color: "#e195ff",
    title: "HEIR OF DESTRUCTION",
    effect: "ruin",
    sigil: "滅",
  },
  gin: {
    color: "#8ad9bf",
    title: "BOUNDLESS PRESSURE",
    effect: "pulse",
    sigil: "魂",
  },
  hanibal: {
    color: "#ede0ad",
    title: "THE FIVE-EYED SKY",
    effect: "kinetic",
    sigil: "天",
  },
  kami: {
    color: "#f4b97b",
    title: "THE UNSEEN RECKONING",
    effect: "burst",
    sigil: "影",
  },
  kidou: {
    color: "#e4e9ff",
    title: "A THOUSAND BLADES",
    effect: "rift",
    sigil: "白",
  },
  lane: {
    color: "#c4d99a",
    title: "VOICE OF THE EARTH",
    effect: "earth",
    sigil: "地",
  },
  tomamaru: {
    color: "#91c5ff",
    title: "SOVEREIGN OF THUNDER",
    effect: "lightning",
    sigil: "雷",
  },
  tourgen: {
    color: "#edaa75",
    title: "THE UNBOUND SHOGUN",
    effect: "flame",
    sigil: "将",
  },
};
const NAMES: Record<Unit["character"], Partial<Record<Move, string>>> = {
  dan: {
    attack: "Ashen Cleave",
    skill1: "Cinder Requiem",
    bankai: "Hell Shogun",
    separate: "Tourgen: Unbound",
  },
  afrodi: {
    attack: "Umbral Edge",
    skill1: "Beyond the Veil",
    skill2: "Sever the Horizon",
    bankai: "Procession of the Damned",
  },
  blade: {
    attack: "Worldsplitter",
    skill1: "Between Heartbeats",
    skill2: "Vanishing Step",
    bankai: "Sovereign’s Captive World",
  },
  drake: {
    attack: "Ruin’s Touch",
    skill1: "Crown of Ruin",
    skill2: "Hakai: Absolute Erasure",
    bankai: "Mantle of Annihilation",
  },
  gin: {
    attack: "Pressure Break",
    skill1: "Spiritual Undertow",
    skill2: "Soul Redistribution",
    bankai: "Boundless Ascension",
  },
  hanibal: {
    attack: "Chromatic Impact",
    skill1: "Five Eyes: Awakening",
    skill2: "Spectrum Collapse",
    bankai: "Fifth Eye: Reality Break",
  },
  kami: {
    attack: "Detonation Point",
    skill1: "Unseen Presence",
    skill2: "Cataclysm Salvo",
    bankai: "The Last Witness",
    release: "Erasure Shot: No Tomorrow",
  },
  kidou: {
    attack: "Ivory Crescent",
    skill1: "White Magic: Horizon Sever",
    switch: "Arsenal of Echoes",
  },
  lane: {
    attack: "Faultline Strike",
    skill1: "Mother Earth’s Embrace",
    skill2: "Heart of the World",
    bankai: "Convergence of Worlds",
    release: "Planetary Devastation",
  },
  tomamaru: {
    attack: "Lightning-Rim Cleave",
    skill1: "Heaven’s Returning Blade",
    skill2: "Thunderclap Severance",
    bankai: "Thunder Sovereign",
  },
  tourgen: { attack: "Shogun’s Judgment" },
};
export function moveName(u: Unit, move: Move, fallback: string): string {
  if (move === "bankai" && awakeningVoice(u.character))
    return `Bankai: ${awakeningVoice(u.character)!.title}`;
  if (move === "release" && u.charge?.kind === "lane")
    return "Planetary Devastation";
  return NAMES[u.character][move] ?? fallback;
}
