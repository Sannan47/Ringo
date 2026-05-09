"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

function SectionTitle({ children }) {
  return (
    <p className="hidden px-2 text-xs font-black uppercase tracking-[0.14em] text-[var(--faint)] sm:block">
      {children}
    </p>
  );
}

function HashIcon() {
  return <span className="w-4 text-center text-[var(--faint)]">#</span>;
}

function AtIcon() {
  return <span className="w-4 text-center text-[var(--faint)]">@</span>;
}

function SettingsIcon() {
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
      <path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6V20a2 2 0 1 1-4 0v-.08a1.7 1.7 0 0 0-1-.52 1.7 1.7 0 0 0-1.88.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1H4a2 2 0 1 1 0-4h.08a1.7 1.7 0 0 0 .52-1 1.7 1.7 0 0 0-.34-1.88l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6V4a2 2 0 1 1 4 0v.08a1.7 1.7 0 0 0 1 .52 1.7 1.7 0 0 0 1.88-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c.22.36.42.72.6 1H20a2 2 0 1 1 0 4h-.08a1.7 1.7 0 0 0-.52 1Z" />
    </svg>
  );
}

const getPreferredTheme = () => {
  if (typeof window === "undefined") {
    return "light";
  }

  const stored = window.localStorage.getItem("ringo-theme");
  if (stored === "dark" || stored === "light") {
    return stored;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

function SettingsPopover() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState("light");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const popoverRef = useRef(null);

  useEffect(() => {
    const preferred = getPreferredTheme();
    document.documentElement.classList.toggle("dark", preferred === "dark");
    document.documentElement.classList.toggle("light", preferred === "light");
    window.requestAnimationFrame(() => setTheme(preferred));
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (popoverRef.current?.contains(event.target)) {
        return;
      }
      setIsOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    window.localStorage.setItem("ringo-theme", nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    document.documentElement.classList.toggle("light", nextTheme === "light");
  };

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
    <div ref={popoverRef} className="relative">
      {isOpen ? (
        <div className="modal-surface absolute bottom-12 left-0 z-40 w-64 rounded-lg border border-[var(--border)] bg-[var(--surface-solid)] p-4 text-[var(--text)] shadow-[var(--shadow-md)]">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--faint)]">
              Account
            </p>
            <p className="mt-2 truncate text-sm font-black">
              {user?.name || user?.email || "You"}
            </p>
            {user?.email ? (
              <p className="mt-1 truncate text-xs font-semibold text-[var(--muted)]">
                {user.email}
              </p>
            ) : null}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] px-3 py-2">
            <span className="text-sm font-bold text-[var(--text-soft)]">
              Dark theme
            </span>
            <button
              type="button"
              onClick={toggleTheme}
              className={`relative h-6 w-11 rounded-full border transition ${
                theme === "dark"
                  ? "border-[var(--primary)] bg-[var(--primary)]"
                  : "border-[var(--border-strong)] bg-[var(--surface-muted)]"
              }`}
              aria-pressed={theme === "dark"}
              aria-label="Toggle dark theme"
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition ${
                  theme === "dark" ? "left-5" : "left-0.5"
                }`}
              />
            </button>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="mt-3 text-left text-sm font-black text-rose-600 transition hover:text-rose-500 disabled:opacity-60"
          >
            {isLoggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="icon-button h-10 w-10"
        aria-label="Open settings"
        title="Settings"
      >
        <SettingsIcon />
      </button>
    </div>
  );
}

export default function Sidebar({
  servers,
  dmThreads,
  channels,
  selectedServerId,
  selectedChannelId,
  selectedThreadId,
  onSelectServer,
  onSelectChannel,
  onSelectThread,
  onCreateServer,
  onCreateChannel,
  onRenameServer,
  onDeleteServer,
  onCreateInvite,
  isLoadingChannels,
  canManageServer,
}) {
  return (
    <aside className="dashboard-sidebar flex h-[calc(100vh-1rem)] w-[76px] shrink-0 flex-col text-[var(--text)] sm:w-72">
      <div className="border-b border-[var(--border)] px-3 py-4 sm:px-4">
        <div className="flex items-center justify-center gap-3 sm:justify-start">
          <span className="brand-mark h-10 w-10 rounded-xl">R</span>
          <div className="hidden min-w-0 sm:block">
            <p className="truncate text-sm font-black">Ringo</p>
            <p className="truncate text-xs font-semibold text-[var(--muted)]">
              Workspace console
            </p>
          </div>
        </div>
      </div>

      <div className="soft-scrollbar flex-1 space-y-7 overflow-y-auto px-3 py-4">
        <div>
          <SectionTitle>Direct messages</SectionTitle>
          <div className="mt-3 space-y-1">
            {dmThreads.map((thread, index) => (
              <button
                key={thread.id || `${thread.participant?.email}-${index}`}
                type="button"
                onClick={() => onSelectThread(thread.id)}
                className={`sidebar-item ${
                  selectedThreadId === thread.id ? "sidebar-item-active" : ""
                }`}
                title={thread.participant?.name || "Direct Message"}
              >
                <AtIcon />
                <span className="hidden truncate sm:inline">
                  {thread.participant?.name || "Direct Message"}
                </span>
              </button>
            ))}
            {dmThreads.length === 0 ? (
              <p className="hidden px-3 py-2 text-xs font-semibold text-[var(--faint)] sm:block">
                No direct messages yet.
              </p>
            ) : null}
          </div>
        </div>

        <div>
          <SectionTitle>Servers</SectionTitle>
          <div className="mt-3 space-y-2">
            {servers.map((server, index) => (
              <button
                key={server.id || `${server.name}-${index}`}
                type="button"
                onClick={() => onSelectServer(server.id)}
                className={`sidebar-item ${
                  selectedServerId === server.id ? "sidebar-item-active" : ""
                }`}
                title={server.name}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-xs font-black text-[var(--primary-strong)] shadow-sm">
                  {server.name.slice(0, 2).toUpperCase()}
                </span>
                <span className="hidden truncate sm:inline">{server.name}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onCreateServer}
            className="btn-secondary mt-4 w-full text-xs"
            title="Create server"
          >
            <span>+</span>
            <span className="hidden sm:inline">Create Server</span>
          </button>
          {canManageServer ? (
            <div className="mt-3 grid gap-2">
              <button
                type="button"
                onClick={onCreateInvite}
                className="btn-secondary w-full text-xs"
              >
                Invite
              </button>
              <button
                type="button"
                onClick={onRenameServer}
                className="btn-secondary w-full text-xs"
              >
                Rename
              </button>
              <button
                type="button"
                onClick={onDeleteServer}
                className="w-full rounded-full border border-rose-400/40 px-3 py-2 text-xs font-black text-rose-600 transition hover:bg-rose-500/10 disabled:opacity-60"
              >
                Delete
              </button>
            </div>
          ) : null}
        </div>

        <div>
          <SectionTitle>Channels</SectionTitle>
          <div className="mt-3 space-y-1">
            {isLoadingChannels ? (
              <p className="px-3 py-2 text-xs font-semibold text-[var(--faint)]">
                Loading...
              </p>
            ) : null}
            {channels.length === 0 ? (
              <p className="hidden px-3 py-2 text-xs font-semibold text-[var(--faint)] sm:block">
                No channels yet.
              </p>
            ) : null}
            {channels.map((channel, index) => (
              <button
                key={channel.id || `${channel.name}-${index}`}
                type="button"
                onClick={() => onSelectChannel(channel.id)}
                className={`sidebar-item ${
                  selectedChannelId === channel.id ? "sidebar-item-active" : ""
                }`}
                title={channel.name}
              >
                <HashIcon />
                <span className="hidden truncate sm:inline">{channel.name}</span>
              </button>
            ))}
          </div>
          {canManageServer ? (
            <button
              type="button"
              onClick={onCreateChannel}
              disabled={!selectedServerId}
              className="btn-secondary mt-3 w-full text-xs"
              title="Create channel"
            >
              <span>+</span>
              <span className="hidden sm:inline">Create Channel</span>
            </button>
          ) : null}
        </div>
      </div>

      <div className="border-t border-[var(--border)] p-3 sm:p-4">
        <SettingsPopover />
      </div>
    </aside>
  );
}
