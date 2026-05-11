import { NextResponse } from "next/server";
import { clearSession } from "../../../lib/auth";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

export async function POST() {
	await clearSession();
	return NextResponse.json({ ok: true });
}
