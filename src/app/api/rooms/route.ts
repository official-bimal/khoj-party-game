import { NextResponse } from "next/server";
import { randomInt } from "node:crypto";
import { body, checkOrigin, rateLimit } from "@/lib/server/security";
import { newRoom, type Room } from "@/lib/server/rooms";
import { transaction } from "@/lib/server/storage";
export const runtime = "nodejs";
export async function POST(req: Request) {
  try {
    checkOrigin(req);
    rateLimit(`create:${req.headers.get("x-forwarded-for") || "local"}`, 10);
    const data = await body(req);
    for (let n = 0; n < 5; n++) {
      const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      const code = Array.from(
        { length: 6 },
        () => alphabet[randomInt(alphabet.length)],
      ).join("");
      const result = await transaction<Room, { session: string } | null>(
        `room-${code}`,
        async (old) => {
          if (old && old.expires > Date.now())
            return { value: old, result: null };
          const { room, session } = newRoom(code, data.name);
          return { value: room, result: { session } };
        },
      );
      if (result) {
        const res = NextResponse.json({ code });
        res.cookies.set(`khoj-${code}`, result.session, {
          httpOnly: true,
          sameSite: "strict",
          secure:
            process.env.NODE_ENV === "production" &&
            process.env.ALLOW_FILE_STORAGE !== "true",
          path: `/api/rooms/${code}`,
          maxAge: 7200,
        });
        return res;
      }
    }
    throw new Error("Try again");
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
