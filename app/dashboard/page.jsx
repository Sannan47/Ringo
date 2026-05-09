"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/Sidebar";
import ChatPanel from "../../components/ChatPanel";
import FriendsSidebar from "../../components/FriendsSidebar";
import useSocket from "../../hooks/useSocket";
import { useAuth } from "../../context/AuthContext";

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

export default function DashboardPage() {
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
  const [isCreateServerOpen, setIsCreateServerOpen] = useState(false);
  const [createServerName, setCreateServerName] = useState("");
  const [createServerError, setCreateServerError] = useState("");
  const [isCreatingServer, setIsCreatingServer] = useState(false);
  const socket = useSocket(true);
  const { user } = useAuth();

  const selectedChannel = useMemo(
    () => channels.find((channel) => channel.id === selectedChannelId) || null,
    [channels, selectedChannelId]
  );
  const selectedServer = useMemo(
    () => servers.find((server) => server.id === selectedServerId) || null,
    [servers, selectedServerId]
  );
  const selectedThread = useMemo(
    () => dmThreads.find((thread) => thread.id === selectedThreadId) || null,
    [dmThreads, selectedThreadId]
  );
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
            ownerId: server.ownerId,
          }));
          setServers(normalized);
          if (normalized.length > 0) {
            setSelectedServerId(normalized[0].id);
          }
        }
      } catch {
        setServers([]);
      }
    };

    loadServers();
  }, []);

  useEffect(() => {
    const loadThreads = async () => {
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
    };

    loadThreads();
  }, []);

  const loadFriends = async () => {
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
  };

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
  }, []);

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
          }));
          setChannels(normalized);
          setSelectedChannelId(normalized[0]?.id || null);
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

      setMessages((prev) => {
        if (prev.some((existing) => existing.id === message.id)) {
          return prev;
        }
        return [...prev, message];
      });
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
  }, [socket, selectedChannelId]);

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
    if (!socket || !selectedThreadId) {
      return undefined;
    }

    socket.emit("join_dm", { threadId: selectedThreadId });

    const handleReceiveDm = (message) => {
      if (message.threadId !== selectedThreadId) {
        return;
      }

      setDmMessages((prev) => {
        if (prev.some((existing) => existing.id === message.id)) {
          return prev;
        }
        return [...prev, message];
      });
    };

    socket.on("receive_dm", handleReceiveDm);

    return () => {
      socket.emit("leave_dm", { threadId: selectedThreadId });
      socket.off("receive_dm", handleReceiveDm);
    };
  }, [socket, selectedThreadId]);

  const handleTyping = (isTyping) => {
    if (!socket || !selectedChannelId) {
      return;
    }

    socket.emit(isTyping ? "typing" : "stop_typing", {
      channelId: selectedChannelId,
    });
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
          ownerId: data.server.ownerId,
        };
        setServers((prev) => [newServer, ...prev]);
        setSelectedServerId(newServer.id);
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
        try {
          await navigator.clipboard.writeText(link);
          window.alert("Invite link copied to clipboard.");
        } catch {
          window.prompt("Copy this invite link:", link);
        }
      }
    } catch {
      // No-op for now.
    }
  };

  const handleCreateChannel = async () => {
    if (!selectedServerId || !canManageServer) {
      return;
    }

    const name = window.prompt("Channel name");

    if (!name || !name.trim()) {
      return;
    }

    try {
      const response = await fetch("/api/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), serverId: selectedServerId }),
      });
      const data = await response.json();

      if (response.ok) {
        const newChannel = {
          id: data.channel.id || data.channel._id,
          name: data.channel.name,
        };
        setChannels((prev) => [newChannel, ...prev]);
        setSelectedChannelId(newChannel.id);
      }
    } catch {
      // No-op for now.
    }
  };

  const handleRenameServer = async () => {
    if (!selectedServerId || !canManageServer) {
      return;
    }

    const name = window.prompt("New server name");

    if (!name || !name.trim()) {
      return;
    }

    try {
      const response = await fetch(`/api/servers/${selectedServerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
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
      }
    } catch {
      // No-op for now.
    }
  };

  const handleDeleteServer = async () => {
    if (!selectedServerId || !canManageServer) {
      return;
    }

    if (!window.confirm("Delete this server? This cannot be undone.")) {
      return;
    }

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
      }
    } catch {
      // No-op for now.
    }
  };

  const handleSendMessage = async (content) => {
    if (!selectedChannelId) {
      return false;
    }

    if (!socket) {
      return false;
    }

    socket.emit("send_message", {
      channelId: selectedChannelId,
      content,
    });

    return true;
  };

  const handleSendDm = async (content) => {
    if (!selectedThreadId || !socket) {
      return false;
    }

    socket.emit("send_dm", { threadId: selectedThreadId, content });
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
        const threadsResponse = await fetch("/api/dms/threads");
        const threadsData = await threadsResponse.json();
        if (threadsResponse.ok) {
          setDmThreads(threadsData.threads || []);
        }
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
          const threadsResponse = await fetch("/api/dms/threads");
          const threadsData = await threadsResponse.json();
          if (threadsResponse.ok) {
            setDmThreads(threadsData.threads || []);
          }
          setSelectedThreadId(threadId);
          setViewMode("dm");
        }
      }
    } catch {
      // No-op for now.
    }
  };

  const handleSelectThread = (threadId) => {
    setSelectedThreadId(threadId);
    setViewMode("dm");
  };

  const handleSelectServer = (serverId) => {
    setSelectedServerId(serverId);
    setViewMode("channel");
  };

  const handleSelectChannel = (channelId) => {
    setSelectedChannelId(channelId);
    setViewMode("channel");
  };

  return (
    <div className="dashboard-workspace flex w-full flex-1 gap-2 p-2">
      <Sidebar
        servers={servers}
        dmThreads={dmThreads}
        channels={channels}
        selectedServerId={selectedServerId}
        selectedChannelId={selectedChannelId}
        selectedThreadId={selectedThreadId}
        onSelectServer={handleSelectServer}
        onSelectChannel={handleSelectChannel}
        onSelectThread={handleSelectThread}
        onCreateServer={() => {
          setCreateServerError("");
          setCreateServerName("");
          setIsCreateServerOpen(true);
        }}
        onCreateChannel={handleCreateChannel}
        onRenameServer={handleRenameServer}
        onDeleteServer={handleDeleteServer}
        onCreateInvite={handleCreateInvite}
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
    </div>
  );
}
