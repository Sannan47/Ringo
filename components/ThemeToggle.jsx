"use client";

import { useEffect, useState } from "react";

const getPreferredTheme = () => {
  if (typeof window === "undefined") {
    return "light";
  }

  const stored = window.localStorage.getItem("ringo-theme");
  if (stored === "dark" || stored === "light") {
    return stored;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export default function ThemeToggle() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const preferred = getPreferredTheme();
    document.documentElement.classList.toggle("dark", preferred === "dark");
    document.documentElement.classList.toggle("light", preferred === "light");
    window.requestAnimationFrame(() => setTheme(preferred));
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    window.localStorage.setItem("ringo-theme", nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    document.documentElement.classList.toggle("light", nextTheme === "light");
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="icon-button"
      aria-label="Toggle color theme"
      title="Toggle theme"
    >
      {theme === "dark" ? (
        <svg
          aria-hidden="true"
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
      ) : (
        <svg
          aria-hidden="true"
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.99 13.1A8 8 0 1 1 10.9 3.01 6.5 6.5 0 1 0 20.99 13.1Z" />
        </svg>
      )}
    </button>
  );
}
