"use client";
import { FocusGuard } from "./focus-guard";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Clock3,
  Eye,
  Flame,
  Globe2,
  Minus,
  Plus,
  Settings2,
  Shuffle,
  Smartphone,
  Users,
  X,
} from "lucide-react";
import { useGame } from "@/stores/game-store";
import {
  createRound,
  defaults,
  settingsSchema,
  type Settings,
} from "@/lib/game";
import { categories, selectWord } from "@/lib/words";
import { seedWords, themedPacks } from "@/data/seed";
import { translate } from "@/lib/i18n";
export function Setup() {
  const store = useGame(),
    router = useRouter(),
    s = store.settings;
  const t = (key: Parameters<typeof translate>[1]) =>
    translate(store.language, key);
  const [panel, setPanel] = useState<"players" | "categories" | null>(null),
    [advanced, setAdvanced] = useState(false),
    [error, setError] = useState("");
  function update(data: Partial<Settings>) {
    store.set({ settings: { ...s, ...data } });
  }
  function start(quick = false) {
    try {
      const settings = settingsSchema.parse(
        quick
          ? {
              ...defaults,
              categories: [
                `c${[1, 2, 14, 19, 21][Math.floor(Math.random() * 5)]}`,
              ],
            }
          : s,
      );
      let pool = [
        ...seedWords.filter((w) => w.age < 18),
        ...store.published,
        ...store.custom,
      ];
      if (settings.mode === "undercover") pool = pool.filter((w) => w.related);
      const word = selectWord(
        pool,
        settings.categories,
        settings.difficulty,
        store.recent,
      );
      store.set({
        round: createRound(settings, word),
        settings,
        recent: [...store.recent.slice(-30), word.id],
      });
      window.scrollTo({ top: 0 });
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <section id="setup" className="setup-wrap">
      <div className="section-heading">
        <div>
          <span className="section-note">Sathi haru ready?</span>
          <h2>{t("setup")}</h2>
        </div>
        <button className="text-button" onClick={() => start(true)}>
          <Shuffle size={16} />
          {t("quick")} <ArrowRight size={15} />
        </button>
      </div>
      <div className="mode-tabs" role="tablist" aria-label="Game mode">
        <button
          role="tab"
          aria-selected={s.mode === "classic"}
          onClick={() => update({ mode: "classic" })}
        >
          <Smartphone size={18} />
          {t("classic")}
        </button>
        <button
          role="tab"
          aria-selected={false}
          onClick={() => router.push("/online")}
        >
          <Globe2 size={18} />
          {t("online")}
        </button>
        <button
          role="tab"
          aria-selected={s.mode === "chaos"}
          onClick={() => update({ mode: "chaos" })}
        >
          <Flame size={18} />
          {t("chaos")}
        </button>
        <button
          role="tab"
          aria-selected={s.mode === "undercover"}
          onClick={() => update({ mode: "undercover" })}
        >
          <Eye size={18} />
          {t("undercover")}
        </button>
      </div>
      <div className="setup-card">
        <div className="setup-grid">
          <div className="setting-block">
            <div className="setting-label">
              <Users size={18} />
              <label>{t("players")}</label>
              <span>3–20</span>
            </div>
            <div className="stepper">
              <button
                aria-label="Remove player"
                disabled={s.names.length <= 3}
                onClick={() => {
                  const names = s.names.slice(0, -1);
                  update({
                    names,
                    imposters: Math.min(
                      s.imposters,
                      Math.floor((names.length - 1) / 2),
                    ),
                  });
                }}
              >
                <Minus size={18} />
              </button>
              <strong>{String(s.names.length).padStart(2, "0")}</strong>
              <button
                aria-label="Add player"
                disabled={s.names.length >= 20}
                onClick={() =>
                  update({
                    names: [...s.names, `Player ${s.names.length + 1}`],
                  })
                }
              >
                <Plus size={18} />
              </button>
            </div>
            <button
              className="text-button muted"
              onClick={() => setPanel("players")}
            >
              Edit player names <ArrowRight size={13} />
            </button>
          </div>
          <div className="setting-block">
            <div className="setting-label">
              <Eye size={18} />
              <label>{t("imposters")}</label>
            </div>
            <div className="stepper">
              <button
                aria-label="Fewer imposters"
                disabled={s.imposters <= 1}
                onClick={() => update({ imposters: s.imposters - 1 })}
              >
                <Minus size={18} />
              </button>
              <strong>{String(s.imposters).padStart(2, "0")}</strong>
              <button
                aria-label="More imposters"
                disabled={s.imposters >= Math.floor((s.names.length - 1) / 2)}
                onClick={() => update({ imposters: s.imposters + 1 })}
              >
                <Plus size={18} />
              </button>
            </div>
            <p className="muted small-text">One of you is a little sus.</p>
          </div>
          <div className="setting-block category-setting">
            <div className="setting-label">
              <Shuffle size={18} />
              <label>{t("categories")}</label>
            </div>
            <button
              className="select-box"
              onClick={() => setPanel("categories")}
            >
              <div>
                <strong>
                  {s.categories.length
                    ? `${s.categories.length} selected`
                    : t("all")}
                </strong>
                <span>Food, places, people & everyday things</span>
              </div>
              <ChevronDown size={18} />
            </button>
            <div className="category-dots">
              <span>30 Nepali-first categories</span>
            </div>
          </div>
        </div>
        <div className="setup-bottom">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={s.hints}
              onChange={(e) => update({ hints: e.target.checked })}
            />
            <span className="toggle" />
            {t("hints")}
          </label>
          <label className="timer-label">
            <Clock3 size={16} />
            {t("timer")}
            <select
              aria-label="Discussion duration"
              value={s.seconds}
              onChange={(e) => update({ seconds: Number(e.target.value) })}
            >
              <option value={60}>1 min</option>
              <option value={180}>3 min</option>
              <option value={300}>5 min</option>
              <option value={600}>10 min</option>
            </select>
          </label>
          <button
            className="text-button muted"
            onClick={() => setAdvanced(!advanced)}
            aria-expanded={advanced}
          >
            <Settings2 size={16} /> More settings
          </button>
        </div>
        {advanced && (
          <div className="advanced">
            <label>
              {t("difficulty")}
              <select
                value={s.difficulty}
                onChange={(e) =>
                  update({
                    difficulty: e.target.value as Settings["difficulty"],
                  })
                }
              >
                <option value="mixed">Mixed</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </label>
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={s.guess}
                onChange={(e) => update({ guess: e.target.checked })}
              />
              <span className="toggle" />
              {t("finalGuess")}
            </label>
            <fieldset className="scoring-settings">
              <legend>Points per round</legend>
              {(
                Object.keys(defaults.scoring) as (keyof Settings["scoring"])[]
              ).map((key) => (
                <label key={key}>
                  {
                    {
                      citizenWin: "Citizen win",
                      imposterSurvival: "Imposter survives",
                      imposterGuess: "Correct final guess",
                      correctVote: "Correct vote",
                    }[key]
                  }
                  <input
                    type="number"
                    min={0}
                    max={1000}
                    step={25}
                    value={(s.scoring || defaults.scoring)[key]}
                    onChange={(e) =>
                      update({
                        scoring: {
                          ...(s.scoring || defaults.scoring),
                          [key]: Number(e.target.value),
                        },
                      })
                    }
                  />
                </label>
              ))}
            </fieldset>
            <p className="muted small-text">
              Undercover: receive related words and find the odd word. Chaos:
              shuffled clues, surprise prompts and bluffing bonuses.
            </p>
          </div>
        )}
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <button className="primary start-button" onClick={() => start()}>
          {t("start")}
          <ArrowRight size={19} />
        </button>
        <p className="setup-note">
          Phone pass gare pugchha. Download garnu pardaina.
        </p>
      </div>
      {panel && (
        <div className="modal-backdrop" onClick={() => setPanel(null)}>
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label={panel === "players" ? t("names") : t("categories")}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Escape") setPanel(null);
            }}
          >
            <FocusGuard />
            <div className="section-heading">
              <h2>{panel === "players" ? t("names") : t("categories")}</h2>
              <button
                className="icon-button"
                aria-label="Close"
                onClick={() => setPanel(null)}
              >
                <X />
              </button>
            </div>
            {panel === "players" ? (
              <div className="player-inputs">
                {s.names.map((name, i) => (
                  <label key={i}>
                    <span>{i + 1}</span>
                    <input
                      aria-label={`Player ${i + 1} name`}
                      value={name}
                      maxLength={24}
                      onChange={(e) =>
                        update({
                          names: s.names.map((n, j) =>
                            i === j ? e.target.value : n,
                          ),
                        })
                      }
                    />
                  </label>
                ))}
              </div>
            ) : (
              <>
                <button
                  className="text-button"
                  onClick={() => update({ categories: [] })}
                >
                  Use all categories
                </button>
                <div className="category-list">
                  {[
                    ...categories,
                    ...(store.custom.length
                      ? [{ id: "custom", name: "Your custom words" }]
                      : []),
                  ].map((c) => (
                    <button
                      key={c.id}
                      className={s.categories.includes(c.id) ? "chosen" : ""}
                      onClick={() =>
                        update({
                          categories: s.categories.includes(c.id)
                            ? s.categories.filter((id) => id !== c.id)
                            : [...s.categories, c.id],
                        })
                      }
                    >
                      {c.name}
                      <span>
                        {s.categories.includes(c.id) ? (
                          <Check size={16} />
                        ) : (
                          <Plus size={16} />
                        )}
                      </span>
                    </button>
                  ))}
                </div>
                <h3>Themed mixes</h3>
                <div className="pack-chips">
                  {themedPacks.map((p) => (
                    <button
                      key={p.name}
                      onClick={() => update({ categories: p.categories })}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </>
            )}
            <button className="primary full" onClick={() => setPanel(null)}>
              {t("save")}
            </button>
          </section>
        </div>
      )}
    </section>
  );
}
