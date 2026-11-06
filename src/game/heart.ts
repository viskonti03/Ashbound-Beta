import type { Battle, Unit } from "./types";
export const HEART_GOAL = 3;
export const HEART_BREAK = 24;
export const HEART_OPENS = 2;
export function attuneReason(b: Battle, u: Unit): string | undefined {
  if (!b.heart) return "Elimination battle";
  if (b.round < HEART_OPENS) return "The Heart opens in round 2";
  if (u.hp <= 0 || u.prison) return "Not on battlefield";
  if (u.character === "tourgen") return "Summons cannot attune";
  if (u.charge) return "Finish your charged technique first";
  if (u.phaseUntil || u.invisibleUntil || u.mantleUntil)
    return "Return from phase, invisibility or mantle before attuning";
  if (b.heart.claims[u.side]) return "Your team is already attuning";
  if (b.heart.usedRound[u.side] === b.round) return "One attempt per team each round";
  if (u.energy < 1) return "Needs 1 energy";
}
export function claimFor(b: Battle, u: Unit) {
  const claim = b.heart?.claims[u.side];
  return claim?.unit === u.id ? claim : undefined;
}
