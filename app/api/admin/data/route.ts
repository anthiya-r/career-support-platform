import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../lib/auth";
import { prisma } from "../../../lib/db";
import { toUiStatus } from "../../../lib/submission";
import { SubmissionStatus } from "@prisma/client";

export async function GET() {
	const user = await getCurrentUser();
	if (!user)
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	if (user.role !== "ADMIN")
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });

	const [reviewers, pendingSubmissions] = await Promise.all([
		prisma.user.findMany({
			where: { role: "REVIEWER" },
			select: { id: true, email: true, name: true },
			orderBy: { createdAt: "asc" },
		}),
		prisma.submission.findMany({
			where: { status: { in: ["PENDING", "ASSIGNED"] } },
			select: {
				id: true,
				title: true,
				status: true,
				applicant: { select: { name: true, email: true } },
				assignedReviewer: { select: { name: true, email: true } },
			},
			orderBy: { createdAt: "desc" },
		}),
	]);

	return NextResponse.json({
		reviewers: reviewers.map(
			(item: { id: string; email: string; name: string | null }) => ({
				id: item.id,
				label: item.name || item.email,
				email: item.email,
			}),
		),
		pendingSubmissions: pendingSubmissions.map(
			(item: {
				id: string;
				title: string;
				status: SubmissionStatus;
				applicant: { name: string | null; email: string };
				assignedReviewer: { name: string | null; email: string } | null;
			}) => ({
				id: item.id,
				title: item.title,
				status: toUiStatus(item.status),
				applicant: item.applicant.name || item.applicant.email,
				assignedReviewer: item.assignedReviewer
					? item.assignedReviewer.name || item.assignedReviewer.email
					: null,
			}),
		),
	});
}
