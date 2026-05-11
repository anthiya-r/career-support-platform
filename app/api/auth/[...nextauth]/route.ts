import NextAuth from "next-auth/next";
import { nextAuthOptions } from "../../../lib/next-auth-options";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

const handler = NextAuth(nextAuthOptions);

export { handler as GET, handler as POST };
