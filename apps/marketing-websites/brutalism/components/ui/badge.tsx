import { cn } from "@workspace/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-md border-2 border-black px-3 py-1 font-bold text-sm shadow-brutal-sm",
  {
    variants: {
      variant: {
        default: "bg-main text-main-foreground",
        pink: "bg-accent-pink text-black",
        lime: "bg-accent-lime text-black",
        blue: "bg-accent-blue text-black",
        purple: "bg-accent-purple text-black",
        red: "bg-accent-red text-black",
        white: "bg-white text-black",
        dark: "bg-black text-white",
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
