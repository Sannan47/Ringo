// Mock data for static sidebar layout.
const servers = ["Dev Team", "Gaming", "Study Group"];
const channels = ["general", "random", "help"];

export default function Sidebar() {
  return (
    <aside className="flex h-full w-20 flex-col border-r border-slate-800 bg-slate-900 text-slate-100 sm:w-64">
      <div className="flex items-center justify-center border-b border-slate-800 px-4 py-4 sm:justify-start">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500 text-lg font-semibold text-white">
          R
        </div>
        <span className="ml-3 hidden text-sm font-semibold tracking-wide sm:inline">
          Ringo
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <div>
          <p className="hidden text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 sm:block">
            Servers
          </p>
          <div className="mt-3 space-y-2">
            {servers.map((server) => (
              <button
                key={server}
                type="button"
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-slate-200 transition hover:bg-slate-800"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-xs font-semibold text-slate-200">
                  {server.slice(0, 2).toUpperCase()}
                </span>
                <span className="hidden sm:inline">{server}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <p className="hidden text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 sm:block">
            Channels
          </p>
          <div className="mt-3 space-y-1">
            {channels.map((channel, index) => (
              <button
                key={channel}
                type="button"
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition ${
                  index === 0
                    ? "bg-slate-800 text-white"
                    : "text-slate-300 hover:bg-slate-800/70"
                }`}
              >
                <span className="text-slate-500">#</span>
                <span className="hidden sm:inline">{channel}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
