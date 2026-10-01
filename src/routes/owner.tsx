import { createFileRoute, redirect } from "@tanstack/react-router";
import { OwnerShell } from "@/components/owner-shell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/owner")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/owner/login" });
    const { data: isOwner } = await supabase.rpc("has_role", { _user_id: data.user.id, _role: "owner" });
    if (!isOwner) throw redirect({ to: "/owner/login" });
    return { user: data.user };
  },
  component: OwnerShell,
});
