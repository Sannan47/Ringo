"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export default function ChatPanel({
  title,
  statusLabel,
  messages,
  isLoading,
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
    <section className="flex h-[calc(100vh-65px)] min-w-0 flex-1 flex-col bg-[var(--page)]">
      <header className="border-b border-[var(--border)] bg-[var(--surface)] px-4 py-4 backdrop-blur-xl sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--faint)]">
              Active room
            </p>
            <h2 className="mt-1 truncate text-xl font-black text-[var(--text)]">
              {title || "Select a chat"}
            </h2>
          </div>
          <span className="status-pill shrink-0">{statusLabel || "Idle"}</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        <div className="mx-auto w-full max-w-4xl space-y-5">
          {isLoading ? (
            <div className="ringo-panel p-4 text-sm font-semibold text-[var(--muted)]">
              Loading messages...
            </div>
          ) : null}
          {!isLoading && formattedMessages.length === 0 ? (
            <div className="ringo-panel p-6 text-center">
              <p className="text-sm font-bold text-[var(--text)]">
                This room is quiet.
              </p>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Send the first message and get the conversation moving.
              </p>
            </div>
          ) : null}
          {formattedMessages.map((message) => (
            <div key={message.id} className="group flex gap-3 rounded-lg p-2 transition hover:bg-[var(--surface)]">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-sm font-black text-[var(--primary-strong)]">
                {message.sender?.name?.slice(0, 1) || "?"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-2">
                  <p className="font-bold text-[var(--text)]">
                    {message.sender?.name || "Unknown"}
                  </p>
                  <span className="text-xs font-semibold text-[var(--faint)]">
                    {message.time}
                  </span>
                </div>
                <p className="mt-1 break-words text-sm leading-6 text-[var(--text-soft)]">
                  {message.content}
                </p>
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>
      </div>

      <div className="border-t border-[var(--border)] bg-[var(--surface)] px-4 py-4 sm:px-6">
        <div className="mx-auto w-full max-w-4xl">
          {typingUsers.length > 0 ? (
            <div className="mb-3 text-xs font-semibold text-[var(--muted)]">
              {typingUsers.length === 1
                ? `${typingUsers[0].name} is typing...`
                : `${typingUsers.map((user) => user.name).join(", ")} are typing...`}
            </div>
          ) : null}
          <div className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-solid)] p-2 shadow-sm">
            <button type="button" className="icon-button h-9 w-9" aria-label="Add attachment">
              <svg
                aria-hidden="true"
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M12 5v14" />
                <path d="M5 12h14" />
              </svg>
            </button>
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
              className="min-w-0 flex-1 bg-transparent px-1 text-sm text-[var(--text)] placeholder:text-[var(--faint)] focus:outline-none"
            />
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!messageText.trim() || !canSend}
              className="btn-primary min-h-9 px-4 py-2 text-sm"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
