import { useEffect, useRef } from "react";
import { abilities, present } from "../game/engine";
import { battlePortrait } from "../game/media";
import type { Battle, Unit } from "../game/types";
export function StatusInspector({
  battle: b,
  unit: u,
  onClose,
}: {
  battle: Battle;
  unit: Unit;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const node = dialog.current;
    node?.showModal();
    return () => node?.close();
  }, []);
  const expiry = (n: number) =>
    n <= u.turns
      ? "Ends after this own turn."
      : `Ends after ${n - u.turns} further own turn(s).`;
  const rows: [string, string][] = [];
  const claim = b.heart?.claims[u.side];
  if (claim?.unit === u.id) rows.push(["Attuning to Arena Heart", `Seal at the start of the next own turn, after burn. ${24 - claim.damage} more HP damage or imprisonment breaks it. Healing does not reset accumulated damage.`]);
  if (u.hp <= 0) rows.push(["Defeated", "This character can no longer act."]);
  if (u.prison)
    rows.push([
      "Imprisoned",
      `${u.prison.remaining} scheduled turn(s) remaining. Released if the captor falls.${u.prison.kind === "blade" ? " At 50% HP or higher, escape after the next skipped turn." : ""}`,
    ]);
  if (u.invisibleUntil)
    rows.push([
      "Invisible",
      `Cannot be selected; area attacks still hit. ${expiry(u.invisibleUntil)}`,
    ]);
  if (u.phaseUntil)
    rows.push([
      "Phased",
      `Single-target and area attacks are negated. Existing burn still hurts. ${expiry(u.phaseUntil)}`,
    ]);
  if (u.mantleUntil)
    rows.push([
      "Destruction mantle",
      `Single-target and area attacks negated; contact attackers take 30 retaliation. ${expiry(u.mantleUntil)}`,
    ]);
  if (u.dodgeUntil)
    rows.push([
      "Evasion",
      `${u.evadeCharges} single-target hit(s), until the start of the next own turn. Area attacks still hit.`,
    ]);
  if (u.ampUntil)
    rows.push([
      "Counterstep",
      `Next basic attack gains +${u.bankaiUsed ? 18 : 10} damage. ${expiry(u.ampUntil)}`,
    ]);
  if (u.character === "gin")
    rows.push([
      "Spiritual capacity",
      `${u.reserve}/60 Reserve. Absorb up to ${Math.min(60 - u.reserve, u.absorption * (u.bankaiUsed ? 2 : 1))} from the next hit; full Reserve cannot absorb. Redistribution has two recovery turns.`,
    ]);
  if (u.guard)
    rows.push([
      "Guard",
      "Halves attack damage until the next own turn; piercing and guard-crushing moves bypass it.",
    ]);
  if (u.barrier) {
    const source = b.units.find((t) => t.id === u.barrierSource);
    rows.push([
      "Barrier",
      `${u.barrier} protection; expires at the start of ${source?.name ?? "caster"}’s turn ${u.barrierUntil} (${Math.max(0, u.barrierUntil - (source?.turns ?? 0))} own turn(s) away).`,
    ]);
  }
  if (u.burn)
    rows.push([
      "Burn",
      `${u.burnDamage} damage at each of the next ${u.burn} own turn starts.`,
    ]);
  if (u.charge)
    rows.push([
      "Charging",
      u.turns >= u.charge.ready
        ? "Ready to release from the third slot."
        : `Ready after ${u.charge.ready - u.turns} further own turn(s). Interrupts cancel the charge.`,
    ]);
  if (u.static) {
    const source = b.units.find((t) => t.id === u.static!.source);
    rows.push([
      "Static",
      `Expires at the end of ${source?.name ?? "caster"}’s turn ${u.static.until}. Enables thunder interruption.`,
    ]);
  }
  const reason = !present(u)
    ? "Unavailable while defeated or imprisoned."
    : u.invisibleUntil
      ? "Hidden from single-target selection."
      : u.side === b.units.find((t) => t.id === b.active)?.side
        ? "Ally of the active character."
        : "Visible enemy; targeting also depends on the selected move.";
  return (
    <dialog
      ref={dialog}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="status-inspector panel"
      aria-label={`${u.name} status details`}
    >
      <div className="inspector-heading">
        <img src={battlePortrait(u)} alt="" />
        <div>
          <p className="eyebrow">CHARACTER INSPECTOR</p>
          <h3>{u.name}</h3>
          <p>
            {u.hp}/{u.maxHp} HP · {u.energy}/5 energy
          </p>
        </div>
        <button onClick={onClose}>Close details</button>
      </div>
      <p>{reason}</p>
      <dl>
        {rows.length ? (
          rows.map(([key, value]) => (
            <div key={key}>
              <dt>{key}</dt>
              <dd>{value}</dd>
            </div>
          ))
        ) : (
          <p>No temporary status effects.</p>
        )}
      </dl>
      <div className="cooldown-inspector">
        {abilities(b, u)
          .filter((a) => !["switch", "separate"].includes(a.move))
          .map((a) => (
            <p key={a.move}>
              <strong>{a.name}</strong>
              <span>
                {a.disabled ?? "Ready"} · {a.cost} energy
              </span>
            </p>
          ))}
      </div>
    </dialog>
  );
}
export function Victory({ battle: b }: { battle: Battle }) {
  const winners = b.units.filter(
    (u) => b.result === "draw" || u.side === b.result,
  );
  return (
    <section className="victory-showcase panel" aria-label="Battle result">
      <p className="eyebrow">THE ASHES SETTLE · ROUND {b.round}</p>
      <h2>
        {b.result === "draw"
          ? "A battle without victors"
          : `Player ${b.result === "player" ? 1 : 2} victorious`}
      </h2>
      {b.heart && <p className="heart-result">{b.victoryReason === "arena-heart" ? "ARENA HEART CLAIMED — victory through attunement" : "VICTORY THROUGH ELIMINATION"} · Seals {b.heart.scores.player} : {b.heart.scores.enemy}</p>}
      <div className="victory-lineup">
        {winners.map((u) => (
          <div key={u.id} className={u.hp <= 0 ? "remembered" : ""}>
            <img src={battlePortrait(u)} alt={u.name} />
            <strong>{u.name}</strong>
            <small>
              {u.hp > 0 ? `${u.hp} HP · SURVIVED` : "FALLEN IN BATTLE"}
            </small>
          </div>
        ))}
      </div>
      <div className="match-stat-scroll">
        <table>
          <caption>
            Match statistics · actual HP damage, healing and barrier damage
            absorbed
          </caption>
          <thead>
            <tr>
              <th>Character</th>
              <th>Damage</th>
              <th>Healing</th>
              <th>Protection</th>
              <th>Defeats</th>
            </tr>
          </thead>
          <tbody>
            {b.units.map((u) => {
              const m = b.metrics?.[u.id];
              return (
                <tr key={u.id}>
                  <th>
                    P{u.side === "player" ? 1 : 2} · {u.name}
                  </th>
                  <td>{m?.damage ?? 0}</td>
                  <td>{m?.healing ?? 0}</td>
                  <td>{m?.protection ?? 0}</td>
                  <td>{m?.defeats ?? 0}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="muted">Final action: {b.lastAction?.name ?? "—"}</p>
    </section>
  );
}
export function ArenaAtmosphere({ arena }: { arena: Battle["arena"] }) {
  return (
    <div className={`arena-atmosphere weather-${arena}`} aria-hidden="true">
      {Array.from({ length: 16 }, (_, i) => (
        <i
          key={i}
          style={{
            left: `${i * 6.3}%`,
            animationDelay: `-${i * 0.71}s`,
            animationDuration: `${5 + (i % 5)}s`,
          }}
        />
      ))}
    </div>
  );
}
export function AttackEffect({ effect }: { effect: string }) {
  return (
    <div className={`signature-fx signature-${effect}`} aria-hidden="true">
      <i />
      <i />
      <i />
      <b />
    </div>
  );
}
