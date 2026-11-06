export type Side = "player" | "enemy";
export type RuleSet = "elimination" | "arena-heart";
export type HeartClaim = { unit: string; readyTurn: number; damage: number };
export type ArenaHeart = { message?: string; scores: Record<Side, number>; claims: Partial<Record<Side, HeartClaim>>; usedRound: Record<Side, number> };
export type GameMode = "practice" | "local";
export type CharacterId =
  | "dan"
  | "afrodi"
  | "blade"
  | "drake"
  | "gin"
  | "hanibal"
  | "kami"
  | "kidou"
  | "lane"
  | "tomamaru";
export type Style = Exclude<CharacterId, "kidou">;
export type Pick = { character: CharacterId; styles?: Style[] };
export type Teams = Record<Side, Pick[]>;
export type Move =
  | "signature"
  | "attune"
  | "attack"
  | "guard"
  | "skill1"
  | "skill2"
  | "bankai"
  | "separate"
  | "release"
  | "switch";
export type Command = {
  move: Move;
  target?: string;
  secondary?: string;
  choice?: string;
};
export type Unit = {
  id: string;
  character: CharacterId | "tourgen";
  name: string;
  side: Side;
  owner?: string;
  hp: number;
  maxHp: number;
  attack: number;
  speed: number;
  energy: number;
  awakening: number;
  turns: number;
  guard: boolean;
  burn: number;
  burnDamage: number;
  burnSource?: string;
  evadeCharges: number;
  cooldowns: Record<string, number>;
  bankaiUsed: boolean;
  form: "base" | "armored" | "separated";
  phaseUntil: number;
  invisibleUntil: number;
  mantleUntil: number;
  dodgeUntil: number;
  barrier: number;
  barrierSource?: string;
  barrierUntil: number;
  prison?: { source: string; kind: "hell" | "blade"; remaining: number };
  static?: { source: string; until: number };
  focus: number;
  reserve: number;
  absorption: number;
  strengthUntil: number;
  speedUntilRound: number;
  speedBoost: number;
  ampUntil: number;
  bladeBonus: number;
  eyes: number;
  skyOpen: boolean;
  thunderUntil: number;
  charge?: { kind: "lane" | "kami"; ready: number; target?: string };
  styles: Style[];
  style: Style;
  copiedMove: "attack" | "skill1" | "skill2";
};
export type ActionCue = {
  animation?: { id: "dan-bankai-slash" | "roster-signature"; before: { [K in "units" | "active" | "queue" | "round" | "result" | "log" | "heart" | "metrics" | "deadIds" | "scars"]: Battle[K] } };
  revision: number;
  actor: string;
  character: Unit["character"];
  effect?: string;
  messages?: string[];
  reactions?: {
    id: string;
    kind: "phase" | "mantle" | "evade" | "barrier" | "absorb" | "prison";
  }[];
  name: string;
  move: Move;
  targets: string[];
  outcomes: {
    id: string;
    hpChange: number;
    barrierChange: number;
    defeated: boolean;
  }[];
};
export type ArenaId = "soul-society" | "las-noches" | "living-world";
export type Origin = "shinigami" | "arrancar" | "spirit" | "utility";
export type BattlefieldScar = {
  round?: number;
  revision: number;
  effect: string;
  side: Side;
  awakened: boolean;
};
export type Battle = {
  cinematicUntil?: number;
  rules?: RuleSet;
  heart?: ArenaHeart;
  victoryReason?: "elimination" | "arena-heart";
  scars?: BattlefieldScar[];
  arena: ArenaId;
  lastAction?: ActionCue;
  lastAwakening?: ActionCue;
  metrics?: Record<
    string,
    { damage: number; healing: number; protection: number; defeats: number }
  >;
  mode: GameMode;
  teams: Teams;
  units: Unit[];
  queue: string[];
  active: string | null;
  round: number;
  turn: number;
  revision: number;
  result: Side | "draw" | null;
  deadIds: string[];
  log: string[];
};
export type BattleEvent =
  | ({ type: "move"; turn: number; revision: number } & Command)
  | { type: "ai"; turn: number; revision: number };
export type Ability = {
  move: Move;
  origin?: Origin;
  name: string;
  description: string;
  cost: number;
  rest: number;
  targeting: "enemy" | "none";
  disabled?: string;
  choices?: { id: string; name: string }[];
  secondary?: boolean;
};
