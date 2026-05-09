import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardPage from "../../../dashboard/page";
import { verifyToken } from "../../../../lib/auth";

export default async function ServerDashboardPage({ params }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const user = token ? verifyToken(token) : null;

  if (!user) {
    redirect("/login");
  }

  const { serverId } = await params;

  return <DashboardPage initialServerId={serverId} />;
}
