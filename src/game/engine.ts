import { canAnimateSignature } from "./combatAnimation";
import { attuneReason, HEART_GOAL, HEART_BREAK } from "./heart";
import { signatureMove } from "./signatures";
import { coreMoves as originalCoreMoves, empowered, copyOptions, GIN_HEAL, GIN_COST } from "./kits";
export { basicDamage } from "./kits";
import { arenaAmount } from "./arenas";
import type { ArenaId } from "./types";
import { THEMES, moveName } from "./presentation";
import type {
  Ability,
  Battle,
  BattleEvent,
  Command,
  GameMode,
  RuleSet,
  Pick,
  Side,
  Style,
  Teams,
  Unit,
} from "./types";
import { character, defaultPicks, enemyPicks, validPicks } from "./roster";
const coreMoves = (u:Unit,arena?:ArenaId) => [...originalCoreMoves(u,arena),signatureMove(u,arena)];
const other = (side: Side): Side => (side === "player" ? "enemy" : "player");
const alive = (b: Battle, side?: Side) =>
  b.units.filter((u) => u.hp > 0 && (!side || u.side === side));
export const present = (u: Unit) => u.hp > 0 && !u.prison;
export const getActiveUnit = (b: Battle) =>
  b.units.find((u) => u.id === b.active);
export const isAutomaticTurn = (b: Battle) =>
  !b.result &&
  !!getActiveUnit(b) &&
  b.mode === "practice" &&
  getActiveUnit(b)!.side === "enemy";
