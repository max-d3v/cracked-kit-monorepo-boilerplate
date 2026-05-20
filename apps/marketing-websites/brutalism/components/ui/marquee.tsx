import { cn } from "@workspace/ui/lib/utils";
import type * as React from "react";

type MarqueeProps = React.ComponentProps<"div"> & {
  children: React.ReactNode;
};

function Marquee({ children, className, ...props }: MarqueeProps) {
  return (
    <div
      className={cn("relative flex overflow-hidden", className)}
      data-slot="marquee"
      {...props}
    >
      <div className="flex shrink-0 animate-marquee items-center gap-12 pr-12">
        {children}
        {children}
      </div>
    </div>
  );
}

export { Marquee };
