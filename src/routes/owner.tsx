import { createFileRoute } from "@tanstack/react-router";
import { OwnerShell } from "@/components/owner-shell";
export const Route = createFileRoute("/owner")({ component: OwnerShell });
