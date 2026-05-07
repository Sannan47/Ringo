import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <section className="relative overflow-hidden px-6 py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_45%),radial-gradient(circle_at_bottom,_rgba(14,116,144,0.22),_transparent_55%)]" />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-12 lg:flex-row lg:items-center">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-700/60 bg-slate-900/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-300">
              Ringo Collaboration
            </div>
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              A real-time command center for your team chats.
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
              Ringo blends Discord-style channels with team focus. Build servers,
              move fast, and keep every conversation in sync.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/signup"
                className="rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-400"
              >
                Get started
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-500"
              >
                Log in
              </Link>
            </div>
          </div>
          <div className="flex-1">
            <div className="relative rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-2xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    # launch-room
                  </p>
                  <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs text-emerald-200">
                    5 online
                  </span>
                </div>
                <div className="space-y-3">
                  {["Release checklist", "QA sign-off", "Deploy window confirmed"].map(
                    (item) => (
                      <div
                        key={item}
                        className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-300"
                      >
                        {item}
                      </div>
                    )
                  )}
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-400">
                  Type a message and stay in sync instantly.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Channel clarity",
              desc: "Organize threads by server, channel, and topic with zero noise.",
            },
            {
              title: "Secure sessions",
              desc: "JWT sessions keep access locked while admins control roles.",
            },
            {
              title: "Instant delivery",
              desc: "Socket.IO powered updates keep every member in real time.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6"
            >
              <h3 className="text-lg font-semibold text-white">
                {feature.title}
              </h3>
              <p className="mt-3 text-sm text-slate-300">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
