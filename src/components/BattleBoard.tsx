import CombatSpriteLayer from "../animation/CombatSpriteLayer";
import {preloadAttack} from "../animation/assets";
import {useCombatPresentation} from "../animation/useCombatPresentation";
import {hasCombatAnimation,animationSpec,canAnimateSignature} from "../game/combatAnimation";
import EchoChooser from "./EchoChooser";
import SignatureFilm from "./SignatureFilm";
import ArenaHeart from "./ArenaHeart";
import SoundControls from "./SoundControls";
import { claimFor, HEART_BREAK } from "../game/heart";
import { arenaInfo, heritage } from "../game/arenas";
import { ArenaScene } from "./ArenaReveal";
import Sigil from "./Sigil";
import CombatLinks from "./CombatLinks";
import { worldState } from "../game/world";
import LivingBattlefield, {
  CharacterPresence,
  DefensiveReaction,
} from "./LivingBattlefield";
import { useState, useEffect, useRef, type CSSProperties } from "react";
import type { Battle, Command, Side, Unit } from "../game/types";
import {
  abilities,
  getActiveUnit,
  isAutomaticTurn,
  legalTargets,
  speed,
  statuses,
} from "../game/engine";
import { battlePortrait, battleSprite } from "../game/media";
import Awakening from "./Awakening";
import { THEMES } from "../game/presentation";
import Rules from "./Rules";
import {
  StatusInspector,
  Victory,
  ArenaAtmosphere,
  AttackEffect,
} from "./BattleDetails";
import { previewMove } from "../game/engine";
import { coreMoves } from "../game/kits";
import { playCombatSound } from "../audio/sound";
type Props = {
  battle: Battle;
  controller: Side | "both" | null;
  onAction: (c: Command) => void;
  paused?: boolean;
  busy?: boolean;
};
const colorStyle = (color: string) =>
  ({ "--character-color": color }) as CSSProperties;
