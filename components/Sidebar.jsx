"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
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

function Avatar({ name, imageUrl, className = "h-9 w-9 rounded-lg" }) {
  return (
    <span
      className={`${className} flex shrink-0 items-center justify-center overflow-hidden bg-[var(--primary-soft)] text-xs font-black text-[var(--primary-strong)] shadow-sm`}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt=""
          width={48}
          height={48}
          className="h-full w-full object-cover"
        />
      ) : (
        name?.slice(0, 2).toUpperCase() || "?"
      )}
    </span>
  );
}

function SettingsPopover({ onEditProfileImage }) {
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
            onClick={() => {
              setIsOpen(false);
              onEditProfileImage?.();
            }}
            className="mt-3 text-left text-sm font-black text-[var(--text)] transition hover:text-[var(--primary-strong)]"
          >
            Profile image
          </button>

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

function MessagesIcon() {
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
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
    </svg>
  );
}

function ServerIcon() {
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
      <rect x="3" y="4" width="18" height="6" rx="2" />
      <rect x="3" y="14" width="18" height="6" rx="2" />
      <path d="M7 7h.01" />
      <path d="M7 17h.01" />
    </svg>
  );
}

function VoiceIcon() {
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
      <path d="M11 5 6 9H2v6h4l5 4V5Z" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
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
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function UnreadDot({ show }) {
  return show ? (
    <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-[var(--surface-solid)]" />
  ) : null;
}

export default function Sidebar({
  servers,
  dmThreads,
  textChannels,
  voiceChannels,
  activeTab,
  onTabChange,
  unreadDmThreadIds,
  unreadServerIds,
  unreadChannelIds,
  activeVoiceChannelId,
  selectedServerId,
  selectedChannelId,
  selectedThreadId,
  onSelectServer,
  onSelectChannel,
  onSelectVoiceChannel,
  onSelectThread,
  onCreateServer,
  onCreateChannel,
  onRenameServer,
  onDeleteServer,
  onCreateInvite,
  onEditServerImage,
  onEditProfileImage,
  isLoadingChannels,
  canManageServer,
}) {
  const selectedServer = servers.find((server) => server.id === selectedServerId);
  const hasDmUnread = unreadDmThreadIds.size > 0;

  return (
    <aside className="dashboard-sidebar flex h-[calc(100vh-1rem)] w-[86px] shrink-0 text-[var(--text)] sm:w-[370px]">
      <div className="soft-scrollbar flex w-[84px] shrink-0 flex-col items-center gap-2 overflow-y-auto border-r border-[var(--border)] bg-[var(--surface-solid)] px-2 py-4">
        <button
          type="button"
          onClick={() => onTabChange("dms")}
          className={`icon-button relative h-12 w-12 ${
            activeTab === "dms"
              ? "border-[var(--primary)] bg-[var(--primary-faint)] text-[var(--primary-strong)]"
              : ""
          }`}
          aria-label="Direct messages"
          title="Direct messages"
        >
          <MessagesIcon />
          <UnreadDot show={hasDmUnread} />
        </button>

        <div className="my-2 h-px w-10 bg-[var(--border)]" />

        {servers.map((server, index) => (
          <button
            key={server.id || `${server.name}-${index}`}
            type="button"
            onClick={() => onSelectServer(server.id)}
            className={`relative flex h-12 w-12 items-center justify-center rounded-xl border transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)] ${
              selectedServerId === server.id && activeTab === "servers"
                ? "border-[var(--primary)] bg-[var(--primary-faint)]"
                : "border-[var(--border)] bg-[var(--surface)]"
            }`}
            title={server.name}
            aria-label={server.name}
          >
            <Avatar
              name={server.name}
              imageUrl={server.imageUrl}
              className="h-10 w-10 rounded-lg"
            />
            <UnreadDot show={unreadServerIds.has(server.id)} />
          </button>
        ))}

        <button
          type="button"
          onClick={onCreateServer}
          className="icon-button h-12 w-12 shrink-0"
          aria-label="Create server"
          title="Create server"
        >
          <PlusIcon />
        </button>

        <div className="mt-auto pt-2">
          <SettingsPopover onEditProfileImage={onEditProfileImage} />
        </div>
      </div>

      <div className="hidden min-w-0 flex-1 flex-col sm:flex">
        {activeTab === "servers" ? (
          <>
            <div className="border-b border-[var(--border)] px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar
                    name={selectedServer?.name}
                    imageUrl={selectedServer?.imageUrl}
                    className="h-10 w-10 rounded-lg"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black">
                      {selectedServer?.name || "Select a server"}
                    </p>
                    <p className="truncate text-xs font-semibold text-[var(--muted)]">
                      {textChannels.length} text / {voiceChannels.length} voice
                    </p>
                  </div>
                </div>
                {canManageServer ? (
                  <button
                    type="button"
                    onClick={onEditServerImage}
                    className="icon-button h-10 w-10"
                    aria-label="Set server image"
                    title="Set server image"
                  >
                    <ServerIcon />
                  </button>
                ) : null}
              </div>
            </div>

            <div className="soft-scrollbar flex-1 overflow-y-auto px-3 py-4">
              <div>
                <SectionTitle>{selectedServer?.name || "Channels"}</SectionTitle>
                {!selectedServer ? (
                  <p className="px-3 py-2 text-xs font-semibold text-[var(--faint)]">
                    Pick a server from the rail.
                  </p>
                ) : null}
                {canManageServer ? (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => onCreateChannel("text")}
                      disabled={!selectedServerId}
                      className="btn-secondary min-h-10 px-3 py-2 text-xs"
                    >
                      <HashIcon />
                      Text
                    </button>
                    <button
                      type="button"
                      onClick={() => onCreateChannel("voice")}
                      disabled={!selectedServerId}
                      className="btn-secondary min-h-10 px-3 py-2 text-xs"
                    >
                      <VoiceIcon />
                      Voice
                    </button>
                  </div>
                ) : null}

                {canManageServer ? (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={onCreateInvite}
                      className="btn-secondary min-h-9 px-2 py-2 text-xs"
                    >
                      Invite
                    </button>
                    <button
                      type="button"
                      onClick={onRenameServer}
                      className="btn-secondary min-h-9 px-2 py-2 text-xs"
                    >
                      Rename
                    </button>
                    <button
                      type="button"
                      onClick={onDeleteServer}
                      className="min-h-9 rounded-full border border-rose-400/40 px-2 py-2 text-xs font-black text-rose-600 transition hover:bg-rose-500/10 disabled:opacity-60"
                    >
                      Delete
                    </button>
                  </div>
                ) : null}

                <div className="mt-5">
                  <SectionTitle>Text</SectionTitle>
                  <div className="mt-2 space-y-1">
                    {isLoadingChannels ? (
                      <p className="px-3 py-2 text-xs font-semibold text-[var(--faint)]">
                        Loading...
                      </p>
                    ) : null}
                    {!isLoadingChannels && textChannels.length === 0 ? (
                      <p className="px-3 py-2 text-xs font-semibold text-[var(--faint)]">
                        No text channels yet.
                      </p>
                    ) : null}
                    {textChannels.map((channel, index) => (
                      <button
                        key={channel.id || `${channel.name}-${index}`}
                        type="button"
                        onClick={() => onSelectChannel(channel.id)}
                        className={`sidebar-item relative ${
                          selectedChannelId === channel.id
                            ? "sidebar-item-active"
                            : ""
                        }`}
                        title={channel.name}
                      >
                        <HashIcon />
                        <span className="min-w-0 flex-1 truncate">
                          {channel.name}
                        </span>
                        <UnreadDot show={unreadChannelIds.has(channel.id)} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-5">
                  <SectionTitle>Voice</SectionTitle>
                  <div className="mt-2 space-y-1">
                    {!isLoadingChannels && voiceChannels.length === 0 ? (
                      <p className="px-3 py-2 text-xs font-semibold text-[var(--faint)]">
                        No voice channels yet.
                      </p>
                    ) : null}
                    {voiceChannels.map((channel, index) => (
                      <button
                        key={channel.id || `${channel.name}-${index}`}
                        type="button"
                        onClick={() => onSelectVoiceChannel(channel)}
                        className={`sidebar-item ${
                          activeVoiceChannelId === channel.id
                            ? "sidebar-item-active"
                            : ""
                        }`}
                        title={channel.name}
                      >
                        <VoiceIcon />
                        <span className="min-w-0 flex-1 truncate">
                          {channel.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="border-b border-[var(--border)] px-4 py-4">
              <p className="truncate text-sm font-black">Direct messages</p>
              <p className="truncate text-xs font-semibold text-[var(--muted)]">
                Conversations with friends
              </p>
            </div>

            <div className="soft-scrollbar flex-1 overflow-y-auto px-3 py-4">
              <div className="space-y-1">
                {dmThreads.map((thread, index) => (
                  <button
                    key={thread.id || `${thread.participant?.email}-${index}`}
                    type="button"
                    onClick={() => onSelectThread(thread.id)}
                    className={`sidebar-item relative ${
                      selectedThreadId === thread.id ? "sidebar-item-active" : ""
                    }`}
                    title={thread.participant?.name || "Direct Message"}
                  >
                    <Avatar
                      name={thread.participant?.name}
                      imageUrl={thread.participant?.avatarUrl}
                      className="h-8 w-8 rounded-lg"
                    />
                    <span className="min-w-0 flex-1 truncate">
                      {thread.participant?.name || "Direct Message"}
                    </span>
                    <UnreadDot show={unreadDmThreadIds.has(thread.id)} />
                  </button>
                ))}
                {dmThreads.length === 0 ? (
                  <p className="px-3 py-2 text-xs font-semibold text-[var(--faint)]">
                    No direct messages yet.
                  </p>
                ) : null}
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
