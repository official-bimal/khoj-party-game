"use client";
import { useState } from "react";
import {
  ArrowRight,
  Download,
  Plus,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import {
  categories,
  parseWords,
  validateImport,
  wordSchema,
  type Word,
} from "@/lib/words";
import { seedWords } from "@/data/seed";
import { useGame } from "@/stores/game-store";
import Link from "next/link";
function download(value: unknown, name: string) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function CustomWords() {
  const store = useGame(),
    [canonical, setCanonical] = useState(""),
    [ne, setNe] = useState(""),
    [hint, setHint] = useState(""),
    [related, setRelated] = useState(""),
    [text, setText] = useState(""),
    [error, setError] = useState(""),
    [success, setSuccess] = useState("");
  function save(words: Word[]) {
    try {
      const next = validateImport([...store.custom, ...words]);
      store.set({ custom: next });
      setError("");
      setSuccess(
        `${words.length} word${words.length === 1 ? "" : "s"} added. Saved on this device.`,
      );
      return true;
    } catch (e) {
      setSuccess("");
      setError((e as Error).message);
      return false;
    }
  }
  function add() {
    try {
      const word = wordSchema.parse({
        id: `custom-${crypto.randomUUID()}`,
        canonical,
        roman: canonical,
        ne,
        en: canonical,
        hint,
        related,
        categoryIds: ["custom"],
        source: "Local user-created pack",
      });
      if (save([word])) {
        setCanonical("");
        setNe("");
        setHint("");
        setRelated("");
      }
    } catch (e) {
      setError((e as Error).message);
    }
  }
  function importText(value: string) {
    try {
      save(parseWords(value));
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <section className="content-page">
      <span className="eyebrow">YOUR INSIDE JOKES. YOUR RULES.</span>
      <h1>
        Your words. More drama<span className="coral">.</span>
      </h1>
      <p className="muted">
        Make a pack for your group. Words stay on this device. Choose “Your
        custom words” in game categories to play them.
      </p>
      <div className="content-layout">
        <section className="panel">
          <h2>Add a word</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              add();
            }}
          >
            <label className="field-label">
              Word / Roman Nepali
              <input
                value={canonical}
                onChange={(e) => setCanonical(e.target.value)}
                maxLength={80}
                required
                placeholder="e.g. Hostel ko chiya"
              />
            </label>
            <label className="field-label">
              नेपाली (optional)
              <input
                value={ne}
                onChange={(e) => setNe(e.target.value)}
                maxLength={100}
              />
            </label>
            <label className="field-label">
              Spoiler-safe hint (optional)
              <input
                value={hint}
                onChange={(e) => setHint(e.target.value)}
                maxLength={150}
              />
            </label>
            <label className="field-label">
              Related word for Undercover (optional)
              <input
                value={related}
                onChange={(e) => setRelated(e.target.value)}
                maxLength={100}
              />
            </label>
            <button className="primary full">
              <Plus size={17} />
              Add word
            </button>
          </form>
        </section>
        <section className="panel">
          <h2>Bring your own pack</h2>
          <p className="muted small-text">
            Import JSON or CSV. CSV columns: canonical,ne,roman,en,hint. Maximum
            10,000 entries. Duplicates are rejected.
          </p>
          <label className="field-label">
            Paste CSV / JSON
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={
                "canonical,ne,roman,en,hint\nMomo,मःमः,Momo,Dumplings,A steamed snack"
              }
            />
          </label>
          <div className="inline-actions">
            <button
              className="secondary"
              disabled={!text.trim()}
              onClick={() => importText(text)}
            >
              <Upload size={16} />
              Import text
            </button>
            <label className="file-label">
              Choose file
              <input
                type="file"
                accept=".csv,.json,text/csv,application/json"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 1000000) {
                      setError("File must be smaller than 1 MB");
                      return;
                    }
                    const value = await file.text();
                    setText(value);
                    importText(value);
                  }
                }}
              />
            </label>
          </div>
          <button
            className="text-button"
            disabled={!store.custom.length}
            onClick={() => download(store.custom, "khoj-custom-pack.json")}
          >
            <Download size={16} />
            Export your pack
          </button>
        </section>
      </div>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {success && (
        <p className="success" role="status">
          {success}
        </p>
      )}
      <div className="section-heading" style={{ marginTop: 35 }}>
        <h2>
          Your pack <span className="muted">({store.custom.length})</span>
        </h2>
        <Link className="text-button" href="/">
          Let’s play <ArrowRight size={16} />
        </Link>
      </div>
      {!store.custom.length ? (
        <p className="muted">
          No words yet. Your first inside joke belongs here.
        </p>
      ) : (
        <div className="table-scroll">
          <table className="word-table">
            <thead>
              <tr>
                <th>WORD</th>
                <th>HINT</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {store.custom.map((w) => (
                <tr key={w.id}>
                  <td>
                    {w.canonical}
                    <small>{w.ne}</small>
                  </td>
                  <td>{w.hint || "—"}</td>
                  <td>
                    <button
                      aria-label={`Delete ${w.canonical}`}
                      onClick={() =>
                        store.set({
                          custom: store.custom.filter((x) => x.id !== w.id),
                        })
                      }
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
export function Library() {
  const store = useGame(),
    [search, setSearch] = useState(""),
    [category, setCategory] = useState(""),
    [page, setPage] = useState(0),
    [status, setStatus] = useState("");
  const official = [
    ...new Map(
      [...seedWords, ...store.published].map((w) => [w.id, w]),
    ).values(),
  ];
  const filtered = official.filter(
    (w) =>
      (!category || w.categoryIds.includes(category)) &&
      [w.canonical, w.ne, ...w.aliases].some((s) =>
        s.toLowerCase().includes(search.toLowerCase()),
      ),
  );
  const approved = official.filter(
    (w) => w.status === "approved" && w.reviewedBy,
  );
  async function sync() {
    try {
      const res = await fetch("/api/packs");
      if (!res.ok) throw new Error("Could not fetch published pack");
      const data = await res.json();
      const words = validateImport(data.words.length ? data.words : seedWords);
      store.set({ published: words.filter((w) => w.status === "approved") });
      setStatus(
        `Pack v${data.version} checked. ${data.words.length} approved words cached.`,
      );
    } catch {
      setStatus("Could not update. Your cached starter pack still works.");
    }
  }
  return (
    <section className="content-page">
      <span className="eyebrow">MOMO DEKHI MACHHAPUCHHRE SAMMA</span>
      <h1>
        A little more Nepali<span className="coral">.</span>
      </h1>
      <p className="muted">
        Real, playable vocabulary. Honest numbers. The starter collection is
        AI-authored and awaits independent Nepali editorial review. It is
        available as a clearly labelled starter pack.
      </p>
      <div className="stats-grid">
        <div className="stat">
          <strong>{official.length}</strong>
          <span>Distinct starter & published entries</span>
        </div>
        <div className="stat">
          <strong>{approved.length}</strong>
          <span>Editorially approved entries</span>
        </div>
        <div className="stat">
          <strong>30</strong>
          <span>Categories with starter vocabulary</span>
        </div>
      </div>
      <div className="inline-actions">
        <button className="secondary" onClick={sync}>
          <Download size={16} />
          Update offline packs
        </button>
        <Link href="/custom" className="text-button">
          Make your own pack <ArrowRight size={16} />
        </Link>
      </div>
      {status && (
        <p role="status" className="success">
          {status}
        </p>
      )}
      <div className="filter-bar">
        <label className="sr-only" htmlFor="word-search">
          Search words
        </label>
        <input
          id="word-search"
          placeholder="Search in Nepali or English…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
        />
        <select
          aria-label="Filter category"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(0);
          }}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} (
              {official.filter((w) => w.categoryIds.includes(c.id)).length})
            </option>
          ))}
        </select>
      </div>
      <div className="table-scroll">
        <table className="word-table">
          <thead>
            <tr>
              <th>WORD</th>
              <th>CATEGORY</th>
              <th>DIFFICULTY</th>
              <th>REVIEW</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(page * 25, (page + 1) * 25).map((w) => (
              <tr key={w.id}>
                <td>
                  <strong>{w.canonical}</strong>
                  <small>{w.ne}</small>
                </td>
                <td>
                  {categories.find((c) => c.id === w.categoryIds[0])?.name}
                </td>
                <td>{w.difficulty}</td>
                <td>{w.reviewedBy ? w.status : "Pending"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!filtered.length && (
        <p className="muted">No words found. Try another search.</p>
      )}
      <div className="pagination">
        <button
          className="secondary"
          disabled={page === 0}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </button>
        <span>
          {filtered.length} words · Page {page + 1}
        </span>
        <button
          className="secondary"
          disabled={(page + 1) * 25 >= filtered.length}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
      <section className="prose">
        <h2>A library built to grow</h2>
        <p>
          Categories support nested paths in the database. Each entry tracks
          source, aliases, region, difficulty, suitability, review status and
          version. This starter set has no hard entries. Coverage counts and
          difficulty labels above reflect actual data.
        </p>
        <p>
          Want to help review words or spot a mistake? Export the pack, record
          the entry ID and proposed correction, and give it to your site
          operator. A public reporting service is on the roadmap.
        </p>
      </section>
    </section>
  );
}
export function Admin() {
  const [token, setToken] = useState(""),
    [words, setWords] = useState<Word[] | null>(null),
    [version, setVersion] = useState(1),
    [error, setError] = useState(""),
    [search, setSearch] = useState(""),
    [reviewer, setReviewer] = useState(""),
    [raw, setRaw] = useState(""),
    [audit, setAudit] = useState<
      { at: string; action: string; word: string }[]
    >([]);
  async function request(action?: string, extra: Record<string, unknown> = {}) {
    setError("");
    try {
      const res = await fetch("/api/admin", {
        method: action ? "POST" : "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        ...(action ? { body: JSON.stringify({ action, ...extra }) } : {}),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setWords(data.words);
      setVersion(data.version);
      setAudit(data.audit);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <section className="content-page">
      <span className="eyebrow">PROTECTED CONTENT WORKSPACE</span>
      <h1>
        Make every word count<span className="coral">.</span>
      </h1>
      {!words ? (
        <form
          className="panel admin-login"
          onSubmit={(e) => {
            e.preventDefault();
            void request();
          }}
        >
          <label className="field-label">
            Admin access token
            <input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              type="password"
              autoComplete="current-password"
              required
            />
          </label>
          <button className="primary full">
            Unlock dashboard <ArrowRight size={16} />
          </button>
          <p className="muted small-text">
            Configured server-side with ADMIN_TOKEN. Never saved in the browser.
          </p>
        </form>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat">
              <strong>{words.length}</strong>
              <span>Total entries</span>
            </div>
            <div className="stat">
              <strong>
                {words.filter((w) => w.status === "approved").length}
              </strong>
              <span>Approved · v{version}</span>
            </div>
            <div className="stat">
              <strong>
                {words.filter((w) => w.status === "draft").length}
              </strong>
              <span>Awaiting review</span>
            </div>
          </div>
          <div className="inline-actions">
            <button
              className="secondary"
              onClick={() => download(words, "khoj-editorial-export.json")}
            >
              <Download size={16} />
              Export
            </button>
            <button className="primary" onClick={() => void request("publish")}>
              Publish approved pack
            </button>
            <button
              className="text-button muted"
              onClick={() => {
                setToken("");
                setWords(null);
              }}
            >
              Lock dashboard
            </button>
          </div>
          <div className="content-layout">
            <label className="field-label">
              Reviewer name (recorded on decisions)
              <input
                value={reviewer}
                onChange={(e) => setReviewer(e.target.value)}
                placeholder="Your real editorial identity"
              />
            </label>
            <div>
              <label className="field-label">
                Bulk import JSON / CSV, or edit one complete entry
                <textarea
                  value={raw}
                  onChange={(e) => setRaw(e.target.value)}
                />
              </label>
              <div className="inline-actions">
                <button
                  className="secondary"
                  onClick={() => {
                    try {
                      void request("import", { words: parseWords(raw) });
                    } catch (e) {
                      setError((e as Error).message);
                    }
                  }}
                >
                  Import as drafts
                </button>
                <button
                  className="secondary"
                  onClick={() => {
                    try {
                      void request("save", {
                        word: wordSchema.parse(JSON.parse(raw)),
                      });
                    } catch (e) {
                      setError((e as Error).message);
                    }
                  }}
                >
                  Save entry as draft
                </button>
              </div>
            </div>
          </div>
          <div className="filter-bar">
            <Search size={20} />
            <input
              aria-label="Search admin words"
              placeholder="Search words or review status"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="table-scroll">
            <table className="word-table">
              <thead>
                <tr>
                  <th>WORD</th>
                  <th>STATUS</th>
                  <th>EDITORIAL ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {words
                  .filter((w) =>
                    `${w.canonical} ${w.status}`
                      .toLowerCase()
                      .includes(search.toLowerCase()),
                  )
                  .slice(0, 100)
                  .map((w) => (
                    <tr key={w.id}>
                      <td>
                        {w.canonical}
                        <small>
                          {w.ne} · {w.id}
                        </small>
                      </td>
                      <td>
                        {w.status}
                        <small>{w.reviewedBy}</small>
                      </td>
                      <td>
                        <button
                          onClick={() => {
                            setRaw(JSON.stringify(w, null, 2));
                            window.scrollTo({ top: 250, behavior: "smooth" });
                          }}
                        >
                          Edit
                        </button>
                        <button
                          disabled={reviewer.trim().length < 2}
                          onClick={() =>
                            void request("approve", { id: w.id, reviewer })
                          }
                        >
                          Approve
                        </button>
                        <button
                          disabled={reviewer.trim().length < 2}
                          onClick={() =>
                            void request("reject", { id: w.id, reviewer })
                          }
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => void request("delete", { id: w.id })}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <p className="small-text muted">
            Showing up to 100 matching entries. Search to narrow the list.
          </p>
          <h2 style={{ marginTop: 30 }}>Recent audit activity</h2>
          {audit.slice(0, 15).map((a, i) => (
            <p className="muted small-text" key={i}>
              {a.at} · {a.action} · {a.word}
            </p>
          ))}
        </>
      )}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
