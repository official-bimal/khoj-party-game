"use client";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  Copy,
  Eye,
  EyeOff,
  Globe2,
  LockKeyhole,
  RefreshCw,
  Users,
  WifiOff,
} from "lucide-react";
import type { RoomView } from "@/lib/server/rooms";
import { useGame } from "@/stores/game-store";
import { wordLabel } from "@/lib/words";
export function Online() {
  const store = useGame(),
    [name, setName] = useState(""),
    [code, setCode] = useState(""),
    [room, setRoom] = useState<RoomView | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [shown, setShown] = useState(false),
    [guess, setGuess] = useState(""),
    [copied, setCopied] = useState(false),
    [connected, setConnected] = useState(true),
    [remaining, setRemaining] = useState(0);
  const roundId = useRef(""),
    roomCode = room?.code;
  useEffect(() => {
    queueMicrotask(() => {
      const invite = new URLSearchParams(window.location.search).get("room");
      if (invite && /^[A-Z2-9]{6}$/.test(invite)) setCode(invite);
      const saved = sessionStorage.getItem("khoj-room");
      if (saved) {
        setCode(saved);
        void fetch(`/api/rooms/${saved}`)
          .then((r) => r.json())
          .then((r) => {
            if (!r.error) setRoom(r);
          });
      }
    });
    const hide = () => setShown(false);
    window.addEventListener("blur", hide);
    document.addEventListener("visibilitychange", hide);
    return () => {
      window.removeEventListener("blur", hide);
      document.removeEventListener("visibilitychange", hide);
    };
  }, []);
  useEffect(() => {
    if (!roomCode) return;
    let alive = true;
    const poll = async () => {
      try {
        const res = await fetch(`/api/rooms/${roomCode}`, {
          cache: "no-store",
        });
        const next = await res.json();
        if (!alive) return;
        if (next.error) {
          setError(next.error);
          return;
        }
        if (roundId.current !== next.round?.id) {
          setShown(false);
          roundId.current = next.round?.id || "";
        }
        setRoom(next);
        setConnected(true);
        setRemaining(
          Math.max(
            0,
            Math.ceil(
              ((next.round?.deadline || next.serverTime) - next.serverTime) /
                1000,
            ),
          ),
        );
      } catch {
        if (alive) setConnected(false);
      }
    };
    const timer = setInterval(poll, 1500);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [roomCode]);
  async function call(action: string, extra: Record<string, unknown> = {}) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/rooms/${room?.code || code}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setRoom(data);
      sessionStorage.setItem("khoj-room", data.code);
      if (action === "reveal") setShown(false);
      return data;
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function create() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const state = await fetch(`/api/rooms/${data.code}`).then((r) =>
        r.json(),
      );
      if (state.error) throw new Error(state.error);
      setCode(data.code);
      setRoom(state);
      sessionStorage.setItem("khoj-room", data.code);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const r = room?.round,
    me = room?.players.findIndex((p) => p.id === room.me) ?? -1;
  return (
    <section className="online-page">
      {process.env.NEXT_PUBLIC_EPHEMERAL_ROOMS === "true" && (
        <p className="chaos-event" role="status">
          Free preview: rooms are temporary and reset when the server sleeps or
          restarts. Your offline games and saved packs stay on your device.
        </p>
      )}
      <div className="page-heading">
        <span className="pill">
          <Globe2 size={14} /> SAME DRAMA. DIFFERENT SCREENS.
        </span>
        <h1>{room ? "Your secret hangout." : "Doori jati, guff ustai."}</h1>
        <p className="muted">
          Private rooms. No signup. Bring your friends and a voice call.
        </p>
      </div>
      {!connected && (
        <div className="error" role="status">
          <WifiOff size={16} /> Connection lost. Reconnecting… Your identity
          stays safe.
        </div>
      )}
      {!room ? (
        <div className="online-entry">
          <label className="field-label">
            Your nickname
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={24}
              placeholder="What do your friends call you?"
              autoComplete="nickname"
            />
          </label>
          <button
            className="primary full"
            onClick={create}
            disabled={busy || !name.trim()}
          >
            Create private room
            <ArrowRight size={18} />
          </button>
          <div className="or-divider">or join the gang</div>
          <label className="field-label">
            Room code
            <input
              className="room-code-input"
              value={code}
              maxLength={6}
              placeholder="ABC123"
              onChange={(e) => setCode(e.target.value.toUpperCase())}
            />
          </label>
          <button
            className="secondary full"
            onClick={() => void call("join", { name })}
            disabled={busy || !name.trim() || code.length !== 6}
          >
            Join room
            <ArrowRight size={18} />
          </button>
        </div>
      ) : (
        <>
          <div className="room-header">
            <div>
              <span className="eyebrow">ROOM CODE</span>
              <strong>{room.code}</strong>
            </div>
            <button
              className="secondary"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(
                    `${location.origin}/online?room=${room.code}`,
                  );
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                } catch {
                  setError(
                    "Copy this invitation: " +
                      `${location.origin}/online?room=${room.code}`,
                  );
                }
              }}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}{" "}
              {copied ? "Copied!" : "Invite friends"}
            </button>
          </div>
          {room.closed ? (
            <div className="game-panel">
              <h2>The host closed this room.</h2>
              <button
                className="primary"
                onClick={() => {
                  sessionStorage.removeItem("khoj-room");
                  setRoom(null);
                }}
              >
                Find a new gang
              </button>
            </div>
          ) : !r || r.phase === "results" ? (
            <div className="lobby-grid">
              <section className="panel">
                <span className="eyebrow">
                  THE SUSPECTS · {room.players.length}/20
                </span>
                <h2>{r ? "Ready for round two?" : "Gather the gang."}</h2>
                <div className="score-list">
                  {room.players.map((p) => (
                    <div key={p.id}>
                      <span className="player-avatar">{p.name[0]}</span>
                      <span>
                        <strong>
                          {p.name}
                          {p.id === room.me ? " (you)" : ""}
                        </strong>
                        <small>
                          {p.id === room.host ? "Host · " : ""}
                          {p.online ? "Connected" : "Away"} · {p.score} pts
                        </small>
                      </span>
                      <span className={p.ready ? "mint" : "muted"}>
                        {p.ready ? "Ready" : "Waiting"}
                      </span>
                    </div>
                  ))}
                </div>
                <button
                  className="secondary full"
                  disabled={busy}
                  onClick={() => void call("ready")}
                >
                  {room.players[me]?.ready ? "Not ready" : "I’m ready"}{" "}
                  <Check size={17} />
                </button>
                {room.host === room.me && (
                  <>
                    <button
                      className="primary full"
                      disabled={
                        busy ||
                        room.players.length < 3 ||
                        room.players.some((p) => !p.ready)
                      }
                      onClick={() =>
                        void call("start", {
                          settings: { ...store.settings, names: undefined },
                        })
                      }
                    >
                      Start round <ArrowRight size={18} />
                    </button>
                    <p className="small-text muted">
                      Uses your setup settings. At least 3 ready players
                      required.
                    </p>
                    <label className="field-label">
                      Transfer host
                      <select
                        value=""
                        onChange={(e) => {
                          if (e.target.value)
                            void call("transfer", { target: e.target.value });
                        }}
                      >
                        <option value="">Choose a player</option>
                        {room.players
                          .filter((p) => p.id !== room.me)
                          .map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                      </select>
                    </label>
                    <button
                      className="text-button coral"
                      onClick={() => void call("close")}
                    >
                      Close room
                    </button>
                  </>
                )}
              </section>
              <aside className="panel lobby-aside">
                {r?.result ? (
                  <>
                    <span className="eyebrow">
                      ROUND {room.roundNumber} · RESULTS
                    </span>
                    <h2>
                      {r.result.winner === "citizens"
                        ? "Pakdiyau!"
                        : "Ullu banayo!"}
                    </h2>
                    <div className="answer-box">
                      <span>SECRET WORD</span>
                      <strong>
                        {wordLabel(r.result.word, store.wordLanguage)}
                      </strong>
                    </div>
                    {room.players.map((p, i) => (
                      <p key={p.id}>
                        {p.name} · {r.result!.roles[i] ? "Imposter" : "Citizen"}{" "}
                        · +{r.result!.points[i] || 0}
                      </p>
                    ))}
                  </>
                ) : (
                  <>
                    <Users size={42} />
                    <h2>
                      Voice call on.
                      <br />
                      Poker face on.
                    </h2>
                    <p className="muted">
                      Give clues out loud. Vote privately on your own phone.
                      Your card belongs to you alone.
                    </p>
                    <span className="security-note">
                      <LockKeyhole size={15} /> Server-managed roles. Private
                      votes.
                    </span>
                  </>
                )}
              </aside>
            </div>
          ) : (
            <div className="game-panel online-round">
              <span className="eyebrow">
                ROUND {room.roundNumber} · {r.phase.toUpperCase()}
              </span>
              {r.phase === "reveals" && (
                <>
                  <h1>For your eyes only.</h1>
                  {r.myRevealed ? (
                    <>
                      <Check size={42} className="mint" />
                      <p>Your card is hidden. Waiting for the gang.</p>
                      <p>
                        {r.revealed}/{room.players.length} players ready
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="secret-card">
                        {shown && r.private ? (
                          <>
                            <Eye size={32} />
                            <h2>
                              {r.private.word
                                ? typeof r.private.word === "string"
                                  ? r.private.word
                                  : wordLabel(
                                      r.private.word as Parameters<
                                        typeof wordLabel
                                      >[0],
                                      store.wordLanguage,
                                    )
                                : "Timi nai Imposter hau!"}
                            </h2>
                            <p>
                              {r.private.hint ||
                                (!r.private.word
                                  ? "Blend in. Find the secret word."
                                  : "Give a subtle clue.")}
                            </p>
                          </>
                        ) : (
                          <LockKeyhole size={44} />
                        )}
                      </div>
                      <button
                        className="primary full"
                        disabled={busy}
                        onClick={() =>
                          shown ? void call("reveal") : setShown(true)
                        }
                      >
                        {shown ? (
                          <>
                            <EyeOff size={18} />
                            Hide my card & get ready
                          </>
                        ) : (
                          <>
                            <Eye size={18} />
                            Reveal my card
                          </>
                        )}
                      </button>
                    </>
                  )}
                </>
              )}
              {r.phase === "discussion" && (
                <>
                  <h1>Aba shanka suru!</h1>
                  <div className="countdown">
                    {Math.floor(remaining / 60)}:
                    {String(remaining % 60).padStart(2, "0")}
                  </div>
                  <p className="muted">
                    Speaking order:{" "}
                    {r.order.map((i) => room.players[i]?.name).join(" → ")}
                  </p>
                  {r.event && <p className="chaos-event">{r.event}</p>}
                  {room.host === room.me && (
                    <button
                      className="primary full"
                      disabled={busy}
                      onClick={() => void call("voting")}
                    >
                      Start voting
                      <ArrowRight size={18} />
                    </button>
                  )}
                </>
              )}
              {r.phase === "voting" && (
                <>
                  <h1>Who’s bluffing?</h1>
                  <p>
                    {r.voteCount}/{room.players.length} votes in · {remaining}s
                    left
                  </p>
                  {r.hasVoted ? (
                    <p className="mint">
                      <Check /> Vote locked. Waiting for everyone.
                    </p>
                  ) : (
                    <>
                      <div className="vote-grid">
                        {room.players.map(
                          (p, i) =>
                            p.id !== room.me && (
                              <button
                                key={p.id}
                                disabled={busy}
                                onClick={() => void call("vote", { target: i })}
                              >
                                <span className="player-avatar">
                                  {p.name[0]}
                                </span>
                                {p.name}
                                <ArrowRight size={15} />
                              </button>
                            ),
                        )}
                      </div>
                      <button
                        className="secondary full"
                        disabled={busy}
                        onClick={() => void call("vote", { target: -1 })}
                      >
                        Abstain
                      </button>
                    </>
                  )}
                </>
              )}
              {r.phase === "guess" && (
                <>
                  <h1>One last chance.</h1>
                  {r.canGuess ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        void call("guess", { guess });
                        setGuess("");
                      }}
                    >
                      <label className="field-label">
                        Secret word
                        <input
                          value={guess}
                          maxLength={100}
                          onChange={(e) => setGuess(e.target.value)}
                          required
                          autoComplete="off"
                        />
                      </label>
                      <button className="primary full" disabled={busy}>
                        Guess the word <ArrowRight size={16} />
                      </button>
                    </form>
                  ) : (
                    <p className="muted">
                      The caught imposter is guessing. The truth is coming…
                    </p>
                  )}
                  <p>{remaining}s remaining</p>
                </>
              )}
            </div>
          )}
          <button
            className="text-button muted"
            onClick={() => {
              setShown(false);
              setRoom(null);
              sessionStorage.removeItem("khoj-room");
            }}
          >
            Leave screen (your room session is preserved)
          </button>
        </>
      )}
      {busy && (
        <p className="small-text muted" role="status">
          <RefreshCw size={14} /> Connecting…
        </p>
      )}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
