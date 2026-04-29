import { getCurrentUser } from "../../../lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
	try {
		const user = await getCurrentUser();
		if (!user) {
			return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
		}

		return NextResponse.json({
			id: user.id,
			email: user.email,
			role: user.role,
			name: user.name,
		});
	} catch (error) {
		console.error("Error fetching current user:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
