const values = [
  {
    title: "Calm structure",
    copy: "Servers, channels, DMs, and invites are designed to keep busy teams clear without slowing down real-time work.",
  },
  {
    title: "Responsible access",
    copy: "Admins can manage roles and account status while workspace owners keep server-level controls close at hand.",
  },
  {
    title: "Fast collaboration",
    copy: "Socket-powered messaging keeps the interface responsive, immediate, and natural for focused groups.",
  },
];

export default function AboutPage() {
  return (
    <main className="ringo-page">
      <section className="ringo-container py-16 lg:py-20">
        <div className="max-w-3xl space-y-5 fade-in-up">
          <div className="eyebrow">About Ringo</div>
          <h1 className="text-4xl font-black tracking-tight text-[var(--text)] sm:text-5xl">
            Built for teams that live in conversation.
          </h1>
          <p className="text-lg leading-8 text-[var(--muted)]">
            Ringo is a Discord-inspired communication platform shaped for
            university teams, product squads, and fast-moving communities. It
            combines real-time channels, private messaging, role controls, and
            invite-based collaboration in one polished workspace.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {values.map((value) => (
            <article key={value.title} className="ringo-card p-6">
              <h2 className="text-lg font-black text-[var(--text)]">
                {value.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                {value.copy}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="ringo-panel p-6">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--faint)]">
              Stack
            </p>
            <ul className="mt-5 space-y-3 text-sm font-semibold text-[var(--text-soft)]">
              <li>Next.js App Router</li>
              <li>MongoDB and Mongoose</li>
              <li>JWT with HTTP-only cookies</li>
              <li>Socket.IO messaging</li>
              <li>Tailwind CSS design system</li>
            </ul>
          </div>
          <div className="ringo-panel p-6">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--faint)]">
              Product principle
            </p>
            <h2 className="mt-4 text-2xl font-black text-[var(--text)]">
              Ringo should feel powerful before it feels complicated.
            </h2>
            <p className="mt-4 leading-7 text-[var(--muted)]">
              Every surface is intentionally quiet: clean navigation,
              predictable actions, compact controls, and clear hierarchy. The
              result is a communication product that feels premium while still
              being practical enough for daily work.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
