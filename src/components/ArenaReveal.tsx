import { useEffect, useState } from "react";
import { battlePortrait } from "../game/media";
import { ARENAS, arenaInfo, heritage } from "../game/arenas";
import type { Battle, ArenaId } from "../game/types";
export function ArenaScene({ id }: { id: ArenaId }) {
  return (
    <img
      className="arena-scene"
      src={`/arenas/${id}.webp`}
      alt=""
      aria-hidden="true"
    />
  );
}
export default function ArenaReveal({
  battle,
  ready = false,
  connected = true,
  onReady,
}: {
  battle: Battle;
  ready?: boolean;
  connected?: boolean;
  onReady: () => void;
}) {
  const [settled, setSettled] = useState(() => {
    try {
      return (
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        localStorage.getItem("ashbound-effects") === "off"
      );
    } catch {
      return true;
    }
  });
  useEffect(() => {
    const timer = setTimeout(() => setSettled(true), 3200);
    return () => clearTimeout(timer);
  }, []);
  const arena = arenaInfo(battle.arena);
  return (
    <section
      className={`panel arena-reveal ${settled ? "settled" : "rolling"}`}
      aria-label="Arena reveal"
    >
      <p className="eyebrow">BOTH TEAMS LOCKED · FATE CHOOSES THE FIELD</p>
      <h2>{settled ? arena.name : "Where will your souls clash?"}</h2>
      <div className="arena-choices">
        {ARENAS.map((a, i) => (
          <div
            key={a.id}
            className={`arena-choice ${a.id === arena.id ? "chosen" : ""}`}
            style={{ animationDelay: `${i * 0.22}s` }}
          >
            <ArenaScene id={a.id} />
            <strong>{a.name}</strong>
          </div>
        ))}
      </div>
      <div className="arena-outcome" aria-live="polite">
        {settled ? (
          <>
            <p className="eyebrow">{arena.subtitle}</p>
            <p>{arena.description}</p>
            <p className="heart-result">{battle.heart ? "ARENA HEART · From round 2, channel 3 seals to win—or defeat every opponent. Protect your bearer; interrupt theirs." : "ELIMINATION · Defeat the opposing team."}</p>
            <p className="versus-heading">
              PLAYER 1 <b>VS</b> PLAYER 2
            </p>
            <div className="arena-lineups versus-lineups">
              {(["player", "enemy"] as const).map((side) => (
                <div key={side}>
                  <strong>Player {side === "player" ? 1 : 2}</strong>
                  {battle.units
                    .filter((u) => u.side === side)
                    .map((u) => (
                      <p key={u.id}>
                        <img src={battlePortrait(u)} alt="" />
                        <strong>{u.name}</strong>
                        <small>{heritage(u.character)}</small>
                      </p>
                    ))}
                </div>
              ))}
            </div>
          </>
        ) : (
          <p>Drawing one shared arena for this match…</p>
        )}
      </div>
      <button
        type="button"
        className="primary"
        disabled={!settled || ready || !connected}
        onClick={onReady}
      >
        {ready
          ? "Ready — waiting for opponent"
          : !connected
            ? "Reconnecting…"
            : settled
              ? "Enter arena"
              : "Revealing arena…"}
      </button>
    </section>
  );
}
