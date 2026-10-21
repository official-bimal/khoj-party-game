"use client";
import { FocusGuard } from "./focus-guard";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  Check,
  Clock3,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldQuestion,
  Trophy,
  Users,
} from "lucide-react";
import { useGame } from "@/stores/game-store";
import {
  beginVoting,
  castVote,
  createRound,
  revealDone,
  submitGuess,
  tick,
  type Round,
} from "@/lib/game";
import { translate } from "@/lib/i18n";
import { selectWord, wordLabel } from "@/lib/words";
import { seedWords } from "@/data/seed";
export function OfflineGame() {
  const store = useGame(),
    r = store.round,
    router = useRouter(),
    reduced = useReducedMotion();
  const [shown, setShown] = useState(false),
    [guess, setGuess] = useState(""),
    [now, setNow] = useState(() => Date.now()),
    [cancel, setCancel] = useState(false),
    [error, setError] = useState("");
  const t = (k: Parameters<typeof translate>[1]) =>
    translate(store.language, k);
  function update(round: Round) {
    store.set({ round });
    if (round.phase === "results") store.finish(round);
  }
  useEffect(() => {
    const timer = setInterval(() => {
      const r = useGame.getState().round;
      setNow(Date.now());
      if (r) {
        const next = tick(r);
        if (next !== r) {
          useGame.getState().set({ round: next });
          if (next.phase === "results") useGame.getState().finish(next);
        }
      }
    }, 500);
    const hide = () => setShown(false);
    document.addEventListener("visibilitychange", hide);
    window.addEventListener("blur", hide);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", hide);
      window.removeEventListener("blur", hide);
    };
  }, []);
  if (!r)
    return (
      <div className="empty-state">
        <ShieldQuestion size={56} />
        <h1>Your next mystery awaits.</h1>
        <p>Set up a game and gather your suspects.</p>
        <button className="primary" onClick={() => router.push("/")}>
          Set up a game <ArrowRight size={18} />
        </button>
      </div>
    );
  const player = r.settings.names.findIndex((_, i) => !r.revealed.includes(i)),
    voter = r.settings.names.findIndex((_, i) => r.votes[i] === undefined),
    guesser =
      r.caught.find((i) => r.roles[i] && r.guesses[i] === undefined) ?? -1;
  const remaining = Math.max(0, Math.ceil(((r.deadline || now) - now) / 1000));
  const format = (s: number) =>
    `${Math.floor(s / 60)
      .toString()
      .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
  function rematch() {
    try {
      let pool = [
        ...seedWords.filter((w) => w.age < 18),
        ...store.custom,
        ...store.published,
      ];
      if (r!.settings.mode === "undercover")
        pool = pool.filter((w) => w.related);
      const word = selectWord(
        pool,
        r!.settings.categories,
        r!.settings.difficulty,
        store.recent,
      );
      setShown(false);
      setGuess("");
      store.set({
        round: createRound(r!.settings, word),
        recent: [...store.recent.slice(-30), word.id],
      });
    } catch (e) {
      setError((e as Error).message);
    }
  }
  function reveal() {
    setShown(true);
    if ("vibrate" in navigator) navigator.vibrate(30);
    if (store.sound) {
      const ctx = new AudioContext();
      const oscillator = ctx.createOscillator(),
        gain = ctx.createGain();
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      oscillator.frequency.value = 440;
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.15);
      oscillator.onended = () => void ctx.close();
    }
  }
  return (
    <section className="game-page">
      <div className="game-top">
        <span className="eyebrow">
          {r.settings.mode.toUpperCase()} · {r.settings.names.length} PLAYERS
        </span>
        <button
          className="text-button muted"
          onClick={() => {
            setShown(false);
            setCancel(true);
          }}
        >
          {t("cancel")}
        </button>
      </div>
      <div className="phase-track">
        {["reveals", "discussion", "voting", "results"].map((p, i) => (
          <span
            key={p}
            className={
              r.phase === p || (p === "voting" && r.phase === "guess")
                ? "current"
                : ""
            }
          >
            <i>{i + 1}</i>
            {p}
          </span>
        ))}
      </div>
      <motion.div
        className="game-panel"
        key={r.phase}
        initial={reduced ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {r.phase === "reveals" && (
          <>
            <span className="eyebrow">
              PRIVATE CARD · {r.revealed.length + 1} / {r.roles.length}
            </span>
            <h1>
              {t("pass")}
              <br />
              <span className="coral">{r.settings.names[player]}</span>
            </h1>
            <p className="muted">{t("private")}</p>
            <motion.div
              className={`secret-card ${shown ? "is-revealed" : ""}`}
              animate={{ rotateY: shown ? 0 : 0 }}
            >
              <div className="card-pattern" />
              {shown ? (
                <>
                  <Eye size={32} />
                  <span className="eyebrow">
                    {r.settings.mode === "undercover"
                      ? t("word")
                      : r.roles[player]
                        ? t("imposter")
                        : t("citizen")}
                  </span>
                  {r.roles[player] && r.settings.mode !== "undercover" ? (
                    <>
                      <h2>{t("imposter")}</h2>
                      <p>{r.settings.hints ? r.word.hint : t("noWord")}</p>
                    </>
                  ) : (
                    <>
                      <h2>
                        {r.roles[player]
                          ? r.word.related
                          : wordLabel(r.word, store.wordLanguage)}
                      </h2>
                      <p>
                        {r.settings.mode === "undercover"
                          ? "Keep your word private. Find the different word."
                          : t("help")}
                      </p>
                    </>
                  )}
                </>
              ) : (
                <>
                  <LockKeyhole size={38} />
                  <h2>For your eyes only.</h2>
                  <p>{t("private")}</p>
                </>
              )}
            </motion.div>
            {shown ? (
              <button
                className="primary full"
                onClick={() => {
                  setShown(false);
                  update(revealDone(r, player));
                }}
              >
                <EyeOff size={18} />
                {t("hide")}
                <ArrowRight size={18} />
              </button>
            ) : (
              <button className="primary full" onClick={reveal}>
                <Eye size={18} />
                {t("reveal")}
              </button>
            )}
            <p className="small-text muted">
              The card disappears when you switch away from this screen.
            </p>
          </>
        )}
        {r.phase === "discussion" && (
          <>
            <span className="round-icon">
              <Users size={32} />
            </span>
            <span className="eyebrow">CLUE BY CLUE. LIE BY LIE.</span>
            <h1>
              {t("discuss")}
              <span className="coral">.</span>
            </h1>
            <p className="muted">{t("help")}</p>
            <div
              className="countdown"
              role="timer"
              aria-label={`${remaining} seconds remaining`}
            >
              {format(remaining)}
            </div>
            <div className="clue-order">
              <Clock3 size={17} />
              <span>
                Speaking order:{" "}
                {r.order.map((i) => r.settings.names[i]).join(" → ")}
              </span>
            </div>
            {r.event && <p className="chaos-event">{r.event}</p>}
            <button
              className="primary full"
              onClick={() => update(beginVoting(r))}
            >
              {t("vote")}
              <ArrowRight size={18} />
            </button>
          </>
        )}
        {r.phase === "voting" && (
          <>
            <span className="eyebrow">
              PRIVATE VOTE · {Object.keys(r.votes).length + 1} /{" "}
              {r.roles.length}
            </span>
            <h1>
              {r.settings.names[voter]},<br />
              who’s bluffing?
            </h1>
            <p className="muted">
              Pass to this player. Choose one suspect. No changing your vote.
            </p>
            <div className="vote-grid">
              {r.settings.names.map(
                (name, i) =>
                  i !== voter && (
                    <button
                      key={i}
                      onClick={() => update(castVote(r, voter, i))}
                    >
                      <span className="player-avatar">{name[0]}</span>
                      {name}
                      <ArrowRight size={16} />
                    </button>
                  ),
              )}
            </div>
            <button
              className="secondary full"
              onClick={() => update(castVote(r, voter, -1))}
            >
              {t("abstain")}
            </button>
            <p className="small-text muted">
              Voting closes in {format(remaining)}. Missing votes become
              abstentions.
            </p>
          </>
        )}
        {r.phase === "guess" && (
          <>
            <ShieldQuestion size={50} className="coral" />
            <span className="eyebrow">ONE LAST CHANCE</span>
            <h1>
              {r.settings.names[guesser]},<br />
              {t("guess")}
            </h1>
            <p className="muted">
              A caught imposter can still steal the win. Keep this screen
              private.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                update(submitGuess(r, guesser, guess));
                setGuess("");
              }}
            >
              <label className="field-label" htmlFor="guess">
                Your guess
              </label>
              <input
                id="guess"
                value={guess}
                maxLength={100}
                autoComplete="off"
                onChange={(e) => setGuess(e.target.value)}
                required
              />
              <button className="primary full" type="submit">
                {t("submit")}
                <ArrowRight size={18} />
              </button>
            </form>
            <button
              className="text-button muted"
              onClick={() => update(submitGuess(r, guesser, ""))}
            >
              Skip guess
            </button>
            <p className="small-text muted">{format(remaining)} remaining</p>
          </>
        )}
        {r.phase === "results" && (
          <>
            <div className="result-burst">
              <Trophy size={42} />
            </div>
            <span className="eyebrow">{t("results")}</span>
            <h1>
              {r.winner === "citizens" ? "Pakdiyau!" : "Ullu banayo!"}
              <span className="coral">.</span>
            </h1>
            <p className="muted">
              {r.winner === "citizens"
                ? "The citizens caught the bluff."
                : "The imposters take this round."}
            </p>
            <div className="answer-box">
              <span>THE SECRET WORD</span>
              <strong>{wordLabel(r.word, store.wordLanguage)}</strong>
            </div>
            <div className="score-list">
              {r.settings.names.map((name, i) => (
                <div key={i}>
                  <span
                    className={`player-avatar ${r.roles[i] ? "imposter-avatar" : ""}`}
                  >
                    {name[0]}
                  </span>
                  <span>
                    <strong>{name}</strong>
                    <small>
                      {r.roles[i] ? "Imposter" : "Citizen"}
                      {r.caught.includes(i) ? " · Caught" : ""}
                    </small>
                  </span>
                  <span className="vote-total">
                    {Object.values(r.votes).filter((v) => v === i).length} votes
                  </span>
                  <strong className="mint">+{r.points[i]}</strong>
                </div>
              ))}
            </div>
            <button className="primary full" onClick={rematch}>
              {t("again")}
              <ArrowRight size={18} />
            </button>
            <button
              className="text-button muted"
              onClick={() => {
                store.set({ round: null });
                router.push("/");
              }}
            >
              {t("home")}
            </button>
            <p className="small-text muted">
              <Check size={13} /> Scores saved on this device.
            </p>
          </>
        )}
        {error && <p className="error">{error}</p>}
      </motion.div>
      {cancel && (
        <div className="modal-backdrop">
          <section
            className="modal compact"
            role="alertdialog"
            aria-modal="true"
            aria-label="Cancel game"
            onKeyDown={(e) => {
              if (e.key === "Escape") setCancel(false);
            }}
          >
            <FocusGuard />
            <h2>Leave this round?</h2>
            <p className="muted">Unfinished rounds won’t add to your scores.</p>
            <button className="primary full" onClick={() => setCancel(false)}>
              Keep playing
            </button>
            <button
              className="secondary full"
              onClick={() => {
                store.set({ round: null });
                router.push("/");
              }}
            >
              Leave game
            </button>
          </section>
        </div>
      )}
    </section>
  );
}
