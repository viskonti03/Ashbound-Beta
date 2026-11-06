import { battlePortrait } from "../game/media";
import { coreMoves } from "../game/kits";
import { heritage } from "../game/arenas";
import { THEMES } from "../game/presentation";
import { useState, useRef, useEffect, type CSSProperties } from "react";
import {
  ROSTER,
  character,
  portrait,
  validPicks,
  randomPicks,
} from "../game/roster";
import { abilities, newBattle } from "../game/engine";
import type { CharacterId, Pick } from "../game/types";

type Props = {
  picks: Pick[];
  onChange: (p: Pick[]) => void;
  disabled?: boolean;
  label: string;
};
export default function RosterPicker({
  picks,
  onChange,
  disabled = false,
  label,
}: Props) {
  const dialog=useRef<HTMLDialogElement>(null);
  const [open,setOpen]=useState(false);
  useEffect(()=>{if(open)dialog.current?.showModal();else dialog.current?.close();},[open]);
  const [showBankai, setShowBankai] = useState(false);
  const [inspected, setInspected] = useState<CharacterId>("dan");
  const c = character(inspected),
    chosen = picks.some((p) => p.character === c.id);
  const safe =
    picks.length === 3 && validPicks(picks)
      ? picks
      : [
          {
            character: inspected,
          },
          ...ROSTER.filter((x) => x.id !== inspected && x.id !== "kidou")
            .slice(0, 2)
            .map((x) => ({ character: x.id })),
        ];
  const preview = newBattle(0, "local", { player: safe, enemy: safe });
  const u =
    preview.units.find(
      (x) => x.side === "player" && x.character === inspected,
    ) ??
    newBattle(0, "local", {
      player: [
        {
          character: inspected,
        },
        ...ROSTER.filter((x) => x.id !== inspected && x.id !== "kidou")
          .slice(0, 2)
          .map((x) => ({ character: x.id })),
      ],
      enemy: safe,
    }).units[0];
  function toggle() {
    if (disabled) return;
    onChange(
      chosen
        ? picks.filter((p) => p.character !== inspected)
        : picks.length < 3
          ? [
              ...picks,
              {
                character: inspected,
              },
            ]
          : picks,
    );
    setOpen(false);
  }
  return (
    <section
      className="picker"
      style={{ "--character-color": THEMES[inspected].color } as CSSProperties}
    >
      <div className="section-title">
        <div>
          <p className="eyebrow">CHOOSE THREE · NO DUPLICATES</p>
          <h2>{label}</h2>
        </div>
        <span className="badge">{picks.length}/3 selected</span>
      </div>
      <div className="button-row roster-tools">
        <button
          type="button"
          className="secondary"
          disabled={disabled}
          onClick={() => onChange(randomPicks())}
        >
          Random Team
        </button>
        <button
          type="button"
          className="secondary"
          disabled={disabled || picks.length === 0}
          onClick={() => onChange([])}
        >
          Clear team
        </button>
        <span className="muted small">
          Pick three yourself, or roll a whole team. Random replaces your
          current picks.
        </span>
      </div>
      <div className="team-slots">
        {[0, 1, 2].map((i) => {
          const p = picks[i];
          return (
            <button
              type="button"
              className="slot"
              key={i}
              disabled={!p || disabled}
              onClick={() => p && onChange(picks.filter((_, j) => j !== i))}
              aria-label={
                p
                  ? `Remove ${character(p.character).name}`
                  : `Empty slot ${i + 1}`
              }
            >
              {p ? (
                <>
                  <img src={portrait(p.character)} alt="" />
                  <span>
                    {character(p.character).name}
                    <small>Remove ×</small>
                  </span>
                </>
              ) : (
                <span>
                  Slot {i + 1}
                  <small>Choose a character</small>
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="roster-grid">
        {ROSTER.map((x) => (
          <button
            type="button"
            key={x.id}
            style={{ "--character-color": THEMES[x.id].color } as CSSProperties}
            className={`roster-card ${inspected === x.id ? "inspected" : ""}`}
            aria-pressed={inspected === x.id}
            onClick={() => {setInspected(x.id);setOpen(true);}}
            aria-label={`Inspect ${x.name}`}
          >
            <img src={portrait(x.id)} alt={x.name} />
            <span>
              {x.name}
              <small>{THEMES[x.id].title}</small>
              <small className="roster-role">{x.role}</small>
            </span>
            {picks.some((p) => p.character === x.id) && (
              <b className="selected-mark">✓</b>
            )}
          </button>
        ))}
      </div>
      <dialog ref={dialog} className="roster-dialog" aria-label={`${c.name} character details`} onCancel={()=>setOpen(false)} onClose={()=>setOpen(false)}>
      <button className="roster-close secondary" onClick={()=>setOpen(false)} aria-label="Close character details">Close ×</button>
      <div className="character-detail" key={inspected}>

        <div>
          <div className="portrait-mode">
            <button
              type="button"
              aria-pressed={!showBankai}
              onClick={() => setShowBankai(false)}
            >
              Shikai
            </button>
            <button
              type="button"
              aria-pressed={showBankai}
              disabled={c.id === "hanibal"}
              onClick={() => setShowBankai(true)}
            >
              Bankai
            </button>
          </div>
          <img
            className="detail-portrait"
            src={
              showBankai && c.id !== "hanibal"
                ? battlePortrait({ ...u, bankaiUsed: true })
                : portrait(c.id)
            }
            alt={`${c.name} ${showBankai && c.id !== "hanibal" ? "Bankai" : "Shikai"}`}
          />
          <div className="stat-row">
            <span>{c.hp} HP</span>
            <span>{c.speed} SPD</span>
            <span>{c.basic} ATK</span>
          </div>
          <button
            type="button"
            className="primary wide"
            disabled={disabled || (!chosen && picks.length === 3)}
            onClick={toggle}
          >
            {chosen
              ? "Remove from team"
              : picks.length === 3
                ? "Team is full"
                : "Add to team"}
          </button>
        </div>
        <div>
          <p className="eyebrow">{c.role}</p>
          <p className="heritage-label">{heritage(c.id)}</p>
          <h2>{c.name}</h2>
          <p className="muted">{c.theme}</p>
          <p>{c.plan}</p>
          <div className="callout">
            <strong>Passive / identity</strong>
            <p>{c.passive}</p>
          </div>
          {c.id === "kidou" && (
            <p className="muted small">
              Example copy below. His actual library is built from both teams
              when the match starts.
            </p>
          )}
          {abilities(preview, showBankai && c.id !== "hanibal" ? {...u,bankaiUsed:true,form:c.id === "dan" ? "armored" : "base"} : u)
            .filter((a) => !["guard", "switch", "release"].includes(a.move))
            .map((a) => (
              <div className="ability-description" key={a.move}>
                <strong>{a.name}</strong>
                <small>{a.origin?.toUpperCase()}</small>
                <small>
                  {a.move === "bankai"
                    ? c.id === "hanibal"
                      ? "5 energy · five eyes · once"
                      : "100 Awakening · once"
                    : a.move === "separate"
                      ? "Armored form required"
                      : `${a.cost} energy · rest ${a.rest} own turn(s)`}
                </small>
                <p>{a.description}</p>
              </div>
            ))}
          <details className="kit-evolution">
            <summary>
              {c.id === "hanibal"
                ? "Five-eye evolution"
                : "Preview Bankai: all three upgraded moves"}
            </summary>
            {c.id !== "hanibal" && (
              <img
                className="bankai-preview-art"
                src={battlePortrait({ ...u, bankaiUsed: true })}
                alt={`${c.name} Bankai portrait`}
              />
            )}
            {coreMoves({
              ...u,
              bankaiUsed: c.id !== "hanibal",
              eyes: c.id === "hanibal" ? 5 : 0,
              skyOpen: c.id === "hanibal",
              form: c.id === "dan" ? "armored" : "base",
            }).map((a) => (
              <div className="ability-description" key={a.move}>
                <strong>{a.name}</strong>
                <small>
                  {a.origin?.toUpperCase()} · {a.cost} ENERGY · REST {a.rest}
                </small>
                <p>{a.description}</p>
              </div>
            ))}
          </details>
          <p className="counter">
            <strong>Counterplay:</strong> {c.counter}
          </p>
          <details>
            <summary>Character lore</summary>
            <p>{c.lore}</p>
          </details>
        </div>
      </div>
      </dialog>
      {picks.some((p) => p.character === "kidou") && (
        <div className="callout">
          <strong>Kidou’s battlefield library</strong>
          <p>
            No styles to preselect. Once both teams lock, his copy slot gains
            every Shinigami core move from the characters in this match,
            including enemy techniques.
          </p>
        </div>
      )}
      <p className="muted small">
        Prototype balance, separate from lore. Sword, Mira and Tensei remain
        deferred. Portraits use your original artwork.
      </p>
    </section>
  );
}
