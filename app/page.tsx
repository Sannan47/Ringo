import Link from "next/link";

const featureCards = [
  {
    title: "Channels with context",
    desc: "Keep teams, projects, and launch rooms organized without burying decisions.",
  },
  {
    title: "Fast private messages",
    desc: "Move from group chat to one-on-one follow-ups with direct threads built in.",
  },
  {
    title: "Admin-ready control",
    desc: "Server ownership, invites, roles, and user status controls feel clean and deliberate.",
  },
];

const messages = [
  {
    name: "Maya",
    time: "09:42",
    content: "Design review is ready. I pinned the launch notes in #product.",
  },
  {
    name: "Ali",
    time: "09:44",
    content: "Shipping the final pass after QA signs off on mobile spacing.",
  },
  {
    name: "Noor",
    time: "09:46",
    content: "Invite link is copied. New workspace members can join now.",
  },
];

export default function Home() {
  return (
    <main className="ringo-page">
      <section className="ringo-container grid min-h-[calc(100vh-76px)] items-center gap-12 py-14 lg:grid-cols-[0.95fr_1.05fr] lg:py-18">
        <div className="space-y-7 fade-in-up">
          <div className="eyebrow">Discord-inspired, startup-polished</div>
          <div className="space-y-5">
            <h1 className="max-w-3xl text-5xl font-black leading-[1.02] tracking-tight text-[var(--text)] sm:text-6xl lg:text-7xl">
              Ringo brings team chat into sharper focus.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[var(--muted)]">
              A modern communication platform for teams that want Discord-style
              speed, Slack-level polish, and admin tools that do not get in the
              way.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/signup" className="btn-primary text-sm">
              Start free
            </Link>
            <Link href="/login" className="btn-secondary text-sm">
              Open workspace
            </Link>
          </div>
          <div className="grid max-w-xl grid-cols-3 gap-4 pt-2">
            {[
              ["24ms", "message sync"],
              ["8+", "team spaces"],
              ["99%", "less tab chaos"],
            ].map(([value, label]) => (
              <div key={label}>
                <p className="text-2xl font-black text-[var(--text)]">{value}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--faint)]">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="ringo-shell overflow-hidden rounded-lg fade-in-up fade-in-up-delay-1">
          <div className="grid min-h-[560px] grid-cols-[76px_210px_1fr] max-md:grid-cols-[68px_1fr]">
            <div className="border-r border-[var(--border)] bg-[var(--surface-muted)] p-3">
              <div className="brand-mark mx-auto h-11 w-11">R</div>
              <div className="mt-5 space-y-3">
                {["PD", "MK", "DS", "QA"].map((item, index) => (
                  <div
                    key={item}
                    className={`mx-auto flex h-11 w-11 items-center justify-center rounded-2xl text-xs font-black ${
                      index === 0
                        ? "bg-[var(--primary)] text-white"
                        : "bg-[var(--surface-solid)] text-[var(--muted)]"
                    }`}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <aside className="border-r border-[var(--border)] bg-[var(--surface-solid)] p-4 max-md:hidden">
              <div className="mb-5">
                <p className="text-sm font-black text-[var(--text)]">
                  Product Studio
                </p>
                <p className="mt-1 text-xs text-[var(--muted)]">12 online</p>
              </div>
              <div className="space-y-1">
                {["launch-room", "design", "qa", "engineering"].map(
                  (channel, index) => (
                    <div
                      key={channel}
                      className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                        index === 0
                          ? "bg-[var(--primary-faint)] text-[var(--text)]"
                          : "text-[var(--muted)]"
                      }`}
                    >
                      # {channel}
                    </div>
                  )
                )}
              </div>
              <div className="mt-7">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--faint)]">
                  Direct
                </p>
                {["Sara Chen", "Omar Hale"].map((name) => (
                  <div
                    key={name}
                    className="rounded-lg px-3 py-2 text-sm font-semibold text-[var(--muted)]"
                  >
                    @ {name}
                  </div>
                ))}
              </div>
            </aside>

            <section className="flex min-w-0 flex-col bg-[var(--surface)]">
              <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--faint)]">
                    Active channel
                  </p>
                  <h2 className="mt-1 text-lg font-black text-[var(--text)]">
                    # launch-room
                  </h2>
                </div>
                <span className="status-pill">Live now</span>
              </div>

              <div className="flex-1 space-y-5 overflow-hidden p-5">
                {messages.map((message) => (
                  <div key={message.content} className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-sm font-black text-[var(--primary-strong)]">
                      {message.name.slice(0, 1)}
                    </div>
                    <div>
                      <div className="flex items-baseline gap-2">
                        <p className="font-bold text-[var(--text)]">
                          {message.name}
                        </p>
                        <span className="text-xs text-[var(--faint)]">
                          {message.time}
                        </span>
                      </div>
                      <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                        {message.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-[var(--border)] p-4">
                <div className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-solid)] px-4 py-3">
                  <span className="text-[var(--faint)]">+</span>
                  <p className="flex-1 text-sm text-[var(--faint)]">
                    Message #launch-room
                  </p>
                  <span className="rounded-full bg-[var(--primary)] px-3 py-1.5 text-xs font-black text-white">
                    Send
                  </span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </section>

      <section className="ringo-container grid gap-4 pb-16 md:grid-cols-3">
        {featureCards.map((feature) => (
          <article key={feature.title} className="ringo-card p-6">
            <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary-strong)]">
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 8h10" />
                <path d="M7 12h6" />
                <path d="M21 12c0 4.42-4.03 8-9 8a9.8 9.8 0 0 1-4-.82L3 20l1.16-4.04A7.26 7.26 0 0 1 3 12c0-4.42 4.03-8 9-8s9 3.58 9 8Z" />
              </svg>
            </div>
            <h3 className="text-lg font-black text-[var(--text)]">
              {feature.title}
            </h3>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              {feature.desc}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
