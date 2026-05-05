export default function DashboardPage() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Welcome to Ringo</h1>
        <p className="mt-2 text-sm text-slate-400">
          Your workspace is protected. Use the navigation above to explore.
        </p>
      </div>
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="text-lg font-semibold">Session status</h2>
        <p className="mt-2 text-sm text-slate-400">
          You are logged in and viewing a protected route.
        </p>
      </div>
    </section>
  );
}
