import type { ArenaId, Origin, Unit } from "./types";
export const ARENAS: {
  id: ArenaId;
  name: string;
  subtitle: string;
  description: string;
}[] = [
  {
    id: "soul-society",
    name: "Soul Society",
    subtitle: "THE WHITE CITY OF SOULS",
    description:
      "Shinigami moves gain 12% damage, healing and barriers for pure Shinigami; 6% for half-Shinigami. Immunity and prison durations do not increase.",
  },
  {
    id: "las-noches",
    name: "Las Noches",
    subtitle: "BENEATH AN ENDLESS MOON",
    description:
      "Afrodi, Kami and Kidou gain 12% damage from their Arrancar move. Their Shinigami moves are unchanged.",
  },
  {
    id: "living-world",
    name: "World of the Living",
    subtitle: "WHERE EVERY SOUL STANDS EQUAL",
    description: "Neutral battlefield. No heritage bonuses.",
  },
];
export const arenaInfo = (id: ArenaId) => ARENAS.find((a) => a.id === id)!;
export const HYBRIDS = ["afrodi", "kami", "kidou"] as const;
export function heritage(id: Unit["character"]): string {
  if (id === "dan") return "Half Shinigami · Half Berserker";
  if (id === "tourgen") return "Manifested Zanpakutō spirit";
  return HYBRIDS.some((x) => x === id)
    ? "Half Arrancar · Half Shinigami"
    : "Shinigami";
}
export function arenaMultiplier(
  arena: ArenaId,
  u: Unit,
  origin: Origin = "utility",
) {
  if (arena === "soul-society" && origin === "shinigami")
    return u.character === "dan" ||
      u.character === "tourgen" ||
      HYBRIDS.some((x) => x === u.character)
      ? 1.06
      : 1.12;
  if (
    arena === "las-noches" &&
    origin === "arrancar" &&
    HYBRIDS.some((x) => x === u.character)
  )
    return 1.12;
  return 1;
}
export const arenaAmount = (
  arena: ArenaId,
  u: Unit,
  origin: Origin | undefined,
  n: number,
) => Math.round(n * arenaMultiplier(arena, u, origin));
export function randomArena(): ArenaId {
  return ARENAS[Math.floor(Math.random() * ARENAS.length)].id;
}
