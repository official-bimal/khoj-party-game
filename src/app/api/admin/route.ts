import { NextResponse } from "next/server";
import { body, checkOrigin, equal, rateLimit } from "@/lib/server/security";
import { transaction } from "@/lib/server/storage";
import { validateImport, wordSchema, type Word } from "@/lib/words";
import { seedWords } from "@/data/seed";
import { z } from "zod";
type Content = {
  words: Word[];
  version: number;
  publishedWords?: Word[];
  audit: { at: string; action: string; word: string }[];
};
function authorize(req: Request) {
  rateLimit(`admin:${req.headers.get("x-forwarded-for") || "local"}`, 30);
  if (
    !process.env.ADMIN_TOKEN ||
    !equal(
      req.headers.get("authorization") || "",
      `Bearer ${process.env.ADMIN_TOKEN}`,
    )
  )
    throw new Error("Admin authorization required");
}
export async function GET(req: Request) {
  try {
    authorize(req);
    const result = await transaction<Content, Content>(
      "content",
      async (value) => ({
        value: value || { words: seedWords, version: 1, audit: [] },
        result: value || { words: seedWords, version: 1, audit: [] },
      }),
    );
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Admin authorization required" },
      { status: 401 },
    );
  }
}
export async function POST(req: Request) {
  try {
    authorize(req);
  } catch {
    return NextResponse.json(
      { error: "Admin authorization required" },
      { status: 401 },
    );
  }
  try {
    checkOrigin(req);
    const data = await body(req);
    const result = await transaction<Content, Content>(
      "content",
      async (old) => {
        const value = old || { words: seedWords, version: 1, audit: [] };
        const id = z
          .string()
          .max(100)
          .parse(data.id || "bulk");
        if (data.action === "import") {
          const words = validateImport(data.words).map((w) => ({
            ...w,
            status: "draft" as const,
            reviewedBy: null,
          }));
          value.words = validateImport([...value.words, ...words]);
        } else if (data.action === "delete") {
          value.words = value.words.filter((w) => w.id !== id);
        } else if (data.action === "save") {
          const word = wordSchema.parse(data.word);
          value.words = validateImport([
            ...value.words.filter((w) => w.id !== word.id),
            { ...word, status: "draft", reviewedBy: null },
          ]);
        } else if (["approve", "reject"].includes(data.action)) {
          const w = value.words.find((w) => w.id === id);
          if (!w) throw new Error("Word not found");
          w.status = data.action === "approve" ? "approved" : "rejected";
          w.reviewedBy = z.string().trim().min(2).max(100).parse(data.reviewer);
        } else if (data.action === "publish") {
          value.version++;
          value.publishedWords = value.words
            .filter((w) => w.active && w.status === "approved")
            .map((w) => ({ ...w }));
        } else throw new Error("Unknown action");
        value.audit = [
          { at: new Date().toISOString(), action: data.action, word: id },
          ...value.audit,
        ].slice(0, 1000);
        return { value, result: value };
      },
    );
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
