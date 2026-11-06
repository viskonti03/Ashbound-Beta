import test from "node:test";
import assert from "node:assert/strict";
import {
  newBattle,
  battleReducer,
  getActiveUnit,
  chooseAI,
  legalTargets,
  abilities,
  basicDamage,
  previewMove,
  isAutomaticTurn,
} from "../src/game/engine";
import { coreMoves } from "../src/game/kits";
import { arenaMultiplier, ARENAS } from "../src/game/arenas";
import { ROSTER, validPicks, randomPicks, portrait } from "../src/game/roster";
import type {
  Battle,
  CharacterId,
  Command,
  Pick,
  ArenaId,
} from "../src/game/types";
const picks = (ids: CharacterId[]): Pick[] =>
  ids.map((character) => ({
    character,
    ...(character === "kidou"
      ? { styles: ["dan", "lane"] as ("dan" | "lane")[] }
      : {}),
  }));
function setup(id: CharacterId, bank = false, arena: ArenaId = "living-world") {
  const b = newBattle(
    0,
    "local",
    {
      player: picks([
        id,
        ...ROSTER.map((x) => x.id)
          .filter((x) => x !== id)
          .slice(0, 2),
      ]),
      enemy: picks(["drake", "kami", "lane"]),
    },
    arena,
  );
  b.active = `player:${id}`;
  b.queue = ["enemy:lane", "enemy:drake", "enemy:kami"];
  const u = getActiveUnit(b)!;
  u.energy = 5;
  u.awakening = 100;
  u.bankaiUsed = bank;
  return b;
}
const act = (b: Battle, c: Command) =>
  battleReducer(b, { type: "move", turn: b.turn, revision: b.revision, ...c });
