import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_public/my-booking")({
  beforeLoad: ({ search }) => {
    throw redirect({ to: "/manage-booking", search: search as { ref?: string; phone?: string } });
  },
});
