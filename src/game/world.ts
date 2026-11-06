import type { Battle } from "./types";
export function visibleScars(b: Battle) {
  return (b.scars ?? []).filter(s=>s.round !== undefined && s.round >= b.round-1).slice(-4);
}
/** Derived presentation only. Never used by combat resolution. */
export function worldState(b: Battle) {
  const present = b.units.filter((u) => u.hp > 0 && !u.prison);
  const eyes = Math.max(
    0,
    ...present.filter((u) => u.skyOpen).map((u) => u.eyes),
  );
  const sky = present.some((u) => u.skyOpen);
  const afrodi = present.filter((u) => u.character === "afrodi");
  const hellReady = afrodi.length > 0 && b.deadIds.length >= 2;
  const hellAwakened = afrodi.some((u) => u.bankaiUsed);
  const charging = present.filter((u) => u.charge?.kind === "lane");
  return {
    eyes,
    sky,
    hellReady,
    hellAwakened,
    deaths: b.deadIds.length,
    charging,
    saturation: 1 - eyes * 0.18,
    labels: [
      sky ? `Five Eyes · ${eyes}/5 open` : null,
      hellAwakened
        ? "Hell has opened"
        : hellReady
          ? "Hell gate available"
          : null,
      charging.length ? "Planetary convergence" : null,
    ].filter((x): x is string => !!x),
  };
}
