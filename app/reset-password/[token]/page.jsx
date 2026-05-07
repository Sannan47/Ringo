"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const token = Array.isArray(params?.token) ? params.token[0] : params?.token;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data?.error || "Unable to reset password");
        return;
      }

      setMessage("Password updated. Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch (err) {
      setError("Unable to reset password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto w-full max-w-lg">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
            Reset password
          </p>
          <h1 className="mt-3 text-3xl font-semibold">Set a new password</h1>
          <p className="mt-3 text-sm text-slate-300">
            Choose a strong password to secure your account.
          </p>
        </div>

        {error ? (
          <div className="mb-4 rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        ) : null}

        {message ? (
          <div className="mb-4 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {message}
          </div>
        ) : null}

        <form
          className="space-y-5 rounded-3xl border border-slate-800 bg-slate-900/60 p-6"
          onSubmit={handleSubmit}
        >
          <div>
            <label className="text-sm font-medium text-slate-200" htmlFor="password">
              New password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none"
            />
          </div>
          <div>
            <label
              className="text-sm font-medium text-slate-200"
              htmlFor="confirmPassword"
            >
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Updating..." : "Reset password"}
          </button>
        </form>
      </div>
    </div>
  );
}
