import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { catalogVersion, items } from "../../../../../prisma/item-catalog";

export async function POST(request: Request) {
  const secret = process.env.DEV_LOGIN_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  for (const item of items) {
    const existing = await prisma.item.findFirst({ where: { name: item.name } });
    if (existing) {
      await prisma.item.update({
        where: { id: existing.id },
        data: {
          price: item.price,
          description: item.description,
          color: item.color,
          svg: item.svg,
        },
      });
    } else {
      await prisma.item.create({ data: item });
    }
  }

  return NextResponse.json({ ok: true, catalogVersion, count: items.length });
}
