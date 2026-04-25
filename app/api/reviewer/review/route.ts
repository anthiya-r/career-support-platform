import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "../../../lib/auth";
import { prisma } from "../../../lib/db";

const BodySchema = z.object({
  submissionId: z.string().min(1),
  score: z.number().int().min(1).max(5),
  comment: z.string().trim().min(2).max(2000),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "REVIEWER" && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = BodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const submission = await prisma.submission.findUnique({
    where: { id: parsed.data.submissionId },
    select: { id: true, assignedReviewerId: true },
  });
  if (!submission) return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  if (submission.assignedReviewerId !== user.id && user.role !== "ADMIN") {
    return NextResponse.json({ error: "You are not assigned to this submission" }, { status: 403 });
  }

  await prisma.$transaction([
    prisma.review.upsert({
      where: { submissionId: parsed.data.submissionId },
      update: {
        score: parsed.data.score,
        comment: parsed.data.comment,
        reviewerId: user.id,
      },
      create: {
        submissionId: parsed.data.submissionId,
        reviewerId: user.id,
        score: parsed.data.score,
        comment: parsed.data.comment,
      },
    }),
    prisma.submission.update({
      where: { id: parsed.data.submissionId },
      data: { status: "REVIEWED" },
    }),
  ]);

  return NextResponse.json({ ok: true });
}

