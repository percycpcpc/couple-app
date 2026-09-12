import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { awardOnce, contentBucket, isoWeek, isoWeekBounds, weeklyData, withSerializableRetry } from "@/lib/core-loop";

async function userId() {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}

export async function GET() {
  const id = await userId();
  if (!id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await weeklyData(id));
}

export async function POST(request: Request) {
  const id = await userId();
  if (!id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body: unknown = await request.json().catch(() => null);
  const content = body && typeof body === "object" && "content" in body ? (body as { content?: unknown }).content : null;
  if (typeof content !== "string" || content.trim().length < 3) return NextResponse.json({ error: "Content must be at least 3 characters" }, { status: 400 });

  const result = await withSerializableRetry(async (tx) => {
    const user = await tx.user.findUnique({ where: { id } });
    if (!user?.coupleId) return { needsSetup: true as const };
    const theme = await tx.weeklyTheme.findUnique({ where: { weekNumber_bucketId: { weekNumber: isoWeek(), bucketId: contentBucket(user.bucketId) } } });
    if (!theme) return { missing: true as const };
    await tx.weeklyEntry.upsert({ where: { userId_themeId: { userId: id, themeId: theme.id } }, update: { content: content.trim() }, create: { userId: id, themeId: theme.id, content: content.trim() } });
    const couple = await tx.couple.findUnique({ where: { id: user.coupleId }, select: { users: { select: { id: true } } } });
    const entries = couple ? await tx.weeklyEntry.count({ where: { themeId: theme.id, userId: { in: couple.users.map((member) => member.id) } } }) : 0;
    const bothAnswered = couple?.users.length === 2 && entries === 2;
    if (bothAnswered) {
      const { start, end } = isoWeekBounds();
      await awardOnce(tx, user.coupleId, 25, "weekly_journal", start, end);
    }
    return { ok: true as const, revealed: bothAnswered, bothAnswered };
  });
  if ("needsSetup" in result) return NextResponse.json(result);
  if ("missing" in result) return NextResponse.json({ error: "Weekly theme not found" }, { status: 404 });
  return NextResponse.json(result);
}
