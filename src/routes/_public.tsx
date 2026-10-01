import { createFileRoute } from "@tanstack/react-router";
import { PublicShell } from "@/components/public-shell";
export const Route = createFileRoute("/_public")({ component: PublicShell });