const unit = (b: Battle, id: string) => b.units.find((x) => x.id === id)!;
test("all characters have three evolving core moves; hybrids maintain 1 Arrancar / 2 Shinigami", () => {
  for (const c of ROSTER) {
    const b = setup(c.id),
      u = getActiveUnit(b)!,
      normal = coreMoves(u),
      up = coreMoves({
        ...u,
        bankaiUsed: true,
        eyes: c.id === "hanibal" ? 5 : 0,
      });
    assert.deepEqual(
      normal.map((x) => x.move),
      ["attack", "skill1", "skill2"],
    );
    assert.equal(up.length, 3);
    if (c.id !== "hanibal") {
      assert(up[0].damage > normal[0].damage, c.id);
      for (let i = 0; i < 3; i++)
        assert.notEqual(up[i].name, normal[i].name, c.id);
    }
    if (["afrodi", "kami", "kidou"].includes(c.id))
      for (const kit of [normal, up]) {
        assert.equal(kit.filter((x) => x.origin === "arrancar").length, 1);
        assert.equal(kit.filter((x) => x.origin === "shinigami").length, 2);
      }
  }
});
test("stale and illegal moves cannot mutate state or cues", () => {
  const b = setup("dan");
  assert.equal(act(b, { move: "attack", target: "player:dan" }), b);
  assert.equal(
    battleReducer(b, {
      type: "move",
      turn: b.turn - 1,
      revision: 0,
      move: "guard",
    }),
    b,
  );
});
test("arena bonuses are heritage- and ability-specific; neutral is unchanged", () => {
  const d = getActiveUnit(setup("dan"))!,
    k = getActiveUnit(setup("kami"))!,
    l = getActiveUnit(setup("lane"))!;
  assert.equal(arenaMultiplier("soul-society", d, "shinigami"), 1.06);
  assert.equal(arenaMultiplier("soul-society", l, "shinigami"), 1.12);
  assert.equal(arenaMultiplier("las-noches", k, "arrancar"), 1.12);
  assert.equal(arenaMultiplier("las-noches", k, "shinigami"), 1);
  assert.equal(arenaMultiplier("living-world", l, "shinigami"), 1);
  const b = setup("kami", false, "las-noches");
  const next = act(b, { move: "skill2" });
  assert.equal(unit(next, "enemy:lane").hp, 230 - 40);
  assert.equal(next.arena, "las-noches");
});
test("Bankai persists, preserves cooldowns and improves all three moves", () => {
  let b = setup("dan");
  getActiveUnit(b)!.cooldowns.skill1 = 3;
  b = act(b, { move: "bankai" });
  const dan = unit(b, "player:dan");
  assert(dan.bankaiUsed);
  assert.equal(dan.form, "armored");
  assert.equal(dan.cooldowns.skill1, 3);
  assert.equal(coreMoves(dan)[1].damage, 68);
  b.active = dan.id;
  assert.equal(act(b, { move: "bankai" }), b);
});
test("Afrodi Bankai death gate and Hell execution", () => {
  let b = setup("afrodi");
  assert.equal(act(b, { move: "bankai" }), b);
  b.deadIds = ["enemy:x", "player:y"];
  b = act(b, { move: "bankai" });
  b.active = "player:afrodi";
  unit(b, "enemy:drake").hp = 40;
  b = act(b, { move: "skill1", target: "enemy:drake" });
  assert.equal(unit(b, "enemy:drake").hp, 0);
  assert(unit(b, "player:afrodi").phaseUntil > 0);
});
test("invisibility blocks targeting but not area; phase negates area", () => {
  const b = setup("drake");
  unit(b, "enemy:kami").invisibleUntil = 99;
  unit(b, "enemy:lane").phaseUntil = 99;
  assert(
    !legalTargets(b, getActiveUnit(b)!, "attack").some(
      (x) => x.id === "enemy:kami",
    ),
  );
  const next = act(b, { move: "skill1" });
  assert.equal(unit(next, "enemy:kami").hp, 175 - 34);
  assert.equal(unit(next, "enemy:lane").hp, 230);
});
test("mantle blocks contact and erasure with retaliation only on contact", () => {
  let b = setup("dan");
  unit(b, "enemy:drake").mantleUntil = 99;
  b = act(b, { move: "attack", target: "enemy:drake" });
  assert.equal(unit(b, "player:dan").hp, 170);
  assert.equal(unit(b, "enemy:drake").hp, 185);
  b = setup("kami", true);
  unit(b, "enemy:drake").hp = 10;
  unit(b, "enemy:drake").mantleUntil = 99;
  b = act(b, { move: "attack", target: "enemy:drake" });
  assert.equal(unit(b, "enemy:drake").hp, 10);
});
test("Kami Bankai erasure and stronger Arrancar explosion", () => {
  let b = setup("kami", true);
  unit(b, "enemy:drake").hp = 30;
  b = act(b, { move: "attack", target: "enemy:drake" });
  assert.equal(unit(b, "enemy:drake").hp, 0);
  assert.equal(coreMoves(unit(b, "player:kami"))[2].damage, 60);
});
test("Blade Bankai capture drains energy, strengthens blade and healthy prisoners escape", () => {
  let b = setup("blade", true);
  b.queue = ["enemy:lane", "enemy:drake"];
  b = act(b, { move: "skill1", target: "enemy:lane" });
  assert.equal(unit(b, "enemy:lane").prison, undefined);
  assert.equal(unit(b, "player:blade").bladeBonus, 6);
  assert(unit(b, "enemy:lane").hp >= 110);
});
test("Bankai evasion blocks two single-target hits", () => {
  let b = setup("blade", true);
  b = act(b, { move: "skill2" });
  const id = "player:blade",
    hp = unit(b, id).hp;
  for (let i = 0; i < 3; i++) {
    b.active = "enemy:drake";
    b.queue = ["enemy:kami"];
    b = act(b, { move: "attack", target: id });
    if (i < 2) assert.equal(unit(b, id).hp, hp);
  }
  assert(unit(b, id).hp < hp);
});
test("Gin Bankai boosts allocation and absorption", () => {
  let b = setup("gin", true);
  const g = getActiveUnit(b)!;
  g.hp = 100;
  g.reserve = 40;
  b = act(b, { move: "skill2", choice: "heal" });
  assert.equal(unit(b, "player:gin").hp, 165);
  assert.equal(unit(b, "player:gin").reserve, 15);
  assert.equal(coreMoves(unit(b, "player:gin"))[1].damage, 70);
});
test("Hannibal progresses five eyes and never gains Bankai", () => {
  let b = setup("hanibal");
  assert(!abilities(b, getActiveUnit(b)!).some((x) => x.move === "bankai"));
  b = act(b, { move: "skill1" });
  for (let eye = 1; eye <= 5; eye++) {
    let safety = 0;
    while (b.active !== "player:hanibal" && safety++ < 20)
      b = act(b, { move: "guard" });
    assert.equal(getActiveUnit(b)!.eyes, eye);
    if (eye < 5) b = act(b, { move: "guard" });
  }
  assert.equal(coreMoves(getActiveUnit(b)!)[1].kind, "crush");
  const next = act(b, { move: "skill1" });
  assert.notEqual(next, b);
  assert(!unit(next, "player:hanibal").bankaiUsed);
});
test("Lane charges and releases from the same third slot, free release after charge", () => {
  let b = setup("lane", true);
  b = act(b, { move: "skill2" });
  assert(unit(b, "player:lane").charge);
  b.active = "player:lane";
  const u = getActiveUnit(b)!;
  u.turns++;
  u.energy = 0;
  assert.equal(abilities(b, u).find((x) => x.move === "skill2")!.cost, 0);
  b = act(b, { move: "skill2" });
  assert.equal(unit(b, "player:lane").charge, undefined);
  assert.equal(unit(b, "enemy:drake").hp, 65);
});
test("Thunder interruption cancels charged attack and keeps cooldown", () => {
  let b = setup("tomamaru", true);
  const t = unit(b, "enemy:lane");
  t.charge = { kind: "lane", ready: 1 };
  t.cooldowns.skill2 = 3;
  b = act(b, { move: "skill2", target: t.id });
  assert(!unit(b, t.id).charge);
  assert(unit(b, t.id).cooldowns.skill2 > 0);
});
test("Kidou freely switches one copied style, shared cooldown survives; no Tourgen", () => {
  let b = setup("kidou", true);
  b = act(b, { move: "skill2", target: "enemy:drake" });
  b.active = "player:kidou";
  const turn = b.turn;
  b = act(b, { move: "switch", choice: "lane:skill2" });
  assert.equal(b.turn, turn);
  assert.equal(getActiveUnit(b)!.form, "base");
  assert.equal(act(b, { move: "skill2" }), b);
  assert(!abilities(b, getActiveUnit(b)!).some((x) => x.move === "separate"));
});
test("Tourgen equals separated Dan, has own controlled kit and unique portrait", () => {
  let b = setup("dan", true);
  const d = getActiveUnit(b)!;
  d.form = "armored";
  d.hp = 130;
  b = act(b, { move: "separate" });
  const dan = unit(b, "player:dan"),
    pet = unit(b, "player:dan:tourgen");
  for (const k of ["hp", "maxHp", "attack", "speed", "energy"] as const)
    assert.equal(pet[k], dan[k]);
  assert.equal(basicDamage(pet), basicDamage(dan));
  assert.deepEqual(
    coreMoves(pet).map((x) => x.damage),
    coreMoves(dan).map((x) => x.damage),
  );
  assert(!b.queue.includes(pet.id));
  b.active = pet.id;
  assert(!isAutomaticTurn(b));
  assert.equal(
    abilities(b, pet).filter((x) =>
      ["attack", "skill1", "skill2"].includes(x.move),
    ).length,
    3,
  );
  assert(!abilities(b, pet).some((x) => x.move === "separate"));
  assert.equal(portrait("tourgen"), "/portraits/tourgen.png");
  const after = act(b, { move: "skill1", target: "enemy:drake" });
  assert.notEqual(after, b);
});
test("mirror summons are separate; losing one Dan removes only his spirit", () => {
  let b = newBattle(0, "local", {
    player: picks(["dan", "lane", "gin"]),
    enemy: picks(["dan", "lane", "gin"]),
  });
  for (const side of ["player", "enemy"]) {
    b.active = `${side}:dan`;
    getActiveUnit(b)!.bankaiUsed = true;
    getActiveUnit(b)!.form = "armored";
    b = act(b, { move: "separate" });
  }
  assert.equal(b.units.filter((x) => x.character === "tourgen").length, 2);
  unit(b, "player:dan").hp = 0;
  b.active = "enemy:lane";
  b = act(b, { move: "guard" });
  assert.equal(unit(b, "player:dan:tourgen").hp, 0);
  assert(unit(b, "enemy:dan:tourgen").hp > 0);
  assert(!b.deadIds.includes("player:dan:tourgen"));
});
test("all characters finish matches across all arenas without invalid states", () => {
  for (const arena of ARENAS)
    for (let i = 0; i < ROSTER.length; i++) {
      const ids = ROSTER.map((x) => x.id);
      let b = newBattle(
        0,
        "local",
        {
          player: picks([ids[i], ids[(i + 1) % 10], ids[(i + 2) % 10]]),
          enemy: picks([
            ids[(i + 5) % 10],
            ids[(i + 6) % 10],
            ids[(i + 7) % 10],
          ]),
        },
        arena.id,
      );
      for (let step = 0; step < 1200 && !b.result; step++) {
        const next = act(b, chooseAI(b));
        assert.notEqual(next, b, `stalled ${b.active}`);
        b = next;
        for (const x of b.units) {
          assert(x.hp >= 0 && x.hp <= x.maxHp);
          assert(x.energy >= 0 && x.energy <= 5);
        }
      }
      assert(b.result, `match ${i} ${arena.id} did not end`);
    }
});
test("random teams are valid and preview metadata tracks accepted moves", () => {
  for (let i = 0; i < 100; i++) assert(validPicks(randomPicks()));
  const b = setup("dan");
  const next = act(b, { move: "skill1", target: "enemy:drake" });
  assert.equal(next.lastAction?.name, "Cinder Requiem");
  assert.equal(next.lastAction?.revision, next.revision);
});

