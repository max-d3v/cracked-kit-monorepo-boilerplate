import { Quote } from "lucide-react";

export function Testimonial() {
  return (
    <section className="relative overflow-hidden border-white/[0.04] border-y bg-[#08071a] py-24 md:py-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-[120px]"
      />

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <Quote
          className="mx-auto size-10 text-blue-300/60"
          strokeWidth={1.25}
        />
        <blockquote className="mt-8 font-display font-medium text-3xl text-gradient leading-[1.2] tracking-tight md:text-5xl">
          "We replaced a 12-person ops team with three Nova agents. They never
          sleep, never miss a ticket, and our customers love them more."
        </blockquote>

        <div className="mt-10 flex items-center justify-center gap-4">
          <span className="grid size-12 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 font-display font-semibold text-base text-white">
            MJ
          </span>
          <div className="text-left">
            <div className="font-medium text-foreground text-sm">
              Martin Jerkovic
            </div>
            <div className="text-muted-foreground text-xs">
              Head of Product, Linear
            </div>
          </div>
          <div className="ml-4 h-8 w-px bg-white/[0.08]" />
          <div className="font-display font-medium text-muted-foreground text-sm tracking-widest">
            LINEAR
          </div>
        </div>
      </div>
    </section>
  );
}
