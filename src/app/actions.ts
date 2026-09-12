"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import {
  getBucket,
  getCoupleWithUsers,
  getPartner,
  getTodaysQuestion,
} from "@/lib/couple";
import { redirect } from "next/navigation";

export type ActionState = { error?: string };

async function getUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user) throw new Error("User not found");
  return user;
}

export async function createCouple(_state: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getUser();
  if (user.coupleId) redirect("/dashboard");

  const startDateRaw = String(formData.get("startDate") ?? "");
  const startDate = new Date(`${startDateRaw}T12:00:00`);
  if (!startDateRaw || Number.isNaN(startDate.getTime()) || startDate > new Date()) {
    return { error: "Choose a valid relationship start date that isn’t in the future." };
  }
  const bucketId = getBucket(startDate);
  try {
    await prisma.$transaction(async (tx) => {
      const room = await tx.room.create({ data: { name: "Our Room", slots: { create: [
        { name: "Floor Left" }, { name: "Floor Right" }, { name: "Wall Left" }, { name: "Wall Right" }, { name: "Table" },
      ] } } });
      const couple = await tx.couple.create({ data: { currentRoomId: room.id, currency: 200, users: { connect: { id: user.id } } } });
      await tx.user.update({ where: { id: user.id }, data: { coupleId: couple.id, relationshipStartDate: startDate, bucketId } });
      await tx.currencyTransaction.create({ data: { coupleId: couple.id, amount: 200, reason: "Welcome gift" } });
    });
  } catch {
    return { error: "We couldn’t create your space just now. Please try again." };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function joinCouple(_state: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getUser();
  if (user.coupleId) redirect("/dashboard");

  const code = String(formData.get("inviteCode") ?? "").trim();
  if (!code) return { error: "Enter the invite code your partner shared with you." };
  const couple = await prisma.couple.findUnique({
    where: { inviteCode: code },
    include: { users: true, room: true },
  });
  if (!couple) return { error: "That invite code doesn’t match a couple space. Check it and try again." };
  if (couple.users.length >= 2) return { error: "That couple space already has two people." };

  const startDate = couple.users.find((u) => u.relationshipStartDate)?.relationshipStartDate ?? new Date();
  const bucketId = getBucket(startDate);

  await prisma.user.update({
    where: { id: user.id },
    data: { coupleId: couple.id, relationshipStartDate: startDate, bucketId },
  });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function answerDailyQuestion(formData: FormData) {
  const user = await getUser();
  if (!user.coupleId) throw new Error("No couple");

  const questionId = formData.get("questionId") as string;
  const answer = formData.get("answer") as string;
  if (!questionId || !answer) throw new Error("Missing answer");

  const question = await prisma.dailyQuestion.findUnique({ where: { id: questionId } });
  if (!question || question.bucketId !== user.bucketId || !question.options.includes(answer)) throw new Error("Invalid answer");
  const existing = await prisma.dailyAnswer.findUnique({ where: { userId_questionId: { userId: user.id, questionId } } });
  if (!existing) await prisma.$transaction([
    prisma.dailyAnswer.create({ data: { userId: user.id, questionId, answer } }),
    prisma.couple.update({ where: { id: user.coupleId }, data: { currency: { increment: 5 } } }),
    prisma.currencyTransaction.create({ data: { coupleId: user.coupleId, amount: 5, reason: "Daily question answered" } }),
  ]);

  revalidatePath("/dashboard");
}

export async function writeJournalEntry(formData: FormData) {
  const user = await getUser();
  if (!user.coupleId) throw new Error("No couple");

  const themeId = formData.get("themeId") as string;
  const content = formData.get("content") as string;
  if (!themeId || !content?.trim()) throw new Error("Missing journal content");

  const theme = await prisma.weeklyTheme.findUnique({ where: { id: themeId } });
  if (!theme || theme.bucketId !== user.bucketId) throw new Error("Invalid weekly theme");
  const existing = await prisma.weeklyEntry.findUnique({ where: { userId_themeId: { userId: user.id, themeId } } });
  if (!existing) await prisma.$transaction([
    prisma.weeklyEntry.create({ data: { userId: user.id, themeId, content: content.trim() } }),
    prisma.couple.update({ where: { id: user.coupleId }, data: { currency: { increment: 10 } } }),
    prisma.currencyTransaction.create({ data: { coupleId: user.coupleId, amount: 10, reason: "Weekly journal written" } }),
  ]);

  revalidatePath("/dashboard");
}

export async function nudgePartner() {
  const user = await getUser();
  if (!user.coupleId) throw new Error("No couple");

  const partner = await getPartner(user.id, user.coupleId);
  if (!partner) throw new Error("No partner yet");

  const question = await getTodaysQuestion((user.bucketId ?? "0-6mo") as import("@/lib/couple").BucketId);
  if (!question) throw new Error("No daily question today");

  const partnerAnswer = await prisma.dailyAnswer.findUnique({
    where: { userId_questionId: { userId: partner.id, questionId: question.id } },
  });
  if (partnerAnswer) throw new Error("Partner already answered today");

  const couple = await prisma.couple.update({
    where: { id: user.coupleId },
    data: { currency: { increment: 3 } },
  });
  await prisma.currencyTransaction.create({
    data: { coupleId: couple.id, amount: 3, reason: `Nudge sent by ${user.name ?? "partner"}` },
  });

  revalidatePath("/dashboard");
}

export async function buyAndPlaceItem(formData: FormData) {
  const user = await getUser();
  if (!user.coupleId) throw new Error("No couple");

  const itemId = formData.get("itemId") as string;
  const slotId = formData.get("slotId") as string;
  if (!itemId || !slotId) throw new Error("Missing item or slot");

  const couple = await getCoupleWithUsers(user.coupleId);
  if (!couple) throw new Error("Couple not found");

  const item = await prisma.item.findUnique({ where: { id: itemId } });
  if (!item) throw new Error("Item not found");
  if (couple.currency < item.price) throw new Error("Not enough hearts");

  const slot = couple.room?.slots.find((s) => s.id === slotId);
  if (!slot) throw new Error("Slot not found");

  await prisma.$transaction([
    prisma.couple.update({
      where: { id: couple.id },
      data: { currency: { decrement: item.price } },
    }),
    prisma.currencyTransaction.create({
      data: { coupleId: couple.id, amount: -item.price, reason: `Bought ${item.name}` },
    }),
    prisma.placedItem.upsert({
      where: { slotId },
      update: { itemId },
      create: { itemId, slotId, roomId: couple.room!.id },
    }),
  ]);

  revalidatePath("/room");
}

export async function removePlacedItem(formData: FormData) {
  const user = await getUser();
  if (!user.coupleId) throw new Error("No couple");
  const slotId = String(formData.get("slotId") ?? "");
  const slot = await prisma.roomSlot.findFirst({
    where: { id: slotId, room: { couple: { id: user.coupleId } } },
    include: { placedItem: true },
  });
  if (!slot?.placedItem) throw new Error("Item not found in your room");
  await prisma.placedItem.delete({ where: { id: slot.placedItem.id } });
  revalidatePath("/room");
}

export async function signOut() {
  // Handled by next-auth signOut on client; this is a placeholder for server-side sign out if needed.
}
