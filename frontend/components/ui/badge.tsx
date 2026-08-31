import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-bold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-slate-100 text-slate-800 border-slate-200",
        critical: "bg-red-100 text-red-800 border-red-200",
        high: "bg-amber-100 text-amber-800 border-amber-200",
        medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
        low: "bg-emerald-100 text-emerald-800 border-emerald-200",
        outline: "border-slate-300 text-slate-700 bg-transparent",
        destructive: "bg-red-600 text-white border-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

/** Helper: maps risk level string → badge variant */
export function getRiskVariant(
  level: string
): "critical" | "high" | "medium" | "low" | "default" {
  switch (level?.toUpperCase()) {
    case "CRITICAL":
      return "critical";
    case "HIGH":
      return "high";
    case "MEDIUM":
      return "medium";
    case "LOW":
      return "low";
    default:
      return "default";
  }
}
