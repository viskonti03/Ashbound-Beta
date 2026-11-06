import test from "node:test";
import assert from "node:assert/strict";
import { abilities, battleReducer, newBattle, getActiveUnit, previewMove, chooseAI } from "../src/game/engine";
import { attuneReason } from "../src/game/heart";
import type { Battle, Command } from "../src/game/types";
const teams = { player: [{ character: "dan" }, { character: "lane" }, { character: "afrodi" }], enemy: [{ character: "drake" }, { character: "kami" }, { character: "blade" }] } as const;
function fixture() { const b = newBattle(0, "local", structuredClone(teams) as unknown as Battle['teams'], "living-world", "arena-heart"); b.round = 2; b.active = "player:dan"; b.queue = ["enemy:drake", "player:dan"]; return b; }
const u = (b: Battle, id: string) => b.units.find(t => t.id === id)!;
const act = (b: Battle, c: Command) => battleReducer(b, { type: "move", turn: b.turn, revision: b.revision, ...c });
test("Heart is optional, opens round two, costs one energy and a turn, and earns no awakening", () => {
  const classic = newBattle(); assert.equal(classic.heart, undefined); assert(!abilities(classic, getActiveUnit(classic)!).some(a => a.move === 'attune'));
  let b = fixture(); b.round = 1; assert.match(attuneReason(b, getActiveUnit(b)!)!, /round 2/); assert.equal(act(b, { move: 'attune' }), b);
  b.round = 2; const energy = u(b, 'player:dan').energy, awakening = u(b, 'player:dan').awakening; b = act(b, { move: 'attune' });
  assert.equal(b.active, 'enemy:drake'); assert.equal(u(b, 'player:dan').energy, energy - 1); assert.equal(u(b, 'player:dan').awakening, awakening); assert.equal(b.heart!.scores.player, 0); assert(b.heart!.claims.player);
  b = act(b, { move: 'guard' }); assert.equal(b.active, 'player:dan'); assert.equal(b.heart!.scores.player, 1); assert.equal(b.heart!.claims.player, undefined);
  assert.match(attuneReason(b, u(b, 'player:dan'))!, /per team/);
});
test("Damage accumulates after armor and barriers; a broken claim is forecast without mutating battle", () => {
  let b = act(fixture(), { move: 'attune' }); const dan = u(b, 'player:dan'); dan.barrier = 100; dan.barrierSource = 'player:lane'; dan.barrierUntil = 99;
  b.queue = ['enemy:blade']; b = act(b, { move: 'attack', target: dan.id }); assert.equal(b.heart!.claims.player!.damage, 0);
  u(b, dan.id).barrier = 0; u(b, 'enemy:blade').attack = 12; b.queue = ['enemy:drake']; b = act(b, { move: 'attack', target: dan.id }); assert.equal(b.heart!.claims.player!.damage, 12);
  u(b, 'enemy:drake').attack = 12; const before = JSON.stringify(b); const preview = previewMove(b, { move: 'attack', target: dan.id })!;
  assert(preview.changes.find(c => c.id === dan.id)!.statuses.includes('Attunement broken')); assert.equal(JSON.stringify(b), before);
  b.queue = ['player:dan']; b = act(b, { move: 'attack', target: dan.id }); assert.equal(b.heart!.claims.player, undefined); assert.equal(b.heart!.scores.player, 0);
});
test("Burn resolves before a seal, including lethal burn and accumulated interruption", () => {
  for (const lethal of [false, true]) {    
let b = act(fixture(), { move: 'attune' }); const dan = u(b, 'player:dan'); dan.burn = 1; dan.burnDamage = 24; dan.burnSource = 'enemy:drake'; if (lethal) dan.hp = 20;
    b = act(b, { move: 'guard' }); assert.equal(b.heart!.scores.player, 0); assert.equal(b.heart!.claims.player, undefined);  
}
});
test("Imprisonment breaks a channel, even without sufficient HP damage", () => {
  let b = act(fixture(), { move: 'attune' }); b.active = 'enemy:blade'; const blade = u(b, 'enemy:blade'); blade.bankaiUsed = true; blade.energy = 5; b.queue = ['player:lane'];
  u(b, 'player:dan').barrier = 100; u(b, 'player:dan').barrierSource = 'player:afrodi'; u(b, 'player:dan').barrierUntil = 99;
  b = act(b, { move: 'skill1', target: 'player:dan' }); assert(u(b, 'player:dan').prison); assert.equal(b.heart!.claims.player, undefined);
});
test("Unreachable forms, charging units and summoned Tourgen cannot attune", () => {
  for (const key of ['phaseUntil', 'invisibleUntil', 'mantleUntil'] as const) { const b = fixture(); getActiveUnit(b)![key] = 99; assert.equal(act(b, { move: 'attune' }), b); }
  const b = fixture(); const dan = getActiveUnit(b)!; dan.character = 'tourgen'; assert.match(attuneReason(b, dan)!, /Summons/); dan.character = 'dan'; dan.charge = { kind: 'lane', ready: 99 }; assert.equal(act(b, { move: 'attune' }), b);
});
test("Both teams can channel, and each earns only after its own full response window", () => {
  let b = act(fixture(), { move: 'attune' }); b.queue = ['player:lane']; b = act(b, { move: 'attune' }); assert(b.heart!.claims.player && b.heart!.claims.enemy); assert.deepEqual(b.heart!.scores, { player: 0, enemy: 0 });
  b.queue = ['player:dan']; b = act(b, { move: 'guard' }); assert.deepEqual(b.heart!.scores, { player: 1, enemy: 0 });
  b.queue = ['enemy:drake']; b = act(b, { move: 'guard' }); assert.deepEqual(b.heart!.scores, { player: 1, enemy: 1 });
});
test("Third seal wins with living opponents; terminal and stale actions cannot mutate it", () => {
  let b = fixture(); b.heart!.scores.player = 2; b = act(b, { move: 'attune' }); b = act(b, { move: 'guard' }); assert.equal(b.result, 'player'); assert.equal(b.victoryReason, 'arena-heart'); assert.equal(b.active, null); assert.deepEqual(b.queue, []); assert(b.units.filter(t => t.side === 'enemy').every(t => t.hp > 0)); assert.equal(act(b, { move: 'attack', target: 'enemy:drake' }), b);
  const fresh = fixture(); assert.equal(battleReducer(fresh, { type: 'move', move: 'attune', turn: fresh.turn, revision: -1 }), fresh);
});
test("Elimination still wins before the next seal; fresh matches reset every objective field", () => {
  let b = fixture(); b.heart!.scores.player = 2; b = act(b, { move: 'attune' }); b.active = 'player:lane'; b.queue = ['enemy:drake']; for (const enemy of b.units.filter(t => t.side === 'enemy')) enemy.hp = 0; u(b, 'enemy:drake').hp = 1;
  b = act(b, { move: 'attack', target: 'enemy:drake' }); assert.equal(b.result, 'player'); assert.equal(b.victoryReason, 'elimination'); assert.equal(b.heart!.scores.player, 2);
  const fresh = fixture(); assert.deepEqual(fresh.heart, { scores: { player: 0, enemy: 0 }, claims: {}, usedRound: { player: 0, enemy: 0 } });
});
test("Serialized channels preserve damage, timing and team attempt limits", () => {
  const b = act(fixture(), { move: 'attune' }); b.heart!.claims.player!.damage = 10; const clone = JSON.parse(JSON.stringify(b)) as Battle;
  assert.deepEqual(act(clone, { move: 'guard' }), act(b, { move: 'guard' }));
});
test("AI prioritizes a real channel interruption and can secure an objective victory", () => {
  let b = act(fixture(), { move: 'attune' }); const choice = chooseAI(b); assert(previewMove(b, choice)!.messages.some(m => m.includes('attunement breaks')));
  b = fixture(); b.heart!.scores.player = 2; assert.equal(chooseAI(b).move, 'attune'); b = act(b, chooseAI(b)); b = act(b, { move: 'guard' }); assert.equal(b.victoryReason, 'arena-heart');
});
