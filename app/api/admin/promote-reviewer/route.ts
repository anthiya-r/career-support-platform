import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "../../../lib/auth";
import { prisma } from "../../../lib/db";

const BodySchema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = BodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const email = parsed.data.email.toLowerCase().trim();
  const target = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });

  await prisma.user.update({
    where: { id: target.id },
    data: { role: "REVIEWER" },
  });

  return NextResponse.json({ ok: true });
}