function metric(b: Battle, id: string) {
  b.metrics ??= {};
  return (b.metrics[id] ??= {
    damage: 0,
    healing: 0,
    protection: 0,
    defeats: 0,
  });
}
function recordDamage(
  b: Battle,
  source: string | undefined,
  t: Unit,
  before: number,
) {
  const claim = b.heart?.claims[t.side];
  if (claim?.unit === t.id) {
    claim.damage += Math.max(0, before - t.hp);
    if (claim.damage >= HEART_BREAK || t.hp <= 0) {
      delete b.heart!.claims[t.side];
      b.heart!.message = `${t.name}’s attunement was interrupted.`;
      note(b, `${t.name}’s attunement breaks. No seal earned.`);
    }
  }
  if (!source) return;
  const m = metric(b, source);
  m.damage += Math.max(0, before - t.hp);
  if (before > 0 && t.hp <= 0) m.defeats++;
}
function note(b: Battle, text: string) {
  b.log.unshift(text);
  b.log = b.log.slice(0, 120);
}
function unit(p: Pick, side: Side): Unit {
  const c = character(p.character);
  return {
    id: `${side}:${c.id}`,
    character: c.id,
    name: c.name,
    side,
    hp: c.hp,
    maxHp: c.hp,
    attack: c.basic,
    speed: c.speed,
    energy: 3,
    awakening: 0,
    turns: 0,
    guard: false,
    burn: 0,
    burnDamage: 8,
    evadeCharges: 0,
    cooldowns: {},
    bankaiUsed: false,
    form: "base",
    phaseUntil: 0,
    invisibleUntil: 0,
    mantleUntil: 0,
    dodgeUntil: 0,
    barrier: 0,
    barrierUntil: 0,
    focus: 0,
    reserve: 0,
    absorption: 4,
    strengthUntil: 0,
    speedUntilRound: 0,
    speedBoost: 0,
    ampUntil: 0,
    bladeBonus: 0,
    eyes: 0,
    skyOpen: false,
    thunderUntil: 0,
    styles: [],
    style: "dan",
    copiedMove: "skill1",
  };
}
export function speed(b: Battle, u: Unit) {
  return (
    u.speed +
    u.eyes * 2 +
    (u.speedUntilRound >= b.round && u.speedUntilRound > 0 ? u.speedBoost : 0)
  );
}
const immune = (u: Unit) => u.phaseUntil > 0 || u.mantleUntil > 0;
function reconcile(b: Battle) {
  for (const u of b.units) {
    if (
      u.owner &&
      !b.units.some((x) => x.id === u.owner && x.hp > 0) &&
      u.hp > 0
    ) {
      u.hp = 0;
      note(b, `${u.name} disappears as their owner falls.`);
    }
    if (u.hp <= 0 && u.character !== "tourgen" && !b.deadIds.includes(u.id)) {
      b.deadIds.push(u.id);
      note(b, `${u.name} is defeated.`);
    }
  }
  for (const u of b.units) {
    if (
      u.charge?.kind === "kami" &&
      !b.units.some((x) => x.id === u.charge!.target && x.hp > 0)
    ) {
      delete u.charge;
      note(b, `${u.name} loses the aim as the marked target falls.`);
    }
    if (
      u.prison &&
      !b.units.some((x) => x.id === u.prison!.source && x.hp > 0)
    ) {
      delete u.prison;
      note(b, `${u.name} returns as their captor falls.`);
    }
  }
  if (b.heart) for (const side of ["player", "enemy"] as const) {
    const claim = b.heart.claims[side];
    const bearer = b.units.find(u => u.id === claim?.unit);
    if (claim && (!bearer || !present(bearer))) {
      delete b.heart.claims[side];
      b.heart.message = "Attunement interrupted — bearer left the battlefield.";
      note(b, "Attunement breaks as its bearer leaves the battlefield.");
    }
  }
  const p = alive(b, "player").length,
    e = alive(b, "enemy").length;
  if (!p || !e) {
    b.victoryReason = "elimination";
    b.result = p ? "player" : e ? "enemy" : "draw";
    b.active = null;
    b.queue = [];
    note(
      b,
      b.result === "draw"
        ? "DRAW"
        : `${b.result === "player" ? "Player 1" : "Player 2"} wins!`,
    );
    return true;
  }
  return false;
}
function startRound(b: Battle) {
  b.round++;
  // Stable, symmetric tie breaking alternates the first side each round.
  b.queue = alive(b)
    .sort(
      (a, c) =>
        speed(b, c) - speed(b, a) ||
        (a.side === c.side
          ? a.id.localeCompare(c.id)
          : (b.round % 2 === 1) === (a.side === "player")
            ? -1
            : 1),
    )
    .map((u) => u.id);
  note(b, `ROUND ${b.round}`);
}
function nextTurn(b: Battle) {
  b.active = null;
  while (!b.result) {
    if (reconcile(b)) return;
    if (!b.queue.length) startRound(b);
    const nextId = b.queue.shift();
    const u = b.units.find((x) => x.id === nextId);
    if (!u || u.hp <= 0) continue;
    if (u.prison) {
      const p = u.prison,
        caster = b.units.find((x) => x.id === p.source)!;
      if (p.kind === "blade") {
        if (u.energy > 0) {
          const drain = Math.min(u.energy, empowered(caster) ? 2 : 1);
          u.energy -= drain;
          caster.bladeBonus = Math.min(24, caster.bladeBonus + 3 * drain);
          note(b, `${caster.name} drains ${u.name}; blade power increases.`);
        }
      }
      p.remaining--;
      note(
        b,
        `${u.name} loses this turn in ${p.kind === "hell" ? "Hell" : "Captive World"}.`,
      );
      if (p.remaining <= 0 || (p.kind === "blade" && u.hp >= u.maxHp * 0.5)) {
        delete u.prison;
        note(b, `${u.name} escapes and returns.`);
      }
      continue;
    }
    u.turns++;
    u.guard = false;
    u.dodgeUntil = 0;
    u.evadeCharges = 0;
    for (const key of Object.keys(u.cooldowns))
      u.cooldowns[key] = Math.max(0, u.cooldowns[key] - 1);
    for (const x of b.units)
      if (x.barrierSource === u.id && u.turns >= x.barrierUntil) {
        x.barrier = 0;
        delete x.barrierSource;
      }
    if (u.burn > 0) {
      u.burn--;
      const beforeBurn = u.hp;
      u.hp = Math.max(0, u.hp - u.burnDamage);
      recordDamage(b, u.burnSource, u, beforeBurn);
      note(b, `${u.name} takes ${u.burnDamage} burn damage.`);
      if (reconcile(b)) return;
      if (u.hp <= 0) continue;
    }
    const claim = b.heart?.claims[u.side];
    if (claim?.unit === u.id && u.turns >= claim.readyTurn) {
      delete b.heart!.claims[u.side];
      const score = ++b.heart!.scores[u.side];
      b.heart!.message = `${u.name} secured seal ${score}/${HEART_GOAL} for Player ${u.side === "player" ? 1 : 2}.`;
      note(b, `${u.name} secures an Arena Heart seal (${score}/${HEART_GOAL}).`);
      if (score >= HEART_GOAL) {
        b.result = u.side;
        b.victoryReason = "arena-heart";
        b.queue = [];
        note(b, `Player ${u.side === "player" ? 1 : 2} claims the Arena Heart and wins!`);
        return;
      }
    }
    u.energy = Math.min(5, u.energy + 1);
    if (u.character === "gin") {
      u.absorption = Math.min(12, 4 + 2 * (u.turns - 1));
      u.reserve = Math.min(60, u.reserve + (empowered(u) ? 4 : 2));
    }
    if (u.skyOpen && u.eyes < 5) {
      u.eyes++;
      note(b, `${u.name} opens eye ${u.eyes}/5.`);
    }
    b.active = u.id;
    b.turn++;
    return;
  }
}
export function newBattle(
  firstTurn = 0,
  mode: GameMode = "practice",
  teams: Teams = { player: defaultPicks, enemy: enemyPicks },
  arena: ArenaId = "living-world",
  rules: RuleSet = "elimination",
): Battle {
  if (!validPicks(teams.player) || !validPicks(teams.enemy))
    throw new Error("Each team needs three unique roster characters.");
  const b: Battle = {
    rules,
    ...(rules === "arena-heart" ? { heart: { scores: { player: 0, enemy: 0 }, claims: {}, usedRound: { player: 0, enemy: 0 } } } : {}),
    arena,
    mode,
    teams: structuredClone(teams),
    units: [
      ...teams.player.map((p) => unit(p, "player")),
      ...teams.enemy.map((p) => unit(p, "enemy")),
    ],
    queue: [],
    active: null,
    round: 0,
    turn: firstTurn,
    revision: 0,
    result: null,
    deadIds: [],
    log: ["Battle begins. Three stand together."],
  };
  const sources = [
    ...new Set(
      [...teams.player, ...teams.enemy]
        .map((p) => p.character)
        .filter((id): id is Style => id !== "kidou"),
    ),
  ];
  for (const u of b.units)
    if (u.character === "kidou") {
      u.styles = [...sources];
      u.style = sources[0];
      u.copiedMove = "skill1";
    }
  nextTurn(b);
  return b;
}
export function abilities(b: Battle, u: Unit): Ability[] {
  const list: Ability[] = [
    ...coreMoves(u, b.arena),
    {
      move: "guard",
      name: u.charge ? "Wait" : "Guard",
      description: u.charge
        ? "Maintain the charge without Guard reduction."
        : "Halve attack damage until your next turn and recover 1 energy (maximum 5).",
      cost: 0,
      rest: 0,
      targeting: "none",
      origin: "utility",
    },
  ];
  if (u.character !== "hanibal" && u.character !== "tourgen")
    list.push({
      move: "bankai",
      name: moveName(u, "bankai", "Bankai"),
      description:
        "Permanent transformation: all three core moves become stronger. Uses this turn; once per battle. Existing cooldowns remain.",
      cost: 0,
      rest: 0,
      targeting: "none",
      origin: "shinigami",
    });
  if (u.character === "dan" && u.form === "armored")
    list.push({
      move: "separate",
      name: "Tourgen: Unbound",
      description: `Trade armor for an independent Tourgen: same ${u.maxHp} max HP, current HP, base stats and upgraded move strengths as Dan. Player-controlled; joins next round and disappears if Dan falls.`,
      cost: 3,
      rest: 0,
      targeting: "none",
      origin: "utility",
    });
  if (u.character === "kidou")
    list.push({
      move: "switch",
      name: "Arsenal of Echoes",
      description:
        "Copy a Shinigami move from either starting team. Free switch; one shared cooldown. Uses your form and resources. Defeated characters remain in the library.",
      cost: 0,
      rest: 0,
      targeting: "none",
      origin: "utility",
      choices: copyOptions(u).map((x) => ({
        id: x.id,
        name: `${character(x.source).name} — ${x.name}`,
      })),
    });
  if (b.heart) list.push({
    move: "attune", name: "Attune to the Heart", origin: "utility",
    description: "Spend this turn and 1 energy to channel a seal. Earn it at your next turn, after burn. Taking 24 total HP damage or being imprisoned breaks the channel. Three seals win. One attempt per team per round; summons cannot attune.",
    cost: 1, rest: 0, targeting: "none",
  });
  return list.map((a) => {
    const kit = coreMoves(u, b.arena).find((m) => m.move === a.move);
    let reason: string | undefined;
    if (!present(u)) reason = "Not on battlefield";
    else if (u.charge && a.move !== "skill2" && a.move !== "guard")
      reason = "Charging — release or wait";
    else if (
      (u.cooldowns[a.move] ?? 0) > 0 &&
      !(u.charge && a.move === "skill2")
    )
      reason = `Cooling down: ${u.cooldowns[a.move]} own turn(s)`;
    else if (u.energy < a.cost && !(u.charge && a.move === "skill2"))
      reason = `Needs ${a.cost} energy`;
    if (a.move === "attune") reason = attuneReason(b, u);
    if (a.move === "bankai") {
      if (u.bankaiUsed) reason = "Bankai active";
      else if (u.awakening < 100) reason = "Needs 100 Awakening";
      else if (u.character === "afrodi" && b.deadIds.length < 2)
        reason = "Needs two main-character deaths";
    }
    if (kit?.kind === "eyes" && u.skyOpen && u.eyes < 5)
      reason = `Eyes opening: ${u.eyes}/5`;
    if (
      (kit?.source === "hanibal"
        ? kit.sourceMove === "skill2"
        : u.character === "hanibal" && a.move === "skill2") &&
      !u.skyOpen
    )
      reason = "Activate Five Eyes first";
    if (kit?.kind === "hakai" && u.focus < (empowered(u) ? 1 : 2))
      reason = `Needs ${empowered(u) ? 1 : 2} Focus`;
    if (
      kit?.kind === "allocate" &&
      u.reserve < (empowered(u) ? GIN_COST.bankai : GIN_COST.base)
    )
      reason = "Not enough Reserve";
    if (kit?.kind === "hell" && b.deadIds.length < 2)
      reason = "Needs two main-character deaths";
    if (u.charge && a.move === "skill2" && u.turns < u.charge.ready)
      reason = "Still gathering power";
    return {
      ...a,
      ...(u.charge && a.move === "skill2" ? { cost: 0 } : {}),
      disabled: reason,
    };
  });
}
export function legalTargets(
  b: Battle,
  u: Unit,
  move: Command["move"],
): Unit[] {
  const a = abilities(b, u).find((x) => x.move === move);
  if (!a || a.disabled || a.targeting !== "enemy") return [];
  return alive(b, other(u.side)).filter((x) => present(x) && !x.invisibleUntil);
}
function consumeEvasion(t: Unit) {
  t.evadeCharges = Math.max(0, (t.evadeCharges || 1) - 1);
  if (!t.evadeCharges) t.dodgeUntil = 0;
}
function damage(
  b: Battle,
  s: Unit,
  t: Unit,
  raw: number,
  opts: {
    area?: boolean;
    contact?: boolean;
    pierce?: boolean;
    crush?: boolean;
    execute?: boolean;
  } = {},
): boolean {
  if (!present(t)) return false;
  if (immune(t)) {
    note(b, `${t.name} negates ${s.name}’s attack.`);
    if (t.mantleUntil && opts.contact && s.hp > 0) {
      const before = s.hp;
      s.hp = Math.max(0, s.hp - 30);
      recordDamage(b, t.id, s, before);
      note(b, `${s.name} takes 30 destruction retaliation.`);
    }
    return false;
  }
  if (!opts.area && t.dodgeUntil) {
    consumeEvasion(t);
    note(b, `${t.name} evades the attack.`);
    return false;
  }
  if (opts.execute) {
    const before = t.hp;
    t.hp = 0;
    recordDamage(b, s.id, t, before);
    note(b, `${s.name} erases ${t.name}.`);
    return true;
  }
  let n = raw;
  if (!opts.pierce) {
    if (t.guard && !opts.crush) n *= 0.5;
    if (t.form === "armored") n *= 0.75;
    if (t.charge) n *= 0.8;
  }
  n = Math.ceil(n);
  if (!opts.pierce && !opts.crush && t.barrier) {
    const used = Math.min(t.barrier, n);
    t.barrier -= used;
    if (t.barrierSource) metric(b, t.barrierSource).protection += used;
    n -= used;
  }
  if (t.character === "gin" && n > 0) {
    const absorbed = Math.min(
      n,
      t.absorption * (empowered(t) ? 2 : 1),
      60 - t.reserve,
    );
    t.reserve = Math.min(60, t.reserve + absorbed);
    n -= absorbed;
    note(b, `${t.name} absorbs ${absorbed} energy.`);
  }
  const before = t.hp;
  t.hp = Math.max(0, t.hp - n);
  recordDamage(b, s.id, t, before);
  note(b, `${s.name} hits ${t.name} for ${n}.`);
  if (
    n > 0 &&
    t.hp > 0 &&
    !t.bankaiUsed &&
    t.character !== "hanibal" &&
    t.character !== "tourgen"
  )
    t.awakening = Math.min(100, t.awakening + 10);
  return true;
}
function staticMark(u: Unit, t: Unit) {
  if (t.hp > 0) t.static = { source: u.id, until: u.turns + 1 };
}
function rampart(b: Battle, u: Unit, amount: number, team = true) {
  for (const t of team ? alive(b, u.side).filter(present) : [u]) {
    if (amount >= t.barrier) {
      t.barrier = amount;
      t.barrierSource = u.id;
      t.barrierUntil = u.turns + 1;
    }
  }
  note(b, `${u.name} creates ${amount} barrier${team ? " for the team" : ""}.`);
}
function expireAfterAction(b: Battle, u: Unit) {
  for (const key of [
    "phaseUntil",
    "invisibleUntil",
    "mantleUntil",
    "strengthUntil",
    "ampUntil",
  ] as const)
    if (u[key] > 0 && u.turns >= u[key]) u[key] = 0;
  for (const t of b.units)
    if (t.static?.source === u.id && u.turns >= t.static.until) delete t.static;
}
function capture(
  b: Battle,
  u: Unit,
  t: Unit,
  kind: "hell" | "blade",
  alreadyHit = false,
) {
  if (!present(t)) return;
  if (!alreadyHit) {
    if (immune(t)) {
      note(b, `${t.name} resists imprisonment.`);
      return;
    }
    if (t.dodgeUntil) {
      consumeEvasion(t);
      note(b, `${t.name} evades capture.`);
      return;
    }
  }
  if (kind === "hell" && t.hp <= t.maxHp * 0.25) {
    const before = t.hp;
    t.hp = 0;
    recordDamage(b, u.id, t, before);
    note(b, `${t.name} is claimed by Hell.`);
    return;
  }
  delete t.charge;
  t.prison = { source: u.id, kind, remaining: 2 };
  note(b, `${u.name} imprisons ${t.name}.`);
}
function perform(b: Battle, cmd: Command, advance = true): boolean {
  const u = getActiveUnit(b);
  if (!u || b.result) return false;
  const a = abilities(b, u).find((x) => x.move === cmd.move);
  if (!a || a.disabled) return false;
  const t = legalTargets(b, u, cmd.move).find((x) => x.id === cmd.target);
  if (a.targeting === "enemy" && !t) return false;
  if (a.choices && !a.choices.some((x) => x.id === cmd.choice)) return false;
  const second = cmd.secondary
    ? legalTargets(b, u, cmd.move).find((x) => x.id === cmd.secondary)
    : undefined;
  if (cmd.secondary && (!a.secondary || !second || second.id === t?.id))
    return false;
  if (cmd.move === "switch") {
    const copy = copyOptions(u).find((x) => x.id === cmd.choice)!;
    if (u.style === copy.source && u.copiedMove === copy.move) return false;
    u.style = copy.source;
    u.copiedMove = copy.move;
    note(b, `${u.name} copies ${character(copy.source).name} — ${copy.name}.`);
    return true;
  }
  const m = coreMoves(u, b.arena).find((x) => x.move === cmd.move);
  const source = m?.source ?? u.character;
  const bank = source !== "hanibal" && empowered(u);
  u.energy -= a.cost;
  if (a.rest && m?.kind !== "release") u.cooldowns[cmd.move] = a.rest + 1;
  const hidden = u.invisibleUntil
    ? arenaAmount(b.arena, u, a.origin, bank ? 10 : 5)
    : 0;
  const deal = (
    target: Unit,
    raw: number,
    opts: Parameters<typeof damage>[4] = {},
  ) => damage(b, u, target, raw + hidden, opts);
  const area = (raw: number, crush = false) => {
    for (const target of alive(b, other(u.side)).filter(present))
      deal(target, raw, { area: true, crush });
  };
  if (cmd.move === "attune" && b.heart) {
    b.heart.claims[u.side] = { unit: u.id, readyTurn: u.turns + 1, damage: 0 };
    b.heart.usedRound[u.side] = b.round;
    b.heart.message = `${u.name} is attuning — protect or interrupt before their next turn.`;
    note(b, `${u.name} attunes. Deal ${HEART_BREAK} total HP damage or imprison them before their next turn to break it.`);
  }
  if (m) {
    switch (m.kind) {
      case "hit":
        if (t)
          deal(t, m.damage, {
            pierce: m.pierce,
            execute: !!m.executeAt && t.hp <= t.maxHp * m.executeAt,
            contact: cmd.move !== "signature" && source !== "kami" && !(bank && source === "tomamaru"),
          });
        if (source === "drake") u.focus = Math.min(2, u.focus + 1);
        break;
      case "flame":
        if (t && deal(t, m.damage) && t.hp > 0) {
          t.burn = m.burnTurns!;
          t.burnSource = u.id;
          t.burnDamage = m.burnDamage!;
          note(b, `${t.name} burns for ${t.burnDamage} on ${t.burn} turns.`);
        }
        break;
      case "burst":
        area(m.damage);
        if (m.barrier) rampart(b, u, m.barrier, false);
        if (bank && source === "drake") u.mantleUntil = u.turns + 1;
        break;
      case "phase":
        u.phaseUntil = u.turns + 1;
        note(b, `${u.name} phases through incoming attacks.`);
        break;
      case "hell":
        u.phaseUntil = u.turns + 1;
        if (t) capture(b, u, t, "hell");
        break;
      case "blink":
        if (
          t &&
          deal(t, m.damage, { contact: true }) &&
          bank &&
          u.hp > 0 &&
          t.hp > 0
        )
          capture(b, u, t, "blade", true);
        break;
      case "evade":
        u.dodgeUntil = u.turns + 1;
        u.evadeCharges = m.duration!;
        u.ampUntil = u.turns + 1;
        note(b, `${u.name} prepares ${u.evadeCharges} evasions.`);
        break;
      case "hakai":
        u.focus -= bank ? 1 : 2;
        if (t)
          deal(t, m.damage, {
            execute: t.hp <= t.maxHp * m.executeAt!,
            pierce: true,
          });
        break;
      case "siphon":
        if (t && deal(t, m.damage) && t.hp > 0) {
          const drain = Math.min(t.energy, m.drain!);
          t.energy -= drain;
          u.reserve = Math.min(60, u.reserve + 8 * drain);
          note(b, `${u.name} drains ${drain} energy.`);
        }
        break;
      case "allocate":
        u.reserve -= bank ? GIN_COST.bankai : GIN_COST.base;
        if (cmd.choice === "heal") {
          const n = Math.min(
            u.maxHp - u.hp,
            arenaAmount(
              b.arena,
              u,
              a.origin,
              bank ? GIN_HEAL.bankai : GIN_HEAL.base,
            ),
          );
          u.hp += n;
          metric(b, u.id).healing += n;
          note(b, `${u.name} restores ${n} HP.`);
        } else if (cmd.choice === "strength") u.strengthUntil = u.turns + 2;
        else {
          u.speedUntilRound = b.round + 2;
          u.speedBoost = bank ? 12 : 8;
        }
        break;
      case "eyes":
        u.skyOpen = true;
        note(b, "Five closed eyes appear in the sky.");
        break;
      case "crush":
        area(m.damage, true);
        break;
      case "vanish":
        u.invisibleUntil = u.turns + m.duration!;
        note(b, `${u.name} vanishes without losing the ability to attack.`);
        break;
      case "white":
        if (t) deal(t, m.damage, { pierce: true });
        u.speedUntilRound = b.round + 1;
        u.speedBoost = bank ? 12 : 6;
        break;
      case "rampart":
        rampart(b, u, m.barrier!);
        break;
      case "arc":
        if (t && deal(t, m.damage)) staticMark(u, t);
        if (second && deal(second, m.second!)) staticMark(u, second);
        break;
      case "thunder":
        if (t) {
          const marked = !!t.static,
            disrupt = marked || bank;
          const bonus = marked
            ? arenaAmount(b.arena, u, a.origin, bank ? 20 : 10)
            : 0;
          if (deal(t, m.damage + bonus)) {
            if (disrupt) {
              if (t.charge) {
                delete t.charge;
                note(b, `${u.name} interrupts ${t.name}!`);
              }
              delete t.static;
            } else staticMark(u, t);
          }
        }
        break;
      case "charge":
        u.charge = { kind: "lane", ready: u.turns + 1 };
        note(b, `${u.name} begins gathering planetary power.`);
        break;
      case "release":
        delete u.charge;
        area(m.damage);
        u.cooldowns.skill2 = m.rest + 1;
        break;
    }
  }
  if (cmd.move === "signature" && u.character === "lane") rampart(b,u,bank?45:30,false);
  if (cmd.move === "guard") {
    if (u.charge) note(b, `${u.name} waits while gathering power.`);
    else {
      u.guard = true;
      u.energy = Math.min(5, u.energy + 1);
      note(b, `${u.name} guards.`);
    }
  }
  if (cmd.move === "bankai") {
    u.bankaiUsed = true;
    u.awakening = 0;
    if (u.character === "dan") u.form = "armored";
    if (u.character === "drake") u.mantleUntil = u.turns + 1;
    note(b, `BANKAI — ${u.name}'s three moves evolve permanently.`);
  }
  if (cmd.move === "separate") {
    u.form = "separated";
    const pet = unit({ character: "dan" }, u.side);
    Object.assign(pet, {
      id: `${u.id}:tourgen`,
      character: "tourgen",
      name: "Tourgen",
      owner: u.id,
      hp: u.hp,
      maxHp: u.maxHp,
      attack: u.attack,
      speed: u.speed,
      energy: u.energy,
      bankaiUsed: true,
      form: "separated",
    });
    b.units.push(pet);
    note(
      b,
      `${u.name} separates Tourgen, an equal partner. Tourgen joins next round.`,
    );
  }
  if (cmd.move !== "attune" && !u.bankaiUsed && u.character !== "hanibal" && u.character !== "tourgen")
    u.awakening = Math.min(100, u.awakening + 20);
  expireAfterAction(b, u);
  if (!reconcile(b) && advance) nextTurn(b);
  return true;
}
export function chooseAI(b: Battle): Command {
  const u = getActiveUnit(b)!;
  const enemyClaim = b.heart?.claims[other(u.side)];
  if (enemyClaim) {
    for (const a of abilities(b, u).filter(a => !a.disabled && ["attack", "skill1", "skill2"].includes(a.move) && !a.choices)) {
      const cmd: Command = { move: a.move, ...(a.targeting === "enemy" ? { target: enemyClaim.unit } : {}) };
      const forecast = previewMove(b, cmd);
      if (forecast?.messages.some(m => /attunement breaks|Attunement breaks/.test(m))) return cmd;
    }
  }
  if (b.heart && !attuneReason(b, u) && u.hp > HEART_BREAK && !(u.burn && u.burnDamage >= HEART_BREAK)) return { move: "attune" };
  if (u.character === "kidou" && !u.charge && !(u.cooldowns.skill2 > 0)) {
    const scoreCopy = (candidate: Unit) => {
      const view = {
        ...b,
        units: b.units.map((x) => (x.id === u.id ? candidate : x)),
      };
      const a = abilities(view, candidate).find((x) => x.move === "skill2")!;
      const m = coreMoves(candidate, b.arena)[2];
      if (
        a.disabled ||
        (a.targeting === "enemy" &&
          !legalTargets(view, candidate, "skill2").length)
      )
        return -1;
      if (m.kind === "allocate")
        return candidate.hp < candidate.maxHp * 0.6 ? 120 : 15;
      if (m.kind === "eyes") return 70;
      if (m.kind === "phase" || m.kind === "vanish" || m.kind === "evade")
        return candidate.hp < candidate.maxHp * 0.5 &&
          !candidate.phaseUntil &&
          !candidate.invisibleUntil
          ? 65
          : 10;
      if (m.kind === "rampart") return 25;
      if (m.kind === "hell") return 90;
      return (
        m.damage *
        (m.area ? alive(b, other(u.side)).filter(present).length : 1) +
        (m.second ?? 0)
      );
    };
    let best = scoreCopy(u),
      choice: string | undefined;
    for (const copy of copyOptions(u)) {
      const score = scoreCopy({
        ...u,
        style: copy.source,
        copiedMove: copy.move,
      });
      if (score > best) {
        best = score;
        choice = copy.id;
      }
    }
    if (choice) return { move: "switch", choice };
  }
  const available = abilities(b, u).filter(
    (a) => !a.disabled && a.move !== "switch",
  );
  const ranked = available.sort((a, c) => {
    const score = (x: Ability) =>
      u.charge && x.move === "skill2"
        ? 200
        : x.move === "bankai"
          ? 150
          : x.move === "separate"
            ? 140
            : u.ampUntil > 0 && x.move === "attack"
              ? 110
              : u.character === "gin" &&
                x.move === "skill2" &&
                u.hp < u.maxHp * 0.7
                ? 130
                : x.move === "skill1" && u.character === "hanibal"
                  ? 120
                  : x.move === "signature" ? 95
                  : x.move.startsWith("skill")
                    ? 60
                    : x.move === "attack"
                      ? 30
                      : 0;
    return score(c) - score(a);
  });
  for (const a of ranked) {
    const targets = legalTargets(b, u, a.move).sort((x, y) => x.hp - y.hp);
    if (a.targeting === "enemy" && !targets.length) continue;
    return {
      move: a.move,
      target: targets[0]?.id,
      secondary: a.secondary ? targets[1]?.id : undefined,
      choice: a.choices
        ? u.hp < u.maxHp * 0.8
          ? "heal"
          : "strength"
        : undefined,
    };
  }
  return { move: "guard" };
}
export function battleReducer(state: Battle, event: BattleEvent): Battle {
  if (
    state.result ||
    event.turn !== state.turn ||
    event.revision !== state.revision
  )
    return state;
  if (event.type === "ai" && !isAutomaticTurn(state)) return state;
  if (event.type === "move" && isAutomaticTurn(state)) return state;
  const b = structuredClone(state);
  const cmd = event.type === "ai" ? chooseAI(b) : event;
  // Presentation metadata is server-authored and never used to decide combat.
  const u = getActiveUnit(b);
  const label = u
    ? abilities(b, u).find((a) => a.move === cmd.move)?.name
    : undefined;
  const forecast = previewMove(state, cmd);
  const cueKit = u
    ? coreMoves(u, state.arena).find((m) => m.move === cmd.move)
    : undefined;
  const finishCue = () => {
    if (!u || !label) return;
    b.lastAction = {
      revision: b.revision,
      actor: u.id,
      character: u.character,
      effect: cmd.move === "attune" ? "heart" : THEMES[cueKit?.source ?? u.character].effect,
      messages: forecast?.messages,
      reactions: forecast?.reactions,
      name: label,
      move: cmd.move,
      targets:
        cueKit?.area && cueKit.kind !== "charge"
          ? state.units
            .filter((t) => t.side !== u.side && present(t))
            .map((t) => t.id)
          : [cmd.target, cmd.secondary].filter((x): x is string => !!x),
      outcomes: (forecast?.changes ?? [])
        .filter((x) => x.hp || x.barrier)
        .map((x) => ({
          id: x.id,
          hpChange: x.hp,
          barrierChange: x.barrier,
          defeated: x.defeated,
        })),
    };
    if (canAnimateSignature(state.units.find(t=>t.id===u.id),cmd.move)) {
      const {units,active,queue,round,result,log,heart,metrics,deadIds,scars}=state;
      b.lastAction.animation={id:u.character==="dan"?"dan-bankai-slash":"roster-signature",before:structuredClone({units,active,queue,round,result,log,heart,metrics,deadIds,scars})};
    }
    if (cmd.move === "bankai") b.lastAwakening = b.lastAction;
    if (
      cmd.move === "bankai" ||
      (cueKit &&
        (cueKit.damage > 0 ||
          ["hell", "phase", "charge"].includes(cueKit.kind)))
    ) {
      b.scars = [
        ...(state.scars ?? []),
        {
          revision: b.revision,
          round: state.round,
          effect: b.lastAction.effect!,
          side: u.side,
          awakened: u.bankaiUsed,
        },
      ].slice(-12);
    }
  };
  // A temporarily unavailable marked target must not deadlock a charge.
  if (u?.charge && cmd.move === "guard") {
    note(b, `${u.name} waits while maintaining the charge.`);
    expireAfterAction(b, u);
    nextTurn(b);
    b.revision++;
    finishCue();
    return b;
  }
  if (u && label) note(b, `${u.name} — ${label}.`);
  if (!perform(b, cmd)) return state;
  b.revision++;
  finishCue();
  return b;
}
export function statuses(u: Unit): string[] {
  return [
    empowered(u) ? "Bankai active" : "",
    u.guard ? "Guard" : "",
    u.burn ? `Burn ${u.burn}` : "",
    u.barrier ? `Barrier ${u.barrier}` : "",
    u.prison ? `Exiled (${u.prison.remaining})` : "",
    u.phaseUntil ? "Phased" : "",
    u.invisibleUntil ? "Invisible" : "",
    u.mantleUntil ? "Destruction mantle" : "",
    u.dodgeUntil ? "Evasion" : "",
    u.static ? "Static" : "",
    u.charge ? "Charging" : "",
    u.form === "armored"
      ? "Hell Shogun"
      : u.form === "separated"
        ? "Separated"
        : "",
    u.character === "gin"
      ? `Reserve ${u.reserve}/60 · Absorb ${u.absorption * (empowered(u) ? 2 : 1)}`
      : "",
    u.character === "hanibal" || u.skyOpen ? `Eyes ${u.eyes}/5` : "",
    u.character === "drake" || u.character === "kidou"
      ? `Focus ${u.focus}/2`
      : "",
    u.bladeBonus ? `Blade +${u.bladeBonus}` : "",
    u.ampUntil ? `Counterstep +${empowered(u) ? 18 : 10}` : "",
    u.character === "kidou"
      ? `Reserve ${u.reserve}/60 · Copy: ${character(u.style).name}`
      : "",
  ].filter(Boolean);
}

