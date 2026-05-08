"use client";

import { useState } from "react";

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
    <section className="flex-1 bg-slate-950 px-6 py-8 text-white">
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Friends
          </p>
          <h2 className="mt-2 text-3xl font-semibold">Manage connections</h2>
          <p className="mt-2 text-sm text-slate-300">
            Send requests, accept new friends, and start a direct chat.
          </p>
        </div>

        <form
          className="flex flex-wrap gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4"
          onSubmit={handleSubmit}
        >
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="friend@email.com"
            className="flex-1 rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Sending..." : "Send Request"}
          </button>
          {error ? <p className="w-full text-xs text-rose-300">{error}</p> : null}
        </form>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <h3 className="text-sm font-semibold uppercase text-slate-400">
              Incoming requests
            </h3>
            <div className="mt-3 space-y-3">
              {incoming.length === 0 ? (
                <p className="text-xs text-slate-500">No incoming requests</p>
              ) : null}
              {incoming.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between rounded-xl border border-slate-800 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {request.from?.name}
                    </p>
                    <p className="text-xs text-slate-400">{request.from?.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onAccept(request.id)}
                      className="rounded-full border border-emerald-500/40 px-3 py-1 text-xs font-semibold text-emerald-200 transition hover:border-emerald-400"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => onReject(request.id)}
                      className="rounded-full border border-rose-500/40 px-3 py-1 text-xs font-semibold text-rose-200 transition hover:border-rose-400"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <h3 className="text-sm font-semibold uppercase text-slate-400">
              Outgoing requests
            </h3>
            <div className="mt-3 space-y-3">
              {outgoing.length === 0 ? (
                <p className="text-xs text-slate-500">No outgoing requests</p>
              ) : null}
              {outgoing.map((request) => (
                <div
                  key={request.id}
                  className="rounded-xl border border-slate-800 px-4 py-3"
                >
                  <p className="text-sm font-semibold text-white">
                    {request.to?.name}
                  </p>
                  <p className="text-xs text-slate-400">{request.to?.email}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <h3 className="text-sm font-semibold uppercase text-slate-400">
            Friends
          </h3>
          <div className="mt-3 space-y-3">
            {friends.length === 0 ? (
              <p className="text-xs text-slate-500">No friends yet</p>
            ) : null}
            {friends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center justify-between rounded-xl border border-slate-800 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-white">{friend.name}</p>
                  <p className="text-xs text-slate-400">{friend.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onStartDm(friend)}
                  className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:border-slate-500"
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
