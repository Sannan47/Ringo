"use client";

function MicIcon({ muted = false }) {
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
      <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
      <path d="M12 18v4" />
      <path d="M8 22h8" />
      {muted ? <path d="m3 3 18 18" /> : null}
    </svg>
  );
}

function PhoneIcon() {
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
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.2 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.32 1.78.59 2.63a2 2 0 0 1-.45 2.11L8 9.71a16 16 0 0 0 6.29 6.29l1.25-1.25a2 2 0 0 1 2.11-.45c.85.27 1.73.47 2.63.59A2 2 0 0 1 22 16.92Z" />
    </svg>
  );
}

export default function VoiceControls({
  isConnected,
  isJoining,
  isMuted,
  onJoin,
  onLeave,
  onToggleMute,
}) {
  if (!isConnected) {
    return (
      <button
        type="button"
        onClick={onJoin}
        disabled={isJoining}
        className="btn-primary min-h-10 px-4 py-2 text-sm"
      >
        <PhoneIcon />
        {isJoining ? "Joining..." : "Join Voice"}
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={onToggleMute}
        className={`btn-secondary min-h-10 px-4 py-2 text-sm ${
          isMuted ? "border-rose-400/40 text-rose-600" : ""
        }`}
      >
        <MicIcon muted={isMuted} />
        {isMuted ? "Unmute" : "Mute"}
      </button>
      <button
        type="button"
        onClick={onLeave}
        className="min-h-10 rounded-full border border-rose-400/40 px-4 py-2 text-sm font-black text-rose-600 transition hover:bg-rose-500/10"
      >
        End Call
      </button>
    </div>
  );
}
