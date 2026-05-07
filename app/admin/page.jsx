"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

export default function AdminPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await fetch("/api/admin/users");
        const data = await response.json();

        if (response.status === 401) {
          router.replace("/login");
          return;
        }

        if (response.status === 403) {
          setError("403 - Access Denied");
          setUsers([]);
          return;
        }

        if (response.ok) {
          setUsers(data.users || []);
        } else {
          setError("Unable to load users");
        }
      } catch (err) {
        setError("Unable to load users");
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 px-6 py-10 text-white">
        <p className="text-sm text-slate-400">Loading admin dashboard...</p>
      </div>
    );
  }

  if (!loading && user && user.role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-950 px-6 py-10 text-white">
        <h1 className="text-2xl font-semibold">403 - Access Denied</h1>
        <p className="mt-2 text-sm text-slate-400">
          You do not have permission to view this page.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Admin Dashboard
          </p>
          <h1 className="text-3xl font-semibold">User Management</h1>
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        ) : null}

        {isLoading && !error ? (
          <p className="text-sm text-slate-400">Loading users...</p>
        ) : null}

        {!isLoading && !error ? (
          <div className="overflow-hidden rounded-2xl border border-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/70 text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((entry) => (
                  <tr key={entry.id} className="border-t border-slate-800">
                    <td className="px-4 py-3 text-white">{entry.name}</td>
                    <td className="px-4 py-3 text-slate-300">{entry.email}</td>
                    <td className="px-4 py-3 text-slate-300">{entry.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </div>
  );
}
