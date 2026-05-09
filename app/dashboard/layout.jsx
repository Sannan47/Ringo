import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LogoutButton from "../../components/auth/LogoutButton";
import ThemeToggle from "../../components/ThemeToggle";
import { verifyToken } from "../../lib/auth";

export default async function DashboardLayout({ children }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const user = token ? verifyToken(token) : null;

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="ringo-page flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--surface)] px-4 py-3 backdrop-blur-xl">
        <div className="flex w-full items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              className="flex items-center gap-3 text-lg font-black tracking-tight text-[var(--text)]"
              href="/dashboard"
            >
              <span className="brand-mark h-9 w-9 rounded-xl text-sm">R</span>
              <span className="hidden sm:inline">Ringo</span>
            </Link>
            <nav className="flex items-center gap-1">
              <Link className="nav-link" href="/dashboard">
                Home
              </Link>
              {user.role === "admin" && (
                <Link className="nav-link" href="/admin">
                  Admin
                </Link>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden rounded-full bg-[var(--primary-faint)] px-3 py-2 text-xs font-bold text-[var(--muted)] md:inline">
              {user.email}
            </span>
            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="flex flex-1">{children}</main>
    </div>
  );
}
