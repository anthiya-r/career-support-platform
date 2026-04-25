import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const providers = [];
if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    })
  );
}

export const nextAuthOptions: NextAuthOptions = {
  providers,
  session: { strategy: "jwt" },
};

