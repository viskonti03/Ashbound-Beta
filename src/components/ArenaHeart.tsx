import type { Battle, RuleSet, Side } from "../game/types";
import { HEART_BREAK, HEART_GOAL } from "../game/heart";
export function RulePicker({ value, onChange, disabled = false }: { value: RuleSet; onChange: (r: RuleSet) => void; disabled?: boolean }) {
  return <section className="rule-picker panel" aria-label="Battle rules">
    <p className="eyebrow">CHOOSE HOW THE WORLD IS WON</p>
    <div className="rule-options">
      <button aria-pressed={value === "arena-heart"} disabled={disabled} onClick={() => onChange("arena-heart")}>
        <span className="rule-symbol" aria-hidden="true">◇</span><strong>Arena Heart</strong><small>Claim 3 seals or defeat the enemy team.</small><span>Channel. Protect. Interrupt.</span>
      </button>
      <button aria-pressed={value === "elimination"} disabled={disabled} onClick={() => onChange("elimination")}>
        <span className="rule-symbol" aria-hidden="true">⚔</span><strong>Elimination</strong><small>Defeat the enemy team.</small><span>Classic combat, existing arena bonuses.</span>
      </button>
    </div>
    <p className="muted">{value === "arena-heart" ? "From round 2, spend a turn and 1 energy to attune. Survive to your next turn to earn a seal. Taking 24 total HP damage or imprisonment breaks it. One attempt per team per round. Seals grant no combat bonuses." : "The Heart stays dormant. Win through your characters’ combat abilities."}</p>
  </section>;
}
export default function ArenaHeart({ battle: b, onInspect, nearSide = "player" }: { battle: Battle; onInspect: (id: string) => void; nearSide?: Side }) {
  if (!b.heart) return null;
  const h = b.heart, urgent = Math.max(h.scores.player, h.scores.enemy) === HEART_GOAL - 1;
  return <section className={`heart-panel ${urgent ? 'heart-critical' : ''} ${b.round < 2 ? 'heart-dormant' : ''}`} aria-label="Arena Heart objective">
    <div className="heart-title"><div className="heart-orb" aria-hidden="true"><i /><i /><b>◇</b></div><div><strong>Arena Heart</strong><span className="stage-heart-round">Round {b.round}</span><small>{b.result ? (b.victoryReason === "arena-heart" ? "WORLD CLAIMED" : "BATTLE ENDED") : b.round < 2 ? "OPENS IN ROUND 2" : urgent ? "MATCH POINT · BREAK THEIR CHANNEL" : "THREE SEALS TO CLAIM THIS WORLD"}</small></div></div>
    <div className="heart-sides">{([nearSide, nearSide === "player" ? "enemy" : "player"] as Side[]).map(side => {
      const claim = h.claims[side], bearer = b.units.find(u => u.id === claim?.unit);
      return <div key={side} className={`heart-side heart-${side} ${side === nearSide ? "heart-near" : "heart-far"}`}>
        <div className="heart-score"><strong>Player {side === 'player' ? 1 : 2}</strong><span aria-label={`${h.scores[side]} of 3 seals`}>{Array.from({ length: HEART_GOAL }, (_, i) => <i key={i} className={i < h.scores[side] ? 'seal-earned' : ''}>◆</i>)}</span><b>{h.scores[side]}/3</b></div>
        {claim && bearer ? <button className="heart-channel" onClick={() => onInspect(bearer.id)} aria-label={`Inspect attuning ${bearer.name}`}><span>{bearer.name} · seal at next own turn</span><meter min={0} max={HEART_BREAK} value={claim.damage} aria-label="Damage toward breaking attunement" /><small>{HEART_BREAK - claim.damage} more HP damage breaks it · imprisonment also breaks</small></button> : <p>{b.result ? "" : h.usedRound[side] === b.round ? "Next attempt available next round" : b.round < 2 ? "Prepare your opening" : "No active channel"}</p>}
      </div>;
    })}</div>
    {h.message && <p className="heart-event" role="status">{h.message}</p>}
    <details className="heart-help"><summary>How to contest</summary><p>Use Attune to the Heart instead of an attack. Earn one seal at the start of the bearer’s next turn, after burn damage. Deal 24 cumulative HP damage or imprison the bearer to interrupt. Barriers and absorption protect the channel; healing does not reset damage already taken. Phase, invisibility and destruction mantle prevent starting a channel. Summoned Tourgen cannot claim. Both teams may channel at once. Elimination still wins immediately.</p></details>
  </section>;
}
