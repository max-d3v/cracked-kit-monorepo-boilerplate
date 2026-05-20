"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star } from "@/components/ui/star";

export function CTA() {
  return (
    <section className="relative overflow-hidden border-black border-b-2 bg-main py-24">
      <div className="absolute -top-12 -left-12 text-accent-pink opacity-90">
        <Star className="rotate-12" size={160} />
      </div>
      <div className="absolute -right-16 -bottom-16 text-accent-blue opacity-90">
        <Star className="-rotate-12" size={200} />
      </div>

      <div className="relative mx-auto max-w-3xl px-4 text-center">
        <h2 className="font-display text-5xl tracking-tighter sm:text-6xl md:text-7xl">
          Ship the loudest
          <br />
          <span className="bg-black px-3 text-white">site of your life.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl font-medium text-lg md:text-xl">
          Drop your email. We'll send the starter kit and a single welcome
          email. No drips, no funnels, no nonsense.
        </p>

        <form
          className="mx-auto mt-10 flex max-w-md flex-col gap-3 sm:flex-row"
          onSubmit={(e) => e.preventDefault()}
        >
          <Input
            aria-label="Email address"
            placeholder="you@example.com"
            required
            type="email"
          />
          <Button type="submit" variant="dark">
            Send it
            <ArrowRight />
          </Button>
        </form>

        <p className="mt-4 text-muted-foreground text-sm">
          Free forever. Unsubscribe in one click.
        </p>
      </div>
    </section>
  );
}
