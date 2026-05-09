"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import LogoutButton from "./auth/LogoutButton";
import ThemeToggle from "./ThemeToggle";

function MenuIcon({ open }) {
  return open ? (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  ) : (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );
}

export default function Navbar() {
  const { user, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border)] bg-[var(--surface)] backdrop-blur-xl">
      <div className="ringo-container flex items-center justify-between py-4">
        <Link
          href="/"
          className="flex items-center gap-3 text-lg font-bold tracking-tight text-[var(--text)]"
        >
          <span className="brand-mark">R</span>
          <span>Ringo</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="nav-link">
              {link.label}
            </Link>
          ))}

          {!loading && user ? (
            <>
              <Link href="/dashboard" className="nav-link">
                Dashboard
              </Link>
              {user.role === "admin" ? (
                <Link href="/admin" className="nav-link">
                  Admin
                </Link>
              ) : null}
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="nav-link">
                Login
              </Link>
              <Link href="/signup" className="btn-primary text-sm">
                Sign Up
              </Link>
            </>
          )}
          <ThemeToggle />
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="icon-button"
            aria-label="Toggle navigation"
          >
            <MenuIcon open={isOpen} />
          </button>
        </div>
      </div>

      {isOpen ? (
        <div className="border-t border-[var(--border)] bg-[var(--surface-solid)] px-4 py-4 md:hidden">
          <div className="flex flex-col gap-2 text-sm">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="nav-link">
                {link.label}
              </Link>
            ))}

            {!loading && user ? (
              <>
                <Link href="/dashboard" className="nav-link">
                  Dashboard
                </Link>
                {user.role === "admin" ? (
                  <Link href="/admin" className="nav-link">
                    Admin
                  </Link>
                ) : null}
                <LogoutButton />
              </>
            ) : (
              <>
                <Link href="/login" className="nav-link">
                  Login
                </Link>
                <Link href="/signup" className="btn-primary text-sm">
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
