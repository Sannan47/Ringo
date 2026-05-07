"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import LogoutButton from "../../components/auth/LogoutButton";

export default function AdminPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [updatingId, setUpdatingId] = useState("");
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
          const normalized = Array.isArray(data) ? data : data.users || [];
          setUsers(normalized);
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

  const updateUserState = (updatedUser) => {
    setUsers((prev) =>
      prev.map((entry) => (entry.id === updatedUser.id ? updatedUser : entry))
    );
  };

  const handleRoleChange = async (targetUser, nextRole) => {
    if (!window.confirm(`Change role for ${targetUser.name} to ${nextRole}?`)) {
      return;
    }

    setFeedback("");
    setError("");
    setUpdatingId(targetUser.id);

    try {
      const response = await fetch(`/api/admin/users/${targetUser.id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: nextRole }),
      });
      const data = await response.json();

      if (response.ok) {
        updateUserState(data);
        setFeedback("Role updated successfully");
      } else {
        setError(data?.error || "Failed to update role");
      }
    } catch (err) {
      setError("Failed to update role");
    } finally {
      setUpdatingId("");
    }
  };

  const handleStatusChange = async (targetUser, isActive) => {
    const action = isActive ? "activate" : "disable";

    if (!window.confirm(`Are you sure you want to ${action} ${targetUser.name}?`)) {
      return;
    }

    setFeedback("");
    setError("");
    setUpdatingId(targetUser.id);

    try {
      const response = await fetch(`/api/admin/users/${targetUser.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      const data = await response.json();

      if (response.ok) {
        updateUserState(data);
        setFeedback("Status updated successfully");
      } else {
        setError(data?.error || "Failed to update status");
      }
    } catch (err) {
      setError("Failed to update status");
    } finally {
      setUpdatingId("");
    }
  };

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
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Admin Dashboard
            </p>
            <h1 className="text-3xl font-semibold">User Management</h1>
          </div>
          <LogoutButton />
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        ) : null}

        {feedback ? (
          <div className="mt-4 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {feedback}
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
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((entry) => {
                  const isSelf = user && entry.id === user.userId;

                  return (
                    <tr key={entry.id} className="border-t border-slate-800">
                    <td className="px-4 py-3 text-white">{entry.name}</td>
                    <td className="px-4 py-3 text-slate-300">{entry.email}</td>
                    <td className="px-4 py-3 text-slate-300">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                          entry.role === "admin"
                            ? "bg-amber-500/20 text-amber-200"
                            : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {entry.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          entry.isActive
                            ? "bg-emerald-500/20 text-emerald-200"
                            : "bg-rose-500/20 text-rose-200"
                        }`}
                      >
                        {entry.isActive ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={
                            isSelf || updatingId === entry.id || entry.role === "admin"
                          }
                          onClick={() => handleRoleChange(entry, "admin")}
                          className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:border-amber-400 hover:text-amber-200 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Make Admin
                        </button>
                        <button
                          type="button"
                          disabled={
                            isSelf || updatingId === entry.id || entry.role === "user"
                          }
                          onClick={() => handleRoleChange(entry, "user")}
                          className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:border-sky-400 hover:text-sky-200 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Make User
                        </button>
                        {entry.isActive ? (
                          <button
                            type="button"
                            disabled={isSelf || updatingId === entry.id}
                            onClick={() => handleStatusChange(entry, false)}
                            className="rounded-full border border-rose-500/40 px-3 py-1 text-xs font-semibold text-rose-200 transition hover:border-rose-400 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Disable User
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={isSelf || updatingId === entry.id}
                            onClick={() => handleStatusChange(entry, true)}
                            className="rounded-full border border-emerald-500/40 px-3 py-1 text-xs font-semibold text-emerald-200 transition hover:border-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Activate User
                          </button>
                        )}
                      </div>
                    </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </div>
  );
}
