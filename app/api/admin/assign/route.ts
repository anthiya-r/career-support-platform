import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "../../../lib/auth";
import { prisma } from "../../../lib/db";

const BodySchema = z.object({
  submissionId: z.string().min(1),
  reviewerId: z.string().min(1),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = BodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const reviewer = await prisma.user.findUnique({
    where: { id: parsed.data.reviewerId },
    select: { role: true },
  });
  if (!reviewer || reviewer.role !== "REVIEWER") {
    return NextResponse.json({ error: "Reviewer not found" }, { status: 400 });
  }

  await prisma.submission.update({
    where: { id: parsed.data.submissionId },
    data: {
      assignedReviewerId: parsed.data.reviewerId,
      status: "ASSIGNED",
    },
  });

  return NextResponse.json({ ok: true });
}

