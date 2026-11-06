import type { CharacterId, Pick } from "./types";
export type Character = {
  id: CharacterId;
  name: string;
  role: string;
  hp: number;
  speed: number;
  basic: number;
  theme: string;
  lore: string;
  passive: string;
  counter: string;
  plan: string;
};
export const ROSTER: Character[] = [
  {
    id: "dan",
    name: "Dan Jerald",
    role: "Adaptive bruiser",
    hp: 200,
    speed: 16,
    basic: 26,
    theme: "Black flame \u2022 Hell Shogun \u2022 Tourgen",
    lore: "Retains the existing prototype identity: black flame, Hell Shogun armor and Tourgen separation. Combat numbers are the current prototype balance.",
    passive:
      "Resolve: gain 20 Awakening after your action and 10 when damaged by a direct attack, up to 100.",
    counter:
      "Pressure Dan before transformation. Force a choice between armor and Tourgen\u2019s extra attacks.",
    plan: "Flexible damage dealer who can trade personal durability for an extra unit.",
  },
  {
    id: "afrodi",
    name: "Afrodi",
    role: "Evasive controller",
    hp: 170,
    speed: 18,
    basic: 23,
    theme: "Phasing \u2022 Black magic \u2022 Hell",
    lore: "Can attack while phased through anything. Controls anything black and cuts dimensions. Bankai summons Hell worshippers after battlefield deaths; strong targets are imprisoned, weak targets can die.",
    passive:
      "Death witness: count each original main character\u2019s first defeat. Summons do not count toward Bankai.",
    counter:
      "Attack allies during Phase; pressure him during its cooldown. Stay above the execution threshold.",
    plan: "Survive the opening and turn battlefield losses into a late-game removal threat.",
  },
  {
    id: "blade",
    name: "Blade",
    role: "Mobile duelist",
    hp: 190,
    speed: 20,
    basic: 27,
    theme: "Teleportation \u2022 Captive world \u2022 Power drain",
    lore: "Teleports anywhere instantly and fights with a blade-like Zanpakut\u014d. In Bankai, contact sends targets into his world, where drained power strengthens his Zanpakut\u014d. Strong opponents can escape.",
    passive:
      "Empowered blade: each energy drained from Captive World adds +3 basic damage, maximum +24 for this battle.",
    counter:
      "Keep the captive healthy before capture to shorten exile. Hit Blade with area attacks or defeat him to release the captive.",
    plan: "Pick a key opponent, remove them briefly, and convert the time into weapon strength.",
  },
  {
    id: "drake",
    name: "Drake",
    role: "Destruction finisher",
    hp: 185,
    speed: 14,
    basic: 29,
    theme: "Noble arrogance \u2022 Destruction \u2022 Hakai",
    lore: "Shikai grants destruction powers. Bankai coats his body in energy that destroys anything touching it, including energy attacks. Hakai erases its target. Lore power exceeds the Beerus inspiration.",
    passive:
      "Destructive focus: a basic attack grants one Focus, maximum two. Hakai costs two Focus before Bankai and one after Bankai.",
    counter:
      "Bait the short mantle window, then strike during recovery. Keep damaged allies above Hakai\u2019s threshold.",
    plan: "Build Focus while allies soften enemies, then choose the right moment for destruction.",
  },
  {
    id: "gin",
    name: "Gin",
    role: "Scaling survivor",
    hp: 210,
    speed: 12,
    basic: 22,
    theme: "Absorption \u2022 Allocation \u2022 Spiritual pressure",
    lore: "Constantly absorbs ambient energy, others\u2019 energy and attacks. Grows stronger with time. Redirects energy into strength, speed or healing. Excess attack power damages him and cracks his body; Bankai permanently improves his existing powers.",
    passive:
      "Absorb: after normal damage reduction, absorb up to 4 damage per hit into a Reserve (maximum 60). Capacity rises by 2 each own turn, to 12. Excess damage hits HP. Gain 2 Reserve at turn start (4 in Bankai). At 60 Reserve, absorption stops until energy is spent; excess incoming damage cracks through.",
    counter:
      "Use heavy early hits that exceed absorption capacity. Many small hits feed him; stop letting the match run long.",
    plan: "Read incoming pressure and spend one shared Reserve on survival, damage or initiative.",
  },
  {
    id: "hanibal",
    name: "Hannibal",
    role: "Escalating destroyer",
    hp: 230,
    speed: 10,
    basic: 28,
    theme: "Five eyes \u2022 Color conversion \u2022 Kinetic energy",
    lore: "Shikai manifests five closed eyes in the sky. Takes color from the world and converts it into kinetic energy. Eyes open gradually; at five his speed and destruction can crush reality. No Bankai revealed.",
    passive:
      "Five Eyes: after Shikai activation, open one eye at each own turn start, maximum five. Each eye grants +3 basic damage and +2 speed. Speed changes apply next round.",
    counter:
      "Attack before the fifth eye. Exile can delay an opening by skipping his turn; it does not reset existing eyes.",
    plan: "A visible countdown that rewards a team capable of keeping him alive.",
  },
  {
    id: "kami",
    name: "Kami",
    role: "Invisible saboteur",
    hp: 175,
    speed: 21,
    basic: 26,
    theme: "Invisibility \u2022 Explosions \u2022 Erasure shot",
    lore: "Healer by profession, not a healing-based combat kit. Shikai makes him invisible even while attacking. Arrancar powers produce explosions stronger than the Bakugo inspiration. Bankai shoots a target and erases it from reality.",
    passive:
      "Hidden pressure: while invisible, direct damage dealt gains +5 per target (+10 in Bankai), before arena bonuses. This does not reveal him.",
    counter:
      "Use area damage during invisibility. Keep allies above 20% HP before his Bankai erasure shot.",
    plan: "Pressure the whole team from concealment, then erase weakened targets in Bankai.",
  },
  {
    id: "kidou",
    name: "Kidou",
    role: "Versatile specialist",
    hp: 180,
    speed: 19,
    basic: 24,
    theme: "Zanpakut\u014d mastery \u2022 White magic \u2022 Dimensions",
    lore: "Uses any known Zanpakut\u014d one at a time, switching freely. Shikai and Bankai access their corresponding forms. Mastery is his own, not automatically the original user\u2019s strength. Controls anything white and has an exceptionally fast dimensional cut.",
    passive:
      "Battlefield mastery: freely copy any Shinigami core move from either starting team into the third slot. Copies share a cooldown and use Kidou’s own form, resources and mastery.",
    counter:
      "Track his selected copy, shared cooldown and resources. Interrupt charged copies; protect weakened allies from finishing techniques.",
    plan: "Turn both teams’ Shinigami techniques into an adaptable arsenal, alongside his own white magic.",
  },
  {
    id: "lane",
    name: "Lane",
    role: "Defender / siege attacker",
    hp: 230,
    speed: 13,
    basic: 24,
    theme: "Mother Earth \u2022 Planetary cores \u2022 Devastation",
    lore: "Commands anything natural on Earth, including its core. Bankai gathers power from planetary cores for devastation capable of destroying planets and galaxies. Must remain still while gathering power. Seven Beasts techniques are deferred.",
    passive:
      "Grounded: direct damage received while channeling is reduced by 20%; disruption still cancels the charge.",
    counter:
      "Save an interrupt for his announced charge. Pressure allies so he must choose between protection and charging.",
    plan: "Protect teammates early, then risk a turn of stillness for a powerful team-wide strike.",
  },
  {
    id: "tomamaru",
    name: "Tomamaru",
    role: "Lightning disruptor",
    hp: 185,
    speed: 17,
    basic: 25,
    theme: "Bladed hat \u2022 Lightning \u2022 Thunder command",
    lore: "Shikai uses a lightning-coated bladed hat for close combat or controlled flight. In Bankai he commands thunder directly and needs no weapon.",
    passive:
      "Conductor: damaging specials mark each hit enemy with Static through the end of Tomamaru\u2019s next turn. Static itself deals no damage.",
    counter:
      "Force him to spend disruption before starting a charge. Phase and destruction coating prevent hit effects; no permanent stun lock.",
    plan: "Set up Static with the returning blade, then detonate it with a cheaper thunder strike to deal bonus damage or stop a charge.",
  },
];

export const portrait = (id: string) => `/portraits/${id}.png`;
export const character = (id: CharacterId) => ROSTER.find((c) => c.id === id)!;
export const defaultPicks: Pick[] = [
  { character: "dan" },
  { character: "lane" },
  { character: "tomamaru" },
];
export const enemyPicks: Pick[] = [
  { character: "kami" },
  { character: "gin" },
  { character: "hanibal" },
];
export function validPicks(value: unknown): value is Pick[] {
  if (!Array.isArray(value) || value.length !== 3) return false;
  const ids = new Set<string>();
  for (const p of value) {
    if (
      !p ||
      typeof p !== "object" ||
      !ROSTER.some((c) => c.id === p.character) ||
      ids.has(p.character)
    )
      return false;
    ids.add(p.character);
  }
  return true;
}

/** Roll a whole team without mutating the roster or reusing styles arrays. */
export function randomPicks(): Pick[] {
  function shuffled<T>(items: readonly T[]): T[] {
    const pool = [...items];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool;
  }
  return shuffled(ROSTER)
    .slice(0, 3)
    .map(({ id }) => ({
      character: id,
    }));
}
