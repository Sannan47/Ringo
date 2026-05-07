import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 px-6 py-10 text-slate-400">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-white">Ringo</p>
          <p className="mt-2 text-xs text-slate-500">
            Built for focused, real-time collaboration.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-xs">
          <Link href="/about" className="hover:text-white">
            About
          </Link>
          <Link href="/contact" className="hover:text-white">
            Contact
          </Link>
          <a
            href="mailto:hello@ringo.app"
            className="hover:text-white"
          >
            hello@ringo.app
          </a>
        </div>
        <div className="text-xs text-slate-500">
          © {new Date().getFullYear()} Ringo. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
