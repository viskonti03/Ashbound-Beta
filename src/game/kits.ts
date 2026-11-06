import { arenaAmount } from "./arenas";
import type { Ability, Unit, Origin, ArenaId, Style } from "./types";
export type KitMove = Ability & {
  kind:
    | "hit"
    | "flame"
    | "phase"
    | "hell"
    | "blink"
    | "evade"
    | "burst"
    | "hakai"
    | "siphon"
    | "allocate"
    | "eyes"
    | "crush"
    | "vanish"
    | "white"
    | "rampart"
    | "arc"
    | "thunder"
    | "charge"
    | "release";
  source?: Style;
  sourceMove?: "attack" | "skill1" | "skill2";
  damage: number;
  area?: boolean;
  pierce?: boolean;
  second?: number;
  barrier?: number;
  duration?: number;
  burnDamage?: number;
  burnTurns?: number;
  executeAt?: number;
  drain?: number;
};
export const GIN_HEAL = { base: 40, bankai: 65 };
export const GIN_COST = { base: 30, bankai: 25 };
export const empowered = (u: Unit) => u.character !== "hanibal" && u.bankaiUsed;
export function basicDamage(u: Unit) {
  return (
    Math.round(u.attack * (empowered(u) ? 1.7 : 1)) +
    u.bladeBonus +
    u.eyes * 3 +
    (u.ampUntil > 0 ? (empowered(u) ? 18 : 10) : 0) +
    (u.strengthUntil > 0 ? (empowered(u) ? 18 : 10) : 0)
  );
}
export function coreMoves(u: Unit, arena: ArenaId = "living-world"): KitMove[] {
  const bank = empowered(u),
    n = (a: number, b: number) => (bank ? b : a);
  const move = (
    id: KitMove["move"],
    name: string,
    origin: Origin,
    kind: KitMove["kind"],
    damage = 0,
    cost = 0,
    rest = 0,
    targeting: Ability["targeting"] = "enemy",
    extras: Partial<KitMove> = {},
  ): KitMove => ({
    move: id,
    name,
    origin,
    kind,
    damage,
    cost,
    rest,
    targeting,
    description: "",
    ...extras,
  });
  const basic = (
    name: string,
    origin: Origin = "shinigami",
    extras: Partial<KitMove> = {},
  ) =>
    move("attack", name, origin, "hit", basicDamage(u), 0, 0, "enemy", extras);
  let list: KitMove[] = [];
  switch (u.character) {
    case "dan":
    case "tourgen":
      list = [
        basic(bank ? "Hell Shogun: Soul Cleaver" : "Ashen Cleave"),
        move(
          "skill1",
          bank ? "Infernal Requiem" : "Cinder Requiem",
          "shinigami",
          "flame",
          n(44, 68),
          2,
          1,
          "enemy",
          { burnDamage: n(8, 12), burnTurns: n(2, 3) },
        ),
        move(
          "skill2",
          bank ? "Shogun’s Infernal Dominion" : "Pyre Dominion",
          "shinigami",
          "burst",
          n(28, 46),
          3,
          2,
          "none",
          { area: true, barrier: n(15, 30) },
        ),
      ];
      break;
    case "afrodi":
      list = [
        basic(bank ? "Hellbound Reaping" : "Umbral Soul Edge"),
        move(
          "skill1",
          bank ? "Procession of the Damned" : "Beyond the Veil",
          "shinigami",
          bank ? "hell" : "phase",
          0,
          bank ? 3 : 2,
          3,
          bank ? "enemy" : "none",
          { duration: 1 },
        ),
        move(
          "skill2",
          bank ? "Black Magic: World’s End" : "Black Magic: Sever the Horizon",
          "arrancar",
          "hit",
          n(44, 72),
          3,
          2,
          "enemy",
          { pierce: true },
        ),
      ];
      break;
    case "blade":
      list = [
        basic(bank ? "Worldsplitter: Sovereign Edge" : "Worldsplitter"),
        move(
          "skill1",
          bank ? "Captive World: Sovereign’s Touch" : "Between Heartbeats",
          "shinigami",
          "blink",
          n(48, 74),
          3,
          bank ? 3 : 1,
        ),
        move(
          "skill2",
          bank ? "Untouchable Horizon" : "Vanishing Step",
          "shinigami",
          "evade",
          0,
          2,
          2,
          "none",
          { duration: n(1, 2) },
        ),
      ];
      break;
    case "drake":
      list = [
        basic(bank ? "Annihilation Touch" : "Ruin’s Touch"),
        move(
          "skill1",
          bank ? "Crown of Annihilation" : "Crown of Ruin",
          "shinigami",
          "burst",
          n(34, 56),
          3,
          2,
          "none",
          { area: true },
        ),
        move(
          "skill2",
          bank ? "Hakai: Absolute Erasure" : "Hakai: Destruction Sentence",
          "shinigami",
          "hakai",
          n(64, 92),
          4,
          3,
          "enemy",
          { executeAt: n(0.2, 0.35), pierce: true },
        ),
      ];
      break;
    case "gin":
      list = [
        basic(bank ? "Boundless Pressure Break" : "Pressure Break"),
        move(
          "skill1",
          bank ? "Abyssal Spiritual Undertow" : "Spiritual Undertow",
          "shinigami",
          "siphon",
          n(42, 70),
          2,
          1,
          "enemy",
          { drain: n(1, 2) },
        ),
        move(
          "skill2",
          bank ? "Boundless Soul Redistribution" : "Soul Redistribution",
          "shinigami",
          "allocate",
          0,
          0,
          2,
          "none",
          {
            choices: [
              {
                id: "heal",
                name: `Heal ${arenaAmount(arena, u, "shinigami", n(GIN_HEAL.base, GIN_HEAL.bankai))} HP`,
              },
              { id: "strength", name: `+${n(10, 18)} attack` },
              { id: "speed", name: `+${n(8, 12)} speed` },
            ],
          },
        ),
      ];
      break;
    case "hanibal":
      list = [
        basic(
          u.eyes === 5 ? "Fifth Eye: Chromatic Rupture" : "Chromatic Impact",
        ),
        move(
          "skill1",
          u.eyes === 5 ? "Fifth Eye: Reality Break" : "Five Eyes: Awakening",
          "shinigami",
          u.eyes === 5 ? "crush" : "eyes",
          u.eyes === 5 ? 85 : 0,
          u.eyes === 5 ? 5 : 2,
          u.eyes === 5 ? 3 : 0,
          "none",
          { area: u.eyes === 5 },
        ),
        move(
          "skill2",
          u.eyes === 5 ? "Spectrum Annihilation" : "Spectrum Collapse",
          "shinigami",
          "hit",
          40 + u.eyes * 6,
          3,
          2,
        ),
      ];
      break;
    case "kami":
      list = [
        basic(
          bank ? "Erasure Shot: No Tomorrow" : "Spirit Round",
          "shinigami",
          bank ? { damage: 60, executeAt: 0.2, pierce: true } : { damage: 26 },
        ),
        move(
          "skill1",
          bank ? "Presence Beyond Reality" : "Unseen Presence",
          "shinigami",
          "vanish",
          0,
          2,
          3,
          "none",
          { duration: n(1, 2) },
        ),
        move(
          "skill2",
          bank ? "Black Sun: Cataclysm Salvo" : "Cataclysm Salvo",
          "arrancar",
          "burst",
          n(36, 60),
          3,
          2,
          "none",
          { area: true },
        ),
      ];
      break;
    case "kidou": {
      const source = {
        ...u,
        character: u.style,
        bankaiUsed: u.style === "hanibal" ? false : bank,
      };
      const borrowed = coreMoves(source).find(
        (m) => m.move === u.copiedMove && m.origin === "shinigami",
      )!;
      list = [
        basic(
          bank ? "Echo Blade: Infinite Soul Edge" : "Echo Blade: Soul Edge",
        ),
        move(
          "skill1",
          bank
            ? "White Magic: Boundless Horizon"
            : "White Magic: Horizon Sever",
          "arrancar",
          "white",
          n(46, 76),
          3,
          2,
          "enemy",
          { pierce: true },
        ),
        {
          ...borrowed,
          move: "skill2",
          name: `Echo: ${borrowed.name}`,
          source: u.style,
          sourceMove: u.copiedMove,
        },
      ];
      break;
    }
    case "lane":
      list = [
        basic(bank ? "Planetbreaker Strike" : "Faultline Strike"),
        move(
          "skill1",
          bank ? "Mother Earth: World Aegis" : "Mother Earth’s Embrace",
          "shinigami",
          "rampart",
          0,
          2,
          2,
          "none",
          { barrier: n(30, 52) },
        ),
        move(
          "skill2",
          bank
            ? u.charge
              ? "Planetary Devastation"
              : "Convergence of Worlds"
            : "Heart of the World",
          "shinigami",
          bank ? (u.charge ? "release" : "charge") : "burst",
          n(38, 120),
          bank ? 4 : 3,
          bank ? 3 : 2,
          "none",
          { area: true },
        ),
      ];
      break;
    case "tomamaru":
      list = [
        basic(bank ? "Heaven’s Judgment" : "Lightning-Rim Cleave"),
        move(
          "skill1",
          bank ? "Heavenfall Thunder" : "Heaven’s Returning Blade",
          "shinigami",
          "arc",
          n(42, 68),
          3,
          2,
          "enemy",
          { second: n(22, 38), secondary: true },
        ),
        move(
          "skill2",
          bank
            ? "Thunder Sovereign: Divine Severance"
            : "Thunderclap Severance",
          "shinigami",
          "thunder",
          n(48, 78),
          2,
          2,
        ),
      ];
      break;
  }
  return list.map((m) => {
    const tuned = {
      ...m,
      ...(m.kind === "allocate"
        ? {
            choices: m.choices!.map((c) =>
              c.id === "heal"
                ? {
                    ...c,
                    name: `Heal ${arenaAmount(arena, u, m.origin, bank ? GIN_HEAL.bankai : GIN_HEAL.base)} HP`,
                  }
                : c,
            ),
          }
        : {}),
      damage: arenaAmount(arena, u, m.origin, m.damage),
      ...(m.second !== undefined
        ? { second: arenaAmount(arena, u, m.origin, m.second) }
        : {}),
      ...(m.barrier !== undefined
        ? { barrier: arenaAmount(arena, u, m.origin, m.barrier) }
        : {}),
      ...(m.burnDamage !== undefined
        ? { burnDamage: arenaAmount(arena, u, m.origin, m.burnDamage) }
        : {}),
    };
    return {
      ...tuned,
      description: describe(
        tuned,
        m.source
          ? {
              ...u,
              character: m.source,
              bankaiUsed: m.source === "hanibal" ? false : u.bankaiUsed,
            }
          : u,
        arena,
        u,
      ),
    };
  });
}
function describe(
  m: KitMove,
  u: Unit,
  arena: ArenaId,
  beneficiary: Unit,
): string {
  const bank = empowered(u),
    d = `${m.damage} ${m.area ? "damage to all present enemies" : "damage"}`;
  switch (m.kind) {
    case "hit":
      return `${d}${m.pierce ? "; ignores Guard, armor and barriers" : ""}${m.executeAt ? `; erases targets at ≤${m.executeAt * 100}% HP` : ""}.${u.character === "drake" ? ` Gain 1 Focus (max 2).` : ""}`;
    case "flame":
      return `${d}; burn ${m.burnDamage} HP on ${m.burnTurns} own turns.`;
    case "burst":
      return `${d}.${m.barrier ? ` Gain ${m.barrier} barrier until next own turn.` : ""}${bank && u.character === "drake" ? " Renew destruction immunity through the end of your next own turn; contact attackers take 30 retaliation." : ""}`;
    case "phase":
      return "Negate incoming direct attacks through the end of your next own turn. You can attack while phased; existing burn remains.";
    case "hell":
      return "Phase through next own turn end; imprison one target for 2 scheduled turns, or claim it at ≤25% HP. Immunity and evasion prevent capture.";
    case "blink":
      return `${d}, contact strike.${bank ? " On hit, send target to Captive World: drain 2 energy per skipped turn into blade power. Healthy targets escape after one skip, otherwise two." : ""}`;
    case "evade":
      return `Evade the next ${m.duration} single-target attack${m.duration === 1 ? "" : "s"} before your next turn. Area attacks still hit. Your next basic attack gains +${bank ? 18 : 10} damage through the end of your next own turn.`;
    case "hakai":
      return `${d}, ignoring Guard, armor and barriers, or erase at ≤${m.executeAt! * 100}% HP. Costs ${bank ? 1 : 2} Focus.`;
    case "siphon":
      return `${d}; drain up to ${m.drain} energy, gaining 8 Reserve for each energy drained.`;
    case "allocate":
      return `Spend ${bank ? GIN_COST.bankai : GIN_COST.base} Reserve: heal ${arenaAmount(arena, beneficiary, m.origin, bank ? GIN_HEAL.bankai : GIN_HEAL.base)}, gain +${bank ? 18 : 10} basic damage for two future actions, or +${bank ? 12 : 8} speed for two rounds.`;
    case "eyes":
      return "Summon five closed eyes. Each subsequent own turn opens one: +3 basic damage, +2 speed, +6 Spectrum damage. At five eyes, this slot becomes Reality Break.";
    case "crush":
      return `${d}; ignores Guard and barriers. Five-eye Shikai technique, not Bankai.`;
    case "vanish":
      return `Invisible through the end of your next ${m.duration} own turn${m.duration === 1 ? "" : "s"}. Attacking does not reveal you. Area attacks still hit. Hidden attacks gain +${bank ? 10 : 5} damage before the attack’s arena bonus.`;
    case "white":
      return `${d}; ignores Guard, armor and barriers. +${bank ? 12 : 6} speed for the next round.`;
    case "rampart":
      return `Give each present ally ${m.barrier} barrier until your next own turn.`;
    case "arc":
      return `${d} to primary and ${m.second} to an optional second enemy; mark both with Static.`;
    case "thunder":
      return `${d}. ${bank ? `Always interrupts a charge; detonates Static for +${arenaAmount(arena, beneficiary, m.origin, 20)} damage.` : `Detonates Static for +${arenaAmount(arena, beneficiary, m.origin, 10)} damage and interrupts its charge; otherwise applies Static.`}`;
    case "charge":
      return `Stand still and gather power. Next own turn, use this same slot to release ${m.damage} damage to all enemies. 20% damage reduction while charging. Interrupts cancel it.`;
    case "release":
      return `${m.damage} damage to all present enemies. Consume the gathered planetary power.`;
  }
}

/** Match-derived sources, independent of alive/hidden state; never copies another copy. */
export function copyOptions(u: Unit) {
  return u.styles.flatMap((source) =>
    coreMoves({
      ...u,
      character: source,
      bankaiUsed: source === "hanibal" ? false : u.bankaiUsed,
    })
      .filter((m) => m.origin === "shinigami")
      .map((m) => ({
        id: `${source}:${m.move}`,
        source,
        move: m.move as Unit["copiedMove"],
        name: m.name,
      })),
  );
}
