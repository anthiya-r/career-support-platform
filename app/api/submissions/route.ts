import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "../../lib/auth";
import { prisma } from "../../lib/db";

const BodySchema = z.object({
  title: z.string().trim().min(3).max(120),
  resumeText: z.string().trim().max(20000).optional(),
  resumeFileName: z.string().trim().max(255).optional(),
  resumeFileMime: z.string().trim().max(100).optional(),
  resumeFileBase64: z.string().trim().max(2_500_000).optional(),
  consentGiven: z.boolean(),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = BodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  if (!parsed.data.consentGiven) {
    return NextResponse.json({ error: "Consent is required before submission" }, { status: 400 });
  }

  if (!parsed.data.resumeText && !parsed.data.resumeFileBase64) {
    return NextResponse.json({ error: "Please upload a file or paste resume text" }, { status: 400 });
  }

  const submission = await prisma.submission.create({
    data: {
      applicantId: user.id,
      title: parsed.data.title,
      resumeText: parsed.data.resumeText || null,
      resumeFileName: parsed.data.resumeFileName || null,
      resumeFileMime: parsed.data.resumeFileMime || null,
      resumeFileBase64: parsed.data.resumeFileBase64 || null,
      consentGivenAt: new Date(),
    },
    select: { id: true },
  });

  return NextResponse.json({ ok: true, submissionId: submission.id });
}

