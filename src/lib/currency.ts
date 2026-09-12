import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

type CurrencyDb = Pick<Prisma.TransactionClient, "couple" | "currencyTransaction">;

export async function awardCurrency(
  coupleId: string,
  amount: number,
  reason: string,
  db: CurrencyDb = prisma,
) {
  const [couple, transaction] = await Promise.all([
    db.couple.update({ where: { id: coupleId }, data: { currency: { increment: amount } } }),
    db.currencyTransaction.create({ data: { coupleId, amount, reason } }),
  ]);
  return { couple, transaction };
}
