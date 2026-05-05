// Mock messages for static chat layout.
const messages = [
  {
    id: 1,
    user: "Aisha",
    text: "Morning! Who is taking the release notes today?",
    time: "09:12",
  },
  {
    id: 2,
    user: "Marco",
    text: "I can handle it after standup.",
    time: "09:13",
  },
  {
    id: 3,
    user: "Lena",
    text: "Channel backlog looks good. Need help with QA?",
    time: "09:15",
  },
  {
    id: 4,
    user: "Devon",
    text: "QA is clear. We can push the build after lunch.",
    time: "09:18",
  },
  {
    id: 5,
    user: "Rami",
    text: "Can someone review the new channel permissions?",
    time: "09:21",
  },
  {
    id: 6,
    user: "Aisha",
    text: "On it. I will share feedback in 10 mins.",
    time: "09:22",
  },
];

export default function ChatPanel() {
  return (
    <section className="flex h-full flex-1 flex-col bg-slate-950">
      <header className="border-b border-slate-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Active channel
            </p>
            <h2 className="text-lg font-semibold text-white">#general</h2>
          </div>
          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
            12 online
          </span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="space-y-6">
          {messages.map((message) => (
            <div key={message.id} className="flex gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-800 text-sm font-semibold text-slate-100">
                {message.user.slice(0, 1)}
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <p className="text-sm font-semibold text-white">
                    {message.user}
                  </p>
                  <span className="text-xs text-slate-500">{message.time}</span>
                </div>
                <p className="mt-1 text-sm text-slate-300">{message.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-800 px-6 py-4">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3">
          <input
            type="text"
            placeholder="Send a message"
            className="flex-1 bg-transparent text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none"
          />
          <button
            type="button"
            className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-400"
          >
            Send
          </button>
        </div>
      </div>
    </section>
  );
}
