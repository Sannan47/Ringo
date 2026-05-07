import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "../lib/auth";

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const user = token ? verifyToken(token) : null;

  if (!user) {
    redirect("/login");
  }

  redirect(user.role === "admin" ? "/admin" : "/dashboard");
}
