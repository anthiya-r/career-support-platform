"use client";

import { FormEvent, useEffect, useState } from "react";
import Navbar from "../components/Navbar";

type Reviewer = { id: string; label: string; email: string };
type PendingSubmission = {
  id: string;
  title: string;
  status: "Pending" | "Assigned" | "Reviewed";
  applicant: string;
  assignedReviewer: string | null;
};

export default function AdminPage() {
  const [reviewers, setReviewers] = useState<Reviewer[]>([]);
  const [pendingSubmissions, setPendingSubmissions] = useState<PendingSubmission[]>([]);
  const [selectedReviewerBySubmission, setSelectedReviewerBySubmission] = useState<Record<string, string>>({});
  const [promoteEmail, setPromoteEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    const res = await fetch("/api/admin/data", { cache: "no-store" });
    const payload = (await res.json().catch(() => null)) as
      | { reviewers?: Reviewer[]; pendingSubmissions?: PendingSubmission[]; error?: string }
      | null;
    if (!res.ok) {
      setError(payload?.error ?? "Failed to load admin data");
      return;
    }
    setReviewers(payload?.reviewers ?? []);
    setPendingSubmissions(payload?.pendingSubmissions ?? []);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handlePromote = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    const res = await fetch("/api/admin/promote-reviewer", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: promoteEmail }),
    });
    setLoading(false);
    if (!res.ok) {
      const payload = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(payload?.error ?? "Failed to promote reviewer");
      return;
    }
    setPromoteEmail("");
    setMessage("Reviewer role updated.");
    await loadData();
  };

  const handleAssign = async (submissionId: string) => {
    const reviewerId = selectedReviewerBySubmission[submissionId];
    if (!reviewerId) return;

    setError(null);
    setMessage(null);
    setLoading(true);
    const res = await fetch("/api/admin/assign", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ submissionId, reviewerId }),
    });
    setLoading(false);
    if (!res.ok) {
      const payload = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(payload?.error ?? "Failed to assign reviewer");
      return;
    }
    setMessage("Reviewer assigned.");
    await loadData();
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Admin</h1>
          <p className="mt-1 text-sm text-slate-600">Promote reviewers and assign resume submissions.</p>

          <form onSubmit={handlePromote} className="mt-5 space-y-2">
            <label htmlFor="promote-email" className="block text-sm font-medium text-slate-700">
              Promote user to reviewer (email)
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                id="promote-email"
                type="email"
                value={promoteEmail}
                onChange={(event) => setPromoteEmail(event.target.value)}
                placeholder="reviewer@example.com"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Promote
              </button>
            </div>
          </form>

          <div className="mt-5">
            <h2 className="text-sm font-semibold text-slate-900">Current reviewers</h2>
            <ul className="mt-2 space-y-2 text-sm text-slate-700">
              {reviewers.map((reviewer) => (
                <li key={reviewer.id} className="rounded-md border border-slate-200 p-2">
                  {reviewer.label} ({reviewer.email})
                </li>
              ))}
              {reviewers.length === 0 ? <li className="text-slate-500">No reviewers yet.</li> : null}
            </ul>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Assign reviewer</h2>
          <div className="mt-4 space-y-3">
            {pendingSubmissions.map((item) => (
              <div key={item.id} className="rounded-lg border border-slate-200 p-3">
                <p className="font-semibold text-slate-900">{item.title}</p>
                <p className="text-sm text-slate-600">
                  Applicant: {item.applicant} · Status: {item.status}
                </p>
                <p className="text-xs text-slate-500">
                  Current reviewer: {item.assignedReviewer ?? "Not assigned"}
                </p>

                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                  <select
                    value={selectedReviewerBySubmission[item.id] ?? ""}
                    onChange={(event) =>
                      setSelectedReviewerBySubmission((prev) => ({
                        ...prev,
                        [item.id]: event.target.value,
                      }))
                    }
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                  >
                    <option value="">Select reviewer</option>
                    {reviewers.map((reviewer) => (
                      <option key={reviewer.id} value={reviewer.id}>
                        {reviewer.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={loading || !selectedReviewerBySubmission[item.id]}
                    onClick={() => void handleAssign(item.id)}
                    className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Assign
                  </button>
                </div>
              </div>
            ))}
            {pendingSubmissions.length === 0 ? (
              <p className="text-sm text-slate-500">No pending or assigned submissions right now.</p>
            ) : null}
          </div>
        </section>
      </main>
      <div className="mx-auto max-w-6xl px-4 pb-8">
        {message ? <p className="text-sm font-medium text-emerald-700">{message}</p> : null}
        {error ? <p className="text-sm font-medium text-rose-700">{error}</p> : null}
      </div>
    </div>
  );
}

