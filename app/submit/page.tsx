"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";

export default function SubmitResumePage() {
  const router = useRouter();
  const [title, setTitle] = useState("Resume Submission");
  const [resumeText, setResumeText] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileMime, setFileMime] = useState("");
  const [fileBase64, setFileBase64] = useState("");
  const [consentChecked, setConsentChecked] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setFileName(file?.name ?? "");
    setFileMime(file?.type ?? "");
    setFileBase64("");
    if (!file) return;
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result ?? "");
        const encoded = result.includes(",") ? result.split(",")[1] : "";
        resolve(encoded);
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
    setFileBase64(base64);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!consentChecked) {
      setShowConsentModal(true);
      return;
    }

    setLoading(true);
    const res = await fetch("/api/submissions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title,
        resumeText,
        resumeFileName: fileName || undefined,
        resumeFileMime: fileMime || undefined,
        resumeFileBase64: fileBase64 || undefined,
        consentGiven: consentChecked,
      }),
    });
    setLoading(false);

    if (!res.ok) {
      const payload = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(payload?.error ?? "Failed to submit");
      return;
    }

    setSuccessMessage("Resume submitted successfully!");
    setTimeout(() => {
      router.push("/dashboard");
    }, 900);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900">Submit Resume</h1>
        <p className="mt-1 text-sm text-slate-600">Upload a file or paste your resume text.</p>

        <section className="mt-4 rounded-lg border border-sky-200 bg-sky-50 p-4">
          <h2 className="text-sm font-semibold text-sky-900">Submission recommendations</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-sky-800">
            <li>Use bullet points and quantified results for each experience.</li>
            <li>Remove sensitive data (ID numbers, full home address, bank details).</li>
            <li>Keep resume length to 1-2 pages for early-career applicants.</li>
          </ul>
        </section>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium text-slate-700">
              Submission title
            </label>
            <input
              id="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="resume-file" className="block text-sm font-medium text-slate-700">
              Upload file (PDF preferred)
            </label>
            <input
              id="resume-file"
              type="file"
              accept=".pdf,.txt,.doc,.docx"
              className="w-full rounded-md border border-slate-300 p-2 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium"
              onChange={handleFileChange}
            />
            {fileName ? <p className="text-xs text-slate-500">Selected: {fileName}</p> : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="resume-text" className="block text-sm font-medium text-slate-700">
              Paste resume text
            </label>
            <textarea
              id="resume-text"
              rows={8}
              value={resumeText}
              onChange={(event) => setResumeText(event.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              placeholder="Paste your resume content..."
            />
          </div>

          <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
            <label className="flex items-start gap-2 text-sm text-amber-900">
              <input
                type="checkbox"
                checked={consentChecked}
                onChange={(event) => setConsentChecked(event.target.checked)}
                className="mt-1"
              />
              <span>
                I consent to personal data processing for resume review and mentoring support.
              </span>
            </label>
            <button
              type="button"
              onClick={() => setShowConsentModal(true)}
              className="mt-2 text-xs font-semibold text-amber-800 underline underline-offset-4"
            >
              View consent details
            </button>
          </div>

          {error ? <p className="text-sm font-medium text-rose-700">{error}</p> : null}
          {successMessage ? <p className="text-sm font-medium text-emerald-700">{successMessage}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>

        {showConsentModal ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
            <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-lg">
              <h2 className="text-lg font-bold text-slate-900">Personal data consent notice</h2>
              <p className="mt-2 text-sm text-slate-700">
                We store your resume, profile details, and reviewer comments to provide resume feedback.
                Before submission, remove sensitive data such as government ID, full address, bank account
                numbers, and other personal identifiers you do not want to share.
              </p>
              <div className="mt-4 flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowConsentModal(false)}
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConsentChecked(true);
                    setShowConsentModal(false);
                  }}
                  className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
                >
                  I understand
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
