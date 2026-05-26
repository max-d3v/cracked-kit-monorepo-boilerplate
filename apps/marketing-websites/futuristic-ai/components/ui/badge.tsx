import { cn } from "@workspace/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-medium text-xs transition-colors",
  {
    variants: {
      variant: {
        default: "border-white/10 bg-white/5 text-foreground backdrop-blur-sm",
        blue: "border-blue-400/30 bg-blue-500/10 text-blue-200",
        cyan: "border-cyan-400/30 bg-cyan-500/10 text-cyan-200",
        sky: "border-sky-400/30 bg-sky-500/10 text-sky-200",
        emerald: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
        outline: "border-white/15 bg-transparent text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

type BadgeProps = React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants>;

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant, className }))}
      data-slot="badge"
      {...props}
    />
  );
}

export { Badge, badgeVariants };
