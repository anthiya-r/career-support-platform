import { SubmissionStatus } from "@prisma/client";

export function toUiStatus(status: SubmissionStatus): "Pending" | "Assigned" | "Reviewed" {
  if (status === "ASSIGNED") return "Assigned";
  if (status === "REVIEWED") return "Reviewed";
  return "Pending";
}

