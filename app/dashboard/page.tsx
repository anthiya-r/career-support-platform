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
						<h1 className="text-2xl font-bold text-[#43302E]">
							Your Submissions
						</h1>
						<p className="text-sm text-[#43302E]">
							Track current resume review progress.
						</p>
					</div>
					<Link
						href="/submit"
						className="rounded-md bg-[#3A8FC1] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2B7DA8]"
					>
						Submit New Resume
					</Link>
				</div>

				<div className="grid gap-4">
					{submissions.map((submission) => (
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
