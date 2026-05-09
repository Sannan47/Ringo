"use client";

import { useEffect, useMemo, useRef } from "react";
import useWebRTC from "../../hooks/useWebRTC";
import VoiceControls from "./VoiceControls";

function SpeakerIcon() {
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

function RemoteAudio({ stream }) {
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.srcObject = stream;
    }
  }, [stream]);

  return <audio ref={audioRef} autoPlay playsInline />;
}

function VoiceUser({ user, isSelf }) {
  return (
    <li className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition hover:bg-[var(--surface-hover)]">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-xs font-black text-[var(--primary-strong)]">
        {(user.name || user.email || "?").slice(0, 1).toUpperCase()}
      </span>
      <span className="min-w-0 flex-1 truncate font-bold text-[var(--text)]">
        {user.name || user.email || "User"}
      </span>
      {isSelf ? (
        <span className="rounded-full bg-[var(--primary-faint)] px-2 py-1 text-[0.65rem] font-black text-[var(--primary-strong)]">
          You
        </span>
      ) : null}
    </li>
  );
}

export default function VoiceRoom({
  socket,
  roomId,
  roomName,
  currentUser,
  autoJoin = false,
  onEnded,
}) {
  const {
    isConnected,
    isJoining,
    isMuted,
    error,
    participants,
    remoteStreams,
    currentParticipant,
    joinVoiceRoom,
    leaveVoiceRoom,
    toggleMute,
  } = useWebRTC({ socket, roomId, currentUser });

  useEffect(() => {
    if (!autoJoin || !socket || !roomId || isConnected || isJoining) {
      return;
    }

    joinVoiceRoom();
  }, [autoJoin, isConnected, isJoining, joinVoiceRoom, roomId, socket]);

  const handleLeave = async () => {
    await leaveVoiceRoom();
    onEnded?.();
  };

  const visibleParticipants = useMemo(() => {
    if (!isConnected) {
      return [];
    }

    if (
      participants.some(
        (participant) => participant.socketId === currentParticipant.socketId
      )
    ) {
      return participants;
    }

    return [currentParticipant, ...participants];
  }, [currentParticipant, isConnected, participants]);

  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--surface-solid)] p-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-[var(--faint)]">
            <SpeakerIcon />
            Voice channel
          </div>
          <h3 className="mt-2 truncate text-lg font-black text-[var(--text)]">
            {roomName ? `# ${roomName}` : "Select a channel"}
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="status-pill">
              <span className={isConnected ? "status-dot" : "h-2 w-2 rounded-full bg-[var(--faint)]"} />
              {isConnected ? "Voice connected" : "Not connected"}
            </span>
            {visibleParticipants.length > 0 ? (
              <span className="text-xs font-bold text-[var(--muted)]">
                {visibleParticipants.length} in room
              </span>
            ) : null}
          </div>
        </div>

        <VoiceControls
          isConnected={isConnected}
          isJoining={isJoining}
          isMuted={isMuted}
          onJoin={joinVoiceRoom}
          onLeave={handleLeave}
          onToggleMute={toggleMute}
        />
      </div>

      {error ? (
        <p className="mt-3 rounded-lg border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-sm font-semibold text-rose-600">
          {error}
        </p>
      ) : null}

      <div className="mt-4">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--faint)]">
          Active users
        </p>
        {visibleParticipants.length === 0 ? (
          <p className="mt-2 rounded-lg border border-dashed border-[var(--border)] px-3 py-4 text-sm font-semibold text-[var(--faint)]">
            Join voice to see who is in the room.
          </p>
        ) : (
          <ul className="mt-2 grid gap-1 sm:grid-cols-2 xl:grid-cols-3">
            {visibleParticipants.map((participant) => (
              <VoiceUser
                key={participant.socketId}
                user={participant}
                isSelf={participant.socketId === currentParticipant.socketId}
              />
            ))}
          </ul>
        )}
      </div>

      <div className="sr-only" aria-hidden="true">
        {Object.entries(remoteStreams).map(([socketId, stream]) => (
          <RemoteAudio key={socketId} stream={stream} />
        ))}
      </div>
    </section>
  );
}