test("forecast is pure and agrees with damage, status and retaliation resolution", () => {
  for (const mantle of [false, true]) {
    const b = setup("dan");
    if (mantle) unit(b, "enemy:drake").mantleUntil = 99;
    const original = structuredClone(b);
    const command: Command = { move: "attack", target: "enemy:drake" };
    const preview = previewMove(b, command)!;
    assert.deepEqual(b, original);
    const next = act(b, command);
    for (const delta of preview.changes)
      assert.equal(unit(next, delta.id).hp - unit(b, delta.id).hp, delta.hp);
    if (mantle) assert.equal(next.metrics?.["enemy:drake"].damage, 30);
    else
      assert.equal(
        next.metrics?.["player:dan"].damage,
        unit(b, "enemy:drake").hp - unit(next, "enemy:drake").hp,
      );
  }
  assert.equal(
    previewMove(setup("dan"), { move: "attack", target: "player:dan" }),
    null,
  );
});
test("statistics credit actual damage, overkill, healing and absorbed barriers", () => {
  let b = setup("dan");
  unit(b, "enemy:drake").hp = 5;
  b = act(b, { move: "attack", target: "enemy:drake" });
  assert.equal(b.metrics?.["player:dan"].damage, 5);
  assert.equal(b.metrics?.["player:dan"].defeats, 1);
  b = setup("gin");
  unit(b, "player:gin").hp -= 10;
  unit(b, "player:gin").reserve = 30;
  b = act(b, { move: "skill2", choice: "heal" });
  assert.equal(b.metrics?.["player:gin"].healing, 10);
  b = setup("dan");
  const target = unit(b, "enemy:drake");
  target.barrier = 100;
  target.barrierSource = "enemy:lane";
  target.barrierUntil = 99;
  b = act(b, { move: "attack", target: target.id });
  assert.equal(b.metrics?.["player:dan"].damage, 0);
  assert((b.metrics?.["enemy:lane"].protection ?? 0) > 0);
});

