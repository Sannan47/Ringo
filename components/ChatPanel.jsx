"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export default function ChatPanel({
  title,
  statusLabel,
  messages,
  isLoading,
  onlineCount,
  typingUsers,
  onTyping,
  canSend,
  onSendMessage,
}) {
  const [messageText, setMessageText] = useState("");
  const endRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const formattedMessages = useMemo(
    () =>
      messages.map((message) => ({
        ...message,
        time: message.createdAt
          ? new Date(message.createdAt).toISOString().slice(11, 16)
          : "--:--",
      })),
    [messages]
  );

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [formattedMessages]);

  const clearTypingTimer = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  const scheduleStopTyping = () => {
    clearTypingTimer();
    typingTimeoutRef.current = setTimeout(() => {
      onTyping?.(false);
    }, 1200);
  };

  const handleSubmit = async () => {
    const trimmed = messageText.trim();

    if (!trimmed || !canSend) {
      return;
    }

    onTyping?.(false);

    const sent = await onSendMessage(trimmed);

    if (sent) {
      setMessageText("");
    }
  };

  useEffect(() => () => clearTypingTimer(), []);

  return (
    <section className="flex h-full flex-1 flex-col bg-slate-950">
      <header className="border-b border-slate-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Active channel
            </p>
            <h2 className="text-lg font-semibold text-white">
              {title || "Select a chat"}
            </h2>
          </div>
          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
            {statusLabel || "Idle"}
          </span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="space-y-6">
          {isLoading ? (
            <p className="text-sm text-slate-400">Loading messages...</p>
          ) : null}
          {!isLoading && formattedMessages.length === 0 ? (
            <p className="text-sm text-slate-500">
              No messages yet. Say hello!
            </p>
          ) : null}
          {formattedMessages.map((message) => (
            <div key={message.id} className="flex gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-800 text-sm font-semibold text-slate-100">
                {message.sender?.name?.slice(0, 1) || "?"}
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <p className="text-sm font-semibold text-white">
                    {message.sender?.name || "Unknown"}
                  </p>
                  <span className="text-xs text-slate-500">{message.time}</span>
                </div>
                <p className="mt-1 text-sm text-slate-300">{message.content}</p>
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>
      </div>

      <div className="border-t border-slate-800 px-6 py-4">
        {typingUsers.length > 0 ? (
          <div className="mb-3 text-xs text-slate-400">
            {typingUsers.length === 1
              ? `${typingUsers[0].name} is typing...`
              : `${typingUsers.map((user) => user.name).join(", ")} are typing...`}
          </div>
        ) : null}
        <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3">
          <input
            type="text"
            placeholder="Send a message"
            value={messageText}
            onChange={(event) => {
              setMessageText(event.target.value);
              onTyping?.(true);
              scheduleStopTyping();
            }}
            onBlur={() => onTyping?.(false)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleSubmit();
              }
            }}
            className="flex-1 bg-transparent text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!messageText.trim() || !canSend}
            className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Send
          </button>
        </div>
      </div>
    </section>
  );
}
