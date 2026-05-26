"use client";

import { cn } from "@workspace/ui/lib/utils";
import { type MotionStyle, motion, type Transition } from "motion/react";

interface BorderBeamProps {
  borderWidth?: number;
  className?: string;
  colorFrom?: string;
  colorTo?: string;
  delay?: number;
  duration?: number;
  initialOffset?: number;
  reverse?: boolean;
  size?: number;
  style?: React.CSSProperties;
  transition?: Transition;
}

export const BorderBeam = ({
  className,
  size = 50,
  delay = 0,
  duration = 6,
  colorFrom = "#ffaa40",
  colorTo = "#9c40ff",
  transition,
  style,
  reverse = false,
  initialOffset = 0,
  borderWidth = 1,
}: BorderBeamProps) => {
  return (
    <div
      className="pointer-events-none absolute inset-0 rounded-[inherit]"
      style={{
        borderWidth: `${borderWidth}px`,
        borderStyle: "solid",
        borderColor: "transparent",
        WebkitMask:
          "linear-gradient(transparent, transparent) padding-box, linear-gradient(#000, #000) border-box",
        mask: "linear-gradient(transparent, transparent) padding-box, linear-gradient(#000, #000) border-box",
        WebkitMaskComposite: "xor",
        maskComposite: "exclude",
      }}
    >
      <motion.div
        animate={{
          offsetDistance: reverse
            ? [`${100 - initialOffset}%`, `${-initialOffset}%`]
            : [`${initialOffset}%`, `${100 + initialOffset}%`],
        }}
        className={cn("absolute aspect-square", className)}
        initial={{ offsetDistance: `${initialOffset}%` }}
        style={
          {
            width: size,
            offsetPath: `rect(0 auto auto 0 round ${size}px)`,
            background: `linear-gradient(to left, ${colorFrom}, ${colorTo}, transparent)`,
            ...style,
          } as MotionStyle
        }
        transition={{
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
          duration,
          delay: -delay,
          ...transition,
        }}
      />
    </div>
  );
};
