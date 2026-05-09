"use client";

import { useState } from "react";
import Link from "next/link";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!formData.name.trim()) {
      nextErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      nextErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email.trim())) {
      nextErrors.email = "Enter a valid email address";
    }

    if (!formData.password) {
      nextErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters";
    }

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError("");
    setSuccessMessage("");

    const nextErrors = validate();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setServerError(data?.message || "Signup failed");
        return;
      }

      setSuccessMessage("Account created. You can now log in.");
      setFormData({ name: "", email: "", password: "" });
    } catch (error) {
      setServerError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="ringo-page">
      <div className="ringo-container grid min-h-[calc(100vh-76px)] items-center gap-10 py-12 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="max-w-md space-y-5 fade-in-up">
          <div className="eyebrow">Create workspace access</div>
          <h1 className="text-4xl font-black leading-tight tracking-tight text-[var(--text)]">
            Start a polished team space in minutes.
          </h1>
          <p className="text-base leading-7 text-[var(--muted)]">
            Set up your account to join your team, manage channels, and keep your
            collaboration secure.
          </p>
          <div className="ringo-panel p-4 text-sm leading-6 text-[var(--text-soft)]">
            Ringo keeps onboarding simple: create an account, join a server, and
            start the conversation without setup clutter.
          </div>
        </div>

        <div className="ringo-panel w-full max-w-md p-7 fade-in-up fade-in-up-delay-1">
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-[var(--text)]">Sign up</h2>
            <p className="text-sm text-[var(--muted)]">
              Already have an account?{" "}
              <Link className="font-bold text-[var(--primary-strong)]" href="/login">
                Log in
              </Link>
            </p>
          </div>

          {serverError && (
            <div className="mt-6 rounded-lg border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-600">
              {serverError}
            </div>
          )}

          {successMessage && (
            <div className="mt-6 rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600">
              {successMessage}
            </div>
          )}

          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-bold text-[var(--text)]" htmlFor="name">
                Full name
              </label>
              <input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Jane Appleseed"
                className="field"
              />
              {errors.name && (
                <p className="text-xs font-semibold text-rose-600">{errors.name}</p>
              )}
            </div>

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
                placeholder="At least 6 characters"
                className="field"
              />
              {errors.password && (
                <p className="text-xs font-semibold text-rose-600">
                  {errors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full text-sm"
            >
              {isSubmitting ? "Creating account..." : "Create account"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
