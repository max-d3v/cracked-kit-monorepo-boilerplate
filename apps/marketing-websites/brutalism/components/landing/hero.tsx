import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star } from "@/components/ui/star";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-black border-b-2 bg-grid">
      <div className="absolute -top-10 -left-12 hidden text-accent-pink md:block">
        <Star className="rotate-12" size={120} />
      </div>
      <div className="absolute top-28 right-12 hidden text-accent-lime lg:block">
        <Star className="-rotate-12" size={88} />
      </div>
      <div className="absolute right-32 bottom-20 hidden text-accent-blue md:block">
        <Star className="rotate-45" size={64} />
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-24 md:py-32 lg:grid-cols-2 lg:py-40">
        <div className="flex flex-col justify-center gap-6">
          <Badge className="w-fit" variant="lime">
            <Sparkles className="size-4" />
            v1.0 — Now Shipping
          </Badge>

          <h1 className="font-display text-5xl leading-[1.05] tracking-tighter sm:text-6xl md:text-7xl">
            Build sites that
            <span className="relative ml-2 inline-block">
              <span className="relative z-10 px-2">slap.</span>
              <span
                aria-hidden="true"
                className="absolute inset-0 z-0 block translate-x-1 translate-y-1 bg-accent-pink"
              />
            </span>
          </h1>

          <p className="max-w-xl text-lg text-muted-foreground md:text-xl">
            A no-nonsense neobrutalism starter kit. Thick borders. Hard shadows.
            Loud colors. Zero clichés. Built on Next.js, Tailwind v4, and the{" "}
            <span className="font-bold text-foreground">
              neobrutalism-components
            </span>{" "}
            registry.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link href="#signup">
              <Button size="lg">
                Start Building
                <ArrowRight />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="neutral">
                See Features
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <div className="flex -space-x-2">
              {["pink", "lime", "blue", "purple"].map((color) => (
                <div
                  className="size-9 rounded-full border-2 border-black"
                  key={color}
                  style={{ background: `var(--accent-${color})` }}
                />
              ))}
            </div>
            <p className="font-bold text-sm">
              Loved by 12,000+ devs who hate boring UI.
            </p>
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="relative w-full max-w-md">
            <div className="absolute -top-6 -right-6 z-20 rotate-6">
              <Badge variant="pink">
                <Sparkles className="size-3.5" />
                100% Brutal
              </Badge>
            </div>
            <div className="rotate-2 rounded-md border-2 border-black bg-main p-8 shadow-brutal-lg">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded-full border-2 border-black bg-accent-red" />
                  <div className="size-3 rounded-full border-2 border-black bg-accent-lime" />
                  <div className="size-3 rounded-full border-2 border-black bg-white" />
                </div>
                <div className="space-y-3 rounded-md border-2 border-black bg-white p-4 font-mono text-sm">
                  <div>
                    <span className="text-accent-pink">$</span> npx{" "}
                    <span className="font-bold">create-brutal-app</span>
                  </div>
                  <div className="text-muted-foreground">
                    {"✓"} Installing thick borders...
                  </div>
                  <div className="text-muted-foreground">
                    {"✓"} Casting hard shadows...
                  </div>
                  <div className="text-muted-foreground">
                    {"✓"} Picking loud colors...
                  </div>
                  <div className="font-bold text-foreground">
                    {"→"} Ready. Now go ship something weird.
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded border-2 border-black bg-accent-pink py-3 text-center font-black text-xs">
                    A
                  </div>
                  <div className="rounded border-2 border-black bg-accent-lime py-3 text-center font-black text-xs">
                    B
                  </div>
                  <div className="rounded border-2 border-black bg-accent-blue py-3 text-center font-black text-xs">
                    C
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
