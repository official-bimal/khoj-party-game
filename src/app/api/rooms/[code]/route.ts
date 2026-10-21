import { NextRequest, NextResponse } from "next/server";
import { transaction } from "@/lib/server/storage";
import {
  identify,
  joinRoom,
  applyAction,
  settle,
  project,
  type Room,
} from "@/lib/server/rooms";
import { body, checkOrigin, rateLimit } from "@/lib/server/security";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ code: string }> };
async function handle(req: NextRequest, context: Context, post: boolean) {
  try {
    const { code } = await context.params;
    if (!/^[A-Z2-9]{6}$/.test(code)) throw new Error("Invalid room code");
    if (post) checkOrigin(req);
    rateLimit(
      `room-${post ? "write" : "read"}:${req.headers.get("x-forwarded-for") || "local"}`,
      post ? 300 : 1800,
    );
    const data = post ? await body(req) : null;
    const session = req.cookies.get(`khoj-${code}`)?.value || "";
    const result = await transaction<
      Room,
      { view: ReturnType<typeof project>; session?: string }
    >(`room-${code}`, async (room) => {
      if (!room) throw new Error("Room unavailable or expired");
      if (data?.action === "join") {
        if (session) {
          try {
            const p = identify(room, session);
            settle(room);
            return { value: room, result: { view: project(room, p.id) } };
          } catch {
            /* New guest session */
          }
        }
        const next = joinRoom(room, data.name);
        const p = identify(room, next);
        settle(room);
        return {
          value: room,
          result: { view: project(room, p.id), session: next },
        };
      }
      const p = identify(room, session);
      const view = post
        ? applyAction(room, session, data)
        : (settle(room), project(room, p.id));
      return { value: room, result: { view } };
    });
    const res = NextResponse.json(result.view, {
      headers: { "Cache-Control": "no-store" },
    });
    if (result.session)
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
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }
}
export const GET = (req: NextRequest, ctx: Context) => handle(req, ctx, false);
export const POST = (req: NextRequest, ctx: Context) => handle(req, ctx, true);
