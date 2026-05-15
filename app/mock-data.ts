import { SubmissionStatus as DbSubmissionStatus } from "@prisma/client";

export type SubmissionStatus = "Pending" | "Reviewed";

export type Submission = {
	id: string;
	title: string;
	status: DbSubmissionStatus;
};

export const submissions: Submission[] = [
	{ id: "1", title: "Resume - Jan", status: "PENDING" },
	{ id: "2", title: "Resume - Feb", status: "REVIEWED" },
];

export const feedbackBySubmissionId: Record<
	number,
	{ score?: number; comment?: string }
> = {
	1: {},
	2: {
		score: 4,
		comment: "Good structure, improve bullet clarity.",
	},
};

export const reviewerAssignments = [
	{ id: 1, title: "Resume - Jan", applicant: "Demo User" },
	{ id: 2, title: "Resume - Feb", applicant: "Demo User" },
];
