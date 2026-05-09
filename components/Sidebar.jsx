"use client";

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

function UsersIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 text-[var(--faint)]"
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
  onShowFriends,
  onCreateServer,
  onCreateChannel,
  onRenameServer,
  onDeleteServer,
  onCreateInvite,
  isLoadingChannels,
  canManageServer,
  isFriendsView,
}) {
  return (
    <aside className="flex h-[calc(100vh-65px)] w-[76px] shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface-solid)] text-[var(--text)] sm:w-72">
      <div className="border-b border-[var(--border)] px-3 py-4 sm:px-4">
        <div className="flex items-center justify-center gap-3 sm:justify-start">
          <span className="brand-mark h-10 w-10 rounded-xl">R</span>
          <div className="hidden min-w-0 sm:block">
            <p className="truncate text-sm font-black">Workspace</p>
            <p className="truncate text-xs text-[var(--muted)]">
              Channels and messages
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-7 overflow-y-auto px-3 py-4">
        <div>
          <SectionTitle>Direct messages</SectionTitle>
          <div className="mt-3 space-y-1">
            <button
              type="button"
              onClick={onShowFriends}
              className={`sidebar-item ${isFriendsView ? "sidebar-item-active" : ""}`}
              title="Friends"
            >
              <UsersIcon />
              <span className="hidden truncate sm:inline">Friends</span>
            </button>
            {dmThreads.map((thread, index) => (
              <button
                key={thread.id || `${thread.participant?.email}-${index}`}
                type="button"
                onClick={() => onSelectThread(thread.id)}
                className={`sidebar-item ${
                  selectedThreadId === thread.id && !isFriendsView
                    ? "sidebar-item-active"
                    : ""
                }`}
                title={thread.participant?.name || "Direct Message"}
              >
                <AtIcon />
                <span className="hidden truncate sm:inline">
                  {thread.participant?.name || "Direct Message"}
                </span>
              </button>
            ))}
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
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-xs font-black text-[var(--primary-strong)]">
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
    </aside>
  );
}
