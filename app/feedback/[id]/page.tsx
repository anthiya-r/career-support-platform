import Navbar from "../../components/Navbar";
import FeedbackCard from "../../components/FeedbackCard";
import { requireUser } from "../../lib/auth";
import { prisma } from "../../lib/db";

type Props = {
	params: Promise<{ id: string }>;
};

export default async function FeedbackPage({ params }: Props) {
	const user = await requireUser();
	const { id } = await params;
	const submission = await prisma.submission.findUnique({
		where: { id },
		include: { reviews: true },
	});

	if (!submission) {
		return (
			<div className="min-h-screen">
				<Navbar />
				<main className="mx-auto max-w-3xl px-4 py-8">
					<p className="text-sm font-medium text-rose-700">
						Submission not found.
					</p>
				</main>
			</div>
		);
	}

	const canAccess =
		submission.applicantId === user.id ||
		submission.assignedReviewerId === user.id ||
		user.role === "ADMIN";

	if (!canAccess) {
		return (
			<div className="min-h-screen">
				<Navbar />
				<main className="mx-auto max-w-3xl px-4 py-8">
					<p className="text-sm font-medium text-rose-700">
						You do not have permission to view this feedback.
					</p>
				</main>
			</div>
		);
	}

	return (
		<div className="min-h-screen">
			<Navbar />
			<main className="mx-auto max-w-3xl px-4 py-8">
				<h1 className="text-2xl font-bold text-slate-900">
					{submission.title} Feedback
				</h1>
				<p className="mt-1 text-sm text-slate-600">
					Review score and comments from reviewer.
				</p>

				<div className="mt-6">
					<FeedbackCard
						score={submission.reviews?.[0]?.score}
						comment={submission.reviews?.[0]?.comment}
					/>
				</div>
			</main>
		</div>
	);
}
