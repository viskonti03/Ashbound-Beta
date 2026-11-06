import { SIGNATURE_MS } from "./game/signatures";
import { awakeningDuration } from "./game/awakeningVoices";
import { RulePicker } from "./components/ArenaHeart";
import type { RuleSet } from "./game/types";
import ArenaReveal from "./components/ArenaReveal";
import { randomArena } from "./game/arenas";
import { useEffect, useState } from "react";
import RosterPicker from "./components/RosterPicker";
import BattleBoard from "./components/BattleBoard";
import { battleReducer, isAutomaticTurn, newBattle } from "./game/engine";
import { validPicks } from "./game/roster";
import type { Battle, Command, GameMode, Teams } from "./game/types";
export default function OfflineGame() {
  const [step,setStep] = useState<"setup"|"player"|"enemy">("setup");
  const [rules, setRules] = useState<RuleSet>("arena-heart");
  const [mode, setMode] = useState<GameMode>("practice");
  const [teams, setTeams] = useState<Teams>(() => ({
    player: [],
    enemy: [],
  }));
  const [revealing, setRevealing] = useState(false);
  const [battle, setBattle] = useState<Battle | null>(null);
  useEffect(() => {
    if (!battle || revealing || !isAutomaticTurn(battle)) return;
    const { turn, revision } = battle;
    const timer = setTimeout(
      () =>
        setBattle((b) =>
          b ? (()=>{const next=battleReducer(b,{type:"ai",turn,revision});
            if(next !== b && ["bankai","signature"].includes(next.lastAction?.move ?? "")) next.cinematicUntil=Date.now()+(next.lastAction?.move === "bankai"?awakeningDuration(next.lastAwakening!.character):SIGNATURE_MS);
            return next;})() : null,
        ),
      Math.max(750, (battle.cinematicUntil ?? 0) - Date.now() + 100),
    );
    return () => clearTimeout(timer);
  }, [battle, revealing]);
  function act(cmd: Command) {
    if (!battle || (battle.cinematicUntil ?? 0) > Date.now()) return;
    const { turn, revision } = battle;
    setBattle((b) =>
      b ? (()=>{const next = battleReducer(b,{type:"move",turn,revision,...cmd});
        if(next !== b && ["bankai","signature"].includes(cmd.move)) next.cinematicUntil=Date.now()+(cmd.move === "bankai"?awakeningDuration(next.lastAwakening!.character):SIGNATURE_MS);
        return next;})() : null,
    );
  }
  return (
    <main className="game">
      <header className="header">
        <div>
          <p className="eyebrow">ORIGINAL CHARACTER BATTLER</p>
          <h1>
            ASHBOUND<span>.</span>
          </h1>
        </div>
        <span className="badge">
          {mode === "practice" ? "PRACTICE" : "LOCAL DUEL"}
        </span>
      </header>
      {!battle ? (
        <div className="draft-workspace">
          <nav className="draft-tabs" aria-label="Team selection steps">
            {(["setup","player","enemy"] as const).map((tab,i)=><button key={tab} aria-current={step === tab ? "step" : undefined} onClick={()=>setStep(tab)}><small>0{i+1}</small>{tab === "setup" ? "Match rules" : tab === "player" ? `Player 1 · ${teams.player.length}/3` : `${mode === "practice" ? "Opponent" : "Player 2"} · ${teams.enemy.length}/3`}</button>)}
          </nav>
          <div key={step} className="draft-page">
          {step === "setup" ? <>
          <section className="panel">
            <h2>Choose your battlefield</h2>
            <div className="button-row">
              <button
                className={mode === "practice" ? "primary" : "secondary"}
                onClick={() => setMode("practice")}
              >
                Practice vs AI
              </button>
              <button
                className={mode === "local" ? "primary" : "secondary"}
                onClick={() => setMode("local")}
              >
                Local 2-player
              </button>
            </div>
            <p className="muted">
              Select three characters for each side. In practice, the opponent
              is controlled by AI. Local mode shares this device.
            </p>
          </section>
          <RulePicker value={rules} onChange={setRules} />
          </> : <RosterPicker label={step === "player" ? "Player 1" : mode === "practice" ? "AI opponent" : "Player 2"} picks={teams[step]} onChange={p=>setTeams({...teams,[step]:p})}/>}
          </div>
          <div className="draft-footer">
          {step !== "setup" && <button className="secondary" onClick={()=>setStep(step === "enemy" ? "player" : "setup")}>Back</button>}
          {step !== "enemy" && <button className="primary" onClick={()=>setStep(step === "setup" ? "player" : "enemy")}>{step === "setup" ? "Choose Player 1" : "Choose opponent"}</button>}
          <span>{teams.player.length}/3 vs {teams.enemy.length}/3 ready</span>
          <button
            className="primary wide start-button"
            disabled={!validPicks(teams.player) || !validPicks(teams.enemy)}
            onClick={() => {
              setBattle(newBattle(0, mode, teams, randomArena(), rules));
              setRevealing(true);
            }}
          >
            Start battle
          </button>
          </div>
        </div>
      ) : revealing ? (
        <ArenaReveal battle={battle} onReady={() => setRevealing(false)} />
      ) : (
        <>
          <div className="button-row battle-toolbar">
            <button
              className="secondary"
              onClick={() => {
                if (
                  battle.result ||
                  window.confirm(
                    "End this offline battle and return to character selection?",
                  )
                ) {
                  setTeams({ player: [], enemy: [] });
                  setBattle(null);
                }
              }}
            >
              Return to roster
            </button>
            {battle.result && (
              <button
                className="primary"
                onClick={() => {
                  setBattle(
                    newBattle(battle.turn + 1, mode, teams, randomArena(), rules),
                  );
                  setRevealing(true);
                }}
              >
                Rematch same teams
              </button>
            )}
          </div>
          <BattleBoard
            battle={battle}
            controller={mode === "practice" ? "player" : "both"}
            onAction={act}
          />
        </>
      )}
      <footer>Cinematic edition · Ten-character roster · Draft balance</footer>
    </main>
  );
}
