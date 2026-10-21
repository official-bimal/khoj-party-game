"use client";
import { create } from "zustand";
import { openDB } from "idb";
import { defaults, type Settings, type Round } from "@/lib/game";
import type { Word } from "@/lib/words";
import type { Language } from "@/lib/i18n";
type History = {
  id: string;
  at: string;
  names: string[];
  points: number[];
  winner: string;
  word: string;
  mode: Settings["mode"];
};
const db = () =>
  openDB("khoj-local", 1, {
    upgrade(db) {
      db.createObjectStore("data");
    },
  });
export async function localGet<T>(key: string, fallback: T): Promise<T> {
  try {
    return (await (await db()).get("data", key)) ?? fallback;
  } catch {
    return fallback;
  }
}
export async function localSet(key: string, value: unknown) {
  try {
    await (await db()).put("data", value, key);
  } catch {
    /* Game still works when storage is unavailable. */
  }
}
type Store = {
  language: Language;
  wordLanguage: Language;
  settings: Settings;
  custom: Word[];
  published: Word[];
  recent: string[];
  history: History[];
  round: Round | null;
  hydrated: boolean;
  sound: boolean;
  hydrate: () => Promise<void>;
  set: (data: Partial<Store>) => void;
  save: () => void;
  finish: (r: Round) => void;
};
export const useGame = create<Store>((set, get) => ({
  language: "roman",
  wordLanguage: "roman",
  settings: defaults,
  custom: [],
  published: [],
  recent: [],
  history: [],
  round: null,
  hydrated: false,
  sound: false,
  hydrate: async () => {
    const data = await localGet<Partial<Store>>("preferences", {});
    const custom = await localGet<Word[]>("custom", []);
    const published = await localGet<Word[]>("published", []);
    set({
      language: data.language || "roman",
      wordLanguage: data.wordLanguage || "roman",
      settings: data.settings || defaults,
      recent: data.recent || [],
      history: data.history || [],
      custom,
      published,
      hydrated: true,
      sound: data.sound || false,
    });
  },
  set: (data) => {
    set(data);
    get().save();
  },
  save: () => {
    const {
      language,
      wordLanguage,
      settings,
      recent,
      history,
      sound,
      custom,
      published,
    } = get();
    void localSet("preferences", {
      language,
      wordLanguage,
      settings,
      recent,
      history,
      sound,
    });
    void localSet("custom", custom);
    void localSet("published", published);
  },
  finish: (r) => {
    if (get().history.some((h) => h.id === r.id)) return;
    set({
      history: [
        {
          id: r.id,
          at: new Date().toISOString(),
          names: r.settings.names,
          points: r.points,
          winner: r.winner,
          word: r.word.canonical,
          mode: r.settings.mode,
        },
        ...get().history,
      ].slice(0, 100),
    });
    get().save();
  },
}));
