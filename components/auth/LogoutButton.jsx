"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function LogoutButton() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/login");
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="btn-secondary text-sm"
    >
      {isLoggingOut ? "Logging out..." : "Logout"}
    </button>
  );
}
