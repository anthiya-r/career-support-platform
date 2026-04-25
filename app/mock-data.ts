export type SubmissionStatus = "Pending" | "Reviewed";

export type Submission = {
  id: number;
  title: string;
  status: SubmissionStatus;
};

export const submissions: Submission[] = [
  { id: 1, title: "Resume - Jan", status: "Pending" },
  { id: 2, title: "Resume - Feb", status: "Reviewed" }
];

export const feedbackBySubmissionId: Record<
  number,
  { score?: number; comment?: string }
> = {
  1: {},
  2: {
    score: 4,
    comment: "Good structure, improve bullet clarity."
  }
};

export const reviewerAssignments = [
  { id: 1, title: "Resume - Jan", applicant: "Demo User" },
  { id: 2, title: "Resume - Feb", applicant: "Demo User" }
];
