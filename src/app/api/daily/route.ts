import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { awardOnce, contentBucket, dailyData, utcDay, withSerializableRetry } from "@/lib/core-loop";

async function userId() {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}

export async function GET() {
  const id = await userId();
  if (!id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await dailyData(id));
}

export async function POST(request: Request) {
  const id = await userId();
  if (!id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body: unknown = await request.json().catch(() => null);
  const answer = body && typeof body === "object" && "answer" in body ? (body as { answer?: unknown }).answer : null;
  if (typeof answer !== "string") return NextResponse.json({ error: "Invalid answer" }, { status: 400 });

  const result = await withSerializableRetry(async (tx) => {
    const user = await tx.user.findUnique({ where: { id } });
    if (!user?.coupleId) return { needsSetup: true as const };
    const question = await tx.dailyQuestion.findFirst({ where: { bucketId: contentBucket(user.bucketId), date: utcDay() }, orderBy: { id: "asc" } });
    if (!question || !question.options.includes(answer)) return { invalid: true as const };
    await tx.dailyAnswer.upsert({ where: { userId_questionId: { userId: id, questionId: question.id } }, update: { answer }, create: { userId: id, questionId: question.id, answer } });
    const couple = await tx.couple.findUnique({ where: { id: user.coupleId }, select: { users: { select: { id: true } } } });
    const answers = couple ? await tx.dailyAnswer.count({ where: { questionId: question.id, userId: { in: couple.users.map((member) => member.id) } } }) : 0;
    const bothAnswered = couple?.users.length === 2 && answers === 2;
    if (bothAnswered) {
      const start = utcDay();
      const end = new Date(start.getTime() + 86400000);
      await awardOnce(tx, user.coupleId, 10, "daily_question", start, end);
    }
    return { ok: true as const, revealed: bothAnswered, bothAnswered };
  });
  if ("needsSetup" in result) return NextResponse.json(result);
  if ("invalid" in result) return NextResponse.json({ error: "Invalid answer" }, { status: 400 });
  return NextResponse.json(result);
}
