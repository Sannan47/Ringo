export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto w-full max-w-4xl space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
            About Ringo
          </p>
          <h1 className="mt-3 text-4xl font-semibold">Built for focused teams.</h1>
        </div>
        <p className="text-base leading-relaxed text-slate-300">
          Ringo is a Discord-inspired collaboration platform created for
          university teams and fast-moving groups. It combines real-time chat,
          role-based access control, and server ownership to keep conversations
          structured and secure.
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-lg font-semibold">Tech Stack</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              <li>Next.js App Router</li>
              <li>MongoDB + Mongoose</li>
              <li>JWT + HTTP-only cookies</li>
              <li>Socket.IO real-time messaging</li>
              <li>Tailwind CSS UI system</li>
            </ul>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-lg font-semibold">Project Focus</h2>
            <p className="mt-3 text-sm text-slate-300">
              This project emphasizes secure authentication, role-based access,
              server ownership, and a production-ready collaboration workflow
              for team communication.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
