"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

const publicRoutes = [
  "/",
  "/about",
  "/contact",
  "/login",
  "/signup",
  "/forgot-password",
];

const publicPrefixes = ["/reset-password"];

export default function PublicChrome({ children }) {
  const pathname = usePathname();
  const isPublic =
    publicRoutes.includes(pathname) ||
    publicPrefixes.some((prefix) => pathname.startsWith(prefix));

  return (
    <div className="min-h-screen flex flex-col">
      {isPublic ? <Navbar /> : null}
      <div className="flex-1">{children}</div>
      {isPublic ? <Footer /> : null}
    </div>
  );
}
