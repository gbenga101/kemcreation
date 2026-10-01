import { CircleCheck, CircleDashed, CircleX, Clock3, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type AppointmentStatus = "pending" | "confirmed" | "reschedule requested" | "rescheduled" | "completed" | "cancelled" | "no-show";

const statusMeta: Record<AppointmentStatus, { label: string; icon: LucideIcon; color: string }> = {
  pending: { label: "Pending", icon: CircleDashed, color: "text-status-pending" },
  confirmed: { label: "Confirmed", icon: CircleCheck, color: "text-status-confirmed" },
  "reschedule requested": { label: "Reschedule requested", icon: Clock3, color: "text-status-pending" },
  rescheduled: { label: "Rescheduled", icon: Clock3, color: "text-status-confirmed" },
  completed: { label: "Completed", icon: CircleCheck, color: "text-status-confirmed" },
  cancelled: { label: "Cancelled", icon: CircleX, color: "text-status-cancelled" },
  "no-show": { label: "No-show", icon: CircleX, color: "text-status-cancelled" },
};

export function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  const { label, icon: Icon, color } = statusMeta[status];
  return <span className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground"><Icon aria-hidden="true" className={cn("size-3.5", color)} />{label}</span>;
}
