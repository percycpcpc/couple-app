import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { awardCurrency } from "./currency";

export type ContentBucket = "<6mo" | "6-12mo" | "1yr+";

export function contentBucket(bucketId: string | null): ContentBucket {
  return bucketId === "6-12mo" || bucketId === "1yr+" ? bucketId : "<6mo";
}

export function utcDay(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function isoWeek(date = new Date()) {
  const value = utcDay(date);
  value.setUTCDate(value.getUTCDate() + 4 - (value.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(value.getUTCFullYear(), 0, 1));
  return Math.ceil(((value.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function isoWeekBounds(date = new Date()) {
  const start = utcDay(date);
  start.setUTCDate(start.getUTCDate() - ((start.getUTCDay() + 6) % 7));
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 7);
  return { start, end };
}

async function context(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;
  if (!user.coupleId) return { user, couple: null, partner: null };
  const couple = await prisma.couple.findUnique({ where: { id: user.coupleId }, include: { users: true } });
  const partner = couple?.users.find((candidate) => candidate.id !== user.id) ?? null;
  return { user, couple, partner };
}

export async function dailyData(userId: string) {
  const ctx = await context(userId);
  if (!ctx?.couple) return { needsSetup: true as const };
  const question = await prisma.dailyQuestion.findFirst({
    where: { bucketId: contentBucket(ctx.user.bucketId), date: utcDay() }, orderBy: { id: "asc" },
  });
  if (!question) return { needsSetup: false as const, question: null };
  const [mine, theirs] = await Promise.all([
    prisma.dailyAnswer.findUnique({ where: { userId_questionId: { userId, questionId: question.id } } }),
    ctx.partner ? prisma.dailyAnswer.findUnique({ where: { userId_questionId: { userId: ctx.partner.id, questionId: question.id } } }) : null,
  ]);
  const revealed = Boolean(mine && theirs);
  return { needsSetup: false as const, question: { id: question.id, text: question.question, options: question.options }, answered: Boolean(mine), partnerAnswered: Boolean(theirs), answer: mine?.answer ?? null, partnerAnswer: revealed ? theirs?.answer ?? null : null, revealed };
}

export async function weeklyData(userId: string) {
  const ctx = await context(userId);
  if (!ctx?.couple) return { needsSetup: true as const };
  const theme = await prisma.weeklyTheme.findUnique({
    where: { weekNumber_bucketId: { weekNumber: isoWeek(), bucketId: contentBucket(ctx.user.bucketId) } },
  });
  if (!theme) return { needsSetup: false as const, theme: null };
  const [mine, theirs] = await Promise.all([
    prisma.weeklyEntry.findUnique({ where: { userId_themeId: { userId, themeId: theme.id } } }),
    ctx.partner ? prisma.weeklyEntry.findUnique({ where: { userId_themeId: { userId: ctx.partner.id, themeId: theme.id } } }) : null,
  ]);
  const revealed = Boolean(mine && theirs);
  return { needsSetup: false as const, theme: { id: theme.id, title: theme.title, prompt: theme.prompt }, answered: Boolean(mine), partnerAnswered: Boolean(theirs), content: mine?.content ?? null, partnerContent: revealed ? theirs?.content ?? null : null, revealed };
}

export async function withSerializableRetry<T>(operation: (tx: Prisma.TransactionClient) => Promise<T>) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await prisma.$transaction(operation, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (error) {
      if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2034" || attempt === 2) throw error;
    }
  }
  throw new Error("Transaction retry exhausted");
}

export async function awardOnce(tx: Prisma.TransactionClient, coupleId: string, amount: number, reason: string, start: Date, end: Date) {
  const existing = await tx.currencyTransaction.findFirst({ where: { coupleId, reason, createdAt: { gte: start, lt: end } } });
  if (!existing) await awardCurrency(coupleId, amount, reason, tx);
}
