import test from "node:test";
import assert from "node:assert/strict";
import { io, type Socket } from "socket.io-client";
import { createGameServer } from "../server/index";
import { chooseAI, getActiveUnit } from "../src/game/engine";
import type { RoomSession, RoomView } from "../src/game/online";
function once<T>(
  s: Socket,
  event: string,
  accept: (data: T) => boolean = () => true,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      s.off(event, listener);
      reject(new Error(`Timed out: ${event}`));
    }, 5000);
    const listener = (data: T) => {
      if (!accept(data)) return;
      clearTimeout(timer);
      s.off(event, listener);
      resolve(data);
    };
    s.on(event, listener);
  });
}
test(
  "two clients select, lock, play, reconnect and mutually rematch",
  { timeout: 60000 },
  async () => {
    const server = createGameServer(1, 0);
    await new Promise<void>((resolve) =>
      server.http.listen(0, "127.0.0.1", resolve),
    );
    const addr = server.http.address();
    assert(addr && typeof addr !== "string");
    const url = `http://127.0.0.1:${addr.port}`;
    const a = io(url, {
      autoConnect: false,
      transports: ["websocket"],
      reconnection: false,
    }),
      b = io(url, {
        autoConnect: false,
        transports: ["websocket"],
        reconnection: false,
      });
    let view: RoomView | undefined;
    a.on("room:state", (v: RoomView) => {
      view = v;
    });
    let session: RoomSession | undefined;
    a.on("room:session", (s: RoomSession) => {
      session = s;
    });
    try {
      let pa = once(a, "connect");
      const pb = once(b, "connect");
      a.connect();
      b.connect();
      await Promise.all([pa, pb]);
      let state = once<RoomView>(a, "room:state");
      a.emit("room:create");
      let v = await state;
      assert.equal(v.phase, "selection");
      assert.equal(v.battle, null);
      assert.deepEqual(v.picks, { player: [], enemy: [] });
      state = once(a, "room:state");
      b.emit("room:join", v.code);
      v = await state;
      assert(v.connected.enemy);
      assert.equal(v.rules, "arena-heart");
      let rulesError = once<string>(b, "room:error");
      b.emit("room:rules", { version: v.version, rules: "elimination" });
      assert.match(await rulesError, /host/);
      rulesError = once<string>(a, "room:error");
      a.emit("room:rules", { version: v.version - 1, rules: "elimination" });
      assert.match(await rulesError, /changed/);
      state = once(a, "room:state");
      a.emit("room:rules", { version: v.version, rules: "elimination" });
      v = await state; assert.equal(v.rules, "elimination");
      state = once(a, "room:state");
      a.emit("room:rules", { version: v.version, rules: "arena-heart" });
      v = await state; assert.equal(v.rules, "arena-heart");
      let error = once<string>(a, "room:error");
      a.emit("roster:lock", { version: v.version, locked: true });
      assert.match(await error, /valid teams/);
      error = once<string>(a, "room:error");
      a.emit("roster:update", {
        version: v.version,
        picks: [
          { character: "dan" },
          { character: "dan" },
          { character: "lane" },
        ],
      });
      assert.match(await error, /three different/);
      state = once(a, "room:state");
      a.emit("roster:update", {
        version: v.version,
        picks: [
          { character: "kidou" },
          { character: "drake" },
          { character: "tomamaru" },
        ],
      });
      v = await state;
      state = once(a, "room:state");
      a.emit("roster:lock", { version: v.version, locked: true });
      v = await state;
      state = once(a, "room:state");
      a.emit("room:rules", { version: v.version, rules: "elimination" });
      v = await state; assert.deepEqual(v.locked, { player: false, enemy: false });
      assert.equal(v.picks.player.length, 3, "changing rules preserves roster");
      state = once(a, "room:state"); a.emit("room:rules", { version: v.version, rules: "arena-heart" }); v = await state;
      state = once(a, "room:state"); a.emit("roster:lock", { version: v.version, locked: true }); v = await state;
      error = once(a, "room:error");
      a.emit("roster:update", { version: v.version, picks: v.picks.player });
      assert.match(await error, /Unlock/);
      state = once(a, "room:state");
      b.emit("roster:update", {
        version: v.version,
        picks: [
          { character: "dan" },
          { character: "lane" },
          { character: "tomamaru" },
        ],
      });
      v = await state;
      state = once(a, "room:state");
      b.emit("roster:lock", { version: v.version, locked: true });
      v = await state;
      assert.equal(v.phase, "reveal");
      assert(v.battle);
      assert.equal(v.battle.rules, "arena-heart");
      assert(v.battle.heart);
      const arena = v.battle.arena;
      error = once(a, "room:error");
      a.emit("battle:move", {
        move: "guard",
        turn: v.battle.turn,
        revision: v.battle.revision,
      });
      assert.match(await error, /No active battle/);
      state = once(a, "room:state");
      a.emit("arena:ready", { turn: v.battle.turn });
      v = await state;
      assert.equal(v.phase, "reveal");
      assert(v.arenaReady.player);
      const offline = once<RoomView>(
        b,
        "room:state",
        (v) => !v.connected.player,
      );
      a.disconnect();
      await offline;
      pa = once(a, "connect");
      a.connect();
      await pa;
      state = once(a, "room:state");
      a.emit("room:resume", session);
      v = await state;
      assert.equal(v.phase, "reveal");
      assert.equal(v.battle!.arena, arena);
      assert(v.arenaReady.player);
      state = once(a, "room:state");
      b.emit("arena:ready", { turn: v.battle!.turn });
      v = await state;
      assert.equal(v.phase, "battle");
      assert(v.battle);

      const wrong = getActiveUnit(v.battle)!.side === "player" ? b : a;
      error = once(wrong, "room:error");
      wrong.emit("battle:move", {
        move: "guard",
        turn: v.battle.turn,
        revision: v.battle.revision,
      });
      assert.match(await error, /not your turn/);
      const current = getActiveUnit(v.battle)!.side === "player" ? a : b;
      error = once(current, "room:error");
      current.emit("battle:move", {
        move: "guard",
        turn: v.battle.turn,
        revision: -1,
      });
      assert.match(await error, /Battle changed/);
      const revision = v.battle.revision;
      const disconnected = once<RoomView>(
        b,
        "room:state",
        (v) => !v.connected.player,
      );
      a.disconnect();
      assert.equal((await disconnected).connected.player, false);
      error = once(b, "room:error");
      b.emit("battle:move", { move: "guard", turn: v.battle.turn, revision });
      assert.match(await error, /reconnect/);
      pa = once(a, "connect");
      a.connect();
      await pa;
      state = once(a, "room:state");
      a.emit("room:resume", session);
      v = await state;
      assert.equal(v.battle!.revision, revision);
      for (let i = 0;i < 700 && !v.battle?.result;i++) {
        const battle = v.battle!,
          unit = getActiveUnit(battle)!;
        state = once<RoomView>(a, "room:state");
        {
          // Stay under the server's per-second input limit.
          await new Promise((resolve) => setTimeout(resolve, 36));
          (unit.side === "player" ? a : b).emit("battle:move", {
            ...chooseAI(battle),
            turn: battle.turn,
            revision: battle.revision,
          });
        }
        v = await state;
      }
      assert(v.battle?.result, "battle must finish");
      const persistedBattle = structuredClone(v.battle);
      const gone = once<RoomView>(b, "room:state", v => !v.connected.player); a.disconnect(); await gone;
      pa = once(a, "connect"); a.connect(); await pa; state = once(a, "room:state"); a.emit("room:resume", session); v = await state;
      assert.deepEqual(v.battle, persistedBattle, "reconnect preserves full objective and result state");
      const turn = v.battle!.turn;
      state = once(a, "room:state");
      a.emit("battle:rematch", { turn, accept: true });
      v = await state;
      assert(v.rematch.player);
      assert.equal(v.phase, "battle");
      state = once(a, "room:state");
      b.emit("battle:rematch", { turn, accept: true });
      v = await state;
      assert.equal(v.phase, "selection");
      assert.equal(v.battle, null);
      assert.equal(v.rules, "arena-heart");
      assert(!v.locked.player && !v.locked.enemy);
      assert.deepEqual(v.picks, { player: [], enemy: [] });
      assert(view);
    } finally {
      a.disconnect();
      b.disconnect();
      await server.stop();
    }
  },
);
