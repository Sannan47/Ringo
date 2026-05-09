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
  const [confirmAction, setConfirmAction] = useState(null);

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
      } catch {
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

  const updateUserRole = async (targetUser, nextRole) => {
    setFeedback("");
    setError("");
    setUpdatingId(targetUser.id);
    setConfirmAction(null);

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
    } catch {
      setError("Failed to update role");
    } finally {
      setUpdatingId("");
    }
  };

  const updateUserStatus = async (targetUser, isActive) => {
    setFeedback("");
    setError("");
    setUpdatingId(targetUser.id);
    setConfirmAction(null);

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
    } catch {
      setError("Failed to update status");
    } finally {
      setUpdatingId("");
    }
  };

  if (loading) {
    return (
      <div className="ringo-page px-6 py-10">
        <p className="text-sm font-semibold text-[var(--muted)]">
          Loading admin dashboard...
        </p>
      </div>
    );
  }

  if (!loading && user && user.role !== "admin") {
    return (
      <div className="ringo-page px-6 py-10">
        <h1 className="text-2xl font-black text-[var(--text)]">
          403 - Access Denied
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          You do not have permission to view this page.
        </p>
      </div>
    );
  }

  return (
    <main className="ringo-page px-4 py-10">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="eyebrow">Admin Dashboard</div>
            <h1 className="mt-4 text-4xl font-black text-[var(--text)]">
              User Management
            </h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Review accounts, update roles, and keep workspace access tidy.
            </p>
          </div>
          <LogoutButton />
        </div>

        {error ? (
          <div className="rounded-lg border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-600">
            {error}
          </div>
        ) : null}

        {feedback ? (
          <div className="mt-4 rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-600">
            {feedback}
          </div>
        ) : null}

        {isLoading && !error ? (
          <p className="text-sm font-semibold text-[var(--muted)]">
            Loading users...
          </p>
        ) : null}

        {!isLoading && !error ? (
          <div className="table-surface overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-[var(--surface-muted)] text-[var(--muted)]">
                <tr>
                  <th className="px-4 py-3 font-black">Name</th>
                  <th className="px-4 py-3 font-black">Email</th>
                  <th className="px-4 py-3 font-black">Role</th>
                  <th className="px-4 py-3 font-black">Status</th>
                  <th className="px-4 py-3 font-black">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((entry) => {
                  const isSelf = user && entry.id === user.userId;

                  return (
                    <tr key={entry.id} className="border-t border-[var(--border)]">
                    <td className="px-4 py-3 font-bold text-[var(--text)]">{entry.name}</td>
                    <td className="px-4 py-3 text-[var(--muted)]">{entry.email}</td>
                    <td className="px-4 py-3 text-[var(--muted)]">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ${
                          entry.role === "admin"
                            ? "bg-purple-500/15 text-[var(--primary-strong)]"
                            : "bg-[var(--surface-muted)] text-[var(--muted)]"
                        }`}
                      >
                        {entry.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--muted)]">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black ${
                          entry.isActive
                            ? "bg-emerald-500/15 text-emerald-600"
                            : "bg-rose-500/15 text-rose-600"
                        }`}
                      >
                        {entry.isActive ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--muted)]">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={
                            isSelf || updatingId === entry.id || entry.role === "admin"
                          }
                          onClick={() =>
                            setConfirmAction({
                              title: "Change role",
                              body: `Change role for ${entry.name} to admin?`,
                              onConfirm: () => updateUserRole(entry, "admin"),
                            })
                          }
                          className="btn-secondary min-h-0 px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Make Admin
                        </button>
                        <button
                          type="button"
                          disabled={
                            isSelf || updatingId === entry.id || entry.role === "user"
                          }
                          onClick={() =>
                            setConfirmAction({
                              title: "Change role",
                              body: `Change role for ${entry.name} to user?`,
                              onConfirm: () => updateUserRole(entry, "user"),
                            })
                          }
                          className="btn-secondary min-h-0 px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Make User
                        </button>
                        {entry.isActive ? (
                          <button
                            type="button"
                            disabled={isSelf || updatingId === entry.id}
                            onClick={() =>
                              setConfirmAction({
                                title: "Disable user",
                                body: `Disable ${entry.name}?`,
                                onConfirm: () => updateUserStatus(entry, false),
                              })
                            }
                            className="rounded-full border border-rose-400/40 px-3 py-2 text-xs font-black text-rose-600 transition hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Disable User
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={isSelf || updatingId === entry.id}
                            onClick={() =>
                              setConfirmAction({
                                title: "Activate user",
                                body: `Activate ${entry.name}?`,
                                onConfirm: () => updateUserStatus(entry, true),
                              })
                            }
                            className="rounded-full border border-emerald-400/40 px-3 py-2 text-xs font-black text-emerald-600 transition hover:bg-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-50"
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
      {confirmAction ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4 py-6">
          <div className="modal-surface w-full max-w-md rounded-lg border border-[var(--border)] bg-[var(--surface-solid)] p-5 text-[var(--text)] shadow-[var(--shadow-md)]">
            <h2 className="text-2xl font-black">{confirmAction.title}</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--text-soft)]">
              {confirmAction.body}
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                className="btn-secondary min-h-10 px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmAction.onConfirm}
                disabled={Boolean(updatingId)}
                className="btn-primary min-h-10 px-4 py-2 text-sm"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
