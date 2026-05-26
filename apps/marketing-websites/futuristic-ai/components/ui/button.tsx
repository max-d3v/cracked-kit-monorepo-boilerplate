import { cn } from "@workspace/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "relative bg-gradient-to-b from-blue-500 to-blue-700 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_8px_24px_-8px_rgba(59,130,246,0.6)] hover:from-blue-400 hover:to-blue-600 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_10px_28px_-6px_rgba(59,130,246,0.7)]",
        secondary:
          "border border-white/10 bg-white/5 text-foreground backdrop-blur hover:border-white/20 hover:bg-white/10",
        outline:
          "border border-white/10 bg-transparent text-foreground hover:border-white/20 hover:bg-white/[0.04]",
        ghost: "text-muted-foreground hover:bg-white/5 hover:text-foreground",
        light:
          "bg-white text-black shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_8px_24px_-8px_rgba(255,255,255,0.4)] hover:bg-white/90",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        default: "h-10 px-5",
        lg: "h-12 px-7 text-base",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants>;

function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      data-slot="button"
      {...props}
    />
  );
}

export { Button, buttonVariants };
