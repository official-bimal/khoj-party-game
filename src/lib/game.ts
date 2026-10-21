import { z } from "zod";
import { normalize, secureRandom, type Word } from "./words";
export const defaultScoring = {
  citizenWin: 100,
  imposterSurvival: 150,
  imposterGuess: 200,
  correctVote: 25,
};
export const scoringSchema = z.object({
  citizenWin: z.number().int().min(0).max(1000),
  imposterSurvival: z.number().int().min(0).max(1000),
  imposterGuess: z.number().int().min(0).max(1000),
  correctVote: z.number().int().min(0).max(1000),
});
export const settingsSchema = z
  .object({
    names: z.array(z.string().trim().min(1).max(24)).min(3).max(20),
    imposters: z.number().int().min(1),
    categories: z.array(z.string()).max(50),
    difficulty: z.enum(["easy", "medium", "hard", "mixed"]),
    seconds: z.number().int().min(30).max(1800),
    hints: z.boolean(),
    guess: z.boolean(),
    mode: z.enum(["classic", "chaos", "undercover"]),
    scoring: scoringSchema.default(defaultScoring),
  })
  .refine((s) => s.imposters <= Math.floor((s.names.length - 1) / 2), {
    message: "Imposters must be fewer than half the players",
  })
  .refine((s) => new Set(s.names.map(normalize)).size === s.names.length, {
    message: "Player names must be different",
  });
export type Settings = z.infer<typeof settingsSchema>;
export type Phase = "reveals" | "discussion" | "voting" | "guess" | "results";
export type Round = {
  id: string;
  settings: Settings;
  word: Word;
  roles: boolean[];
  phase: Phase;
  revealed: number[];
  votes: Record<number, number>;
  deadline: number | null;
  caught: number[];
  guesses: Record<number, string>;
  order: number[];
  event: string;
  points: number[];
  winner: string;
};
export const defaults: Settings = {
  names: ["Suman", "Aashma", "Bikash"],
  imposters: 1,
  categories: [],
  difficulty: "mixed",
  seconds: 180,
  hints: false,
  guess: true,
  mode: "classic",
  scoring: defaultScoring,
};
export function shuffle<T>(values: T[], random = secureRandom) {
  const a = [...values];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export function createRound(
  raw: Settings,
  word: Word,
  random = secureRandom,
): Round {
  const settings = settingsSchema.parse(raw);
  if (settings.mode === "undercover" && !word.related)
    throw new Error("This pack has no Undercover pair. Choose another pack.");
  const order = shuffle(
      settings.names.map((_, i) => i),
      random,
    ),
    roles = settings.names.map((_, i) =>
      order.slice(0, settings.imposters).includes(i),
    );
  return {
    id: crypto.randomUUID(),
    settings,
    word,
    roles,
    phase: "reveals",
    revealed: [],
    votes: {},
    deadline: null,
    caught: [],
    guesses: {},
    order: shuffle(order, random),
    event:
      settings.mode === "chaos"
        ? [
            "Give your next clue like a movie villain.",
            "One extra clue each. No pointing!",
            "Lightning round: discussion is 30 seconds shorter.",
          ][Math.floor(random() * 3)]
        : "",
    points: [],
    winner: "",
  };
}
export function revealDone(r: Round, player: number, now = Date.now()): Round {
  if (
    r.phase !== "reveals" ||
    !r.settings.names[player] ||
    r.revealed.includes(player)
  )
    throw new Error("Invalid reveal");
  const revealed = [...r.revealed, player];
  return {
    ...r,
    revealed,
    phase: revealed.length === r.roles.length ? "discussion" : "reveals",
    deadline:
      revealed.length === r.roles.length
        ? now +
          (r.settings.seconds - (r.event.startsWith("Lightning") ? 30 : 0)) *
            1000
        : null,
  };
}
export function beginVoting(r: Round): Round {
  if (r.phase !== "discussion") throw new Error("Discussion has not started");
  return { ...r, phase: "voting", deadline: Date.now() + 120000 };
}
export function castVote(r: Round, player: number, target: number): Round {
  if (
    r.phase !== "voting" ||
    r.votes[player] !== undefined ||
    !r.settings.names[player] ||
    target === player ||
    target < -1 ||
    target >= r.roles.length
  )
    throw new Error("Invalid vote");
  const next = { ...r, votes: { ...r.votes, [player]: target } };
  return Object.keys(next.votes).length === r.roles.length
    ? resolveVotes(next)
    : next;
}
export function resolveVotes(r: Round): Round {
  if (r.phase !== "voting") throw new Error("Voting has not started");
  const tally = r.roles.map(
    (_, i) => Object.values(r.votes).filter((v) => v === i).length,
  );
  const max = Math.max(...tally);
  const caught = max > 0 ? tally.flatMap((n, i) => (n === max ? [i] : [])) : [];
  // A tied top vote catches nobody. Multi-imposter rounds require all imposters in a unique top set;
  // use the top N with no tie at the cutoff for multiple imposters.
  const ranked = tally.map((n, i) => ({ n, i })).sort((a, b) => b.n - a.n);
  const n = r.settings.imposters;
  const selected =
    n === 1
      ? caught.length === 1
        ? caught
        : []
      : ranked[n - 1].n > 0 && ranked[n - 1].n > (ranked[n]?.n ?? -1)
        ? ranked.slice(0, n).map((x) => x.i)
        : [];
  const next = { ...r, caught: selected, deadline: null };
  return selected.some((i) => r.roles[i]) &&
    r.settings.guess &&
    r.settings.mode !== "undercover"
    ? { ...next, phase: "guess", deadline: Date.now() + 60000 }
    : score(next);
}
export function submitGuess(r: Round, player: number, guess: string): Round {
  if (
    r.phase !== "guess" ||
    !r.roles[player] ||
    !r.caught.includes(player) ||
    r.guesses[player] !== undefined
  )
    throw new Error("Invalid guess");
  const next = {
    ...r,
    guesses: { ...r.guesses, [player]: guess.slice(0, 100) },
  };
  return next.caught
    .filter((i) => r.roles[i])
    .every((i) => next.guesses[i] !== undefined)
    ? score(next)
    : next;
}
export function score(r: Round): Round {
  const scoring = r.settings.scoring || defaultScoring;
  const accepted = [
    r.word.canonical,
    r.word.ne,
    r.word.roman,
    r.word.en,
    ...r.word.aliases,
  ]
    .filter(Boolean)
    .map(normalize);
  const guessed = Object.values(r.guesses).some((g) =>
    accepted.includes(normalize(g)),
  );
  const allCaught = r.roles.every((role, i) => !role || r.caught.includes(i));
  const impostersWin = !allCaught || guessed;
  return {
    ...r,
    phase: "results",
    deadline: null,
    winner: impostersWin ? "imposters" : "citizens",
    points: r.roles.map(
      (role, i) =>
        (role
          ? guessed
            ? scoring.imposterGuess
            : !allCaught
              ? scoring.imposterSurvival
              : 0
          : !impostersWin
            ? scoring.citizenWin
            : 0) +
        (!role && r.roles[r.votes[i]] ? scoring.correctVote : 0) +
        (role && impostersWin && r.settings.mode === "chaos" ? 25 : 0),
    ),
  };
}
export function tick(r: Round, now = Date.now()): Round {
  if (!r.deadline || now < r.deadline) return r;
  if (r.phase === "discussion") return beginVoting(r);
  if (r.phase === "voting") return resolveVotes(r);
  if (r.phase === "guess") return score(r);
  return r;
}
