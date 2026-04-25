import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../lib/db";
import { createSession, hashPassword } from "../../../lib/auth";

const BodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  const parsed = BodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase().trim();
  const passwordHash = await hashPassword(parsed.data.password);

  try {
    const userCount = await prisma.user.count();
    const user = await prisma.user.create({
      data: { email, passwordHash, role: userCount === 0 ? "ADMIN" : "APPLICANT" },
      select: { id: true },
    });
    await createSession(user.id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Email already in use" }, { status: 409 });
  }
}

