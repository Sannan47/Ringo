"use client";

import { useState } from "react";

function EmptyState({ children }) {
  return (
    <p className="rounded-lg border border-dashed border-[var(--border)] px-4 py-6 text-center text-sm font-semibold text-[var(--faint)]">
      {children}
    </p>
  );
}

export default function FriendsPanel({
  incoming,
  outgoing,
  friends,
  onSendRequest,
  onAccept,
  onReject,
  onStartDm,
}) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    setIsSubmitting(true);
    const ok = await onSendRequest(email.trim());
    if (!ok) {
      setError("Unable to send request");
    } else {
      setEmail("");
    }
    setIsSubmitting(false);
  };

  return (
    <section className="h-[calc(100vh-65px)] flex-1 overflow-y-auto bg-[var(--page)] px-4 py-8 text-[var(--text)] sm:px-6">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <div className="eyebrow">Friends</div>
            <h2 className="mt-4 text-4xl font-black">
              Manage connections
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Send requests, accept new teammates, and open direct chats from a
              single focused workspace view.
            </p>
          </div>
        </div>

        <form className="ringo-panel flex flex-col gap-3 p-4 sm:flex-row" onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="friend@email.com"
            className="field flex-1"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary text-sm"
          >
            {isSubmitting ? "Sending..." : "Send Request"}
          </button>
          {error ? (
            <p className="w-full text-xs font-semibold text-rose-600">{error}</p>
          ) : null}
        </form>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="ringo-panel p-5">
            <h3 className="text-xs font-black uppercase tracking-[0.14em] text-[var(--faint)]">
              Incoming requests
            </h3>
            <div className="mt-4 space-y-3">
              {incoming.length === 0 ? <EmptyState>No incoming requests</EmptyState> : null}
              {incoming.map((request) => (
                <div
                  key={request.id}
                  className="flex flex-col gap-3 rounded-lg border border-[var(--border)] p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-[var(--text)]">
                      {request.from?.name}
                    </p>
                    <p className="truncate text-xs text-[var(--muted)]">
                      {request.from?.email}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onAccept(request.id)}
                      className="rounded-full border border-emerald-400/40 px-3 py-2 text-xs font-black text-emerald-600 transition hover:bg-emerald-500/10"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => onReject(request.id)}
                      className="rounded-full border border-rose-400/40 px-3 py-2 text-xs font-black text-rose-600 transition hover:bg-rose-500/10"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="ringo-panel p-5">
            <h3 className="text-xs font-black uppercase tracking-[0.14em] text-[var(--faint)]">
              Outgoing requests
            </h3>
            <div className="mt-4 space-y-3">
              {outgoing.length === 0 ? <EmptyState>No outgoing requests</EmptyState> : null}
              {outgoing.map((request) => (
                <div
                  key={request.id}
                  className="rounded-lg border border-[var(--border)] p-4"
                >
                  <p className="truncate text-sm font-black text-[var(--text)]">
                    {request.to?.name}
                  </p>
                  <p className="truncate text-xs text-[var(--muted)]">
                    {request.to?.email}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="ringo-panel p-5">
          <h3 className="text-xs font-black uppercase tracking-[0.14em] text-[var(--faint)]">
            Friends
          </h3>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {friends.length === 0 ? <EmptyState>No friends yet</EmptyState> : null}
            {friends.map((friend) => (
              <div
                key={friend.id}
                className="flex flex-col gap-3 rounded-lg border border-[var(--border)] p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-[var(--text)]">
                    {friend.name}
                  </p>
                  <p className="truncate text-xs text-[var(--muted)]">
                    {friend.email}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onStartDm(friend)}
                  className="btn-secondary text-xs"
                >
                  Message
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
