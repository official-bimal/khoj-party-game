"use client";
import { useGame } from "@/stores/game-store";
import type { Language } from "@/lib/i18n";
import { useState } from "react";
export function SettingsPage() {
  const store = useGame();
  const [mode, setMode] = useState("classic");
  const history = store.history.filter((h) => (h.mode || "classic") === mode);
  const scores = new Map<string, number>();
  for (const h of history)
    h.names.forEach((name, i) =>
      scores.set(name, (scores.get(name) || 0) + h.points[i]),
    );
  return (
    <section className="content-page">
      <div className="page-heading">
        <span className="eyebrow">YOUR GANG. YOUR VIBE.</span>
        <h1>
          A little more you<span className="coral">.</span>
        </h1>
        <p className="muted">
          Preferences and finished rounds stay on this device.
        </p>
      </div>
      <div className="settings-grid">
        <section className="panel">
          <h2>Language & sound</h2>
          <label className="field-label">
            Interface language
            <select
              value={store.language}
              onChange={(e) =>
                store.set({ language: e.target.value as Language })
              }
            >
              <option value="roman">Roman Nepali</option>
              <option value="ne">नेपाली</option>
              <option value="en">English</option>
            </select>
          </label>
          <label className="field-label">
            Word language
            <select
              value={store.wordLanguage}
              aria-label="Word language"
              onChange={(e) =>
                store.set({ wordLanguage: e.target.value as Language })
              }
            >
              <option value="roman">Roman Nepali</option>
              <option value="ne">नेपाली</option>
              <option value="en">English</option>
            </select>
          </label>
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={store.sound}
              onChange={(e) => store.set({ sound: e.target.checked })}
            />
            <span className="toggle" />
            Card reveal sound
          </label>
          <p className="muted small-text">
            Sound is off by default. Motion follows your device’s reduced-motion
            setting.
          </p>
        </section>
        <section className="panel">
          <h2>Your table’s scoreboard</h2>
          <label className="field-label">
            Game mode
            <select value={mode} onChange={(e) => setMode(e.target.value)}>
              <option value="classic">Classic</option>
              <option value="undercover">Undercover</option>
              <option value="chaos">Nepali Chaos</option>
            </select>
          </label>
          <p className="muted">{history.length} completed local rounds</p>
          {scores.size ? (
            <div className="score-list">
              {[...scores]
                .sort((a, b) => b[1] - a[1])
                .map(([name, score]) => (
                  <div key={name}>
                    <span className="player-avatar">{name[0]}</span>
                    <span>{name}</span>
                    <strong className="mint">{score}</strong>
                  </div>
                ))}
            </div>
          ) : (
            <p className="muted">
              The first round is anyone’s game. Go make some memories.
            </p>
          )}
        </section>
      </div>
    </section>
  );
}
