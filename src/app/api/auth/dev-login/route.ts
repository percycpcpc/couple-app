import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

function secretsMatch(provided: string, expected: string) {
  const providedHash = createHash("sha256").update(provided).digest();
  const expectedHash = createHash("sha256").update(expected).digest();
  return timingSafeEqual(providedHash, expectedHash);
}

export async function POST(request: Request) {
  const expectedSecret = process.env.DEV_LOGIN_SECRET;
  if (!expectedSecret) {
    return NextResponse.json({ ok: false, error: "Dev login disabled" }, { status: 503 });
  }

  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object") throw new Error("Invalid request");

    const { email, secret } = body as { email?: unknown; secret?: unknown };
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    if (!normalizedEmail || typeof secret !== "string") {
      return NextResponse.json({ ok: false, error: "Email and secret are required" }, { status: 400 });
    }
    if (!secretsMatch(secret, expectedSecret)) {
      return NextResponse.json({ ok: false, error: "Invalid email or secret" }, { status: 401 });
    }

    const sessionToken = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
    const user = await prisma.user.upsert({
      where: { email: normalizedEmail },
      update: {},
      create: { email: normalizedEmail },
    });
    await prisma.session.create({ data: { sessionToken, userId: user.id, expires } });

    const response = NextResponse.json({ ok: true });
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
      expires,
    };
    // NextAuth uses the __Secure- prefix when served over HTTPS.
    response.cookies.set("next-auth.session-token", sessionToken, cookieOptions);
    response.cookies.set("__Secure-next-auth.session-token", sessionToken, cookieOptions);
    return response;
  } catch {
    return NextResponse.json({ ok: false, error: "Dev login failed" }, { status: 400 });
  }
}
