import { describe, it, expect } from "vitest";
import {
  createRound,
  defaults,
  settingsSchema,
  revealDone,
  beginVoting,
  castVote,
  resolveVotes,
  submitGuess,
  tick,
  type Round,
} from "../lib/game";
import {
  normalize,
  selectWord,
  validateImport,
  parseWords,
} from "../lib/words";
import { seedWords } from "../data/seed";
import { translate } from "../lib/i18n";
const word = seedWords[0];
const voting = (): Round => ({
  ...createRound(defaults, word, () => 0),
  phase: "voting" as const,
  roles: [false, false, true],
});
describe("game rules", () => {
  it("respects configurable scoring and rejects unsafe scores", () => {
    const r = resolveVotes({
      ...voting(),
      settings: {
        ...defaults,
        guess: false,
        scoring: {
          citizenWin: 50,
          imposterSurvival: 75,
          imposterGuess: 90,
          correctVote: 10,
        },
      },
      votes: { 0: 2, 1: 2, 2: 0 },
    });
    expect(r.points).toEqual([60, 60, 0]);
    expect(() =>
      settingsSchema.parse({
        ...defaults,
        scoring: { ...defaults.scoring, correctVote: -1 },
      }),
    ).toThrow();
  });
  it("assigns the exact number of imposters for 3–20 players", () => {
    for (let n = 3; n <= 20; n++)
      for (let k = 1; k <= Math.floor((n - 1) / 2); k++) {
        const r = createRound(
          {
            ...defaults,
            names: Array.from({ length: n }, (_, i) => `P${i}`),
            imposters: k,
          },
          word,
        );
        expect(r.roles.filter(Boolean)).toHaveLength(k);
      }
  });
  it("rejects invalid counts and duplicate names", () => {
    expect(() => settingsSchema.parse({ ...defaults, imposters: 2 })).toThrow();
    expect(() =>
      settingsSchema.parse({ ...defaults, names: ["A", "A", "B"] }),
    ).toThrow();
  });
  it("hides between deliberate reveals and starts discussion only after all", () => {
    let r = createRound(defaults, word);
    r = revealDone(r, 0, 1000);
    expect(r.phase).toBe("reveals");
    expect(() => revealDone(r, 0)).toThrow();
    r = revealDone(revealDone(r, 1, 1000), 2, 1000);
    expect(r.deadline).toBe(181000);
    expect(r.phase).toBe("discussion");
  });
  it("requires discussion before voting", () => {
    expect(() => beginVoting(createRound(defaults, word))).toThrow();
  });
  it("locks votes, rejects self and out of range votes", () => {
    let r = voting();
    expect(() => castVote(r, 0, 0)).toThrow();
    expect(() => castVote(r, 0, 3)).toThrow();
    r = castVote(r, 0, 2);
    expect(() => castVote(r, 0, 1)).toThrow();
  });
  it("citizens catch imposter and allow final guess", () => {
    let r = voting();
    r = castVote(castVote(castVote(r, 0, 2), 1, 2), 2, 0);
    expect(r.phase).toBe("guess");
    r = submitGuess(r, 2, "wrong");
    expect(r.winner).toBe("citizens");
    expect(r.points).toEqual([125, 125, 0]);
  });
  it("accepts canonical, script and normalized alias guesses", () => {
    for (const guess of ["MOMO", "मःमः", " Momo "]) {
      let r = resolveVotes({ ...voting(), votes: { 0: 2, 1: 2, 2: 0 } });
      r = submitGuess(r, 2, guess);
      expect(r.winner).toBe("imposters");
      expect(r.points[2]).toBe(200);
    }
  });
  it("ties and all abstentions catch nobody", () => {
    for (const votes of [
      { 0: 1, 1: 2, 2: 0 },
      { 0: -1, 1: -1, 2: -1 },
    ]) {
      const r = resolveVotes({ ...voting(), votes });
      expect(r.caught).toEqual([]);
      expect(r.points[2]).toBe(150);
    }
  });
  it("handles timeout in discussion, voting and guess", () => {
    const r = { ...voting(), phase: "discussion" as const, deadline: 1 };
    let next = tick(r, 2);
    expect(next.phase).toBe("voting");
    next = tick({ ...next, deadline: 1 }, 2);
    expect(next.phase).toBe("results");
    const guessing = resolveVotes({ ...voting(), votes: { 0: 2, 1: 2, 2: 0 } });
    expect(tick({ ...guessing, deadline: 1 }, 2).phase).toBe("results");
  });
  it("resolves multi-imposter cutoff and ties", () => {
    const base = createRound(
      { ...defaults, names: ["A", "B", "C", "D", "E"], imposters: 2 },
      word,
    );
    const r = resolveVotes({
      ...base,
      phase: "voting",
      roles: [false, false, false, true, true],
      votes: { 0: 3, 1: 3, 2: 4, 3: 4, 4: 0 },
    });
    expect(r.caught.sort()).toEqual([3, 4]);
    expect(
      resolveVotes({
        ...base,
        phase: "voting",
        votes: { 0: 1, 1: 2, 2: 3, 3: 4, 4: 0 },
      }).caught,
    ).toEqual([]);
  });
  it("undercover requires a pair and disables final guessing", () => {
    expect(() =>
      createRound(
        { ...defaults, mode: "undercover" },
        { ...word, related: "" },
      ),
    ).toThrow();
    const r = resolveVotes({
      ...voting(),
      settings: { ...defaults, mode: "undercover" },
      votes: { 0: 2, 1: 2, 2: 0 },
    });
    expect(r.phase).toBe("results");
  });
});
describe("content and language", () => {
  it("has unique seed identities, canonicals and all 30 categories", () => {
    expect(validateImport(seedWords)).toHaveLength(seedWords.length);
    expect(new Set(seedWords.map((w) => w.id)).size).toBe(seedWords.length);
    expect(new Set(seedWords.flatMap((w) => w.categoryIds)).size).toBe(30);
  });
  it("normalizes Unicode and detects alias collisions", () => {
    expect(normalize(" Momo! ")).toBe("momo");
    expect(() =>
      validateImport([
        word,
        { ...word, id: "another", canonical: "Other", aliases: ["momo"] },
      ]),
    ).toThrow();
  });
  it("filters categories and avoids recent words", () => {
    const pool = seedWords.filter((w) => w.categoryIds.includes("c1"));
    const selected = selectWord(seedWords, ["c1"], "easy", [word.id], () => 0);
    expect(selected.id).not.toBe(word.id);
    expect(pool.some((w) => w.id === selected.id)).toBe(true);
    expect(() => selectWord(seedWords, ["missing"], "easy", [])).toThrow();
  });
  it("allows repeats only after the pool is exhausted", () =>
    expect(selectWord([word], [], "mixed", [word.id]).id).toBe(word.id));
  it("parses quoted CSV and validates malformed imports", () => {
    expect(
      parseWords(
        'canonical,ne,roman,en,hint\n"Test, Word",टेस्ट,Test,Test,"A, hint"',
      )[0].hint,
    ).toBe("A, hint");
    expect(() => parseWords('"broken')).toThrow();
    expect(() => parseWords('[{"canonical":""}]')).toThrow();
  });
  it("falls back to English and provides all translation keys", () => {
    expect(translate("unknown", "start")).toBe("Start game");
    expect(translate("ne", "start")).toBe("खेल सुरु गर");
  });
});
