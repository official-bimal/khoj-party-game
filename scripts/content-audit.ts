import { readFile } from "node:fs/promises";
import { seedWords } from "../src/data/seed";
import { categories, parseWords, validateImport } from "../src/lib/words";
const words = process.argv[2]
  ? parseWords(await readFile(process.argv[2], "utf8"))
  : validateImport(seedWords);
console.log(
  JSON.stringify(
    {
      entries: words.length,
      approved: words.filter((w) => w.status === "approved" && w.reviewedBy)
        .length,
      categories: categories.map((c) => ({
        name: c.name,
        total: words.filter((w) => w.categoryIds.includes(c.id)).length,
        difficulty: {
          easy: words.filter(
            (w) => w.categoryIds.includes(c.id) && w.difficulty === "easy",
          ).length,
          medium: words.filter(
            (w) => w.categoryIds.includes(c.id) && w.difficulty === "medium",
          ).length,
          hard: words.filter(
            (w) => w.categoryIds.includes(c.id) && w.difficulty === "hard",
          ).length,
        },
      })),
    },
    null,
    2,
  ),
);
