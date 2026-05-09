import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)] px-4 py-10 text-[var(--muted)]">
      <div className="ringo-container flex flex-col gap-7 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span className="brand-mark h-9 w-9 rounded-xl text-sm">R</span>
          <div>
            <p className="text-sm font-bold text-[var(--text)]">Ringo</p>
            <p className="mt-1 text-xs">Real-time spaces for focused teams.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <Link href="/about" className="nav-link">
            About
          </Link>
          <Link href="/contact" className="nav-link">
            Contact
          </Link>
          <a href="mailto:hello@ringo.app" className="nav-link">
            hello@ringo.app
          </a>
        </div>
        <div className="text-xs text-[var(--faint)]">
          &copy; {new Date().getFullYear()} Ringo. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
