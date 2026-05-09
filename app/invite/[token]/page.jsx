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
      } catch {
        setStatus("Invite invalid or expired");
      }
    };

    if (token) {
      acceptInvite();
    }
  }, [router, token]);

  return (
    <main className="ringo-page flex min-h-screen items-center px-4 py-16">
      <div className="ringo-panel mx-auto w-full max-w-lg p-6">
        <div className="brand-mark mb-5">R</div>
        <div className="eyebrow">Workspace invite</div>
        <h1 className="mt-4 text-3xl font-black text-[var(--text)]">
          Server invite
        </h1>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{status}</p>
      </div>
    </main>
  );
}
