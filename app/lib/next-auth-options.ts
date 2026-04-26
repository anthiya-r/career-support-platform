import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./db";
import { createSession } from "./auth";

const providers = [];
if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
	providers.push(
		GoogleProvider({
			clientId: process.env.AUTH_GOOGLE_ID,
			clientSecret: process.env.AUTH_GOOGLE_SECRET,
		}),
	);
}

export const nextAuthOptions: NextAuthOptions = {
	providers,
	session: { strategy: "jwt" },
	callbacks: {
		async signIn({ user, account }) {
			if (account?.provider === "google") {
				try {
					// Check if user exists
					const existingUser = await prisma.user.findUnique({
						where: { email: user.email! },
					});

					let dbUser = existingUser;
					if (!existingUser) {
						// Create new user for OAuth
						dbUser = await prisma.user.create({
							data: {
								email: user.email!,
								name: user.name,
								role: "APPLICANT", // Default role
								// OAuth users don't have password
								passwordHash: "", // Empty for OAuth users
							},
						});
					}

					// Store user ID in the token for later use
					if (dbUser) {
						user.id = dbUser.id;
						// Create database session immediately for OAuth users
						await createSession(dbUser.id);
					}
					return true;
				} catch (error) {
					console.error("Error saving OAuth user:", error);
					return false;
				}
			}
			return true;
		},
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id;
				token.email = user.email;
				token.name = user.name;
			}
			return token;
		},
		async session({ session, token }) {
			if (token && session.user) {
				session.user.id = token.id as string;
				session.user.email = token.email as string;
				session.user.name = token.name as string;
			}
			return session;
		},
	},
};
