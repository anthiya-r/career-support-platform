import Link from "next/link";
import Navbar from "../components/Navbar";
import SubmissionCard from "../components/SubmissionCard";
import { requireUser } from "../lib/auth";
import { prisma } from "../lib/db";
import { toUiStatus } from "../lib/submission";

export default async function DashboardPage() {
  const user = await requireUser();
  const submissions = await prisma.submission.findMany({
    where: { applicantId: user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, status: true },
  });

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Your Submissions</h1>
            <p className="text-sm text-slate-600">Track current resume review progress.</p>
          </div>
          <Link
            href="/submit"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Submit New Resume
          </Link>
        </div>

        <div className="grid gap-4">
          {submissions.map((submission: { id: string; title: string; status: "PENDING" | "ASSIGNED" | "REVIEWED" }) => (
            <SubmissionCard
              key={submission.id}
              submission={{
                id: submission.id,
                title: submission.title,
                status: toUiStatus(submission.status),
              }}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
