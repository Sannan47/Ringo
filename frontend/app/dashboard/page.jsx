"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Sidebar from "../../components/Sidebar";
import ChatPanel from "../../components/ChatPanel";
import FriendsSidebar from "../../components/FriendsSidebar";
import VoiceRoom from "../../components/chat/VoiceRoom";
import useSocket from "../../hooks/useSocket";
import { useAuth } from "../../context/AuthContext";

const uploadImage = async (file, scope) => {
  if (!file) {
    return "";
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("scope", scope);

  const response = await fetch("/api/uploads", {
    method: "POST",
    body: formData,
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || "Unable to upload image");
  }

  return data.url;
};

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

function CreateServerModal({
  name,
  error,
  isSubmitting,
  onNameChange,
  onClose,
  onSubmit,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4 py-6">
      <form
        onSubmit={onSubmit}
        className="modal-surface w-full max-w-md rounded-lg border border-[var(--border)] bg-[var(--surface-solid)] p-5 text-[var(--text)] shadow-[var(--shadow-md)]"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--faint)]">
              Server
            </p>
            <h2 className="mt-1 text-2xl font-black">
              Create server
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="icon-button h-9 w-9"
            aria-label="Close create server"
          >
            <CloseIcon />
          </button>
        </div>

        <label className="mt-5 block text-sm font-bold text-[var(--text-soft)]">
          Server name
        </label>
        <input
          type="text"
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          className="field mt-2"
          placeholder="Design team"
          autoFocus
        />
        {error ? (
          <p className="mt-2 text-xs font-semibold text-rose-600">{error}</p>
        ) : null}

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary min-h-10 px-4 py-2 text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary min-h-10 px-4 py-2 text-sm"
          >
            {isSubmitting ? "Creating..." : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}

function DashboardModal({
  dialog,
  value,
  file,
  error,
  status,
  isSubmitting,
  onValueChange,
  onFileChange,
  onClose,
  onSubmit,
}) {
  if (!dialog) {
    return null;
  }

  const isImageDialog = dialog.type === "server-image" || dialog.type === "profile-image";
  const isDelete = dialog.type === "delete-server";
  const isInvite = dialog.type === "invite";
  const title =
    dialog.type === "create-channel"
      ? `Create ${dialog.channelType} channel`
      : dialog.type === "rename-server"
      ? "Rename server"
      : dialog.type === "delete-server"
      ? "Delete server"
      : dialog.type === "server-image"
      ? "Server image"
      : dialog.type === "profile-image"
      ? "Profile image"
      : "Invite link";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4 py-6">
      <form
        onSubmit={onSubmit}
        className="modal-surface w-full max-w-md rounded-lg border border-[var(--border)] bg-[var(--surface-solid)] p-5 text-[var(--text)] shadow-[var(--shadow-md)]"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--faint)]">
              {dialog.kicker || "Settings"}
            </p>
            <h2 className="mt-1 text-2xl font-black">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="icon-button h-9 w-9"
            aria-label={`Close ${title}`}
          >
            <CloseIcon />
          </button>
        </div>

        {isInvite ? (
          <>
            <label className="mt-5 block text-sm font-bold text-[var(--text-soft)]">
              Share this link
            </label>
            <input className="field mt-2" readOnly value={dialog.link || ""} />
            {status ? (
              <p className="mt-2 text-xs font-semibold text-emerald-600">{status}</p>
            ) : null}
          </>
        ) : isDelete ? (
          <p className="mt-5 text-sm leading-6 text-[var(--text-soft)]">
            Delete {dialog.serverName || "this server"}? This removes its channels
            and messages.
          </p>
        ) : isImageDialog ? (
          <>
            {dialog.currentUrl ? (
              <Image
                src={dialog.currentUrl}
                alt=""
                width={96}
                height={96}
                className="mt-5 h-24 w-24 rounded-lg object-cover"
              />
            ) : null}
            <label className="mt-5 block text-sm font-bold text-[var(--text-soft)]">
              Image file
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(event) => onFileChange(event.target.files?.[0] || null)}
              className="field mt-2"
            />
            <p className="mt-2 text-xs font-semibold text-[var(--muted)]">
              JPG, PNG, WebP, or GIF. Max 4 MB.
            </p>
          </>
        ) : (
          <>
            <label className="mt-5 block text-sm font-bold text-[var(--text-soft)]">
              {dialog.label || "Name"}
            </label>
            <input
              type="text"
              value={value}
              onChange={(event) => onValueChange(event.target.value)}
              className="field mt-2"
              placeholder={dialog.placeholder || ""}
              autoFocus
            />
          </>
        )}

        {file ? (
          <p className="mt-2 truncate text-xs font-semibold text-[var(--muted)]">
            Selected: {file.name}
          </p>
        ) : null}
        {error ? (
          <p className="mt-2 text-xs font-semibold text-rose-600">{error}</p>
        ) : null}

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary min-h-10 px-4 py-2 text-sm"
          >
            {isInvite ? "Close" : "Cancel"}
          </button>
          {isInvite ? (
            <button
              type="button"
              onClick={dialog.onCopy}
              className="btn-primary min-h-10 px-4 py-2 text-sm"
            >
              Copy
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className={`min-h-10 px-4 py-2 text-sm ${
                isDelete
                  ? "rounded-full border border-rose-400/40 font-black text-rose-600 transition hover:bg-rose-500/10"
                  : "btn-primary"
              }`}
            >
              {isSubmitting ? "Saving..." : isDelete ? "Delete" : "Save"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default function DashboardPage({ initialServerId = null } = {}) {
  const [servers, setServers] = useState([]);
  const [dmThreads, setDmThreads] = useState([]);
  const [channels, setChannels] = useState([]);
  const [messages, setMessages] = useState([]);
  const [dmMessages, setDmMessages] = useState([]);
  const [selectedServerId, setSelectedServerId] = useState(null);
  const [selectedChannelId, setSelectedChannelId] = useState(null);
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [viewMode, setViewMode] = useState("channel");
  const [isLoadingChannels, setIsLoadingChannels] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingDmMessages, setIsLoadingDmMessages] = useState(false);
  const [isLoadingThreads, setIsLoadingThreads] = useState(false);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [onlineFriendIds, setOnlineFriendIds] = useState([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [typingUsers, setTypingUsers] = useState([]);
  const [sidebarTab, setSidebarTab] = useState("servers");
  const [unreadDmThreadIds, setUnreadDmThreadIds] = useState(() => new Set());
  const [unreadChannelIds, setUnreadChannelIds] = useState(() => new Set());
  const [draftDmThread, setDraftDmThread] = useState(null);
  const [activeVoiceChannel, setActiveVoiceChannel] = useState(null);
  const [isCreateServerOpen, setIsCreateServerOpen] = useState(false);
  const [createServerName, setCreateServerName] = useState("");
  const [createServerError, setCreateServerError] = useState("");
  const [isCreatingServer, setIsCreatingServer] = useState(false);
  const [dialog, setDialog] = useState(null);
  const [dialogValue, setDialogValue] = useState("");
  const [dialogFile, setDialogFile] = useState(null);
  const [dialogError, setDialogError] = useState("");
  const [dialogStatus, setDialogStatus] = useState("");
  const [isDialogSubmitting, setIsDialogSubmitting] = useState(false);
  const socket = useSocket(true);
  const { user, setUser } = useAuth();

  const selectedChannel = useMemo(
    () => channels.find((channel) => channel.id === selectedChannelId) || null,
    [channels, selectedChannelId]
  );
  const selectedServer = useMemo(
    () => servers.find((server) => server.id === selectedServerId) || null,
    [servers, selectedServerId]
  );
  const selectedThread = useMemo(
    () =>
      dmThreads.find((thread) => thread.id === selectedThreadId) ||
      (draftDmThread?.id === selectedThreadId ? draftDmThread : null),
    [dmThreads, draftDmThread, selectedThreadId]
  );
  const textChannels = useMemo(
    () => channels.filter((channel) => channel.type !== "voice"),
    [channels]
  );
  const voiceChannels = useMemo(
    () => channels.filter((channel) => channel.type === "voice"),
    [channels]
  );
  const unreadServerIds = useMemo(() => {
    const channelIds = unreadChannelIds;
    return new Set(
      channels
        .filter((channel) => channelIds.has(channel.id))
        .map((channel) => channel.serverId)
        .filter(Boolean)
    );
  }, [channels, unreadChannelIds]);
  const canManageServer = Boolean(
    selectedServer && user && selectedServer.ownerId === user.userId
  );

  useEffect(() => {
    const loadServers = async () => {
      try {
        const response = await fetch("/api/servers");
        const data = await response.json();

        if (response.ok) {
          const normalized = (data.servers || []).map((server) => ({
            id: server.id || server._id,
            name: server.name,
            imageUrl: server.imageUrl || "",
            ownerId: server.ownerId,
          }));
          setServers(normalized);
          if (normalized.length > 0) {
            const initialServer = normalized.find(
              (server) => server.id === initialServerId
            );
            setSelectedServerId(initialServer?.id || normalized[0].id);
          }
        }
      } catch {
        setServers([]);
      }
    };

    loadServers();
  }, [initialServerId]);

  const loadDmThreads = useCallback(async () => {
    setIsLoadingThreads(true);

    try {
      const response = await fetch("/api/dms/threads");
      const data = await response.json();

      if (response.ok) {
        setDmThreads(data.threads || []);
      } else {
        setDmThreads([]);
      }
    } catch {
      setDmThreads([]);
    } finally {
      setIsLoadingThreads(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      loadDmThreads();
    });
  }, [loadDmThreads]);

  const loadFriends = useCallback(async () => {
    try {
      const response = await fetch("/api/friends/requests");
      const data = await response.json();

      if (response.ok) {
        setIncomingRequests(data.incoming || []);
        setOutgoingRequests(data.outgoing || []);
        setFriends(data.friends || []);
      }
    } catch {
      setIncomingRequests([]);
      setOutgoingRequests([]);
      setFriends([]);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadInitialFriends = async () => {
      try {
        const response = await fetch("/api/friends/requests");
        const data = await response.json();

        if (!isMounted) {
          return;
        }

        if (response.ok) {
          setIncomingRequests(data.incoming || []);
          setOutgoingRequests(data.outgoing || []);
          setFriends(data.friends || []);
        }
      } catch {
        if (isMounted) {
          setIncomingRequests([]);
          setOutgoingRequests([]);
          setFriends([]);
        }
      }
    };

    loadInitialFriends();

    return () => {
      isMounted = false;
    };
  }, [initialServerId]);

  useEffect(() => {
    const loadChannels = async () => {
      if (!selectedServerId) {
        setChannels([]);
        setSelectedChannelId(null);
        return;
      }

      setIsLoadingChannels(true);

      try {
        const response = await fetch(`/api/channels?serverId=${selectedServerId}`);
        const data = await response.json();

        if (response.ok) {
          const normalized = (data.channels || []).map((channel) => ({
            id: channel.id || channel._id,
            name: channel.name,
            type: channel.type || "text",
            serverId: channel.serverId || selectedServerId,
          }));
          setChannels(normalized);
          setSelectedChannelId(
            normalized.find((channel) => channel.type !== "voice")?.id || null
          );
        } else {
          setChannels([]);
          setSelectedChannelId(null);
        }
      } catch {
        setChannels([]);
        setSelectedChannelId(null);
      } finally {
        setIsLoadingChannels(false);
      }
    };

    loadChannels();
  }, [selectedServerId]);

  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedChannelId) {
        setMessages([]);
        setTypingUsers([]);
        setOnlineCount(0);
        return;
      }

      setIsLoadingMessages(true);

      try {
        const response = await fetch(`/api/messages/${selectedChannelId}`);
        const data = await response.json();

        if (response.ok) {
          setMessages(data.messages || []);
        } else {
          setMessages([]);
        }
      } catch {
        setMessages([]);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    loadMessages();
  }, [selectedChannelId]);

  useEffect(() => {
    const loadDmMessages = async () => {
      if (!selectedThreadId) {
        setDmMessages([]);
        return;
      }

      setIsLoadingDmMessages(true);

      try {
        const response = await fetch(`/api/dms/threads/${selectedThreadId}/messages`);
        const data = await response.json();

        if (response.ok) {
          setDmMessages(data.messages || []);
        } else {
          setDmMessages([]);
        }
      } catch {
        setDmMessages([]);
      } finally {
        setIsLoadingDmMessages(false);
      }
    };

    loadDmMessages();
  }, [selectedThreadId]);

  const upsertDmThread = useCallback((thread) => {
    if (!thread?.id) {
      return;
    }

    setDmThreads((prev) => {
      const existing = prev.find((entry) => entry.id === thread.id);
      const nextThread = existing ? { ...existing, ...thread } : thread;
      return [nextThread, ...prev.filter((entry) => entry.id !== thread.id)];
    });
  }, []);

  const appendDmMessage = useCallback((message) => {
    if (!message?.id) {
      return;
    }

    setDmMessages((prev) => {
      if (prev.some((existing) => existing.id === message.id)) {
        return prev;
      }
      return [...prev, message];
    });
  }, []);

  const appendChannelMessage = useCallback((message) => {
    if (!message?.id) {
      return;
    }

    setMessages((prev) => {
      if (prev.some((existing) => existing.id === message.id)) {
        return prev;
      }
      return [...prev, message];
    });
  }, []);

  useEffect(() => {
    if (!socket || !selectedChannelId) {
      return undefined;
    }

    socket.emit("join_channel", { channelId: selectedChannelId });

    const handleOnlineCount = ({ channelId, count }) => {
      if (channelId === selectedChannelId) {
        setOnlineCount(count);
      }
    };

    const handleReceiveMessage = (message) => {
      if (message.channelId !== selectedChannelId) {
        return;
      }

      appendChannelMessage(message);
    };

    const handleTyping = ({ channelId, user }) => {
      if (channelId !== selectedChannelId || !user) {
        return;
      }

      setTypingUsers((prev) => {
        if (prev.some((entry) => entry.id === user.id)) {
          return prev;
        }
        return [...prev, { id: user.id, name: user.name }];
      });
    };

    const handleStopTyping = ({ channelId, userId }) => {
      if (channelId !== selectedChannelId) {
        return;
      }

      setTypingUsers((prev) => prev.filter((entry) => entry.id !== userId));
    };

    socket.on("receive_message", handleReceiveMessage);
    socket.on("online_count", handleOnlineCount);
    socket.on("typing", handleTyping);
    socket.on("stop_typing", handleStopTyping);

    return () => {
      socket.emit("leave_channel", { channelId: selectedChannelId });
      socket.off("receive_message", handleReceiveMessage);
      socket.off("online_count", handleOnlineCount);
      socket.off("typing", handleTyping);
      socket.off("stop_typing", handleStopTyping);
      setTypingUsers([]);
      setOnlineCount(0);
    };
  }, [appendChannelMessage, socket, selectedChannelId]);

  useEffect(() => {
    if (!socket) {
      return undefined;
    }

    const friendIds = friends.map((friend) => friend.id).filter(Boolean);

    if (friendIds.length === 0) {
      return undefined;
    }

    const handleFriendsPresence = ({ onlineUserIds } = {}) => {
      setOnlineFriendIds(onlineUserIds || []);
    };

    socket.on("friends_presence", handleFriendsPresence);
    socket.emit("watch_friends", { friendIds });

    return () => {
      socket.off("friends_presence", handleFriendsPresence);
    };
  }, [socket, friends]);

  useEffect(() => {
    if (!socket) {
      return undefined;
    }

    const handleFriendChange = async () => {
      await loadFriends();
      await loadDmThreads();
    };

    const handleDmActivity = ({ thread, message } = {}) => {
      if (thread) {
        upsertDmThread(thread);
      }

      if (message?.threadId === selectedThreadId && viewMode === "dm") {
        appendDmMessage(message);
        setUnreadDmThreadIds((prev) => {
          const next = new Set(prev);
          next.delete(message.threadId);
          return next;
        });
        return;
      }

      if (message?.sender?.id !== user?.userId && message?.threadId) {
        setUnreadDmThreadIds((prev) => new Set(prev).add(message.threadId));
      }
    };

    const handleServerActivity = ({ channelId, message } = {}) => {
      if (channelId === selectedChannelId && viewMode === "channel") {
        appendChannelMessage(message);
        setUnreadChannelIds((prev) => {
          const next = new Set(prev);
          next.delete(channelId);
          return next;
        });
        return;
      }

      if (message?.sender?.id !== user?.userId && channelId) {
        setUnreadChannelIds((prev) => new Set(prev).add(channelId));
      }
    };

    socket.on("friend_request_created", handleFriendChange);
    socket.on("friend_request_updated", handleFriendChange);
    socket.on("dm_activity", handleDmActivity);
    socket.on("server_activity", handleServerActivity);

    return () => {
      socket.off("friend_request_created", handleFriendChange);
      socket.off("friend_request_updated", handleFriendChange);
      socket.off("dm_activity", handleDmActivity);
      socket.off("server_activity", handleServerActivity);
    };
  }, [
    appendChannelMessage,
    appendDmMessage,
    loadDmThreads,
    loadFriends,
    selectedChannelId,
    selectedThreadId,
    socket,
    upsertDmThread,
    user?.userId,
    viewMode,
  ]);

  useEffect(() => {
    if (!socket || !selectedThreadId) {
      return undefined;
    }

    socket.emit("join_dm", { threadId: selectedThreadId });

    const handleReceiveDm = (message) => {
      if (message.threadId !== selectedThreadId) {
        return;
      }

      appendDmMessage(message);
    };

    socket.on("receive_dm", handleReceiveDm);

    return () => {
      socket.emit("leave_dm", { threadId: selectedThreadId });
      socket.off("receive_dm", handleReceiveDm);
    };
  }, [appendDmMessage, socket, selectedThreadId]);

  const handleTyping = (isTyping) => {
    if (!socket || !selectedChannelId) {
      return;
    }

    socket.emit(isTyping ? "typing" : "stop_typing", {
      channelId: selectedChannelId,
    });
  };

  const closeDialog = () => {
    setDialog(null);
    setDialogValue("");
    setDialogFile(null);
    setDialogError("");
    setDialogStatus("");
  };

  const openDialog = (nextDialog, nextValue = "") => {
    setDialog(nextDialog);
    setDialogValue(nextValue);
    setDialogFile(null);
    setDialogError("");
    setDialogStatus("");
  };

  const handleCreateServer = async (event) => {
    event.preventDefault();
    setCreateServerError("");

    if (!createServerName.trim()) {
      setCreateServerError("Server name is required");
      return;
    }

    setIsCreatingServer(true);
    try {
      const response = await fetch("/api/servers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: createServerName.trim() }),
      });
      const data = await response.json();

      if (response.ok) {
        const newServer = {
          id: data.server.id || data.server._id,
          name: data.server.name,
          imageUrl: data.server.imageUrl || "",
          ownerId: data.server.ownerId,
        };
        setServers((prev) => [newServer, ...prev]);
        setSelectedServerId(newServer.id);
        setSidebarTab("servers");
        setCreateServerName("");
        setIsCreateServerOpen(false);
      } else {
        setCreateServerError(data?.error || "Unable to create server");
      }
    } catch {
      setCreateServerError("Unable to create server");
    } finally {
      setIsCreatingServer(false);
    }
  };

  const handleCreateInvite = async () => {
    if (!selectedServerId || !canManageServer) {
      return;
    }

    try {
      const response = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serverId: selectedServerId }),
      });
      const data = await response.json();

      if (response.ok) {
        const link = `${window.location.origin}${data.inviteLink}`;
        openDialog({
          type: "invite",
          kicker: "Invite",
          link,
          onCopy: async () => {
            try {
              await navigator.clipboard.writeText(link);
              setDialogStatus("Copied to clipboard");
            } catch {
              setDialogStatus("Select the link and copy it manually");
            }
          },
        });
      }
    } catch {
      openDialog({ type: "invite", kicker: "Invite", link: "" });
      setDialogError("Unable to create invite");
    }
  };

  const handleCreateChannel = async (type = "text") => {
    if (!selectedServerId || !canManageServer) {
      return;
    }

    const channelType = type === "voice" ? "voice" : "text";
    openDialog(
      {
        type: "create-channel",
        channelType,
        kicker: selectedServer?.name || "Channel",
        label: `${channelType === "voice" ? "Voice" : "Text"} channel name`,
        placeholder: channelType === "voice" ? "Team room" : "general",
      },
      ""
    );
  };

  const submitCreateChannel = async () => {
    if (!selectedServerId || !canManageServer || dialog?.type !== "create-channel") {
      return;
    }

    const channelType = dialog.channelType === "voice" ? "voice" : "text";
    const name = dialogValue.trim();

    if (!name) {
      setDialogError("Channel name is required");
      return;
    }

    setIsDialogSubmitting(true);
    try {
      const response = await fetch("/api/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          type: channelType,
          serverId: selectedServerId,
        }),
      });
      const data = await response.json();

      if (response.ok) {
        const newChannel = {
          id: data.channel.id || data.channel._id,
          name: data.channel.name,
          type: data.channel.type || channelType,
          serverId: data.channel.serverId || selectedServerId,
        };
        setChannels((prev) => [newChannel, ...prev]);
        if (newChannel.type === "voice") {
          setActiveVoiceChannel(newChannel);
        } else {
          setSelectedChannelId(newChannel.id);
        }
        closeDialog();
      } else {
        setDialogError(data?.error || data?.message || "Unable to create channel");
      }
    } catch {
      setDialogError("Unable to create channel");
    } finally {
      setIsDialogSubmitting(false);
    }
  };

  const handleRenameServer = async () => {
    if (!selectedServerId || !canManageServer) {
      return;
    }

    openDialog(
      {
        type: "rename-server",
        kicker: selectedServer?.name || "Server",
        label: "Server name",
        placeholder: "Design team",
      },
      selectedServer?.name || ""
    );
  };

  const submitRenameServer = async () => {
    if (!selectedServerId || !canManageServer) {
      return;
    }

    const name = dialogValue.trim();

    if (!name) {
      setDialogError("Server name is required");
      return;
    }

    setIsDialogSubmitting(true);
    try {
      const response = await fetch(`/api/servers/${selectedServerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await response.json();

      if (response.ok) {
        setServers((prev) =>
          prev.map((server) =>
            server.id === selectedServerId
              ? { ...server, name: data.server.name }
              : server
          )
        );
        closeDialog();
      } else {
        setDialogError(data?.error || "Unable to rename server");
      }
    } catch {
      setDialogError("Unable to rename server");
    } finally {
      setIsDialogSubmitting(false);
    }
  };

  const handleDeleteServer = async () => {
    if (!selectedServerId || !canManageServer) {
      return;
    }

    openDialog({
      type: "delete-server",
      kicker: "Danger zone",
      serverName: selectedServer?.name,
    });
  };

  const submitDeleteServer = async () => {
    if (!selectedServerId || !canManageServer) {
      return;
    }

    setIsDialogSubmitting(true);
    try {
      const response = await fetch(`/api/servers/${selectedServerId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setServers((prev) => {
          const remaining = prev.filter(
            (server) => server.id !== selectedServerId
          );
          setSelectedServerId(remaining[0]?.id || null);
          return remaining;
        });
        setChannels([]);
        setMessages([]);
        setSelectedChannelId(null);
        if (activeVoiceChannel?.serverId === selectedServerId) {
          setActiveVoiceChannel(null);
        }
        closeDialog();
      } else {
        const data = await response.json();
        setDialogError(data?.error || "Unable to delete server");
      }
    } catch {
      setDialogError("Unable to delete server");
    } finally {
      setIsDialogSubmitting(false);
    }
  };

  const handleEditServerImage = () => {
    if (!selectedServerId || !canManageServer) {
      return;
    }

    openDialog({
      type: "server-image",
      kicker: selectedServer?.name || "Server",
      currentUrl: selectedServer?.imageUrl || "",
    });
  };

  const handleEditProfileImage = () => {
    openDialog({
      type: "profile-image",
      kicker: "Account",
      currentUrl: user?.avatarUrl || "",
    });
  };

  const submitServerImage = async () => {
    if (!selectedServerId || !canManageServer || !dialogFile) {
      setDialogError("Choose an image first");
      return;
    }

    setIsDialogSubmitting(true);
    try {
      const imageUrl = await uploadImage(dialogFile, "servers");
      const response = await fetch(`/api/servers/${selectedServerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      });
      const data = await response.json();

      if (response.ok) {
        setServers((prev) =>
          prev.map((server) =>
            server.id === selectedServerId
              ? { ...server, imageUrl: data.server.imageUrl || "" }
              : server
          )
        );
        closeDialog();
      } else {
        setDialogError(data?.error || "Unable to update server image");
      }
    } catch (error) {
      setDialogError(error?.message || "Unable to update server image");
    } finally {
      setIsDialogSubmitting(false);
    }
  };

  const submitProfileImage = async () => {
    if (!dialogFile) {
      setDialogError("Choose an image first");
      return;
    }

    setIsDialogSubmitting(true);
    try {
      const avatarUrl = await uploadImage(dialogFile, "avatars");
      const response = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl }),
      });
      const data = await response.json();

      if (response.ok) {
        setUser(data.user || null);
        closeDialog();
      } else {
        setDialogError(data?.error || "Unable to update profile image");
      }
    } catch (error) {
      setDialogError(error?.message || "Unable to update profile image");
    } finally {
      setIsDialogSubmitting(false);
    }
  };

  const handleDialogSubmit = async (event) => {
    event.preventDefault();
    setDialogError("");

    if (dialog?.type === "create-channel") {
      await submitCreateChannel();
    } else if (dialog?.type === "rename-server") {
      await submitRenameServer();
    } else if (dialog?.type === "delete-server") {
      await submitDeleteServer();
    } else if (dialog?.type === "server-image") {
      await submitServerImage();
    } else if (dialog?.type === "profile-image") {
      await submitProfileImage();
    }
  };

  const handleSendMessage = async (content, imageFile = null) => {
    if (!selectedChannelId) {
      return false;
    }

    if (!socket) {
      return false;
    }

    try {
      const imageUrl = imageFile ? await uploadImage(imageFile, "messages") : "";
      socket.emit("send_message", {
        channelId: selectedChannelId,
        content,
        imageUrl,
      });
    } catch {
      return false;
    }

    return true;
  };

  const handleSendDm = async (content, imageFile = null) => {
    if (!selectedThreadId || !socket) {
      return false;
    }

    try {
      const imageUrl = imageFile ? await uploadImage(imageFile, "messages") : "";
      socket.emit("send_dm", { threadId: selectedThreadId, content, imageUrl });
    } catch {
      return false;
    }

    return true;
  };

  const handleSendRequest = async (email) => {
    try {
      const response = await fetch("/api/friends/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (response.ok) {
        await loadFriends();
        return true;
      }
    } catch {
      return false;
    }

    return false;
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const response = await fetch(
        `/api/friends/requests/${requestId}/accept`,
        { method: "PATCH" }
      );
      if (response.ok) {
        await loadFriends();
        await loadDmThreads();
      }
    } catch {
      // No-op for now.
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      const response = await fetch(
        `/api/friends/requests/${requestId}/reject`,
        { method: "PATCH" }
      );
      if (response.ok) {
        await loadFriends();
      }
    } catch {
      // No-op for now.
    }
  };

  const handleStartDm = async (friend) => {
    try {
      const response = await fetch("/api/dms/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendId: friend.id }),
      });
      const data = await response.json();

      if (response.ok) {
        const threadId = data.thread?.id;
        if (threadId) {
          await loadDmThreads();
          setDraftDmThread({
            id: threadId,
            participant: {
              id: friend.id,
              name: friend.name,
              email: friend.email,
            },
          });
          setSelectedThreadId(threadId);
          setViewMode("dm");
          setSidebarTab("dms");
          setUnreadDmThreadIds((prev) => {
            const next = new Set(prev);
            next.delete(threadId);
            return next;
          });
        }
      }
    } catch {
      // No-op for now.
    }
  };

  const handleSelectThread = (threadId) => {
    setSelectedThreadId(threadId);
    setViewMode("dm");
    setSidebarTab("dms");
    setUnreadDmThreadIds((prev) => {
      const next = new Set(prev);
      next.delete(threadId);
      return next;
    });
  };

  const handleSelectServer = (serverId) => {
    setSelectedServerId(serverId);
    setViewMode("channel");
    setSidebarTab("servers");
  };

  const handleSelectChannel = (channelId) => {
    setSelectedChannelId(channelId);
    setViewMode("channel");
    setSidebarTab("servers");
    setUnreadChannelIds((prev) => {
      const next = new Set(prev);
      next.delete(channelId);
      return next;
    });
  };

  const handleSelectVoiceChannel = (channel) => {
    if (!channel?.id) {
      return;
    }

    setActiveVoiceChannel(channel);
    setSidebarTab("servers");
  };

  return (
    <div className="dashboard-workspace flex w-full flex-1 gap-2 p-2">
      <Sidebar
        servers={servers}
        dmThreads={dmThreads}
        textChannels={textChannels}
        voiceChannels={voiceChannels}
        activeTab={sidebarTab}
        onTabChange={setSidebarTab}
        unreadDmThreadIds={unreadDmThreadIds}
        unreadServerIds={unreadServerIds}
        unreadChannelIds={unreadChannelIds}
        activeVoiceChannelId={activeVoiceChannel?.id}
        selectedServerId={selectedServerId}
        selectedChannelId={selectedChannelId}
        selectedThreadId={selectedThreadId}
        onSelectServer={handleSelectServer}
        onSelectChannel={handleSelectChannel}
        onSelectVoiceChannel={handleSelectVoiceChannel}
        onSelectThread={handleSelectThread}
        onCreateServer={() => {
          setCreateServerError("");
          setCreateServerName("");
          setSidebarTab("servers");
          setIsCreateServerOpen(true);
        }}
        onCreateChannel={handleCreateChannel}
        onRenameServer={handleRenameServer}
        onDeleteServer={handleDeleteServer}
        onCreateInvite={handleCreateInvite}
        onEditServerImage={handleEditServerImage}
        onEditProfileImage={handleEditProfileImage}
        isLoadingChannels={isLoadingChannels}
        canManageServer={canManageServer}
      />
      <ChatPanel
        title={
          viewMode === "dm"
            ? selectedThread?.participant?.name
            : selectedChannel
            ? `#${selectedChannel.name}`
            : "Select a channel"
        }
        statusLabel={
          viewMode === "dm"
            ? "Direct message"
            : selectedChannel
            ? `${onlineCount} online`
            : "Idle"
        }
        messages={viewMode === "dm" ? dmMessages : messages}
        isLoading={
          viewMode === "dm"
            ? isLoadingDmMessages || isLoadingThreads
            : isLoadingMessages || isLoadingChannels
        }
        typingUsers={viewMode === "dm" ? [] : typingUsers}
        onTyping={viewMode === "dm" ? null : handleTyping}
        canSend={viewMode === "dm" ? Boolean(selectedThreadId) : Boolean(selectedChannelId)}
        onSendMessage={viewMode === "dm" ? handleSendDm : handleSendMessage}
        voiceRoom={
          activeVoiceChannel ? (
            <VoiceRoom
              key={activeVoiceChannel.id}
              socket={socket}
              roomId={activeVoiceChannel.id}
              roomName={activeVoiceChannel.name}
              currentUser={user}
              autoJoin
              onEnded={() => setActiveVoiceChannel(null)}
            />
          ) : null
        }
      />
      <FriendsSidebar
        friends={friends}
        incoming={incomingRequests}
        outgoing={outgoingRequests}
        onlineFriendIds={onlineFriendIds}
        onSendRequest={handleSendRequest}
        onAccept={handleAcceptRequest}
        onReject={handleRejectRequest}
        onStartDm={handleStartDm}
      />
      {isCreateServerOpen ? (
        <CreateServerModal
          name={createServerName}
          error={createServerError}
          isSubmitting={isCreatingServer}
          onNameChange={setCreateServerName}
          onClose={() => setIsCreateServerOpen(false)}
          onSubmit={handleCreateServer}
        />
      ) : null}
      <DashboardModal
        dialog={dialog}
        value={dialogValue}
        file={dialogFile}
        error={dialogError}
        status={dialogStatus}
        isSubmitting={isDialogSubmitting}
        onValueChange={setDialogValue}
        onFileChange={setDialogFile}
        onClose={closeDialog}
        onSubmit={handleDialogSubmit}
      />
    </div>
  );
}
