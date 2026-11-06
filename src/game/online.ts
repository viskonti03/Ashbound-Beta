import type { Battle, Command, Pick, Side } from "./types";
export type RoomSession = { code: string; token: string };
export type RoomView = {
  serverNow?: number;
  rules: import("./types").RuleSet;
  code: string;
  side: Side;
  phase: "selection" | "reveal" | "battle";
  battle: Battle | null;
  arenaReady: Record<Side, boolean>;
  connected: Record<Side, boolean>;
  joined: boolean;
  rematch: Record<Side, boolean>;
  picks: Record<Side, Pick[]>;
  locked: Record<Side, boolean>;
  version: number;
};
export type OnlineMove = Command & { turn: number; revision: number };
export const SESSION_KEY = "ashbound-room-v5";
