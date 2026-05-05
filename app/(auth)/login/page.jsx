"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!formData.email.trim()) {
      nextErrors.email = "Email is required";
    }

    if (!formData.password) {
      nextErrors.password = "Password is required";
    }

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError("");

    const nextErrors = validate();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setServerError(data?.message || "Login failed");
        return;
      }

      router.push("/dashboard");
    } catch (error) {
      setServerError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#e0f2fe,_#f1f5f9,_#ffffff)] px-4 py-12 font-sans text-slate-900">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-12 lg:flex-row-reverse">
        <div className="w-full max-w-md space-y-4 fade-in-up">
          <p className="inline-flex items-center rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
            Welcome back
          </p>
          <h1 className="text-4xl font-semibold leading-tight">
            Log in to keep conversations moving.
          </h1>
          <p className="text-base leading-relaxed text-slate-600">
            Your Ringo workspace is waiting. Sign in securely and jump straight
            into your team channels.
          </p>
          <div className="rounded-2xl border border-sky-200/60 bg-white/70 p-4 text-sm text-sky-800 shadow-sm">
            Use the email and password you registered during signup.
          </div>
        </div>

        <div className="w-full max-w-md rounded-3xl bg-white/90 p-8 shadow-xl ring-1 ring-black/5 backdrop-blur fade-in-up fade-in-up-delay-1">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Log in</h2>
            <p className="text-sm text-slate-500">
              New here?{" "}
              <Link className="font-semibold text-sky-700" href="/signup">
                Create an account
              </Link>
            </p>
          </div>

          {serverError && (
            <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {serverError}
            </div>
          )}

          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@ringo.dev"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              />
              {errors.email && (
                <p className="text-xs font-medium text-rose-600">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <label
                className="text-sm font-medium text-slate-700"
                htmlFor="password"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Your secure password"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              />
              {errors.password && (
                <p className="text-xs font-medium text-rose-600">
                  {errors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-200 transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
