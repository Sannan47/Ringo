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
    <main className="ringo-page px-4 py-16">
      <div className="mx-auto w-full max-w-lg">
        <div className="mb-8">
          <div className="eyebrow">Password reset</div>
          <h1 className="mt-4 text-3xl font-black text-[var(--text)]">
            Forgot your password?
          </h1>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            Enter your email and we will generate a reset link for you.
          </p>
        </div>

        {error ? (
          <div className="mb-4 rounded-lg border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-600">
            {error}
          </div>
        ) : null}

        {message ? (
          <div className="mb-4 rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600">
            {message}
            {resetLink ? (
              <div className="mt-2">
                <Link className="font-bold underline" href={resetLink}>
                  {resetLink}
                </Link>
              </div>
            ) : null}
          </div>
        ) : null}

        <form
          className="ringo-panel space-y-5 p-6"
          onSubmit={handleSubmit}
        >
          <div>
            <label className="text-sm font-bold text-[var(--text)]" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@ringo.dev"
              className="field mt-2"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary text-sm"
          >
            {isSubmitting ? "Generating..." : "Send reset link"}
          </button>
          <p className="text-xs text-[var(--muted)]">
            Remembered your password?{" "}
            <Link className="font-bold text-[var(--primary-strong)]" href="/login">
              Back to login
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
