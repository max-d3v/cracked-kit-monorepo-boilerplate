import { cn } from "@workspace/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border-2 border-black font-bold text-base shadow-brutal transition-all duration-150 ease-in-out hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 active:translate-x-[4px] active:translate-y-[4px] active:shadow-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-main text-main-foreground",
        secondary: "bg-secondary-background text-secondary-foreground",
        pink: "bg-accent-pink text-black",
        lime: "bg-accent-lime text-black",
        blue: "bg-accent-blue text-black",
        purple: "bg-accent-purple text-black",
        red: "bg-accent-red text-black",
        outline: "bg-transparent text-foreground",
        neutral: "bg-white text-black",
        dark: "bg-black text-white",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        default: "h-11 px-5",
        lg: "h-14 px-7 text-lg",
        icon: "size-11",
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
