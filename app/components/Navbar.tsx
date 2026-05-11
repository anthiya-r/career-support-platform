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
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
		<nav className="border-b border-slate-200 bg-[#3A8FC1]">
			<div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-4">
				<Link
					href="/dashboard"
					className="text-lg font-bold text-white cursor-pointer hover:text-gray-200 transition"
				>
					GoGetJob
				</Link>

				{/* Desktop Navigation */}
				<div className="hidden md:flex flex-wrap items-center gap-2">
					{visibleLinks.map((link) => {
						const active = pathname.startsWith(link.href);
						return (
							<Link
								key={link.href}
								href={link.href}
								className={`rounded-md px-3 py-2 text-sm font-semibold cursor-pointer transition ${
									active
										? "bg-[#43302E] text-[#FFF1B5]"
										: "text-[#FFF1B5] hover:bg-[#43302E] hover:text-[#FFF1B5]"
								}`}
							>
								{link.label}
							</Link>
						);
					})}
					<button
						type="button"
						onClick={() => void handleLogout()}
						className="rounded-md bg-[#FFF1B5] px-3 py-2 text-sm font-semibold cursor-pointer text-[#43302E] transition hover:bg-[#43302E] hover:text-[#FFF1B5]"
					>
						Logout
					</button>
				</div>

				{/* Mobile Hamburger Menu */}
				<div className="md:hidden">
					<button
						type="button"
						onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
						className="text-white hover:text-gray-200 focus:outline-none"
					>
						<svg
							className="h-6 w-6"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							{mobileMenuOpen ? (
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M6 18L18 6M6 6l12 12"
								/>
							) : (
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M4 6h16M4 12h16M4 18h16"
								/>
							)}
						</svg>
					</button>
				</div>
			</div>

			{/* Mobile Menu Overlay */}
			{mobileMenuOpen && (
				<div className="md:hidden bg-[#3A8FC1] border-b border-slate-200">
					<div className="px-4 py-4 space-y-2">
						{visibleLinks.map((link) => {
							const active = pathname.startsWith(link.href);
							return (
								<Link
									key={link.href}
									href={link.href}
									onClick={() => setMobileMenuOpen(false)}
									className={`block w-full rounded-md px-3 py-2 text-sm font-semibold cursor-pointer transition ${
										active
											? "bg-[#43302E] text-[#FFF1B5]"
											: "text-[#FFF1B5] hover:bg-[#43302E] hover:text-[#FFF1B5]"
									}`}
								>
									{link.label}
								</Link>
							);
						})}
						<button
							type="button"
							onClick={() => {
								void handleLogout();
								setMobileMenuOpen(false);
							}}
							className="w-full rounded-md bg-[#FFF1B5] px-3 py-2 text-sm font-semibold cursor-pointer text-[#43302E] transition hover:bg-[#43302E] hover:text-[#FFF1B5]"
						>
							Logout
						</button>
					</div>
				</div>
			)}
		</nav>
	);
}