export default function BattleBoard({
  battle: authoritative,
  controller,
  onAction,
  paused = false,
  busy = false,
}: Props) {
  const {battle:b,running:combatRunning,deadline:combatDeadline}=useCombatPresentation(authoritative);
  const [clock,setClock]=useState(Date.now);
  useEffect(()=>{const until=b.cinematicUntil ?? 0;if(!until)return;
    const timer=setTimeout(()=>setClock(Date.now()),Math.max(0,until-Date.now()+40));return()=>clearTimeout(timer);
  },[b.cinematicUntil]);
  const awakeningLocked=(b.cinematicUntil ?? 0)>clock;
  const [selection, setSelection] = useState<{
    revision: number;
    move: Command["move"];
    target?: string;
    choice?: string;
  } | null>(null);
  const [echoRevision,setEchoRevision]=useState<number|null>(null);
  const [viewport,setViewport]=useState(true);
  const [localView,setLocalView]=useState<Side>("player");
  const nearSide:Side=controller === "enemy" ? "enemy" : controller === "both" ? localView : "player";
  const farSide:Side=nearSide === "player" ? "enemy" : "player";
  useEffect(()=>{if(!viewport||b.result)return;const overflow=document.body.style.overflow;document.body.style.overflow="hidden";return()=>{document.body.style.overflow=overflow;};},[viewport,b.result]);
  const [fullArt, setFullArt] = useState(false);
  const [field, setField] = useState<HTMLDivElement | null>(null);
  const [inspected, setInspected] = useState<string | null>(null);
  const [hovered,setHovered]=useState<{move:Command["move"];revision:number;actor:string|null}|null>(null);
  const hoverMove=hovered?.revision === b.revision && hovered.actor === b.active ? hovered.move : null;
  const setHoverMove=(move:Command["move"]|null)=>setHovered(move?{move,revision:b.revision,actor:b.active}:null);
  const soundRevision = useRef(b.revision);
  useEffect(() => {
    if (b.lastAction && b.lastAction.revision > soundRevision.current) {
      soundRevision.current = b.lastAction.revision;
      if(!hasCombatAnimation(b.lastAction)) playCombatSound(
        b.lastAction.effect ?? THEMES[b.lastAction.character].effect,
        b.lastAction.move,
      );
    }
  }, [b.lastAction]);
  const [finishedEffect,setFinishedEffect]=useState(b.lastAction?.revision ?? -1);
  useEffect(()=>{const revision=b.lastAction?.revision;if(revision === undefined || revision<=finishedEffect)return;
    const timer=setTimeout(()=>setFinishedEffect(revision),1800);return()=>clearTimeout(timer);
  },[b.lastAction?.revision,finishedEffect]);
  const boardRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    for(const actor of b.units) { const awakened={...actor,bankaiUsed:true}; if(canAnimateSignature(awakened,"signature")) void preloadAttack(animationSpec(awakened).sheet).catch(()=>{}); }
    for (const t of b.units) {
      const img = new Image();
      img.src = battlePortrait({ ...t, bankaiUsed: true });
      for(const rear of [false,true]){const image=new Image();image.src=battleSprite({...t,bankaiUsed:true},rear)}
    }
    // Preload only the starting lineup; summoned Tourgen already has its own art.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    boardRef.current?.focus({ preventScroll: true });
    boardRef.current?.scrollIntoView({ block: "start" });
  }, []);
  useEffect(()=>{
    const closeDrawers=(e:KeyboardEvent)=>{if(e.key!=="Escape")return;
      boardRef.current?.querySelectorAll<HTMLDetailsElement>(".combat-log[open],.rules[open]").forEach(node=>{node.open=false;node.querySelector<HTMLElement>("summary")?.focus();});};
    window.addEventListener("keydown",closeDrawers);return()=>window.removeEventListener("keydown",closeDrawers);
  },[]);
  const u = getActiveUnit(b),
    automatic = isAutomaticTurn(b),
    cue = b.lastAction;
  const animate = !!cue && cue.revision > finishedEffect && !b.result && !hasCombatAnimation(cue);
  const canAct =
    !!u &&
    !b.result &&
    !automatic &&
    !awakeningLocked &&
    !combatRunning &&
    !paused &&
    !busy &&
    (controller === "both" || controller === u.side);
  const pending = selection?.revision === b.revision ? selection : null;
  const options = u ? abilities(b, u) : [],
    selected = options.find((a) => a.move === pending?.move);
  const targets = u && pending ? legalTargets(b, u, pending.move) : [];
  const observed = b.units.find((t) => t.id === inspected);
  const forecastMove = pending?.move ?? hoverMove;
  const forecastAbility = options.find((a) => a.move === forecastMove);
  useEffect(() => {
    if (!pending) return;
    const cancel = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelection(null);
    };
    window.addEventListener("keydown", cancel);
    return () => window.removeEventListener("keydown", cancel);
  }, [pending]);
  const areaForecast =
    forecastMove &&
      forecastAbility?.targeting === "none" &&
      (!forecastAbility.choices || pending?.choice)
      ? previewMove(b, { move: forecastMove, choice: pending?.choice })
      : null;
  function act(cmd: Command) {
    if (!canAct) return;
    setSelection(null);
    setHoverMove(null);
    onAction(cmd);
  }
  function card(t: Unit) {
    const attunement = claimFor(b, t);
    const theme = THEMES[t.character],
      outcome = animate ? cue?.outcomes.find((x) => x.id === t.id) : undefined;
    const cast = animate && cue?.actor === t.id && !["guard","switch","attune"].includes(cue.move);
    const impact =
      animate && ((outcome?.hpChange ?? 0) < 0 || cue?.targets.includes(t.id));
    const canTarget =
      canAct && targets.some((x) => x.id === t.id) && t.id !== pending?.target;
    const prediction =
      canAct &&
        forecastMove &&
        forecastAbility?.targeting === "enemy" &&
        legalTargets(b, u!, forecastMove).some((x) => x.id === t.id)
        ? previewMove(b, {
          move: forecastMove,
          target: pending?.target ?? t.id,
          ...(pending?.target && pending.target !== t.id
            ? { secondary: t.id }
            : {}),
        })
        : null;
    const delta = prediction?.changes.find((x) => x.id === t.id);
    const retaliation =
      prediction?.changes.find((x) => x.id === u?.id)?.hp ?? 0;
    const blocked = t.phaseUntil
      ? "Phased: attack negated"
      : t.mantleUntil
        ? "Destruction mantle: attack negated"
        : t.dodgeUntil &&
          u &&
          !coreMoves(u, b.arena).find((m) => m.move === forecastMove)?.area
          ? "Evasion: attack dodged"
          : "";
    const restriction =
      pending && t.side !== u?.side
        ? t.hp <= 0
          ? "Defeated"
          : t.prison
            ? "Imprisoned"
            : t.invisibleUntil
              ? "Invisible: area attacks only"
              : ""
        : "";
    const state =
      t.hp <= 0
        ? "DEFEATED"
        : t.prison
          ? "EXILED"
          : t.id === b.active
            ? "YOUR MOVE"
            : `SPD ${speed(b, t)}`;
    return (
      <button
        type="button"
        key={t.id}
        data-unit-id={t.id}
        style={colorStyle(theme.color)}
        className={`unit ${t.bankaiUsed ? "released-form" : ""} ${t.side} ${t.id === b.active ? "current" : ""} ${canTarget || prediction ? "targetable" : ""} ${pending?.target === t.id ? "primary-target" : ""} ${t.hp <= 0 ? "fallen" : t.hp / t.maxHp <= 0.3 ? "wounded" : "alive-unit"} ${t.prison ? "exiled" : ""} ${t.invisibleUntil ? "invisible-unit" : ""} ${t.phaseUntil ? "phased-unit" : ""} ${t.mantleUntil ? "mantle-unit" : ""}`}
        aria-pressed={inspected === t.id}
        onClick={() => {
          if (!pending || !canTarget) {
            setInspected(t.id);
            return;
          }
          if (selected?.secondary && !pending.target && targets.length > 1)
            setSelection({ ...pending, target: t.id });
          else
            act({
              move: pending.move,
              target: pending.target ?? t.id,
              ...(pending.target ? { secondary: t.id } : {}),
            });
        }}
        aria-label={`${t.name}, Player ${t.side === "player" ? 1 : 2}, ${t.hp} of ${t.maxHp} HP${canTarget ? ", select target" : ", inspect character"}`}
      >
        <div className="unit-art">
          <img className="fighter-sprite" src={viewport && !b.result ? battleSprite(t,t.side===nearSide) : battlePortrait(t)} alt={t.name} />
          {viewport && !b.result && <img className="fighter-reflection" src={battleSprite(t,t.side===nearSide)} alt="" aria-hidden="true"/>}
          <div className="portrait-shade" />
          <CharacterPresence unit={t} deaths={b.deadIds.length} />
          {animate &&
            cue?.reactions
              ?.filter((r) => r.id === t.id)
              .map((r) => (
                <DefensiveReaction
                  key={`${cue.revision}-${r.kind}`}
                  kind={r.kind}
                  portrait={battlePortrait(t)}
                />
              ))}
          <span className="unit-state">{state}</span>
          <span className="character-sigil" aria-hidden="true">
            <Sigil kind={theme.effect} />
          </span>
          <div className="portrait-caption">
            <small>{theme.title}</small>
            <h3>{t.name}</h3>
          </div>
          {t.character === "tourgen" && (
            <span className="pet-label">TOURGEN · EQUAL PARTNER</span>
          )}
          {t.character === "hanibal" && t.skyOpen && (
            <div className="sky-eyes" aria-label={`${t.eyes} of 5 eyes open`}>
              {[1, 2, 3, 4, 5].map((i) => (
                <i key={i} className={i <= t.eyes ? "open" : ""} />
              ))}
            </div>
          )}
          {cast && (
            <div
              key={`cast-${cue.revision}`}
              className={`cast-aura fx-${cue.effect ?? THEMES[cue.character].effect} ${cue.move === "bankai" ? "ultimate-aura" : ""}`}
              aria-hidden="true"
            />
          )}
          {impact && (
            <div
              key={`hit-${cue.revision}`}
              className={`impact-effect fx-${cue.effect ?? THEMES[cue.character].effect}`}
              aria-hidden="true"
            >
              <i />
              <i />
              <i />
            </div>
          )}
          {impact &&
            cue.effect === "ruin" &&
            outcome &&
            outcome.hpChange < 0 && (
              <div
                key={`ruin-${cue.revision}`}
                className="ruin-silhouette"
                aria-hidden="true"
              >
                {[0, 1, 2, 3, 4].map((i) => (
                  <img
                    key={i}
                    src={battlePortrait(t)}
                    alt=""
                    style={{ "--strip": i } as CSSProperties}
                  />
                ))}
              </div>
            )}
          {impact && (
            <AttackEffect
              key={`signature-${cue.revision}`}
              effect={cue.effect ?? THEMES[cue.character].effect}
            />
          )}
          {outcome && (
            <span
              key={`float-${cue?.revision}`}
              aria-hidden="true"
              className={`floating-number ${outcome.hpChange > 0 ? "healing" : outcome.hpChange < 0 ? "damage" : "shield-gain"}`}
            >
              {outcome.hpChange
                ? `${outcome.hpChange > 0 ? "+" : ""}${outcome.hpChange} HP`
                : outcome.barrierChange > 0
                  ? `+${outcome.barrierChange} SHIELD`
                  : "SHIELD HIT"}
            </span>
          )}
          {t.charge && (
            <div className="charge-line">
              <span />
              GATHERING POWER
            </div>
          )}
        </div>
        <div className="unit-content">
          <div className="stage-hud-name"><img src={battlePortrait(t)} alt=""/><strong>{t.name}</strong></div>
          <div className="health-label">
            <span>VITALITY</span>
            <strong>
              {t.hp}
              <small> / {t.maxHp}</small>
            </strong>
          </div>
          <div
            className="health-track"
            role="progressbar"
            aria-label={`${t.name} health`}
            aria-valuemin={0}
            aria-valuemax={t.maxHp}
            aria-valuenow={t.hp}
          >
            <div style={{ width: `${(100 * t.hp) / t.maxHp}%` }} />
          </div>
          {
            <>
              <div className="resource-row">
                <span
                  className="energy-pips"
                  aria-label={`${t.energy} of 5 energy`}
                >
                  {[1, 2, 3, 4, 5].map((i) => (
                    <i className={i <= t.energy ? "filled" : ""} key={i} />
                  ))}
                </span>
                <small>
                  {t.character === "hanibal"
                    ? `${t.eyes}/5 EYES`
                    : t.bankaiUsed
                      ? "BANKAI ACTIVE"
                      : `${t.awakening}% AWAKENING`}
                </small>
              </div>
              {t.character !== "hanibal" && (
                <div
                  className={`awakening-track ${t.awakening >= 100 ? "ready" : ""}`}
                  aria-label={`${t.name} Awakening ${t.awakening}`}
                >
                  <div
                    style={{ width: `${t.bankaiUsed ? 100 : t.awakening}%` }}
                  />
                </div>
              )}
            </>
          }
          {attunement && <span className="attuning-label">◇ ATTUNING · {HEART_BREAK - attunement.damage} HP damage to interrupt</span>}
          <div className="statuses">
            {statuses(t).map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
          {prediction && (
            <span className="damage-forecast">
              {blocked || (delta?.hp ? `${delta.hp} HP` : "0 HP damage")}
              {delta?.barrier ? ` · ${delta.barrier} barrier` : ""}
              {delta?.statuses.length ? ` · ${delta.statuses.join(", ")}` : ""}
              {retaliation < 0 ? ` · Attacker takes ${-retaliation} HP` : ""}
              {delta?.defeated ? " · DEFEAT" : ""}
            </span>
          )}
          {restriction && (
            <span className="target-restriction">{restriction}</span>
          )}
          {canTarget && (
            <span className="target-label">
              {pending?.target ? "＋ SECOND TARGET" : "◎ SELECT TARGET"}
            </span>
          )}
          {pending?.target === t.id && (
            <span className="target-label">PRIMARY TARGET LOCKED</span>
          )}
        </div>
      </button>
    );
  }
  return (
    <div
      className={`battle-experience ${combatRunning ? "has-sprite-cue" : ""} ${viewport && !b.result ? "viewport-battle stage-battle" : ""} ${fullArt ? "full-art" : "compact-battle"} ${b.result ? "is-finished" : ""}`}
      ref={boardRef}
      style={{"--arena-image":`url(${b.arena === "soul-society" ? "/stage/eclipse.png" : `/arenas/${b.arena}.webp`})`,"--world-saturation":worldState(b).saturation} as CSSProperties}
      tabIndex={-1}
    >
      <div className="viewport-backdrop" aria-hidden="true"/>
      {b.result && <Victory battle={b} />}
      <section className={`arena-banner arena-${b.arena}`}>
        <ArenaScene id={b.arena} />
        <div>
          <p className="eyebrow">{arenaInfo(b.arena).subtitle}</p>
          <h2>{arenaInfo(b.arena).name}</h2>
          <p>{arenaInfo(b.arena).description}</p>
        </div>
      </section>
      <section className="battle-title">
        <span className="stage-wordmark">ASHBOUND</span>
        <SoundControls expanded={viewport} onRoom={()=>setViewport(!viewport)} view={`Player ${nearSide==='player'?1:2}`} onView={controller==='both'?()=>{setLocalView(farSide);setSelection(null);setHoverMove(null)}:undefined}/>
        <button
          className="art-density"
          aria-pressed={fullArt}
          onClick={() => setFullArt(!fullArt)}
        >
          {fullArt ? "Compact battlefield" : "Full artwork"}
        </button>
        <div>
          <p className="eyebrow">THE ASHEN ARENA</p>
          <h2>
            {b.result
              ? b.result === "draw"
                ? "A world without victors"
                : `Player ${b.result === "player" ? 1 : 2} prevails`
              : "Three souls. One victory."}
          </h2>
        </div>
        <span className="round-seal">
          <small>ROUND</small>
          <strong>{String(b.round).padStart(2, "0")}</strong>
        </span>
      </section>
      <div className="initiative" aria-label="Turn order">
        <span className="eyebrow">INITIATIVE</span>
        {[b.active, ...b.queue].map((id) => {
          const t = b.units.find((x) => x.id === id);
          return t && t.hp > 0 ? (
            <div
              key={id}
              className={`initiative-unit ${id === b.active ? "now" : ""}`}
            >
              <img src={battlePortrait(t)} alt="" />
              <span>
                P{t.side === "player" ? 1 : 2} · {t.name}
                {t.prison ? " (exiled)" : ""}
              </span>
            </div>
          ) : null;
        })}
      </div>
      <ArenaHeart battle={b} onInspect={setInspected} nearSide={nearSide} />
      <div className="arena-layout">
        <div
          className="arena-field"
          ref={setField}
          style={
            {
              "--arena-image": `url(${b.arena === "soul-society" ? "/stage/eclipse.png" : `/arenas/${b.arena}.webp`})`,
              "--world-saturation": worldState(b).saturation,
            } as CSSProperties
          }
        >
          {combatRunning && combatDeadline && authoritative.lastAction && <CombatSpriteLayer cue={authoritative.lastAction} deadline={combatDeadline} field={field} nearSide={nearSide}/>}
          <LivingBattlefield battle={b} />
          <ArenaAtmosphere arena={b.arena} />
          {animate &&
            cue &&
            ["skill1", "skill2"].includes(cue.move) &&
            b.units.some((t) => t.id === cue.actor && t.bankaiUsed) && (
              <div
                key={`cut-${cue.revision}`}
                className={`signature-cut-in cut-${cue.effect}`}
                aria-hidden="true"
              >
                <img
                  src={battlePortrait(b.units.find((t) => t.id === cue.actor)!)}
                  alt=""
                />
                <div>
                  <small>RELEASED POWER</small>
                  <strong>{cue.name}</strong>
                </div>
              </div>
            )}

          {animate && cue && (
            <CombatLinks key={cue.revision} cue={cue} field={field} />
          )}
          {[farSide, nearSide].map((side, index) => (
            <section key={side} className={`team-section side-${side} ${side === nearSide ? "near-team" : "far-team"}`}>
              <div className="team-heading">
                <span className="team-label">
                  PLAYER {side === "player" ? 1 : 2}{" "}
                  {controller === side ? "· YOUR TEAM" : ""}
                </span>
                <small>
                  {
                    b.units.filter(
                      (t) =>
                        t.side === side &&
                        t.hp > 0 &&
                        t.character !== "tourgen",
                    ).length
                  }
                  /3 STANDING
                </small>
              </div>
              <div className="team" style={{gridTemplateColumns:`repeat(${b.units.filter(t=>t.side === side).length},minmax(0,1fr))`}}>
                {b.units.filter(t=>t.side === side).map(card)}
              </div>
              {index === 0 && (
                <div
                  className="clash-strip"
                  style={colorStyle(
                    cue ? THEMES[cue.character].color : "#c5a879",
                  )}
                >
                  <span className="clash-ornament" aria-hidden="true">
                    ◇
                  </span>
                  <div
                    key={cue ? `${cue.revision}-${cue.actor}` : "opening"}
                    className={animate ? "action-announcement" : ""}
                  >
                    <small>
                      {cue
                        ? `${b.units.find((t) => t.id === cue.actor)?.name} · ${cue.move === "bankai" ? (cue.character === "hanibal" ? "FIVE EYES" : "BANKAI") : "LAST ACTION"}`
                        : "THE BATTLE BEGINS"}
                    </small>
                    <strong>{cue?.name ?? "Let your resolve burn."}</strong>
                    {cue?.messages?.length ? (
                      <span className="action-explanation" role="status">
                        {cue.messages.slice(0, 2).join(" ")}
                      </span>
                    ) : null}
                  </div>
                  <span className="clash-ornament" aria-hidden="true">
                    ◇
                  </span>
                </div>
              )}
            </section>
          ))}
        </div>
        {observed && (
          <StatusInspector
            battle={b}
            unit={observed}
            onClose={() => setInspected(null)}
          />
        )}
        <aside className="command-column">
          {!b.result ? (
            <section
              className="panel controls"
              style={colorStyle(u ? THEMES[u.character].color : "#c5a879")}
            >
              <div className="commander">
                {u && <img src={battlePortrait(u)} alt="" />}
                <div>
                  <p className="eyebrow" aria-live="polite">
                    {awakeningLocked ? "Cinematic playing… Battle resumes after the release." : paused
                      ? "BATTLE PAUSED"
                      : automatic
                        ? "AUTOMATIC TURN"
                        : canAct
                          ? "YOUR COMMAND"
                          : "OPPONENT’S TURN"}
                  </p>
                  <h2>{u?.name}</h2>
                  <small className="heritage-label">
                    {u ? heritage(u.character) : ""}
                  </small>
                  <span className="muted">
                    {busy
                      ? "Sending action…"
                      : u
                        ? `${u.energy}/5 energy · Player ${u.side === "player" ? 1 : 2}`
                        : ""}
                  </span>
                </div>
              </div>
              {canAct && u ? (
                <>
                  <div className="ability-readout" aria-live="polite">
                    <strong>
                      {forecastAbility?.name ?? "Choose your technique"}
                    </strong>
                    <span>
                      {forecastAbility?.description ??
                        "Select an attack to see its effects. Click a character to inspect their status."}
                    </span>
                  </div>
                  <div className="actions">
                    {options.map((a, index) => {
                      const noTarget =
                        a.targeting === "enemy" &&
                        !legalTargets(b, u, a.move).length;
                      return (
                        <div
                          className={`action-wrap move-${a.move}`}
                          key={a.move}
                        >
                          <button
                            type="button"
                            disabled={!!a.disabled || noTarget || (!!a.choices && a.move !== "switch")}
                            className={
                              pending?.move === a.move ? "selected" : ""
                            }
                            onMouseEnter={() => setHoverMove(a.move)}
                            onMouseLeave={() => setHoverMove(null)}
                            onFocus={() => setHoverMove(a.move)}
                            onBlur={() => setHoverMove(null)}
                            title={a.description}
                            onClick={() => {
                              if(a.move === "switch"){setEchoRevision(b.revision);return;}
                              if (a.targeting === "enemy") {
                                setSelection({
                                  revision: b.revision,
                                  move: a.move,
                                });
                                if (!viewport && window.innerWidth <= 850)
                                  boardRef.current
                                    ?.querySelector(".arena-field")
                                    ?.scrollIntoView({ block: "start" });
                              } else if (
                                a.move === "attune" || coreMoves(u, b.arena).find(
                                  (m) => m.move === a.move,
                                )
                              ) {
                                setSelection({
                                  revision: b.revision,
                                  move: a.move,
                                });
                              } else act({ move: a.move });
                            }}
                          >
                            <span className="technique-icon" aria-hidden="true"><Sigil kind={a.move === "guard" ? "shield" : a.move === "bankai" ? "awakening" : a.move === "attack" ? "rift" : THEMES[u.character].effect}/></span>
                            <span className="action-index" aria-hidden="true">
                              {String(index + 1).padStart(2, "0")}
                            </span>
                            <div>
                              <small>
                                {a.move === "bankai"
                                  ? u.character === "hanibal"
                                    ? "FIVE EYES · ONCE"
                                    : "BANKAI · 100 AWAKENING"
                                  : a.move === "switch"
                                    ? "FREE SWITCH"
                                    : `${a.cost} ENERGY · REST ${a.rest}`}
                              </small>
                              <strong>{a.name}</strong>
                              <small className="origin-label">
                                {a.origin?.toUpperCase()}
                              </small>
                              <span>{a.description}</span>
                              {(a.disabled || noTarget) && (
                                <em>{a.disabled ?? "No visible targets"}</em>
                              )}
                            </div>
                          </button>
                          {a.move !== "switch" && (
                            a.choices && (
                              <div className="choice-row">
                                {a.choices.map((c) => (
                                  <button
                                    type="button"
                                    className="secondary"
                                    key={c.id}
                                    disabled={
                                      !!a.disabled ||
                                      (a.move === "switch" &&
                                        `${u.style}:${u.copiedMove}` === c.id)
                                    }
                                    onClick={() =>
                                      setSelection({
                                        revision: b.revision,
                                        move: a.move,
                                        choice: c.id,
                                      })
                                    }
                                  >
                                    {c.name}
                                  </button>
                                ))}
                              </div>
                            )
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="forecast-slot">
                  {areaForecast && (
                    <div className="area-forecast" aria-live="polite">
                      <strong>Immediate action preview</strong>
                      {areaForecast.changes.map((x) => (
                        <span key={x.id}>
                          {x.name}:{" "}
                          {x.hp ? `${x.hp > 0 ? "+" : ""}${x.hp} HP` : ""}{" "}
                          {x.barrier
                            ? `${x.barrier > 0 ? "+" : ""}${x.barrier} barrier`
                            : ""}{" "}
                          {x.statuses.join(", ")}
                        </span>
                      ))}
                      {!areaForecast.changes.length && (
                        <span>
                          {areaForecast.messages.join(" ") ||
                            forecastAbility?.description}
                        </span>
                      )}
                    </div>
                  )}
                  </div>
                  <div className="decision-slot">
                  {pending && (
                    <div className="target-prompt" role="status">
                      <span>
                        {selected?.targeting === "none"
                          ? "Review the affected characters, then confirm."
                          : pending.target
                            ? "Choose a second target or finish with one hit."
                            : `${selected?.name}: choose a highlighted opponent.`}
                      </span>
                      <div className="button-row">
                        {selected?.targeting === "none" && (
                          <button
                            type="button"
                            className="primary"
                            onClick={() =>
                              act({
                                move: pending.move,
                                choice: pending.choice,
                              })
                            }
                          >
                            Confirm {selected.name}
                          </button>
                        )}
                        {pending.target && (
                          <button
                            type="button"
                            className="primary"
                            onClick={() =>
                              act({
                                move: pending.move,
                                target: pending.target,
                              })
                            }
                          >
                            Only primary target
                          </button>
                        )}
                        <button
                          type="button"
                          className="secondary"
                          onClick={() => setSelection(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                  </div>
                </>
              ) : (
                <div className="waiting-command">
                  <span aria-hidden="true">◇</span>
                  <p>
                    {awakeningLocked ? "Cinematic playing… Battle resumes after the release." : paused
                      ? "Waiting for both players to connect."
                      : automatic
                        ? "A move is being prepared…"
                        : "Watch the field. Your next move matters."}
                  </p>
                </div>
              )}
            </section>
          ) : null}
          <details className="panel combat-log">
            <summary>Battle chronicle · {b.log.length} recent events</summary>
            <div className="section-title">
              <h3>Battle chronicle</h3>
              <span className="eyebrow">NEWEST FIRST</span>
            </div>
            <div className="log-entries" aria-live="polite">
              {b.log.map((text, i) => (
                <p
                  key={`${b.revision}-${i}`}
                  className={
                    text.startsWith("ROUND")
                      ? "log-round"
                      : text.includes(" — ")
                        ? "log-action"
                        : ""
                  }
                >
                  {text}
                </p>
              ))}
            </div>
          </details>
        </aside>
      </div>
      {echoRevision===b.revision && canAct && u && <EchoChooser current={`${u.style}:${u.copiedMove}`} choices={options.find(a=>a.move==='switch')?.choices??[]} onClose={()=>setEchoRevision(null)} onChoose={choice=>{setEchoRevision(null);act({move:'switch',choice})}}/>}
      <SignatureFilm battle={b}/>
      <Awakening battle={b} />
      <Rules />
    </div>
  );
}
