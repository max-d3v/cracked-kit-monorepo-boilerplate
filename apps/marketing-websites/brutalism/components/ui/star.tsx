import { cn } from "@workspace/ui/lib/utils";
import type * as React from "react";

type StarProps = React.SVGProps<SVGSVGElement> & {
  size?: number;
};

function Star({ size = 64, className, ...props }: StarProps) {
  return (
    <svg
      aria-hidden="true"
      className={cn(className)}
      height={size}
      viewBox="0 0 200 200"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>Star</title>
      <path
        d="M100 0 L120 70 L195 75 L135 120 L160 195 L100 150 L40 195 L65 120 L5 75 L80 70 Z"
        fill="currentColor"
        stroke="black"
        strokeLinejoin="round"
        strokeWidth="6"
      />
    </svg>
  );
}

export { Star };
