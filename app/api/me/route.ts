import { NextResponse } from "next/server";
import { getCurrentUser } from "../../lib/auth";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

export async function GET() {
	const user = await getCurrentUser();
	if (!user) return NextResponse.json({ user: null }, { status: 200 });

	return NextResponse.json({
		user: {
			id: user.id,
			email: user.email,
			role: user.role,
			name: user.name,
			goal: user.goal,
		},
	});
}
