import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type DbStatus = "pending" | "confirmed" | "reschedule_requested" | "rescheduled" | "completed" | "cancelled" | "no_show";
export type OwnerAppointment = {
  id: string; reference: string; service_type: string; appointment_date: string; appointment_time: string;
  occasion: string | null; event_date: string | null; notes: string | null; status: DbStatus; created_at: string; production_stage: string;
  follow_up_status: FollowUp; follow_up_notes: string | null;
  customers: { full_name: string; phone: string; email: string | null } | null;
};
export type FollowUp = "none" | "follow_up_due" | "waiting_client" | "completed";
export const FOLLOW_UPS: { id: FollowUp; label: string }[] = [
  { id: "none", label: "No follow-up needed" },
  { id: "follow_up_due", label: "Follow-up due" },
  { id: "waiting_client", label: "Waiting on client / fabric" },
  { id: "completed", label: "Follow-up done" },
];
export const needsFollowUp = (a: OwnerAppointment) => a.follow_up_status === "follow_up_due" || a.follow_up_status === "waiting_client";

export const badgeStatus = (s: DbStatus) =>
  (({ reschedule_requested: "reschedule requested", no_show: "no-show" }) as Record<string, string>)[s] ?? s;

export function useAppointments() {
  return useQuery({
    queryKey: ["owner", "appointments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("id, reference, service_type, appointment_date, appointment_time, occasion, event_date, notes, status, created_at, production_stage, follow_up_status, follow_up_notes, customers(full_name, phone, email)")
        .order("appointment_date").order("appointment_time");
      if (error) throw error;
      return data as unknown as OwnerAppointment[];
    },
  });
}

export function useSetStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: DbStatus }) => {
      const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["owner"] }),
  });
}

export function useSetFollowUp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: { id: string; follow_up_status?: FollowUp; follow_up_notes?: string | null }) => {
      const { error } = await supabase.from("appointments").update(patch as never).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["owner"] }),
  });
}

export function useSetStage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, stage }: { id: string; stage: string }) => {
      const { error } = await supabase.from("appointments").update({ production_stage: stage } as never).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["owner"] }),
  });
}

export const lagosToday = () => new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Lagos" });
export const addDaysISO = (iso: string, n: number) => { const d = new Date(`${iso}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
export const prettyDate = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

export function whatsappLink(phone: string) {
  const digits = phone.replace(/\D/g, "");
  const intl = digits.startsWith("0") ? `234${digits.slice(1)}` : digits;
  return `https://wa.me/${intl}`;
}
