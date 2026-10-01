import { AlertTriangle, CalendarClock, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const STAGES = [
  { id: "consultation", label: "Consultation" },
  { id: "measurements_taken", label: "Measurements Taken" },
  { id: "in_sewing", label: "Fabric Sourced / In Sewing" },
  { id: "fitting_ready", label: "Fitting Ready" },
  { id: "completed", label: "Completed / Collected" },
] as const;
export type Stage = (typeof STAGES)[number]["id"];
export const stageIndex = (s: string) => Math.max(0, STAGES.findIndex((x) => x.id === s));
export const stageLabel = (s: string) => STAGES[stageIndex(s)]!.label;

export function StageStepper({ stage, className }: { stage: string; className?: string }) {
  const cur = stageIndex(stage);
  return <ol aria-label="Garment progress" className={cn("grid grid-cols-5 gap-1.5", className)}>
    {STAGES.map((s, i) => <li key={s.id} aria-current={i === cur ? "step" : undefined} className="min-w-0">
      <span className={cn("block h-1.5 rounded-full", i <= cur ? "bg-accent" : "bg-border")} />
      <span className={cn("mt-2 flex items-start gap-1 text-[11px] leading-tight", i === cur ? "font-semibold text-foreground" : "text-muted-foreground")}>
        {i < cur && <Check aria-hidden className="mt-px size-3 shrink-0 text-accent" />}{s.label}
        {i === cur && <span className="sr-only"> (current stage)</span>}
      </span>
    </li>)}
  </ol>;
}

export function daysUntil(iso: string, todayIso: string) {
  return Math.round((Date.parse(`${iso}T00:00:00Z`) - Date.parse(`${todayIso}T00:00:00Z`)) / 86400000);
}

export function EventUrgencyBadge({ eventDate, today }: { eventDate: string | null; today: string }) {
  if (!eventDate) return null;
  const d = daysUntil(eventDate, today);
  if (d > 30) return null;
  const base = "inline-flex items-center gap-1.5 rounded-sm px-2 py-1 text-xs font-medium";
  if (d < 0) return <span className={cn(base, "bg-muted text-muted-foreground")}>Event passed</span>;
  const txt = d === 0 ? "Event today" : d === 1 ? "Event tomorrow" : `Event in ${d} days`;
  if (d <= 7) return <span className={cn(base, "bg-accent text-accent-foreground")}><AlertTriangle aria-hidden className="size-3.5" />{txt}</span>;
  return <span className={cn(base, "border border-border bg-surface text-foreground")}><CalendarClock aria-hidden className="size-3.5" />{txt}</span>;
}
