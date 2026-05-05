"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    setMessage("Password reset flow is not implemented yet.");
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fef2f2,_#fff7ed,_#ffffff)] px-4 py-12 font-sans text-slate-900">
      <div className="mx-auto w-full max-w-md rounded-3xl bg-white/90 p-8 shadow-xl ring-1 ring-black/5 backdrop-blur">
        <h1 className="text-2xl font-semibold">Forgot password</h1>
        <p className="mt-2 text-sm text-slate-500">
          Enter the email you used to sign up and we will send recovery steps.
        </p>

        {message && (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {message}
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@ringo.dev"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
            />
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-200 transition hover:bg-amber-700"
          >
            Send reset link
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-500">
          Remembered your password?{" "}
          <Link className="font-semibold text-amber-700" href="/login">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
