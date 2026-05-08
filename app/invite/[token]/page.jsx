"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function InvitePage() {
  const router = useRouter();
  const params = useParams();
  const token = Array.isArray(params?.token) ? params.token[0] : params?.token;
  const [status, setStatus] = useState("Joining...");

  useEffect(() => {
    const acceptInvite = async () => {
      try {
        const response = await fetch("/api/invites/accept", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await response.json();

        if (response.ok) {
          setStatus("Invite accepted. Redirecting...");
          setTimeout(() => {
            router.push("/dashboard");
          }, 1000);
        } else {
          setStatus(data?.error || "Invite invalid or expired");
        }
      } catch (error) {
        setStatus("Invite invalid or expired");
      }
    };

    if (token) {
      acceptInvite();
    }
  }, [router, token]);

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
        <h1 className="text-2xl font-semibold">Server Invite</h1>
        <p className="mt-3 text-sm text-slate-300">{status}</p>
      </div>
    </div>
  );
}
