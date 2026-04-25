"use client";

import { FormEvent, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import FormInput from "../components/FormInput";

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [careerGoal, setCareerGoal] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/me", { cache: "no-store" })
      .then((res) => res.json())
      .then((payload: { user: null | { name: string | null; goal: string | null } }) => {
        if (!payload.user) return;
        setName(payload.user.name ?? "");
        setCareerGoal(payload.user.goal ?? "");
      })
      .catch(() => {
        // no-op
      });
  }, []);

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, goal: careerGoal }),
      });
      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(payload?.error ?? "Failed to save profile");
        return;
      }
      setShowToast(true);
      setTimeout(() => setShowToast(false), 1800);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
          {showToast ? (
            <p className="rounded-md bg-emerald-100 px-3 py-2 text-xs font-semibold text-emerald-700">
              Profile saved
            </p>
          ) : null}
        </div>

        <form
          onSubmit={handleSave}
          className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
        >
          <FormInput id="name" label="Name" value={name} onChange={setName} />

          <div className="space-y-1">
            <label htmlFor="goal" className="block text-sm font-medium text-slate-700">
              Career goal
            </label>
            <input
              id="goal"
              value={careerGoal}
              onChange={(event) => setCareerGoal(event.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            />
          </div>

          {error ? <p className="text-sm font-medium text-rose-700">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </form>
      </main>
    </div>
  );
}
