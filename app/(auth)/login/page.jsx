"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuth();
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
        setServerError(data?.error || data?.message || "Login failed");
        return;
      }

      if (data?.user) {
        setUser(data.user);
      }
      router.push(data?.user?.role === "admin" ? "/admin" : "/dashboard");
    } catch (error) {
      setServerError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="ringo-page">
      <div className="ringo-container grid min-h-[calc(100vh-76px)] items-center gap-10 py-12 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="max-w-md space-y-5 fade-in-up lg:order-2">
          <div className="eyebrow">Welcome back</div>
          <h1 className="text-4xl font-black leading-tight tracking-tight text-[var(--text)]">
            Log in and get straight back to the room.
          </h1>
          <p className="text-base leading-7 text-[var(--muted)]">
            Your Ringo workspace is waiting. Sign in securely and jump straight
            into your team channels.
          </p>
          <div className="ringo-panel p-4 text-sm leading-6 text-[var(--text-soft)]">
            Secure sessions use HTTP-only cookies, so the interface stays smooth
            while access stays protected.
          </div>
        </div>

        <div className="ringo-panel w-full max-w-md p-7 fade-in-up fade-in-up-delay-1">
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-[var(--text)]">Log in</h2>
            <p className="text-sm text-[var(--muted)]">
              New here?{" "}
              <Link className="font-bold text-[var(--primary-strong)]" href="/signup">
                Create an account
              </Link>
            </p>
          </div>

          {serverError && (
            <div className="mt-6 rounded-lg border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-600">
              {serverError}
            </div>
          )}

          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-bold text-[var(--text)]" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@ringo.dev"
                className="field"
              />
              {errors.email && (
                <p className="text-xs font-semibold text-rose-600">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <label
                className="text-sm font-bold text-[var(--text)]"
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
                className="field"
              />
              {errors.password && (
                <p className="text-xs font-semibold text-rose-600">
                  {errors.password}
                </p>
              )}
              <div className="text-right text-xs">
                <Link
                  className="font-bold text-[var(--primary-strong)]"
                  href="/forgot-password"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full text-sm"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
