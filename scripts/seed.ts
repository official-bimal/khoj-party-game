import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { categories, normalize, validateImport } from "../src/lib/words";
import { seedWords } from "../src/data/seed";
if (!process.env.DATABASE_URL)
  throw new Error("Set DATABASE_URL before seeding");
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
try {
  const words = validateImport(seedWords);
  await db.$transaction(
    async (tx) => {
      await tx.contentSource.upsert({
        where: { id: "starter" },
        create: {
          id: "starter",
          name: "AI-authored starter vocabulary; review pending",
        },
        update: {},
      });
      for (const category of categories)
        await tx.category.upsert({
          where: { id: category.id },
          create: category,
          update: { name: category.name },
        });
      for (const w of words) {
        await tx.wordEntry.upsert({
          where: { id: w.id },
          create: {
            id: w.id,
            canonical: w.canonical,
            normalized: normalize(w.canonical),
            difficulty: w.difficulty,
            hint: w.hint,
            region: w.region,
            age: w.age,
            sourceId: "starter",
            related: w.related,
            status: "draft",
          },
          update: {},
        });
        for (const [language, text] of Object.entries({
          ne: w.ne,
          roman: w.roman,
          en: w.en,
        }))
          await tx.wordTranslation.upsert({
            where: { wordId_language: { wordId: w.id, language } },
            create: { wordId: w.id, language, text },
            update: { text },
          });
        for (const categoryId of w.categoryIds)
          await tx.wordCategory.upsert({
            where: { wordId_categoryId: { wordId: w.id, categoryId } },
            create: { wordId: w.id, categoryId },
            update: {},
          });
      }
      await tx.stateDocument.upsert({
        where: { id: "content" },
        create: {
          id: "content",
          state: JSON.parse(
            JSON.stringify({
              words,
              version: 1,
              publishedWords: [],
              audit: [],
            }),
          ),
        },
        update: {},
      });
    },
    { timeout: 60000 },
  );
  console.log(
    `Seeded ${words.length} distinct draft entries across ${categories.length} categories. No editorial approvals created.`,
  );
} finally {
  await db.$disconnect();
}
