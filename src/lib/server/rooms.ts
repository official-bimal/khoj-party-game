import "server-only";
import { z } from "zod";
import {
  defaults,
  createRound,
  revealDone,
  beginVoting,
  castVote,
  submitGuess,
  tick,
  type Round,
  type Settings,
  scoringSchema,
} from "../game";
import { selectWord } from "../words";
import { seedWords } from "../../data/seed";
import { token, hash } from "./security";
export type Participant = {
  id: string;
  name: string;
  tokenHash: string;
  ready: boolean;
  seen: number;
  score: number;
};
export type Room = {
  code: string;
  host: string;
  players: Participant[];
  round: Round | null;
  roundNumber: number;
  recent: string[];
  settings: Settings;
  expires: number;
  closed: boolean;
  scoredRound: string | null;
};
export const nickname = z
  .string()
  .trim()
  .min(1)
  .max(24)
  .regex(
    /^[\p{L}\p{N} _.-]+$/u,
    "Use letters, numbers, spaces, dots or hyphens",
  );
export function newRoom(code: string, name: string) {
  const session = token();
  const player = {
    id: crypto.randomUUID(),
    name: nickname.parse(name),
    tokenHash: hash(session),
    ready: false,
    seen: Date.now(),
    score: 0,
  };
  const room: Room = {
    code,
    host: player.id,
    players: [player],
    round: null,
    roundNumber: 0,
    recent: [],
    settings: { ...defaults, names: [] },
    expires: Date.now() + 7200000,
    closed: false,
    scoredRound: null,
  };
  return { room, session };
}
export function joinRoom(room: Room, name: string) {
  assertLive(room);
  if (room.round && room.round.phase !== "results")
    throw new Error("Round in progress. Join after the results.");
  if (room.players.length >= 20) throw new Error("Room is full");
  name = nickname.parse(name);
  if (room.players.some((p) => p.name.toLowerCase() === name.toLowerCase()))
    throw new Error("Choose a different nickname");
  const session = token();
  room.players.push({
    id: crypto.randomUUID(),
    name,
    tokenHash: hash(session),
    ready: false,
    seen: Date.now(),
    score: 0,
  });
  return session;
}
export function assertLive(room: Room) {
  if (room.closed || room.expires < Date.now())
    throw new Error("Room unavailable or expired");
}
export function identify(room: Room, session: string) {
  assertLive(room);
  const player = room.players.find((p) => p.tokenHash === hash(session));
  if (!player) throw new Error("Room session required");
  player.seen = Date.now();
  room.expires = Date.now() + 7200000;
  return player;
}
export function applyAction(
  room: Room,
  session: string,
  data: Record<string, unknown>,
) {
  const p = identify(room, session);
  room.round = room.round ? tick(room.round) : null;
  const r = room.round,
    me = room.players.indexOf(p);
  switch (data.action) {
    case "ready":
      if (r && r.phase !== "results") throw new Error("Round already started");
      p.ready = !p.ready;
      break;
    case "start": {
      if (room.host !== p.id) throw new Error("Only the host can start");
      if (r && r.phase !== "results") throw new Error("Round already started");
      if (room.players.length < 3 || room.players.some((x) => !x.ready))
        throw new Error("At least 3 ready players needed");
      const settings = {
        ...room.settings,
        ...z
          .object({
            imposters: z.number().int(),
            seconds: z.number().int(),
            hints: z.boolean(),
            guess: z.boolean(),
            mode: z.enum(["classic", "chaos", "undercover"]),
            categories: z.array(z.string()),
            difficulty: z.enum(["easy", "medium", "hard", "mixed"]),
            scoring: scoringSchema,
          })
          .partial()
          .parse(data.settings || {}),
        names: room.players.map((x) => x.name),
      };
      let words = seedWords.filter((w) => w.age < 18);
      if (settings.mode === "undercover")
        words = words.filter((w) => w.related);
      room.round = createRound(
        settings,
        selectWord(
          words,
          settings.categories,
          settings.difficulty,
          room.recent,
        ),
      );
      room.settings = settings;
      room.recent = [...room.recent.slice(-30), room.round.word.id];
      room.roundNumber++;
      break;
    }
    case "reveal":
      if (!r) throw new Error("No round");
      room.round = revealDone(r, me);
      break;
    case "vote":
      if (!r) throw new Error("No round");
      room.round = castVote(r, me, z.number().int().parse(data.target));
      break;
    case "guess":
      if (!r) throw new Error("No round");
      room.round = submitGuess(r, me, z.string().max(100).parse(data.guess));
      break;
    case "voting":
      if (room.host !== p.id || !r) throw new Error("Host only");
      room.round = beginVoting(r);
      break;
    case "transfer":
      if (room.host !== p.id || !room.players.some((x) => x.id === data.target))
        throw new Error("Invalid host transfer");
      room.host = String(data.target);
      break;
    case "close":
      if (room.host !== p.id) throw new Error("Host only");
      room.closed = true;
      break;
    default:
      throw new Error("Invalid action");
  }
  settle(room);
  return project(room, p.id);
}
export function settle(room: Room) {
  if (room.round) {
    room.round = tick(room.round);
    if (room.round.phase === "results" && room.scoredRound !== room.round.id) {
      room.round.points.forEach((n, i) => (room.players[i].score += n));
      room.scoredRound = room.round.id;
      room.players.forEach((p) => (p.ready = false));
    }
  }
}
export function project(room: Room, id: string) {
  const me = room.players.findIndex((p) => p.id === id),
    r = room.round;
  return {
    code: room.code,
    host: room.host,
    me: id,
    closed: room.closed,
    roundNumber: room.roundNumber,
    settings: room.settings,
    serverTime: Date.now(),
    players: room.players.map((p) => ({
      id: p.id,
      name: p.name,
      ready: p.ready,
      online: Date.now() - p.seen < 15000,
      score: p.score,
    })),
    round: r
      ? {
          id: r.id,
          phase: r.phase,
          deadline: r.deadline,
          mode: r.settings.mode,
          event: r.event,
          order: r.order,
          revealed: r.revealed.length,
          myRevealed: r.revealed.includes(me),
          hasVoted: r.votes[me] !== undefined,
          voteCount: Object.keys(r.votes).length,
          canGuess:
            r.phase === "guess" &&
            r.caught.includes(me) &&
            r.roles[me] &&
            r.guesses[me] === undefined,
          private:
            r.phase === "reveals" && !r.revealed.includes(me)
              ? {
                  imposter: r.roles[me],
                  word: r.roles[me]
                    ? r.settings.mode === "undercover"
                      ? r.word.related
                      : null
                    : {
                        ne: r.word.ne,
                        roman: r.word.roman,
                        en: r.word.en,
                        canonical: r.word.canonical,
                      },
                  hint: r.roles[me] && r.settings.hints ? r.word.hint : null,
                }
              : null,
          result:
            r.phase === "results"
              ? {
                  word: r.word,
                  roles: r.roles,
                  points: r.points,
                  winner: r.winner,
                  caught: r.caught,
                  votes: r.votes,
                }
              : null,
        }
      : null,
  };
}
export type RoomView = ReturnType<typeof project>;
