import { prisma } from "./prisma";

export type BucketId = "0-6mo" | "6-12mo" | "1yr+";

export function getBucket(startDate: Date | null | undefined): BucketId {
  if (!startDate) return "0-6mo";
  const now = new Date();
  const ms = now.getTime() - new Date(startDate).getTime();
  const months = ms / (1000 * 60 * 60 * 24 * 30.44);
  if (months < 6) return "0-6mo";
  if (months < 12) return "6-12mo";
  return "1yr+";
}

export function daysSince(startDate: Date | null | undefined): number {
  if (!startDate) return 0;
  const ms = new Date().getTime() - new Date(startDate).getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

export function startOfDay(date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getISOWeek(date: Date): number {
  const tmp = new Date(date);
  tmp.setHours(0, 0, 0, 0);
  tmp.setDate(tmp.getDate() + 4 - ((tmp.getDay() + 6) % 7));
  const yearStart = new Date(tmp.getFullYear(), 0, 1);
  const weekNo = Math.ceil(((tmp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return weekNo;
}

export async function getCoupleWithUsers(coupleId: string) {
  return prisma.couple.findUnique({
    where: { id: coupleId },
    include: {
      users: true,
      room: { include: { slots: { include: { placedItem: { include: { item: true } } } } } },
    },
  });
}

export async function getPartner(userId: string, coupleId: string) {
  const couple = await prisma.couple.findUnique({
    where: { id: coupleId },
    include: { users: true },
  });
  if (!couple) return null;
  return couple.users.find((u) => u.id !== userId) || null;
}

export async function computeStreak(
  coupleId: string,
  userIds: [string, string]
): Promise<number> {
  const today = startOfDay();
  // Collect all dates where both users answered any daily question
  const answers = await prisma.dailyAnswer.findMany({
    where: { userId: { in: userIds } },
    select: { questionId: true, userId: true, answeredAt: true },
  });

  // Group by questionId and require both users
  const byQuestion: Record<string, Set<string>> = {};
  for (const a of answers) {
    byQuestion[a.questionId] ||= new Set();
    byQuestion[a.questionId].add(a.userId);
  }
  const completeDates = new Set<string>();
  const questions = await prisma.dailyQuestion.findMany({
    where: { id: { in: Object.keys(byQuestion) } },
    select: { id: true, date: true },
  });
  const questionDateById = new Map(questions.map((q) => [q.id, q.date]));
  for (const [qid, users] of Object.entries(byQuestion)) {
    if (users.size === 2) {
      const d = questionDateById.get(qid);
      if (d) completeDates.add(startOfDay(d).toISOString());
    }
  }

  let streak = 0;
  // Start from today if complete, otherwise yesterday
  const hasToday = completeDates.has(today.toISOString());
  const cursor = new Date(today);
  if (!hasToday) cursor.setDate(cursor.getDate() - 1);

  while (cursor.getTime() >= today.getTime() - 365 * 24 * 60 * 60 * 1000) {
    if (completeDates.has(cursor.toISOString())) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export async function getTodaysQuestion(bucketId: BucketId) {
  const today = startOfDay();
  const questions = await prisma.dailyQuestion.findMany({
    where: { bucketId, date: today },
    orderBy: { id: "asc" },
    take: 1,
  });
  return questions[0] ?? null;
}

export async function getCurrentTheme(bucketId: BucketId, startDate: Date | null | undefined) {
  const count = await prisma.weeklyTheme.count({ where: { bucketId } });
  if (count === 0) return null;
  const offset = Math.floor(daysSince(startDate) / 7) % count;
  const themes = await prisma.weeklyTheme.findMany({
    where: { bucketId },
    orderBy: { weekNumber: "asc" },
    skip: offset,
    take: 1,
  });
  return themes[0] ?? null;
}

export async function getOrCreateRoom(coupleId: string) {
  const couple = await prisma.couple.findUnique({
    where: { id: coupleId },
    include: { room: true },
  });
  if (couple?.room) return couple.room;

  const room = await prisma.room.create({
    data: {
      name: "Our Room",
      slots: {
        create: [
          { name: "Floor Left" },
          { name: "Floor Right" },
          { name: "Wall Left" },
          { name: "Wall Right" },
          { name: "Table" },
        ],
      },
    },
  });

  await prisma.couple.update({
    where: { id: coupleId },
    data: { currentRoomId: room.id },
  });

  return room;
}

export function bucketLabel(bucketId: BucketId) {
  switch (bucketId) {
    case "0-6mo":
      return "Early days";
    case "6-12mo":
      return "Growing together";
    case "1yr+":
      return "Long-term love";
    default:
      return bucketId;
  }
}
