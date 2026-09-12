import { NextResponse } from "next/server";
import { seedQuestions } from "../../../../../prisma/seed-questions";

export async function POST(request: Request) {
  const secret = process.env.ADMIN_SEED_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const result = await seedQuestions();
  return NextResponse.json({ ok: true, ...result });
}
