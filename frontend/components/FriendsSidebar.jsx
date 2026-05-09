"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

function EmptyState({ children }) {
  return (
    <p className="rounded-lg border border-dashed border-[var(--border)] px-4 py-5 text-center text-sm font-semibold text-[var(--faint)]">
      {children}
    </p>
  );
}

function PlusIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ChevronUpIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m18 15-6-6-6 6" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function FriendRow({ friend, isOnline, onStartDm }) {
  return (
    <button
      type="button"
      onClick={() => onStartDm(friend)}
      className="friend-row flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-[var(--surface-hover)]"
      title={`Message ${friend.name}`}
    >
      <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-xs font-black text-[var(--primary-strong)]">
        {friend.avatarUrl ? (
          <Image
            src={friend.avatarUrl}
            alt=""
            width={40}
            height={40}
            className="h-full w-full rounded-xl object-cover"
          />
        ) : (
          friend.name?.slice(0, 1).toUpperCase() || "?"
        )}
        <span
          className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[var(--surface-solid)] ${
            isOnline ? "bg-emerald-500" : "bg-[var(--faint)]"
          }`}
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-black text-[var(--text)]">
          {friend.name || "Friend"}
        </span>
        <span className="block truncate text-xs font-semibold text-[var(--muted)]">
          {isOnline ? "Online" : "Offline"}
        </span>
      </span>
    </button>
  );
}

function FriendsList({ friends, onlineFriends, offlineFriends, onlineIds, onStartDm }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="px-2 text-xs font-black uppercase tracking-[0.14em] text-[var(--faint)]">
          Online
        </p>
        <div className="mt-2 space-y-1">
          {onlineFriends.length === 0 ? (
            <p className="px-3 py-2 text-xs font-semibold text-[var(--faint)]">
              Nobody online.
            </p>
          ) : null}
          {onlineFriends.map((friend) => (
            <FriendRow
              key={friend.id}
              friend={friend}
              isOnline
              onStartDm={onStartDm}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="px-2 text-xs font-black uppercase tracking-[0.14em] text-[var(--faint)]">
          Offline
        </p>
        <div className="mt-2 space-y-1">
          {offlineFriends.length === 0 && friends.length === 0 ? (
            <p className="px-3 py-2 text-xs font-semibold text-[var(--faint)]">
              Add friends to start DMs.
            </p>
          ) : null}
          {offlineFriends.map((friend) => (
            <FriendRow
              key={friend.id}
              friend={friend}
              isOnline={onlineIds.has(friend.id)}
              onStartDm={onStartDm}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function RequestsModal({
  incoming,
  outgoing,
  onClose,
  onSendRequest,
  onAccept,
  onReject,
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
    if (ok) {
      setEmail("");
    } else {
      setError("Unable to send request");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4 py-6">
      <div className="modal-surface soft-scrollbar max-h-[90vh] min-h-[58vh] w-full max-w-5xl overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--surface-solid)] p-5 text-[var(--text)] shadow-[var(--shadow-md)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--faint)]">
              Friends
            </p>
            <h2 className="mt-1 text-2xl font-black">
              Friend requests
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="icon-button h-9 w-9"
            aria-label="Close friend requests"
          >
            <CloseIcon />
          </button>
        </div>

        <form className="mt-5 flex flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
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

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-[var(--border)] p-4">
            <h3 className="text-xs font-black uppercase tracking-[0.14em] text-[var(--faint)]">
              Incoming
            </h3>
            <div className="mt-4 space-y-3">
              {incoming.length === 0 ? <EmptyState>No incoming requests</EmptyState> : null}
              {incoming.map((request) => (
                <div key={request.id} className="rounded-lg border border-[var(--border)] p-3">
                  <p className="truncate text-sm font-black text-[var(--text)]">
                    {request.from?.name}
                  </p>
                  <p className="truncate text-xs font-semibold text-[var(--muted)]">
                    {request.from?.email}
                  </p>
                  <div className="mt-3 flex gap-2">
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

          <div className="rounded-lg border border-[var(--border)] p-4">
            <h3 className="text-xs font-black uppercase tracking-[0.14em] text-[var(--faint)]">
              Outgoing
            </h3>
            <div className="mt-4 space-y-3">
              {outgoing.length === 0 ? <EmptyState>No outgoing requests</EmptyState> : null}
              {outgoing.map((request) => (
                <div key={request.id} className="rounded-lg border border-[var(--border)] p-3">
                  <p className="truncate text-sm font-black text-[var(--text)]">
                    {request.to?.name}
                  </p>
                  <p className="truncate text-xs font-semibold text-[var(--muted)]">
                    {request.to?.email}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FriendsSidebar({
  friends,
  incoming,
  outgoing,
  onlineFriendIds,
  onSendRequest,
  onAccept,
  onReject,
  onStartDm,
}) {
  const [isRequestsOpen, setIsRequestsOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pendingCount = incoming.length;
  const onlineIds = useMemo(() => new Set(onlineFriendIds), [onlineFriendIds]);
  const onlineFriends = friends.filter((friend) => onlineIds.has(friend.id));
  const offlineFriends = friends.filter((friend) => !onlineIds.has(friend.id));

  return (
    <>
      <aside className="dashboard-sidebar hidden h-[calc(100vh-1rem)] w-80 shrink-0 flex-col text-[var(--text)] lg:flex">
        <div className="border-b border-[var(--border)] px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-black">Friends</p>
              <p className="text-xs font-semibold text-[var(--muted)]">
                {onlineFriends.length} online
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsRequestsOpen(true)}
              className="icon-button h-10 w-10"
              aria-label="Open friend requests"
              title="Friend requests"
            >
              <span className="relative">
                <PlusIcon />
                {pendingCount > 0 ? (
                  <span className="absolute -right-2 -top-2 h-2.5 w-2.5 rounded-full bg-rose-500" />
                ) : null}
              </span>
            </button>
          </div>
        </div>

        <div className="soft-scrollbar flex-1 overflow-y-auto px-4 py-4">
          <FriendsList
            friends={friends}
            onlineFriends={onlineFriends}
            offlineFriends={offlineFriends}
            onlineIds={onlineIds}
            onStartDm={onStartDm}
          />
        </div>
      </aside>

      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setIsMobileOpen(true)}
          className="fixed bottom-24 right-4 z-40 flex min-h-12 items-center gap-3 rounded-full border border-[var(--border)] bg-[var(--surface-solid)] px-4 py-2 text-sm font-black text-[var(--text)] shadow-[var(--shadow-md)]"
          aria-label="Open friends panel"
        >
          <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary-faint)] text-[var(--primary-strong)]">
            <UsersIcon />
            {pendingCount > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-[var(--surface-solid)]" />
            ) : null}
          </span>
          <span>Friends</span>
          <ChevronUpIcon />
        </button>

        {isMobileOpen ? (
          <div className="fixed inset-0 z-50 flex items-end bg-black/35 px-2 pb-2 pt-16">
            <aside className="modal-surface flex max-h-[82vh] w-full flex-col rounded-lg border border-[var(--border)] bg-[var(--surface-solid)] text-[var(--text)] shadow-[var(--shadow-md)]">
              <div className="border-b border-[var(--border)] px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-black">Friends</p>
                    <p className="truncate text-xs font-semibold text-[var(--muted)]">
                      {onlineFriends.length} online / {friends.length} total
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsRequestsOpen(true)}
                      className="icon-button h-10 w-10"
                      aria-label="Open friend requests"
                      title="Friend requests"
                    >
                      <span className="relative">
                        <PlusIcon />
                        {pendingCount > 0 ? (
                          <span className="absolute -right-2 -top-2 h-2.5 w-2.5 rounded-full bg-rose-500" />
                        ) : null}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsMobileOpen(false)}
                      className="icon-button h-10 w-10"
                      aria-label="Close friends panel"
                    >
                      <CloseIcon />
                    </button>
                  </div>
                </div>
              </div>

              <div className="soft-scrollbar flex-1 overflow-y-auto px-4 py-4">
                <FriendsList
                  friends={friends}
                  onlineFriends={onlineFriends}
                  offlineFriends={offlineFriends}
                  onlineIds={onlineIds}
                  onStartDm={(friend) => {
                    setIsMobileOpen(false);
                    onStartDm(friend);
                  }}
                />
              </div>
            </aside>
          </div>
        ) : null}
      </div>

      {isRequestsOpen ? (
        <RequestsModal
          incoming={incoming}
          outgoing={outgoing}
          onClose={() => setIsRequestsOpen(false)}
          onSendRequest={onSendRequest}
          onAccept={onAccept}
          onReject={onReject}
        />
      ) : null}
    </>
  );
}
