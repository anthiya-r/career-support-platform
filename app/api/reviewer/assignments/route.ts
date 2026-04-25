import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../lib/auth";
import { prisma } from "../../../lib/db";
import { toUiStatus } from "../../../lib/submission";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "REVIEWER" && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const submissions = await prisma.submission.findMany({
    where: { assignedReviewerId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      applicant: { select: { name: true, email: true } },
      review: { select: { id: true, score: true } },
    },
  });

  return NextResponse.json({
    submissions: submissions.map(
      (item: {
        id: string;
        title: string;
        status: "PENDING" | "ASSIGNED" | "REVIEWED";
        applicant: { name: string | null; email: string };
        resumeText: string | null;
        resumeFileName: string | null;
        resumeFileMime: string | null;
        resumeFileBase64: string | null;
        review: { id: string; score: number } | null;
      }) => ({
      id: item.id,
      title: item.title,
      status: toUiStatus(item.status),
      applicant: item.applicant.name || item.applicant.email,
      resumeText: item.resumeText,
      resumeFileName: item.resumeFileName,
      resumeFileMime: item.resumeFileMime,
      resumeFileBase64: item.resumeFileBase64,
      hasReview: Boolean(item.review),
      })
    ),
  });
}

