import { NextResponse } from "next/server";
import { transaction } from "@/lib/server/storage";
import type { Word } from "@/lib/words";
import { seedWords } from "@/data/seed";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const pack = await transaction<
      {
        words: Word[];
        version: number;
        publishedWords?: Word[];
        audit?: unknown[];
      },
      unknown
    >("content", async (value) => ({
      value: value || { words: seedWords, version: 1, audit: [] },
      result: {
        version: value?.version || 1,
        words: value?.publishedWords || [],
      },
    }));
    return NextResponse.json(pack);
  } catch {
    return NextResponse.json({ version: 1, words: [] });
  }
}
