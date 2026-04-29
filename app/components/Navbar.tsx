"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type UserRole = "APPLICANT" | "REVIEWER" | "ADMIN";

interface User {
	id: string;
	email: string;
	role: UserRole;
	name?: string;
}

const allLinks = [
	{
		href: "/dashboard",
		label: "Dashboard",
		roles: ["APPLICANT", "ADMIN"],
	},
	{
		href: "/profile",
		label: "Profile",
		roles: ["APPLICANT", "REVIEWER", "ADMIN"],
	},
	{ href: "/submit", label: "Submit", roles: ["APPLICANT"] },
	{ href: "/reviewer", label: "Reviewer", roles: ["REVIEWER", "ADMIN"] },
	{ href: "/admin", label: "Admin", roles: ["ADMIN"] },
];

export default function Navbar() {
	const pathname = usePathname();
	const router = useRouter();
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchUser = async () => {
			try {
				const res = await fetch("/api/auth/me");
				if (res.ok) {
					const userData = await res.json();
					setUser(userData);
				} else {
					setUser(null);
				}
			} catch (error) {
				console.error("Error fetching user:", error);
				setUser(null);
			} finally {
				setLoading(false);
			}
		};

		fetchUser();
	}, []);

	const handleLogout = async () => {
		await fetch("/api/auth/logout", { method: "POST" });
		router.push("/login");
		router.refresh();
	};

	// Filter links based on user role
	const visibleLinks = loading
		? []
		: allLinks.filter((link) => user && link.roles.includes(user.role));

	return (
		<nav className="border-b border-slate-200 bg-white">
			<div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-4">
				<p className="text-sm font-semibold text-slate-700">GoGetJob</p>
				<div className="flex flex-wrap items-center gap-2">
					{visibleLinks.map((link) => {
						const active = pathname.startsWith(link.href);
						return (
							<Link
								key={link.href}
								href={link.href}
								className={`rounded-md px-3 py-2 text-sm font-medium transition ${
									active
										? "bg-slate-900 text-white"
										: "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
								}`}
							>
								{link.label}
							</Link>
						);
					})}
					<button
						type="button"
						onClick={() => void handleLogout()}
						className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
					>
						Logout
					</button>
				</div>
			</div>
		</nav>
	);
}
