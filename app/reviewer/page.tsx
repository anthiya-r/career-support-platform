"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";

export default function ReviewerPage() {
  const [assignments, setAssignments] = useState<
    Array<{
      id: string;
      title: string;
      status: "Pending" | "Assigned" | "Reviewed";
      applicant: string;
      resumeText: string | null;
      resumeFileName: string | null;
      resumeFileMime: string | null;
      resumeFileBase64: string | null;
      hasReview: boolean;
    }>
  >([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [score, setScore] = useState("4");
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedSubmission = useMemo(
    () => assignments.find((item) => item.id === selectedId),
    [assignments, selectedId]
  );

  const loadAssignments = useCallback(async () => {
    const res = await fetch("/api/reviewer/assignments", { cache: "no-store" });
    const payload = (await res.json().catch(() => null)) as
      | { submissions?: typeof assignments; error?: string }
      | null;
    if (!res.ok) {
      setError(payload?.error ?? "Failed to load assignments");
      return;
    }
    setAssignments(payload?.submissions ?? []);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadAssignments();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadAssignments]);

  const handleSubmitReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!selectedSubmission) return;
    setLoading(true);

    const res = await fetch("/api/reviewer/review", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        submissionId: selectedSubmission.id,
        score: Number(score),
        comment,
      }),
    });

    setLoading(false);
    if (!res.ok) {
      const payload = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(payload?.error ?? "Failed to submit review");
      return;
    }

    setSubmitted(true);
    setComment("");
    await loadAssignments();
    setTimeout(() => setSubmitted(false), 2000);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto grid max-w-5xl gap-6 px-4 py-8 md:grid-cols-2">
        <section className="space-y-4">
          <h1 className="text-2xl font-bold text-slate-900">Assigned Submissions</h1>
          {assignments.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
            >
              <p className="text-base font-semibold text-slate-900">{item.title}</p>
              <p className="text-sm text-slate-600">{item.applicant} · {item.status}</p>
              <button
                type="button"
                onClick={() => setSelectedId(item.id)}
                className="mt-3 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Review
              </button>
            </div>
          ))}
          {assignments.length === 0 ? (
            <p className="rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-600">
              No assigned submissions yet.
            </p>
          ) : null}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Review Form</h2>
          <p className="mb-4 mt-1 text-sm text-slate-600">
            {selectedSubmission
              ? `Reviewing: ${selectedSubmission.title}`
              : "Select a submission to start review."}
          </p>

          {selectedSubmission?.resumeText ? (
            <div className="mb-4 rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Resume text</p>
              <p className="max-h-40 overflow-auto whitespace-pre-wrap text-sm text-slate-700">
                {selectedSubmission.resumeText}
              </p>
            </div>
          ) : null}

          {selectedSubmission?.resumeFileBase64 && selectedSubmission.resumeFileName ? (
            <a
              href={`data:${selectedSubmission.resumeFileMime ?? "application/octet-stream"};base64,${selectedSubmission.resumeFileBase64}`}
              download={selectedSubmission.resumeFileName}
              className="mb-4 inline-flex rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Download attached file
            </a>
          ) : null}

          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="score" className="block text-sm font-medium text-slate-700">
                Score (1-5)
              </label>
              <select
                id="score"
                value={score}
                onChange={(event) => setScore(event.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                disabled={!selectedSubmission}
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <option key={value} value={String(value)}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="comment" className="block text-sm font-medium text-slate-700">
                Comment
              </label>
              <textarea
                id="comment"
                rows={5}
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                placeholder="Write reviewer feedback..."
                disabled={!selectedSubmission}
              />
            </div>

            {submitted ? <p className="text-sm font-medium text-emerald-700">Review submitted.</p> : null}
            {error ? <p className="text-sm font-medium text-rose-700">{error}</p> : null}

            <button
              type="submit"
              disabled={!selectedSubmission || loading}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {loading ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