/** Pure forecast: resolve this action on a clone, without starting the next turn. */
export function previewMove(b: Battle, cmd: Command) {
  const copy = structuredClone(b);
  copy.log = [];
  const actor = getActiveUnit(copy);
  if (actor?.charge && cmd.move === "guard" && !copy.result) {
    note(copy, `${actor.name} waits while maintaining the charge.`);
    expireAfterAction(copy, actor);
  } else if (!perform(copy, cmd, false)) return null;
  const move = actor
    ? coreMoves(getActiveUnit(b)!, b.arena).find((m) => m.move === cmd.move)
    : undefined;
  const targetIds = move?.area
    ? b.units
      .filter((t) => t.side !== actor?.side && present(t))
      .map((t) => t.id)
    : [cmd.target, cmd.secondary].filter(Boolean);
  const reactions: NonNullable<import("./types").ActionCue["reactions"]> = [];
  for (const id of targetIds) {
    const before = b.units.find((t) => t.id === id),
      after = copy.units.find((t) => t.id === id);
    if (!before || !after) continue;
    if (before.phaseUntil) reactions.push({ id: before.id, kind: "phase" });
    else if (before.mantleUntil)
      reactions.push({ id: before.id, kind: "mantle" });
    else if (after.evadeCharges < before.evadeCharges)
      reactions.push({ id: before.id, kind: "evade" });
    else {
      if (after.barrier < before.barrier)
        reactions.push({ id: before.id, kind: "barrier" });
      if (before.character === "gin" && after.reserve > before.reserve)
        reactions.push({ id: before.id, kind: "absorb" });
      if (after.prison && !before.prison)
        reactions.push({ id: before.id, kind: "prison" });
    }
  }
  return {
    reactions,
    changes: copy.units.flatMap((t) => {
      const before = b.units.find((x) => x.id === t.id);
      if (!before) return [];
      const heartBefore = b.heart?.claims[t.side];
      const broken = heartBefore?.unit === t.id && !copy.heart?.claims[t.side];
      const added = statuses(t).filter(
        (s) =>
          !statuses(before).includes(s) &&
          !(t.barrier !== before.barrier && s.startsWith("Barrier")),
      );
      if (broken) added.push("Attunement broken");
      return t.hp !== before.hp || t.barrier !== before.barrier || added.length
        ? [
          {
            id: t.id,
            name: t.name,
            hp: t.hp - before.hp,
            barrier: t.barrier - before.barrier,
            statuses: added,
            defeated: before.hp > 0 && t.hp <= 0,
          },
        ]
        : [];
    }),
    messages: copy.log,
  };
}
