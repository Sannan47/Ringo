"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/Sidebar";
import ChatPanel from "../../components/ChatPanel";

export default function DashboardPage() {
  const [servers, setServers] = useState([]);
  const [channels, setChannels] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedServerId, setSelectedServerId] = useState(null);
  const [selectedChannelId, setSelectedChannelId] = useState(null);
  const [isLoadingChannels, setIsLoadingChannels] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const selectedChannel = useMemo(
    () => channels.find((channel) => channel.id === selectedChannelId) || null,
    [channels, selectedChannelId]
  );

  useEffect(() => {
    const loadServers = async () => {
      try {
        const response = await fetch("/api/servers");
        const data = await response.json();

        if (response.ok) {
          const normalized = (data.servers || []).map((server) => ({
            id: server._id,
            name: server.name,
          }));
          setServers(normalized);
          if (normalized.length > 0) {
            setSelectedServerId(normalized[0].id);
          }
        }
      } catch (error) {
        setServers([]);
      }
    };

    loadServers();
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
            id: channel._id,
            name: channel.name,
          }));
          setChannels(normalized);
          setSelectedChannelId(normalized[0]?.id || null);
        } else {
          setChannels([]);
          setSelectedChannelId(null);
        }
      } catch (error) {
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
      } catch (error) {
        setMessages([]);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    loadMessages();
  }, [selectedChannelId]);

  const handleCreateServer = async () => {
    const name = window.prompt("Server name");

    if (!name || !name.trim()) {
      return;
    }

    try {
      const response = await fetch("/api/servers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await response.json();

      if (response.ok) {
        const newServer = { id: data.server._id, name: data.server.name };
        setServers((prev) => [newServer, ...prev]);
        setSelectedServerId(newServer.id);
      }
    } catch (error) {
      // No-op for now.
    }
  };

  const handleCreateChannel = async () => {
    if (!selectedServerId) {
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
        const newChannel = { id: data.channel._id, name: data.channel.name };
        setChannels((prev) => [newChannel, ...prev]);
        setSelectedChannelId(newChannel.id);
      }
    } catch (error) {
      // No-op for now.
    }
  };

  const handleSendMessage = async (content) => {
    if (!selectedChannelId) {
      return false;
    }

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, channelId: selectedChannelId }),
      });
      const data = await response.json();

      if (response.ok) {
        const optimisticMessage = {
          id: data.message._id,
          content: data.message.content,
          createdAt: data.message.createdAt,
          sender: { name: "You" },
        };
        setMessages((prev) => [...prev, optimisticMessage]);
        return true;
      }
    } catch (error) {
      return false;
    }

    return false;
  };

  return (
    <div className="flex w-full flex-1">
      <Sidebar
        servers={servers}
        channels={channels}
        selectedServerId={selectedServerId}
        selectedChannelId={selectedChannelId}
        onSelectServer={setSelectedServerId}
        onSelectChannel={setSelectedChannelId}
        onCreateServer={handleCreateServer}
        onCreateChannel={handleCreateChannel}
        isLoadingChannels={isLoadingChannels}
      />
      <ChatPanel
        selectedChannel={selectedChannel}
        messages={messages}
        isLoading={isLoadingMessages || isLoadingChannels}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}
