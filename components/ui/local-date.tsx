"use client";

export function LocalDate({
  date,
  showTime = false,
  fallback = "Soon",
}: {
  date: string | Date | null | undefined;
  showTime?: boolean;
  fallback?: string;
}) {
  if (!date) return <span className="text-gate-800/30 italic">{fallback}</span>;
  const d = new Date(date);
  if (isNaN(d.getTime())) return <span className="text-gate-800/30 italic">{fallback}</span>;
  const formatted = showTime
    ? d.toLocaleString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : d.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
  return <>{formatted}</>;
}
