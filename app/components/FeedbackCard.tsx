type Props = {
  score?: number;
  comment?: string;
};

export default function FeedbackCard({ score, comment }: Props) {
  const hasFeedback = typeof score === "number" && Boolean(comment);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      {hasFeedback ? (
        <div className="space-y-3">
          <p className="text-sm text-slate-600">Reviewer Feedback</p>
          <p className="text-2xl font-bold text-slate-900">Score: {score}/5</p>
          <p className="rounded-md bg-slate-100 p-3 text-sm text-slate-700">{comment}</p>
        </div>
      ) : (
        <p className="text-sm font-medium text-amber-700">Pending review</p>
      )}
    </div>
  );
}
