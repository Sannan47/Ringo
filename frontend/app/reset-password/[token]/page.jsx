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
    } catch {
      setError("Unable to reset password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="ringo-page px-4 py-16">
      <div className="mx-auto w-full max-w-lg">
        <div className="mb-8">
          <div className="eyebrow">Reset password</div>
          <h1 className="mt-4 text-3xl font-black text-[var(--text)]">
            Set a new password
          </h1>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            Choose a strong password to secure your account.
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
          </div>
        ) : null}

        <form
          className="ringo-panel space-y-5 p-6"
          onSubmit={handleSubmit}
        >
          <div>
            <label className="text-sm font-bold text-[var(--text)]" htmlFor="password">
              New password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="field mt-2"
            />
          </div>
          <div>
            <label
              className="text-sm font-bold text-[var(--text)]"
              htmlFor="confirmPassword"
            >
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="field mt-2"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary text-sm"
          >
            {isSubmitting ? "Updating..." : "Reset password"}
          </button>
        </form>
      </div>
    </main>
  );
}
