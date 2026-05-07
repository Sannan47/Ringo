"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [resetLink, setResetLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setResetLink("");

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data?.error || "Unable to generate reset link");
        return;
      }

      setMessage(data?.message || "Password reset token generated");
      setResetLink(data?.resetLink || "");
    } catch (err) {
      setError("Unable to generate reset link");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto w-full max-w-lg">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
            Password reset
          </p>
          <h1 className="mt-3 text-3xl font-semibold">Forgot your password?</h1>
          <p className="mt-3 text-sm text-slate-300">
            Enter your email and we will generate a reset link for you.
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
            {resetLink ? (
              <div className="mt-2">
                <Link className="text-emerald-100 underline" href={resetLink}>
                  {resetLink}
                </Link>
              </div>
            ) : null}
          </div>
        ) : null}

        <form
          className="space-y-5 rounded-3xl border border-slate-800 bg-slate-900/60 p-6"
          onSubmit={handleSubmit}
        >
          <div>
            <label className="text-sm font-medium text-slate-200" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@ringo.dev"
              className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Generating..." : "Send reset link"}
          </button>
          <p className="text-xs text-slate-400">
            Remembered your password?{" "}
            <Link className="underline" href="/login">
              Back to login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
