export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6 max-w-5xl animate-pulse">
      <div className="flex flex-col gap-2">
        <div className="h-3 w-24 rounded bg-muted" />
        <div className="h-9 w-64 rounded bg-muted" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-6 flex flex-col gap-3">
            <div className="h-2.5 w-20 rounded bg-muted" />
            <div className="h-8 w-12 rounded bg-muted" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-6 flex flex-col gap-4">
            <div className="h-3 w-32 rounded bg-muted" />
            <div className="h-16 w-full rounded bg-muted" />
            <div className="h-8 w-28 rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}