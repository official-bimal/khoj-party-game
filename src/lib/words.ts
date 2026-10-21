import { z } from "zod";
export const categoryNames = [
  "Nepali Food",
  "Nepali Street Food",
  "Nepali Drinks",
  "Nepali Celebrities",
  "Nepali Actors and Actresses",
  "Nepali Singers",
  "Nepali Comedians",
  "Nepali YouTubers and Creators",
  "Nepali Movies",
  "Nepali Songs and Music",
  "Nepali Cricket",
  "Nepali Football",
  "Nepali Sports Personalities",
  "Nepali Cities",
  "Nepali Villages and Districts",
  "Nepali Mountains",
  "Nepali Tourist Destinations",
  "Nepali Temples and Landmarks",
  "Nepali Festivals",
  "Nepali Traditions and Culture",
  "Nepali Household Objects",
  "Nepali School and College Life",
  "Nepali Slang",
  "Nepali Gen Z Culture",
  "Nepali Memes and Internet Culture",
  "Nepali Relationships and Family",
  "Nepali Transportation",
  "Nepali Animals and Nature",
  "Nepali Brands and Products",
  "Everyday Global Objects",
];
export const categories = categoryNames.map((name, i) => ({
  id: `c${i + 1}`,
  name,
}));
export const wordSchema = z.object({
  id: z.string().min(1).max(100),
  canonical: z.string().trim().min(2).max(80),
  ne: z.string().max(100).default(""),
  roman: z.string().max(100).default(""),
  en: z.string().max(100).default(""),
  aliases: z.array(z.string().max(100)).max(20).default([]),
  categoryIds: z.array(z.string().max(80)).min(1).max(10),
  difficulty: z.enum(["easy", "medium", "hard"]).default("easy"),
  hint: z.string().max(150).default(""),
  region: z.string().max(100).default("Nepal"),
  age: z.number().int().min(0).max(18).default(6),
  source: z.string().max(500).default("User supplied"),
  status: z.enum(["draft", "approved", "rejected"]).default("draft"),
  reviewedBy: z.string().max(100).nullable().default(null),
  active: z.boolean().default(true),
  version: z.number().int().positive().default(1),
  popularity: z.number().min(0).default(1),
  playCount: z.number().int().min(0).default(0),
  lastPlayed: z.string().nullable().default(null),
  related: z.string().max(100).default(""),
});
export type Word = z.infer<typeof wordSchema>;
export const normalize = (s: string) =>
  s
    .normalize("NFKC")
    .trim()
    .toLocaleLowerCase()
    .replace(/[\s\p{P}]+/gu, "");
export function validateImport(input: unknown): Word[] {
  const parsed = z.array(wordSchema).min(1).max(10000).parse(input);
  const seen = new Set<string>(),
    ids = new Set<string>();
  return parsed.map((w) => {
    if (ids.has(w.id)) throw new Error(`Duplicate ID: ${w.id}`);
    ids.add(w.id);
    const keys = [w.canonical, ...w.aliases].map(normalize);
    for (const key of new Set(keys)) {
      if (seen.has(key))
        throw new Error(`Duplicate word or alias: ${w.canonical}`);
      seen.add(key);
    }
    return {
      ...w,
      canonical: w.canonical.normalize("NFC"),
      aliases: [...new Set(w.aliases.map((a) => a.normalize("NFC")))],
    };
  });
}
export function parseWords(text: string): Word[] {
  if (text.trim().startsWith("[")) return validateImport(JSON.parse(text));
  // CSV: canonical,ne,roman,en,hint; quoted commas and escaped quotes supported.
  const rows: string[][] = [];
  let row: string[] = [],
    cell = "",
    quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (quoted && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else quoted = !quoted;
    } else if (c === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((c === "\n" || c === "\r") && !quoted) {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = "";
    } else cell += c;
  }
  if (quoted) throw new Error("Unclosed CSV quote");
  row.push(cell);
  if (row.some(Boolean)) rows.push(row);
  if (rows[0]?.[0]?.toLowerCase() === "canonical") rows.shift();
  return validateImport(
    rows.map((r, i) => ({
      id: `custom-${i}-${normalize(r[0])}`,
      canonical: r[0],
      ne: r[1] || "",
      roman: r[2] || r[0],
      en: r[3] || r[0],
      hint: r[4] || "",
      categoryIds: ["custom"],
      source: "Local custom pack",
      status: "draft",
    })),
  );
}
export function selectWord(
  words: Word[],
  ids: string[],
  difficulty: string,
  recent: string[],
  random = secureRandom,
): Word {
  let pool = [
    ...new Map(words.map((w) => [normalize(w.canonical), w])).values(),
  ].filter(
    (w) =>
      w.active &&
      (!ids.length || w.categoryIds.some((c) => ids.includes(c))) &&
      (difficulty === "mixed" || w.difficulty === difficulty),
  );
  if (!pool.length)
    throw new Error("No words match. Try another difficulty or category.");
  const fresh = pool.filter((w) => !recent.includes(w.id));
  if (fresh.length) pool = fresh;
  const groups = [...new Set(pool.flatMap((w) => w.categoryIds))];
  const group = groups[Math.floor(random() * groups.length)];
  pool = pool.filter((w) => w.categoryIds.includes(group));
  const weights = pool.map(
    (w) => Math.max(0.1, w.popularity) / (1 + w.playCount),
  );
  let n = random() * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < pool.length; i++) {
    n -= weights[i];
    if (n <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}
export function secureRandom() {
  const a = new Uint32Array(1);
  crypto.getRandomValues(a);
  return a[0] / 4294967296;
}
export function wordLabel(w: Word, lang: string) {
  return (lang === "ne" ? w.ne : lang === "en" ? w.en : w.roman) || w.canonical;
}
