import test from "node:test";
import assert from "node:assert/strict";
import {
  newBattle,
  abilities,
  battleReducer,
  getActiveUnit,
  speed,
  chooseAI,
} from "../src/game/engine";
import { coreMoves, copyOptions } from "../src/game/kits";
import { ROSTER, validPicks } from "../src/game/roster";
import type { Battle, Command, CharacterId } from "../src/game/types";
const act = (b: Battle, c: Command) =>
  battleReducer(b, { type: "move", turn: b.turn, revision: b.revision, ...c });
function setup(source: CharacterId = "gin", bank = false) {
  const b = newBattle(
    0,
    "local",
    {
      player: [
        { character: "kidou" },
        { character: "dan" },
        { character: "afrodi" },
      ],
      enemy: [
        source,
        ...ROSTER.map((c) => c.id)
          .filter((id) => id !== source && id !== "kidou")
          .slice(0, 2),
      ].map((character) => ({ character })),
    },
    "soul-society",
  );
  b.active = "player:kidou";
  b.queue = ["player:dan"];
  const u = getActiveUnit(b)!;
  u.energy = 5;
  u.bankaiUsed = bank;
  return b;
}
function select(b: Battle, id: string) {
  return act(b, { move: "switch", choice: id });
}
function ownTurn(b: Battle) {
  b.active = "player:kidou";
  const u = getActiveUnit(b)!;
  u.energy = 5;
  u.cooldowns = {};
  return u;
}
test("Kidou library includes both starting teams, deduplicates sources, excludes Arrancar and unavailable characters", () => {
  const b = setup("kami"),
    u = getActiveUnit(b)!;
  const options = copyOptions(u).map((x) => x.id);
  assert(
    validPicks([
      { character: "kidou" },
      { character: "dan" },
      { character: "gin" },
    ]),
  );
  assert(options.includes("dan:skill2"));
  assert(options.includes("kami:attack"));
  assert(options.includes("kami:skill1"));
  assert(!options.includes("kami:skill2"));
  assert(!options.includes("afrodi:skill2"));
  assert(!options.includes("lane:skill1"));
  assert.equal(new Set(options).size, options.length);
  for (const choice of [
    "kami:skill2",
    "kidou:skill2",
    "lane:skill1",
    "dan:bankai",
    "dan:separate",
  ])
    assert.equal(select(b, choice), b);
  b.units.find((x) => x.character === "kami")!.hp = 0;
  assert.notEqual(select(b, "kami:attack"), b);
});
test("every eligible copied core move resolves in both forms with Kidou heritage and resources", () => {
  for (const source of ROSTER.filter((c) => c.id !== "kidou"))
    for (const bank of [false, true]) {
      const baseline = setup(source.id, bank);
      for (const option of copyOptions(getActiveUnit(baseline)!).filter(
        (x) => x.source === source.id,
      )) {
        let b = select(structuredClone(baseline), option.id);
        let u = getActiveUnit(b)!;
        u.focus = 2;
        u.reserve = 40;
        u.hp = 90;
        if (source.id === "hanibal" && option.move === "skill2") {
          u.skyOpen = true;
          u.eyes = 2;
        }
        b.deadIds = ["prior:one", "prior:two"];
        const m = coreMoves(u, b.arena)[2];
        assert.equal(m.origin, "shinigami");
        assert.equal(m.source, source.id);
        assert(
          !abilities(b, u).find((a) => a.move === "skill2")!.disabled,
          option.id,
        );
        const target = b.units.find((x) => x.side === "enemy")!;
        const before = b;
        b = act(b, {
          move: "skill2",
          target: m.targeting === "enemy" ? target.id : undefined,
          choice: m.choices ? "heal" : undefined,
        });
        assert.notEqual(b, before, `${option.id}, bank=${bank}`);
        u = b.units.find((x) => x.id === "player:kidou")!;
        assert(u.energy >= 0 && u.focus >= 0 && u.reserve >= 0);
        if (m.kind === "charge") {
          b.active = u.id;
          u.turns++;
          u.energy = 0;
          assert.equal(select(b, "dan:attack"), b);
          assert.equal(
            abilities(b, u).find((a) => a.move === "skill2")!.cost,
            0,
          );
          b = act(b, { move: "skill2" });
          assert(!b.units.find((x) => x.id === u.id)!.charge);
        }
      }
    }
});
test("copied Focus and Reserve come from Kidou, and copying is not a cooldown reset", () => {
  let b = select(setup("drake"), "drake:skill2");
  assert.match(
    abilities(b, getActiveUnit(b)!).find((a) => a.move === "skill2")!.disabled!,
    /Focus/,
  );
  b = select(b, "drake:attack");
  b = act(b, { move: "skill2", target: "enemy:drake" });
  assert.equal(b.units.find((x) => x.id === "player:kidou")!.focus, 1);
  assert.equal(b.units.find((x) => x.id === "enemy:drake")!.focus, 0);
  ownTurn(b);
  b = act(b, { move: "skill2", target: "enemy:drake" });
  ownTurn(b);
  b = select(b, "drake:skill2");
  b = act(b, { move: "skill2", target: "enemy:drake" });
  b.active = "player:kidou";
  const before = getActiveUnit(b)!.cooldowns.skill2;
  b = select(b, "afrodi:skill1");
  assert.equal(getActiveUnit(b)!.cooldowns.skill2, before);
  assert.equal(act(b, { move: "skill2" }), b);
  b = select(setup("gin"), "gin:skill2");
  assert.match(
    abilities(b, getActiveUnit(b)!).find((a) => a.move === "skill2")!.disabled!,
    /Reserve/,
  );
  b = select(b, "gin:skill1");
  b = act(b, { move: "skill2", target: "enemy:gin" });
  assert.equal(b.units.find((x) => x.id === "player:kidou")!.reserve, 8);
});
test("Bankai copies upgraded enemy moves without taking enemy Bankai state or passive stats", () => {
  let b = select(setup("kami", true), "kami:attack");
  let u = getActiveUnit(b)!;
  assert.equal(coreMoves(u, b.arena)[2].damage, 64);
  assert.equal(b.units.find((x) => x.id === "enemy:kami")!.bankaiUsed, false);
  const t = b.units.find((x) => x.id === "enemy:kami")!;
  t.hp = 20;
  b = act(b, { move: "skill2", target: t.id });
  assert.equal(b.units.find((x) => x.id === t.id)!.hp, 0);
  b = setup("dan");
  u = getActiveUnit(b)!;
  u.awakening = 100;
  b = act(b, { move: "bankai" });
  u = b.units.find((x) => x.id === u.id)!;
  assert.equal(u.form, "base");
  assert.equal(u.maxHp, 180);
});
test("Hannibal copies preserve five-eye requirement and never invent a Bankai", () => {
  let b = select(setup("hanibal", true), "hanibal:skill2");
  let u = getActiveUnit(b)!;
  assert.match(
    abilities(b, u).find((a) => a.move === "skill2")!.disabled!,
    /Five Eyes/,
  );
  b = select(b, "hanibal:skill1");
  assert.equal(coreMoves(getActiveUnit(b)!)[2].kind, "eyes");
  b = act(b, { move: "skill2" });
  u = ownTurn(b);
  u.eyes = 5;
  assert.equal(coreMoves(u)[2].kind, "crush");
  assert.equal(coreMoves(u)[2].damage, 85);
});
test("copied Hell keeps the death gate; Drake mantle and Gin speed use copied effects", () => {
  let b = select(setup("afrodi", true), "afrodi:skill1");
  assert.match(
    abilities(b, getActiveUnit(b)!).find((a) => a.move === "skill2")!.disabled!,
    /two main-character deaths/,
  );
  b = select(setup("drake", true), "drake:skill1");
  b = act(b, { move: "skill2" });
  assert(b.units.find((x) => x.id === "player:kidou")!.mantleUntil > 0);
  b = select(setup("gin"), "gin:skill2");
  let u = getActiveUnit(b)!;
  u.reserve = 30;
  b = act(b, { move: "skill2", choice: "speed" });
  u = b.units.find((x) => x.id === u.id)!;
  assert.equal(speed(b, u), u.speed + 8);
});
test("practice AI can choose an enemy copy without endless switching", () => {
  const b = setup("lane", true);
  const command = chooseAI(b);
  assert.equal(command.move, "switch");
  const next = act(b, command);
  assert.notEqual(chooseAI(next).move, "switch");
});
