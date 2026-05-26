import { cn } from "@workspace/ui/lib/utils";
import type * as React from "react";

type MarqueeProps = React.ComponentProps<"div"> & {
  children: React.ReactNode;
};

function Marquee({ children, className, ...props }: MarqueeProps) {
  return (
    <div
      className={cn(
        "group relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]",
        className
      )}
      data-slot="marquee"
      {...props}
    >
      <div className="flex shrink-0 animate-marquee items-center gap-16 pr-16">
        {children}
        {children}
      </div>
    </div>
  );
}

export { Marquee };
