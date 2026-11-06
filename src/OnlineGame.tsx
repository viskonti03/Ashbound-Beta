import { RulePicker } from "./components/ArenaHeart";
import ArenaReveal from "./components/ArenaReveal";
import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import type { Pick } from "./game/types";
import type { RoomSession, RoomView } from "./game/online";
import { SESSION_KEY } from "./game/online";
import { character, portrait, validPicks } from "./game/roster";
import RosterPicker from "./components/RosterPicker";
import BattleBoard from "./components/BattleBoard";
// In development, Vite proxies /socket.io. In production, use the Render URL.
const serverUrl = import.meta.env.VITE_SERVER_URL?.trim();
const missingProductionServer = import.meta.env.PROD && !serverUrl;

function saved(): RoomSession | null {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) ?? "null");
  } catch {
    return null;
  }
}
function Lobby({
  room,
  busy,
  send,
}: {
  room: RoomView;
  busy: boolean;
  send: (event: string, data: unknown) => void;
}) {
  const [picks, setPicks] = useState<Pick[]>(() =>
    structuredClone(room.picks[room.side]),
  );
  const opponent = room.side === "player" ? "enemy" : "player",
    locked = room.locked[room.side];
  const dirty = JSON.stringify(picks) !== JSON.stringify(room.picks[room.side]);
  return (
    <>
      <details className="lobby-rules"><summary>Match rules · {room.rules === "arena-heart" ? "Arena Heart" : "Elimination"}</summary>
      <RulePicker value={room.rules} disabled={busy || room.side !== "player"} onChange={rules => send("room:rules", { rules, version: room.version })} />
      <p className="muted">{room.side === "player" ? "You choose the rules. Changing them unlocks both teams so everyone can review." : "The host chooses the rules. Review them before locking your team."}</p>
      </details>
      <RosterPicker
        label="Your team"
        picks={picks}
        onChange={setPicks}
        disabled={busy || locked}
      />
      <div className="panel button-row ready-dock">
        <button
          className="secondary"
          disabled={busy || locked || !dirty || !validPicks(picks)}
          onClick={() =>
            send("roster:update", { picks, version: room.version })
          }
        >
          Save team
        </button>
        <button
          className="primary"
          disabled={
            busy ||
            dirty ||
            (!locked &&
              (!validPicks(picks) ||
                !room.connected.player ||
                !room.connected.enemy))
          }
          onClick={() =>
            send("roster:lock", { version: room.version, locked: !locked })
          }
        >
          {locked ? "Unlock team" : "Lock team & ready"}
        </button>
        <span className="muted">
          {dirty
            ? "Save your changes before locking."
            : locked
              ? "Waiting for the other player to lock."
              : "Both teams lock to begin."}
        </span>
      </div>
      <details className="panel opponent-drawer">
        <summary>Opponent’s team · {room.locked[opponent] ? "Locked" : "Choosing"} · {room.picks[opponent].length}/3</summary>
        <h2>Opponent’s team</h2>
        <p className="eyebrow">
          {room.locked[opponent] ? "LOCKED" : "CHOOSING"}
        </p>
        <div className="team-slots">
          {room.picks[opponent].length === 0 && (
            <p className="muted">No characters selected yet.</p>
          )}
          {room.picks[opponent].map((p) => (
            <div className="slot" key={p.character}>
              <img src={portrait(p.character)} alt="" />
              <span>
                {character(p.character).name}
                <small>{p.styles?.join(" / ")}</small>
              </span>
            </div>
          ))}
        </div>
      </details>
    </>
  );
}
export default function OnlineGame() {
  const ref = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false),
    [room, setRoom] = useState<RoomView | null>(null),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [code, setCode] = useState("");
  useEffect(() => {
    if (missingProductionServer) return;
    const s = io(serverUrl || undefined, { autoConnect: false });
    ref.current = s;
    const clear = (text: string) => {
      try {
        sessionStorage.removeItem(SESSION_KEY);
      } catch {
        /* storage optional */
      }
      setRoom(null);
      setBusy(false);
      setMessage(text);
    };
    s.on("connect", () => {
      setConnected(true);
      setMessage("");
      const session = saved();
      setBusy(!!session);
      if (session) s.emit("room:resume", session);
    });
    s.on("disconnect", () => {
      setConnected(false);
      setBusy(false);
      setMessage("Disconnected. Reconnecting…");
    });
    s.on("connect_error", () => {
      setBusy(false);
      setMessage(
        import.meta.env.DEV
          ? "Cannot reach the local game server. Run npm run server in a second terminal."
          : "Cannot reach the multiplayer server. Check the Render service and its CLIENT_ORIGINS setting.",
      );
    });
    s.on("room:session", (session: RoomSession) => {
      try {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
      } catch {
        setMessage("Storage unavailable: refreshing may lose your seat.");
      }
    });
    s.on("room:state", (view: RoomView) => {
      const deadline=view.battle?.cinematicUntil;
      setRoom(deadline && view.serverNow ? {...view,battle:{...view.battle!,cinematicUntil:deadline>view.serverNow ? Date.now()+deadline-view.serverNow : undefined}} : view);
      setBusy(false);
    });
    s.on("room:error", (text: string) => {
      setBusy(false);
      setMessage(text);
    });
    s.on("room:expired", () =>
      clear("Room expired. Create or join a new room."),
    );
    s.on("room:closed", clear);
    s.connect();
    return () => {
      s.removeAllListeners();
      s.disconnect();
      ref.current = null;
    };
  }, []);
  function send(event: string, data?: unknown) {
    if (!ref.current?.connected || busy) return;
    setBusy(true);
    setMessage("");
    ref.current.emit(event, data);
  }
  const both = !!room?.connected.player && !!room?.connected.enemy,
    b = room?.battle;
  return (
    <main className="game">
      <header className="header">
        <div>
          <p className="eyebrow">PRIVATE ONLINE BATTLES</p>
          <h1>
            ASHBOUND<span>.</span>
          </h1>
        </div>
        <span className="badge">{missingProductionServer ? "SETUP NEEDED" : connected ? "CONNECTED" : "CONNECTING"}</span>
      </header>
      {missingProductionServer && (
        <p className="panel" role="alert">
          Online play needs VITE_SERVER_URL set to your Render server URL in
          Vercel's environment variables. Redeploy the frontend after setting it.
        </p>
      )}
      {message && (
        <p className="panel" role="status">
          {message}
        </p>
      )}
      {!room ? (
        <section className="panel">
          <h2>Challenge a friend</h2>
          <p className="muted">
            Create a private room, share its code, and choose your teams.
          </p>
          <button
            className="primary"
            disabled={!connected || busy}
            onClick={() => send("room:create")}
          >
            Create room
          </button>
          <form
            className="button-row join-form"
            onSubmit={(e) => {
              e.preventDefault();
              send("room:join", code);
            }}
          >
            <input
              aria-label="Room code"
              placeholder="ROOM CODE"
              value={code}
              maxLength={8}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
            />
            <button
              className="secondary"
              disabled={!connected || busy || code.trim().length !== 8}
            >
              Join room
            </button>
          </form>
        </section>
      ) : (
        <>
          <details className="panel room-details">
            <summary>Room {room.code} · Player {room.side === "player" ? 1 : 2} · {both ? "Both connected" : "Waiting for opponent"}</summary>
            <div className="section-title">
              <div>
                <p className="eyebrow">ROOM CODE · SHARE WITH YOUR FRIEND</p>
                <h2 className="room-code">{room.code}</h2>
              </div>
              <span className="badge">
                YOU ARE PLAYER {room.side === "player" ? 1 : 2}
              </span>
            </div>
            <p className="muted">
              Player 1: {room.connected.player ? "Connected" : "Disconnected"} ·
              Player 2:{" "}
              {!room.joined
                ? "Waiting to join"
                : room.connected.enemy
                  ? "Connected"
                  : "Disconnected"}
            </p>
            {!both && (
              <p role="status">
                Waiting for both players. Refreshing this tab restores your seat
                while the server is running.
              </p>
            )}
            <button
              className="secondary"
              disabled={!connected || busy}
              onClick={() => {
                if (window.confirm("Close this room for both players?"))
                  send("room:close");
              }}
            >
              Close room
            </button>
          </details>
          {room.phase === "selection" ? (
            <Lobby
              key={
                JSON.stringify(room.picks[room.side]) + room.locked[room.side]
              }
              room={room}
              busy={busy || !connected}
              send={send}
            />
          ) : room.phase === "reveal" && b ? (
            <ArenaReveal
              key={b.turn}
              battle={b}
              ready={room.arenaReady[room.side]}
              connected={connected && !busy}
              onReady={() => send("arena:ready", { turn: b.turn })}
            />
          ) : (
            b && (
              <>
                <BattleBoard
                  battle={b}
                  controller={room.side}
                  paused={!connected || !both}
                  busy={busy}
                  onAction={(cmd) =>
                    send("battle:move", {
                      ...cmd,
                      turn: b.turn,
                      revision: b.revision,
                    })
                  }
                />
                {b.result && (
                  <section className="panel result">
                    <h2>
                      {b.result === "draw"
                        ? "DRAW"
                        : b.result === room.side
                          ? "VICTORY"
                          : "DEFEAT"}
                    </h2>
                    <p>
                      Both players agree to return to roster selection for a
                      rematch.
                    </p>
                    <div className="button-row">
                      <button
                        className="primary"
                        disabled={!both || busy || room.rematch[room.side]}
                        onClick={() =>
                          send("battle:rematch", { turn: b.turn, accept: true })
                        }
                      >
                        {room.rematch[room.side]
                          ? "Rematch requested"
                          : room.rematch[
                            room.side === "player" ? "enemy" : "player"
                          ]
                            ? "Accept rematch"
                            : "Request rematch"}
                      </button>
                      {room.rematch[room.side] && (
                        <button
                          className="secondary"
                          disabled={busy || !connected}
                          onClick={() =>
                            send("battle:rematch", {
                              turn: b.turn,
                              accept: false,
                            })
                          }
                        >
                          Cancel request
                        </button>
                      )}
                    </div>
                  </section>
                )}
              </>
            )
          )}
        </>
      )}
      <footer>
        Cinematic edition · Server-authoritative battles · Rooms reset when the
        server restarts
      </footer>
    </main>
  );
}
