"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, GraduationCap, Calendar, BookOpen,
  CreditCard, Bell, Handshake, Briefcase, FileText, BarChart3,
  Settings2, User, Award, Trophy, FolderOpen, Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  "/admin": LayoutDashboard,
  "/admin/users": Users,
  "/admin/participants": GraduationCap,
  "/admin/cycles": Calendar,
  "/admin/subjects": BookOpen,
  "/admin/payments": CreditCard,
  "/admin/notifications": Bell,
  "/admin/partners": Handshake,
  "/admin/careers": Briefcase,
  "/admin/content": FileText,
  "/admin/analytics": BarChart3,
  "/admin/settings": Settings2,
  "/admin/results": Award,
  "/admin/certificates": Trophy,
  "/admin/inquiries": Shield,
  "/coordinator": LayoutDashboard,
  "/coordinator/participants": GraduationCap,
  "/coordinator/reports": BarChart3,
  "/partner": LayoutDashboard,
  "/partner/profile": Handshake,
  "/partner/status": FileText,
  "/participant": LayoutDashboard,
  "/participant/profile": User,
  "/participant/enrollment": BookOpen,
  "/participant/enrollments": GraduationCap,
  "/participant/exams": FileText,
  "/participant/results": Award,
  "/participant/certificates": Trophy,
  "/participant/documents": FolderOpen,
};

interface NavLink {
  href: string;
  label: string;
}

export function DashboardSidebar({ links }: { links: NavLink[] }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || (href.length > 1 && pathname.startsWith(href + "/"));

  return (
    <nav className="flex flex-col gap-1 p-3 flex-1 overflow-y-auto">
      {links.map((link) => {
        const Icon = ICON_MAP[link.href];
        const active = isActive(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-semibold uppercase tracking-[0.18em] transition-all duration-200",
              active
                ? "bg-gate-gold/12 text-gate-gold dark:bg-gate-gold/15"
                : "text-foreground/50 hover:text-foreground hover:bg-muted/60",
            )}
          >
            {Icon && (
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  active ? "text-gate-gold" : "text-foreground/40",
                )}
              />
            )}
            <span className="truncate">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
