export default function ContactPage() {
  return (
    <main className="ringo-page">
      <section className="ringo-container grid gap-10 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:py-20">
        <div className="space-y-5 fade-in-up">
          <div className="eyebrow">Contact</div>
          <h1 className="text-4xl font-black tracking-tight text-[var(--text)] sm:text-5xl">
            Tell us what your workspace needs next.
          </h1>
          <p className="max-w-xl text-lg leading-8 text-[var(--muted)]">
            Questions, feedback, and product ideas are welcome. Send a note and
            the Ringo team will follow up.
          </p>
          <div className="grid max-w-md gap-3 text-sm">
            <div className="ringo-panel flex items-center gap-3 p-4">
              <span className="status-pill">Email</span>
              <a
                href="mailto:hello@ringo.app"
                className="font-semibold text-[var(--text)]"
              >
                hello@ringo.app
              </a>
            </div>
            <div className="ringo-panel flex items-center gap-3 p-4">
              <span className="status-pill">Support</span>
              <span className="font-semibold text-[var(--text)]">
                Weekdays, 9:00 to 18:00
              </span>
            </div>
          </div>
        </div>

        <form className="ringo-panel space-y-5 p-6 fade-in-up fade-in-up-delay-1">
          <div>
            <label className="text-sm font-bold text-[var(--text)]" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@ringo.dev"
              className="field mt-2"
            />
          </div>
          <div>
            <label
              className="text-sm font-bold text-[var(--text)]"
              htmlFor="message"
            >
              Message
            </label>
            <textarea
              id="message"
              rows={6}
              placeholder="Share your question or feedback"
              className="field mt-2 resize-none"
            />
          </div>
          <button type="submit" className="btn-primary text-sm">
            Send message
          </button>
        </form>
      </section>
    </main>
  );
}
