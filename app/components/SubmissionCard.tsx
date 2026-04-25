import Link from "next/link";
import StatusBadge from "./StatusBadge";

type Props = {
  submission: {
    id: string;
    title: string;
    status: "Pending" | "Assigned" | "Reviewed";
  };
};

export default function SubmissionCard({ submission }: Props) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{submission.title}</h3>
          <div className="mt-2">
            <StatusBadge status={submission.status} />
          </div>
        </div>
        <Link
          href={`/feedback/${submission.id}`}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          View Feedback
        </Link>
      </div>
    </div>
  );
}
