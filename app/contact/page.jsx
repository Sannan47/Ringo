export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
            Contact
          </p>
          <h1 className="mt-3 text-4xl font-semibold">Let us know how we can help.</h1>
          <p className="mt-3 text-sm text-slate-300">
            Send a message and we will follow up with you.
          </p>
        </div>
        <form className="space-y-5 rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
          <div>
            <label className="text-sm font-medium text-slate-200" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@ringo.dev"
              className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-200" htmlFor="message">
              Message
            </label>
            <textarea
              id="message"
              rows={5}
              placeholder="Share your question or feedback"
              className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-400"
          >
            Send message
          </button>
        </form>
      </div>
    </div>
  );
}
