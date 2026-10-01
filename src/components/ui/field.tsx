import { type ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type FieldProps = { id: string; label: string; hint?: string; error?: string; required?: boolean };

function FieldFrame({ id, label, hint, error, required, children }: FieldProps & { children: ReactNode }) {
  return <div className="space-y-2"><Label htmlFor={id} className="text-sm font-medium">{label}{required && <span className="ml-1 text-destructive" aria-hidden="true">*</span>}</Label>{children}{hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}{error && <p id={`${id}-error`} role="alert" className="text-xs text-destructive">{error}</p>}</div>;
}
export function TextField({ id, label, hint, error, required, ...props }: FieldProps & Omit<React.ComponentProps<typeof Input>, "id" | "required">) {
  return <FieldFrame {...{ id, label, hint, error, required }}><Input id={id} required={required} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} {...props} /></FieldFrame>;
}
export function LongTextField({ id, label, hint, error, required, ...props }: FieldProps & Omit<React.ComponentProps<typeof Textarea>, "id" | "required">) {
  return <FieldFrame {...{ id, label, hint, error, required }}><Textarea id={id} required={required} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} {...props} /></FieldFrame>;
}
