import test from "node:test";
import assert from "node:assert/strict";
import {
  newBattle,
  battleReducer,
  getActiveUnit,
  previewMove,
  abilities,
  basicDamage,
} from "../src/game/engine";
import { worldState, visibleScars } from "../src/game/world";
import type { Battle, CharacterId, Command } from "../src/game/types";
function setup(id: CharacterId = "dan", bank = false) {
  const b = newBattle(
    0,
    "local",
    {
      player: [
        { character: id },
        { character: id === "lane" ? "afrodi" : "lane" },
        { character: "hanibal" },
      ],
      enemy: [
        { character: "gin" },
        { character: "drake" },
        { character: "kami" },
      ],
    },
    "living-world",
  );
  b.active = "player:" + id;
  b.queue = ["enemy:kami"];
  const u = getActiveUnit(b)!;
  u.energy = 5;
  u.bankaiUsed = bank;
  u.awakening = 100;
  return b;
}
const unit = (b: Battle, id: string) => b.units.find((u) => u.id === id)!;
const act = (b: Battle, c: Command) =>
  battleReducer(b, { type: "move", turn: b.turn, revision: b.revision, ...c });
test("Gin full Reserve takes overflow; empty capacity absorbs; healing has genuine recovery", () => {
  const b = setup();
  unit(b, "enemy:gin").reserve = 60;
  const full = previewMove(b, { move: "attack", target: "enemy:gin" })!;
  unit(b, "enemy:gin").reserve = 0;
  const empty = previewMove(b, { move: "attack", target: "enemy:gin" })!;
  assert.equal(full.changes.find((x) => x.id === "enemy:gin")!.hp, -26);
  assert.equal(empty.changes.find((x) => x.id === "enemy:gin")!.hp, -22);
  const g = setup("gin", true);
  unit(g, "player:gin").reserve = 40;
  unit(g, "player:gin").hp = 100;
  const next = act(g, { move: "skill2", choice: "heal" });
  next.active = "player:gin";
  assert.equal(unit(next, "player:gin").hp, 165);
  assert.equal(unit(next, "player:gin").reserve, 15);
  unit(next, "player:gin").reserve = 60;
  assert.match(
    abilities(next, getActiveUnit(next)!).find((a) => a.move === "skill2")!
      .disabled!,
    /Cooling/,
  );
});
test("Static setup can pay for its next-turn detonation and interrupt a charge", () => {
  let b = setup("tomamaru");
  getActiveUnit(b)!.energy = 4;
  b = act(b, { move: "skill1", target: "enemy:drake", secondary: "enemy:gin" });
  b.active = "player:tomamaru";
  const u = getActiveUnit(b)!;
  u.turns++;
  u.energy++;
  const t = unit(b, "enemy:drake");
  t.charge = { kind: "lane", ready: 9 };
  t.cooldowns.skill2 = 3;
  assert.equal(u.energy, 2);
  const hp = t.hp;
  b = act(b, { move: "skill2", target: t.id });
  assert.equal(unit(b, t.id).hp, hp - Math.ceil(58 * 0.8));
  assert(!unit(b, t.id).charge);
  assert(!unit(b, t.id).static);
});
test("Blade counterstep empowers one next basic; Guard restores energy; separation costs energy", () => {
  let b = setup("blade");
  const base = basicDamage(getActiveUnit(b)!);
  b = act(b, { move: "skill2" });
  b.active = "player:blade";
  getActiveUnit(b)!.turns++;
  assert.equal(basicDamage(getActiveUnit(b)!), base + 10);
  b = act(b, { move: "attack", target: "enemy:drake" });
  assert.equal(unit(b, "player:blade").ampUntil, 0);
  b = setup();
  getActiveUnit(b)!.energy = 1;
  b = act(b, { move: "guard" });
  assert.equal(unit(b, "player:dan").energy, 2);
  b = setup("dan", true);
  getActiveUnit(b)!.form = "armored";
  getActiveUnit(b)!.energy = 2;
  assert.equal(act(b, { move: "separate" }), b);
  getActiveUnit(b)!.energy = 3;
  b = act(b, { move: "separate" });
  assert.equal(unit(b, "player:dan").energy, 0);
  assert.equal(unit(b, "player:dan:tourgen").energy, 0);
  assert.equal(
    unit(b, "player:dan").attack,
    unit(b, "player:dan:tourgen").attack,
  );
});
test("weaker shields cannot steal or extend stronger protection", () => {
  const b = setup("lane");
  const ally = unit(b, "player:hanibal");
  ally.barrier = 80;
  ally.barrierSource = "player:hanibal";
  ally.barrierUntil = 7;
  const next = act(b, { move: "skill1" });
  assert.equal(unit(next, ally.id).barrier, 80);
  assert.equal(unit(next, ally.id).barrierSource, ally.id);
  assert.equal(unit(next, ally.id).barrierUntil, 7);
});
test("Hakai pierces shields but respects phase; defensive reactions match resolution", () => {
  const b = setup("drake");
  getActiveUnit(b)!.focus = 2;
  const t = unit(b, "enemy:kami");
  t.barrier = 100;
  t.guard = true;
  b.queue = ["enemy:gin"];
  const preview = previewMove(b, { move: "skill2", target: t.id })!;
  assert.equal(preview.changes.find((x) => x.id === t.id)!.hp, -64);
  t.phaseUntil = 99;
  const phase = previewMove(b, { move: "skill2", target: t.id })!;
  assert(!phase.changes.some((x) => x.id === t.id));
  assert.deepEqual(phase.reactions, [{ id: t.id, kind: "phase" }]);
});
test("scar history is deterministic, bounded, survives serialization and rejects stale moves", () => {
  let b = setup();
  for (let i = 0; i < 18; i++) {
    b.active = "player:dan";
    unit(b, "enemy:drake").hp = 185;
    b = act(b, { move: "attack", target: "enemy:drake" });
  }
  assert.equal(b.scars?.length, 12);
  assert.equal(b.scars?.[0].revision, b.revision - 11);
  const copy: Battle = JSON.parse(JSON.stringify(b));
  assert.deepEqual(copy.scars, b.scars);
  assert.deepEqual(worldState(copy), worldState(b));
  assert.equal(
    battleReducer(b, {
      type: "move",
      turn: b.turn,
      revision: b.revision - 1,
      move: "guard",
    }),
    b,
  );
  assert(!setup().scars);
});
test("Five Eyes changes only scenery state; active powers fade when the source falls", () => {
  const b = setup("afrodi");
  const h = unit(b, "player:hanibal");
  h.skyOpen = true;
  h.eyes = 5;
  b.deadIds = ["a", "b"];
  getActiveUnit(b)!.bankaiUsed = true;
  const before = structuredClone(b);
  const w = worldState(b);
  assert.equal(w.eyes, 5);
  assert(w.saturation < 0.11);
  assert(w.hellAwakened);
  assert.deepEqual(b, before);
  h.hp = 0;
  assert.equal(worldState(b).saturation, 1);
});

test("residue is limited to four recent marks and disappears after two rounds",()=>{
 const b=setup();b.round=5;
 b.scars=Array.from({length:12},(_,i)=>({revision:i+1,round:i<4?3:4,effect:"flame",side:"player" as const,awakened:true}));
 const before=JSON.stringify(b);assert.equal(visibleScars(b).length,4);assert.equal(visibleScars(b)[0].revision,9);assert.equal(JSON.stringify(b),before);
 b.round=6;assert.equal(visibleScars(b).length,0);
 b.scars=[{revision:20,effect:"flame",side:"player",awakened:false}];assert.equal(visibleScars(b).length,0);
});
