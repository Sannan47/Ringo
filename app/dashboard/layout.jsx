import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "../../lib/auth";

export default async function DashboardLayout({ children }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const user = token ? verifyToken(token) : null;

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="ringo-page dashboard-stage flex min-h-screen flex-col">
      <main className="flex min-h-0 flex-1">{children}</main>
    </div>
  );
}
