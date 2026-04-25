import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../lib/db";
import { requireUser } from "../../lib/auth";

const BodySchema = z.object({
  name: z.string().trim().min(1).max(100),
  goal: z.string().trim().min(1).max(300),
});

export async function PATCH(req: Request) {
  const user = await requireUser();
  const parsed = BodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { name: parsed.data.name, goal: parsed.data.goal },
    select: { name: true, goal: true },
  });

  return NextResponse.json({ ok: true, profile: updated });
}

