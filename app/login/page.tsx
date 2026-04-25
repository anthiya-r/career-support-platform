"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import FormInput from "../components/FormInput";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServerError(null);

    const nextErrors: { email?: string; password?: string } = {};
    if (!email.includes("@")) nextErrors.email = "Enter a valid email.";
    if (password.trim().length < 6) nextErrors.password = "Password must be at least 6 characters.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length !== 0) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as { error?: string } | null;
        setServerError(payload?.error ?? "Something went wrong");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{mode === "login" ? "Login" : "Sign up"}</h1>
            <p className="mt-1 text-sm text-slate-600">
              {mode === "login" ? "Sign in to view your resume submissions." : "Create an account to submit your resume."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setServerError(null);
              setMode((m) => (m === "login" ? "signup" : "login"));
            }}
            className="text-sm font-semibold text-slate-700 underline underline-offset-4 hover:text-slate-900"
          >
            {mode === "login" ? "Create account" : "Have an account?"}
          </button>
        </div>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <FormInput
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            error={errors.email}
          />
          <FormInput
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="******"
            error={errors.password}
          />
          {serverError ? <p className="text-sm font-medium text-rose-700">{serverError}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {loading ? "Please wait..." : mode === "login" ? "Login" : "Sign up"}
          </button>
        </form>
        <div className="mt-4">
          <button
            type="button"
            onClick={() => {
              window.location.href = "/api/auth/signin/google?callbackUrl=/dashboard";
            }}
            className="block w-full rounded-md border border-slate-300 px-4 py-2 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Continue with Google (OAuth)
          </button>
        </div>
      </div>
    </main>
  );
}
