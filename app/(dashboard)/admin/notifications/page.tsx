import { requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import { notifications, cycles } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { NotificationForm } from "./notification-form";

export default async function NotificationsPage() {
  await requireRole(["super_admin", "admin"]);

  const [allNotifications, allCycles] = await Promise.all([
    db.query.notifications.findMany({
      orderBy: desc(notifications.sentAt),
      with: { sentBy: true, cycle: true },
    }),
    db.query.cycles.findMany({ orderBy: desc(cycles.year) }),
  ]);

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
          Admin
        </span>
        <h1 className="font-serif text-4xl font-light text-foreground">Notifications</h1>
        <p className="text-sm font-light text-foreground/60 mt-1">
          Send email notifications to registered users
        </p>
      </div>

      <NotificationForm cycles={allCycles} />

      {/* Sent history */}
      <div className="flex flex-col gap-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-foreground">
          Sent History
        </h2>

        {allNotifications.length === 0 ? (
          <p className="text-sm font-light text-foreground/40">No notifications sent yet.</p>
        ) : (
          <div className="flex flex-col gap-0 border border-border bg-card divide-y divide-border">
            <div className="grid grid-cols-[3fr_1.5fr_1fr_1fr_120px] gap-4 px-5 py-3 bg-muted/30">
              {["Subject", "Recipients", "Count", "Sent By", "Date"].map((h) => (
                <span
                  key={h}
                  className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/50"
                >
                  {h}
                </span>
              ))}
            </div>
            {allNotifications.map((n) => (
              <div
                key={n.id}
                className="grid grid-cols-[3fr_1.5fr_1fr_1fr_120px] gap-4 px-5 py-4 items-center"
              >
                <p className="text-sm font-light text-foreground truncate">{n.subject}</p>
                <p className="text-xs font-light text-foreground/60 truncate">
                  {n.cycleId ? (n.cycle?.name ?? `Cycle #${n.cycleId}`) : "All users"}
                </p>
                <p className="text-sm font-light text-foreground">{n.recipientCount}</p>
                <p className="text-xs font-light text-foreground/55 truncate">
                  {n.sentBy?.name ?? "—"}
                </p>
                <p className="text-[11px] font-light text-foreground/50">
                  {new Date(n.sentAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
