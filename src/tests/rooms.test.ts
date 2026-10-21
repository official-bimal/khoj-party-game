import { describe, it, expect } from "vitest";
import {
  newRoom,
  joinRoom,
  identify,
  applyAction,
  project,
  settle,
} from "../lib/server/rooms";
import { hash } from "../lib/server/security";
function lobby() {
  const { room, session } = newRoom("ABC234", "Host");
  const s2 = joinRoom(room, "Second"),
    s3 = joinRoom(room, "Third");
  const sessions = [session, s2, s3];
  sessions.forEach((s) => applyAction(room, s, { action: "ready" }));
  applyAction(room, session, { action: "start" });
  return { room, sessions };
}
describe("authoritative rooms", () => {
  it("creates, joins and reconnects by hashed private session", () => {
    const { room, sessions } = lobby();
    expect(room.players[0].tokenHash).toBe(hash(sessions[0]));
    expect(identify(room, sessions[0]).name).toBe("Host");
    expect(() => identify(room, "fake")).toThrow();
    expect(() => joinRoom(room, "Late")).toThrow();
  });
  it("never delivers another player’s roles or token hashes", () => {
    const { room, sessions } = lobby();
    sessions.forEach((s, i) => {
      const view = project(room, identify(room, s).id);
      const serialized = JSON.stringify(view);
      expect(serialized).not.toContain("tokenHash");
      expect(serialized).not.toContain('"roles"');
      expect(serialized).not.toContain('"votes"');
      expect(view.round?.private?.imposter).toBe(room.round!.roles[i]);
      if (room.round!.roles[i])
        expect(serialized).not.toContain(room.round!.word.canonical);
    });
  });
  it("prevents non-host start and forged voting identity", () => {
    const { room, sessions } = lobby();
    expect(() => applyAction(room, sessions[1], { action: "start" })).toThrow();
    sessions.forEach((s) => applyAction(room, s, { action: "reveal" }));
    applyAction(room, sessions[0], { action: "voting" });
    applyAction(room, sessions[1], { action: "vote", player: 0, target: 0 });
    expect(room.round?.votes[1]).toBe(0);
    expect(room.round?.votes[0]).toBeUndefined();
    expect(() =>
      applyAction(room, sessions[1], { action: "vote", target: 2 }),
    ).toThrow();
  });
  it("settles exactly once and can rematch", () => {
    const { room, sessions } = lobby();
    sessions.forEach((s) => applyAction(room, s, { action: "reveal" }));
    applyAction(room, sessions[0], { action: "voting" });
    sessions.forEach((s) =>
      applyAction(room, s, { action: "vote", target: -1 }),
    );
    expect(room.round?.phase).toBe("results");
    const score = room.players.map((p) => p.score);
    settle(room);
    expect(room.players.map((p) => p.score)).toEqual(score);
    sessions.forEach((s) => applyAction(room, s, { action: "ready" }));
    applyAction(room, sessions[0], { action: "start" });
    expect(room.roundNumber).toBe(2);
  });
  it("isolates sessions across rooms and expires inactive rooms", () => {
    const first = newRoom("ABC234", "A"),
      second = newRoom("DEF234", "B");
    expect(() => identify(first.room, second.session)).toThrow();
    first.room.expires = 0;
    expect(() => identify(first.room, first.session)).toThrow();
  });
  it("transfers host and closes safely", () => {
    const { room, sessions } = lobby();
    applyAction(room, sessions[0], {
      action: "transfer",
      target: room.players[1].id,
    });
    expect(room.host).toBe(room.players[1].id);
    applyAction(room, sessions[1], { action: "close" });
    expect(() => identify(room, sessions[2])).toThrow();
  });
});
