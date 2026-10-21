import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      roomStorage: process.env.DATABASE_URL
        ? "postgres"
        : process.env.ALLOW_EPHEMERAL_ROOMS === "true"
          ? "temporary"
          : "local",
      roomsResetOnRestart:
        process.env.ALLOW_EPHEMERAL_ROOMS === "true" &&
        !process.env.DATABASE_URL,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
