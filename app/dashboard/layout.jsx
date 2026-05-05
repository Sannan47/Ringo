import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LogoutButton from "../../components/auth/LogoutButton";
import { verifyToken } from "../../lib/auth";

export default async function DashboardLayout({ children }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const user = token ? verifyToken(token) : null;

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-950/80 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Link className="text-lg font-semibold tracking-tight" href="/dashboard">
              Ringo Dashboard
            </Link>
            <nav className="flex items-center gap-3 text-sm text-slate-300">
              <Link className="hover:text-white" href="/dashboard">
                Home
              </Link>
              {user.role === "admin" && (
                <Link className="hover:text-white" href="/admin">
                  Admin
                </Link>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">{user.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="flex flex-1">{children}</main>
    </div>
  );
}