test("presentation tracks area targets and pure forecasts explain blocked attacks", () => {
  const b = setup("dan");
  unit(b, "enemy:lane").phaseUntil = 99;
  const forecast = previewMove(b, { move: "skill2" })!;
  assert(forecast.messages.some((s) => s.includes("negates")));
  assert(!forecast.changes.some((x) => x.id === "enemy:lane"));
  const next = act(b, { move: "skill2" });
  assert.deepEqual(next.lastAction?.targets, [
    "enemy:drake",
    "enemy:kami",
    "enemy:lane",
  ]);
  assert.equal(next.lastAction?.effect, "flame");
  assert(!b.lastAction);
});

test("action cues exclude the next turn burn and charge-wait forecasts match the reducer", () => {
  let b = setup("dan");
  const victim = unit(b, "enemy:lane");
  victim.burn = 1;
  victim.burnDamage = 8;
  victim.burnSource = "player:dan";
  const next = act(b, { move: "attack", target: "enemy:drake" });
  assert.equal(unit(next, victim.id).hp, victim.hp - 8);
  assert(!next.lastAction?.outcomes.some((x) => x.id === victim.id));
  b = setup("lane", true);
  b = act(b, { move: "skill2" });
  b.active = "player:lane";
  const forecast = previewMove(b, { move: "guard" })!;
  assert(forecast.messages.some((x) => x.includes("waits while maintaining")));
  assert(
    !forecast.changes.some(
      (x) => x.id === "player:lane" && x.statuses.includes("Guard"),
    ),
  );
});
