"use client";

import dynamic from "next/dynamic";

const LightRays = dynamic(() => import("@/components/light-rays"), {
  ssr: false,
});

export function HeroBg() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <LightRays
        className="h-full w-full"
        distortion={0}
        fadeDistance={1}
        followMouse
        lightSpread={0.5}
        mouseInfluence={0.1}
        noiseAmount={0}
        pulsating={false}
        rayLength={3}
        raysColor="#3b82f6"
        raysOrigin="top-center"
        raysSpeed={1}
        saturation={1}
      />
    </div>
  );
}
