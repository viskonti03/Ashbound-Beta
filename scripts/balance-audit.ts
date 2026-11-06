import {
  newBattle,
  battleReducer,
  chooseAI,
  getActiveUnit,
} from "../src/game/engine";
import { ROSTER } from "../src/game/roster";
import type { CharacterId, ArenaId, Pick } from "../src/game/types";
const rules = process.argv.includes("--heart") ? "arena-heart" : "elimination";
let heartWins = 0, eliminationWins = 0;
let seed = 13032026;
const random = () => {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return (seed >>> 0) / 4294967296;
};
const team = (): Pick[] => {
  const pool = ROSTER.map((c) => c.id);
  for (let i = pool.length - 1;i > 0;i--) {
    const j = Math.floor(random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, 3).map((character) => ({ character }));
};
const roster = Object.fromEntries(
  ROSTER.map((c) => [
    c.id,
    { games: 0, wins: 0, bankai: 0, eyes5: 0, damage: 0 },
  ]),
) as Record<
  CharacterId,
  { games: number; wins: number; bankai: number; eyes5: number; damage: number }
>;
let games = 0,
  draws = 0,
  capped = 0,
  rounds = 0,
  actions = 0,
  freeSwitches = 0;
const arenas: ArenaId[] = ["living-world", "soul-society", "las-noches"];
for (let sample = 0;sample < 60;sample++) {
  const first = team(),
    second = team(),
    arena = arenas[sample % 3];
  for (const flip of [false, true]) {
    const teams = {
      player: flip ? second : first,
      enemy: flip ? first : second,
    };
    let b = newBattle(0, "local", teams, arena, rules),
      steps = 0;
    while (!b.result && steps++ < 400) {
      const cmd = chooseAI(b);
      const next = battleReducer(b, {
        type: "move",
        turn: b.turn,
        revision: b.revision,
        ...cmd,
      });
      if (next === b)
        throw Error(
          `Illegal AI action ${getActiveUnit(b)?.character} ${JSON.stringify(cmd)}`,
        );
      if (cmd.move === "switch") freeSwitches++;
      else actions++;
      b = next;
    }
    games++;
    if (b.victoryReason === "arena-heart") heartWins++;
    if (b.victoryReason === "elimination") eliminationWins++;
    rounds += b.round;
    if (!b.result) capped++;
    if (b.result === "draw") draws++;
    for (const u of b.units) {
      if (u.character === "tourgen") continue;
      const row = roster[u.character];
      row.games++;
      if (b.result === u.side) row.wins++;
      if (u.bankaiUsed) row.bankai++;
      if (u.eyes === 5) row.eyes5++;
      row.damage += b.metrics?.[u.id]?.damage ?? 0;
    }
  }
}
console.log(
  JSON.stringify(
    {
      seed: 13032026,
      games,
      rules, heartWins, eliminationWins,
      arenas,
      draws,
      capped,
      meanRounds: Math.round((rounds / games) * 100) / 100,
      meanActions: Math.round((actions / games) * 100) / 100,
      freeSwitches,
      method:
        "60 seeded roster pairs, both seat orders; existing practice AI on both teams. Exploratory smoke test, not human win-rate evidence.",
      roster: Object.fromEntries(
        Object.entries(roster).map(([id, r]) => [
          id,
          {
            ...r,
            winRate: Math.round((1000 * r.wins) / r.games) / 10,
            meanDamage: Math.round(r.damage / r.games),
          },
        ]),
      ),
    },
    null,
    2,
  ),
);
