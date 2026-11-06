import { SIGNATURE_MS } from "../src/game/signatures";
import { awakeningDuration } from "../src/game/awakeningVoices";
import { ARENAS } from "../src/game/arenas";
import { createServer } from "node:http";
import { randomBytes, randomInt } from "node:crypto";
import { pathToFileURL } from "node:url";
import { Server, type Socket } from "socket.io";
import {
  battleReducer,
  getActiveUnit,
  isAutomaticTurn,
  newBattle,
} from "../src/game/engine";
import { validPicks } from "../src/game/roster";
import type { Battle, Command, Move, Pick, Side } from "../src/game/types";
import type { OnlineMove, RoomSession, RoomView } from "../src/game/online";

type Seat = { token: string; socketId: string | null };
type Room = {
  rules: import("../src/game/types").RuleSet;
  code: string;
  battle: Battle | null;
  phase: "selection" | "reveal" | "battle";
  seats: { player: Seat; enemy: Seat | null };
  picks: Record<Side, Pick[]>;
  locked: Record<Side, boolean>;
  arenaReady: Record<Side, boolean>;
  rematch: Record<Side, boolean>;
  touched: number;
  version: number;
  nextTurn: number;
  timer?: ReturnType<typeof setTimeout>;
};
const moves = new Set<Move>([
  "attune",
  "attack",
  "guard",
  "skill1",
  "skill2",
  "bankai",
  "signature",
  "separate",
  "release",
  "switch",
]);
export function validMove(v: unknown): v is OnlineMove {
  if (!v || typeof v !== "object") return false;
  const x = v as Record<string, unknown>;
  return (
    Number.isSafeInteger(x.turn) &&
    Number.isSafeInteger(x.revision) &&
    typeof x.move === "string" &&
    moves.has(x.move as Move) &&
    ["target", "secondary", "choice"].every(
      (k) =>
        x[k] === undefined || (typeof x[k] === "string" && x[k].length <= 80),
    )
  );
}
export function createGameServer(companionDelay = 850, awakeningDelay?: number) {
  const rooms = new Map<string, Room>(),
    members = new Map<string, { code: string; side: Side }>();
  const http = createServer((_req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Ashbound roster server is running.");
  });
  // CLIENT_ORIGINS is a comma-separated list of exact frontend origins.
  // Restrict WebSockets as well as HTTP polling to avoid permissive CORS.
  const allowedOrigins = (process.env.CLIENT_ORIGINS || "http://localhost:5173,http://127.0.0.1:5173")
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean);
  const io = new Server(http, {
    maxHttpBufferSize: 16384,
    cors: { origin: allowedOrigins, methods: ["GET", "POST"] },
    allowRequest: (req, callback) => {
      const origin = req.headers.origin;
      callback(null, !origin || allowedOrigins.includes(origin));
    },
  });
  const fail = (s: Socket, message: string) => s.emit("room:error", message);
  const connected = (r: Room) => ({
    player: !!r.seats.player.socketId,
    enemy: !!r.seats.enemy?.socketId,
  });
  const ready = (r: Room) => {
    const c = connected(r);
    return c.player && c.enemy;
  };
  function publish(r: Room) {
    for (const side of ["player", "enemy"] as const) {
      const seat = r.seats[side];
      if (!seat?.socketId) continue;
      const v: RoomView = {
        serverNow: Date.now(),
        rules: r.rules,
        code: r.code,
        side,
        phase: r.phase,
        battle: r.battle,
        connected: connected(r),
        joined: !!r.seats.enemy,
        rematch: r.rematch,
        picks: r.picks,
        locked: r.locked,
        arenaReady: r.arenaReady,
        version: r.version,
      };
      io.to(seat.socketId).emit("room:state", v);
    }
    if (
      r.phase !== "battle" ||
      r.timer ||
      !ready(r) ||
      !r.battle ||
      r.battle.result ||
      !isAutomaticTurn(r.battle)
    )
      return;
    const turn = r.battle.turn,
      revision = r.battle.revision;
    r.timer = setTimeout(() => {
      r.timer = undefined;
      if (
        rooms.get(r.code) !== r ||
        !ready(r) ||
        !r.battle ||
        r.battle.turn !== turn ||
        r.battle.revision !== revision
      )
        return;
      r.battle = battleReducer(r.battle, { type: "ai", turn, revision });
      r.touched = Date.now();
      publish(r);
    }, Math.max(companionDelay,(r.battle.cinematicUntil ?? 0)-Date.now()+50));
  }
  function attach(s: Socket, r: Room, side: Side) {
    const seat = r.seats[side]!;
    if (seat.socketId && seat.socketId !== s.id) {
      const old = seat.socketId;
      members.delete(old);
      const sock = io.sockets.sockets.get(old);
      sock?.emit("room:closed", "Your seat was opened in another connection.");
      sock?.disconnect(true);
    }
    seat.socketId = s.id;
    members.set(s.id, { code: r.code, side });
    r.touched = Date.now();
    r.version++;
    const session: RoomSession = { code: r.code, token: seat.token };
    s.emit("room:session", session);
    if (
      r.phase === "reveal" &&
      r.arenaReady.player &&
      r.arenaReady.enemy &&
      ready(r)
    )
      r.phase = "battle";
    publish(r);
  }
  function close(r: Room, reason: string) {
    if (r.timer) clearTimeout(r.timer);
    for (const side of ["player", "enemy"] as const) {
      const id = r.seats[side]?.socketId;
      if (id) {
        members.delete(id);
        io.to(id).emit("room:closed", reason);
      }
    }
    rooms.delete(r.code);
  }
  function member(s: Socket) {
    const m = members.get(s.id),
      r = m ? rooms.get(m.code) : undefined;
    if (!m || !r) {
      fail(s, "Join a room first.");
      return null;
    }
    return { r, side: m.side };
  }
  io.on("connection", (s) => {
    // Small per-connection burst limit prevents accidental repeated submissions.
    let count = 0,
      windowStart = Date.now();
    s.use((_event, next) => {
      if (Date.now() - windowStart > 1000) {
        count = 0;
        windowStart = Date.now();
      }
      if (++count > 30) {
        fail(s, "Too many requests. Wait a moment.");
        return;
      }
      next();
    });
    s.on("room:create", () => {
      if (members.has(s.id)) return fail(s, "Close your current room first.");
      if (rooms.size >= 100) return fail(s, "Server is full.");
      let code = randomBytes(4).toString("hex").toUpperCase();
      while (rooms.has(code))
        code = randomBytes(4).toString("hex").toUpperCase();
      const r: Room = {
        rules: "arena-heart",
        code,
        phase: "selection",
        battle: null,
        seats: {
          player: { token: randomBytes(32).toString("hex"), socketId: null },
          enemy: null,
        },
        picks: {
          player: [],
          enemy: [],
        },
        locked: { player: false, enemy: false },
        arenaReady: { player: false, enemy: false },
        rematch: { player: false, enemy: false },
        touched: Date.now(),
        version: 0,
        nextTurn: 0,
      };
      rooms.set(code, r);
      attach(s, r, "player");
    });
    s.on("room:join", (v: unknown) => {
      if (members.has(s.id)) return fail(s, "Close your current room first.");
      if (typeof v !== "string") return fail(s, "Enter a room code.");
      const r = rooms.get(v.trim().toUpperCase());
      if (!r) return fail(s, "Room not found.");
      if (r.seats.enemy) return fail(s, "Both seats are taken.");
      r.seats.enemy = {
        token: randomBytes(32).toString("hex"),
        socketId: null,
      };
      attach(s, r, "enemy");
    });
    s.on("room:resume", (v: unknown) => {
      if (members.has(s.id)) return;
      if (!v || typeof v !== "object") {
        s.emit("room:expired");
        return;
      }
      const x = v as Record<string, unknown>,
        r = typeof x.code === "string" ? rooms.get(x.code) : undefined;
      if (!r || typeof x.token !== "string") {
        s.emit("room:expired");
        return;
      }
      const side =
        r.seats.player.token === x.token
          ? "player"
          : r.seats.enemy?.token === x.token
            ? "enemy"
            : null;
      if (!side) {
        s.emit("room:expired");
        return;
      }
      attach(s, r, side);
    });
    s.on("room:rules", (v: unknown) => {
      const m = member(s);
      if (!m) return;
      const { r, side } = m;
      if (side !== "player" || r.phase !== "selection") return fail(s, "Only the host can change rules before battle.");
      if (!v || typeof v !== "object") return fail(s, "Invalid rules.");
      const x = v as Record<string, unknown>;
      if (x.version !== r.version) { publish(r); return fail(s, "Lobby changed. Try again."); }
      if (x.rules !== "arena-heart" && x.rules !== "elimination") return fail(s, "Unknown rules.");
      if (x.rules === r.rules) { publish(r); return; }
      r.rules = x.rules;
      r.locked = { player: false, enemy: false };
      r.version++;
      r.touched = Date.now();
      publish(r);
    });
    s.on("roster:update", (v: unknown) => {
      const m = member(s);
      if (!m) return;
      const { r, side } = m;
      if (!v || typeof v !== "object") return fail(s, "Invalid roster.");
      const x = v as Record<string, unknown>;
      if (r.phase !== "selection" || r.locked[side])
        return fail(s, "Unlock your team before editing.");
      if (x.version !== r.version) {
        publish(r);
        return fail(s, "Lobby changed. Please try your selection again.");
      }
      if (!validPicks(x.picks))
        return fail(s, "Choose three different characters.");
      r.picks[side] = x.picks.map((p) => ({
        character: p.character,
      }));
      r.version++;
      r.touched = Date.now();
      publish(r);
    });
    s.on("roster:lock", (v: unknown) => {
      const m = member(s);
      if (!m) return;
      const { r, side } = m;
      if (!v || typeof v !== "object") return fail(s, "Invalid lock request.");
      const x = v as Record<string, unknown>;
      if (
        r.phase !== "selection" ||
        x.version !== r.version ||
        typeof x.locked !== "boolean"
      ) {
        publish(r);
        return fail(s, "Lobby changed. Please try again.");
      }
      if (x.locked && (!ready(r) || !validPicks(r.picks[side])))
        return fail(s, "Both players must connect and choose valid teams.");
      r.locked[side] = x.locked;
      r.version++;
      r.touched = Date.now();
      if (r.locked.player && r.locked.enemy && ready(r)) {
        r.battle = newBattle(
          r.nextTurn,
          "local",
          r.picks,
          ARENAS[randomInt(ARENAS.length)].id,
          r.rules,
        );
        r.arenaReady = { player: false, enemy: false };
        r.phase = "reveal";
      }
      publish(r);
    });
    s.on("arena:ready", (v: unknown) => {
      const m = member(s);
      if (!m) return;
      const { r, side } = m;
      if (
        r.phase !== "reveal" ||
        !r.battle ||
        !v ||
        typeof v !== "object" ||
        (v as { turn?: unknown }).turn !== r.battle.turn
      )
        return fail(s, "Arena reveal changed.");
      r.arenaReady[side] = true;
      r.touched = Date.now();
      r.version++;
      if (r.arenaReady.player && r.arenaReady.enemy && ready(r))
        r.phase = "battle";
      publish(r);
    });
    s.on("battle:move", (v: unknown) => {
      const m = member(s);
      if (!m) return;
      const { r, side } = m;
      if (!validMove(v)) return fail(s, "Invalid action.");
      if (!ready(r)) return fail(s, "Waiting for both players to reconnect.");
      const b = r.battle;
      if (r.phase !== "battle" || !b || b.result)
        return fail(s, "No active battle.");
      if ((b.cinematicUntil ?? 0) > Date.now()) return fail(s, "A cinematic is playing. Battle resumes after the reveal.");
      if (getActiveUnit(b)?.side !== side || isAutomaticTurn(b))
        return fail(s, "It is not your turn.");
      if (v.turn !== b.turn || v.revision !== b.revision) {
        publish(r);
        return fail(s, "Battle changed. Choose your action again.");
      }
      const command: Command = {
        move: v.move,
        target: v.target,
        secondary: v.secondary,
        choice: v.choice,
      };
      const next = battleReducer(b, {
        type: "move",
        turn: v.turn,
        revision: v.revision,
        ...command,
      });
      if (next === b) return fail(s, "That action or target is unavailable.");
      if (command.move === "bankai" || command.move === "signature") next.cinematicUntil = Date.now() + (command.move === "bankai" ? (awakeningDelay ?? awakeningDuration(next.lastAwakening!.character)) : SIGNATURE_MS);
      r.battle = next;
      r.touched = Date.now();
      publish(r);
    });
    s.on("battle:rematch", (v: unknown) => {
      const m = member(s);
      if (!m) return;
      const { r, side } = m;
      if (!v || typeof v !== "object")
        return fail(s, "Invalid rematch request.");
      const x = v as Record<string, unknown>;
      if (
        !r.battle?.result ||
        x.turn !== r.battle.turn ||
        typeof x.accept !== "boolean"
      ) {
        publish(r);
        return fail(s, "Rematch is available after battle.");
      }
      if (x.accept && !ready(r))
        return fail(s, "Wait for your opponent to reconnect.");
      r.rematch[side] = x.accept;
      r.touched = Date.now();
      if (r.rematch.player && r.rematch.enemy && ready(r)) {
        r.nextTurn = r.battle.turn + 1;
        r.battle = null;
        r.phase = "selection";
        r.picks = { player: [], enemy: [] };
        r.arenaReady = { player: false, enemy: false };
        r.locked = { player: false, enemy: false };
        r.rematch = { player: false, enemy: false };
        r.version++;
      }
      publish(r);
    });
    s.on("room:close", () => {
      const m = member(s);
      if (m) close(m.r, "A player closed the room.");
    });
    s.on("disconnect", () => {
      const m = members.get(s.id);
      members.delete(s.id);
      if (!m) return;
      const r = rooms.get(m.code),
        seat = r?.seats[m.side];
      if (!r || !seat || seat.socketId !== s.id) return;
      seat.socketId = null;
      r.touched = Date.now();
      r.version++;
      if (r.timer) {
        clearTimeout(r.timer);
        r.timer = undefined;
      }
      publish(r);
    });
  });
  const cleanup = setInterval(() => {
    for (const r of rooms.values())
      if (!ready(r) && r.touched < Date.now() - 30 * 60 * 1000)
        close(r, "Disconnected room expired.");
  }, 60000);
  cleanup.unref();
  return {
    http,
    io,
    stop: async () => {
      clearInterval(cleanup);
      for (const r of rooms.values()) if (r.timer) clearTimeout(r.timer);
      await new Promise<void>((resolve) => io.close(() => resolve()));
    },
  };
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const { http } = createGameServer();
  const port = Number(process.env.PORT ?? 3001);
  http.listen(port, "0.0.0.0", () =>
    console.log(`Ashbound roster server listening on 0.0.0.0:${port}`),
  );
}
