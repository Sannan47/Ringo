"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import LogoutButton from "./auth/LogoutButton";

export default function Navbar() {
  const { user, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight text-white">
          Ringo
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          {!loading && user ? (
            <>
              <Link href="/dashboard" className="transition hover:text-white">
                Dashboard
              </Link>
              {user.role === "admin" ? (
                <Link href="/admin" className="transition hover:text-white">
                  Admin
                </Link>
              ) : null}
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="transition hover:text-white">
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200 transition hover:border-slate-500"
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-800 text-slate-200 transition hover:border-slate-500 md:hidden"
        >
          <span className="text-lg">{isOpen ? "✕" : "☰"}</span>
        </button>
      </div>
      {isOpen ? (
        <div className="border-t border-slate-800 bg-slate-950 px-6 py-4 md:hidden">
          <div className="flex flex-col gap-3 text-sm text-slate-300">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition hover:text-white"
              >
                {link.label}
              </Link>
            ))}
            {!loading && user ? (
              <>
                <Link href="/dashboard" className="transition hover:text-white">
                  Dashboard
                </Link>
                {user.role === "admin" ? (
                  <Link href="/admin" className="transition hover:text-white">
                    Admin
                  </Link>
                ) : null}
                <LogoutButton />
              </>
            ) : (
              <>
                <Link href="/login" className="transition hover:text-white">
                  Login
                </Link>
                <Link href="/signup" className="transition hover:text-white">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
