import { Quote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    quote:
      "Finally, a UI kit that doesn't look like every other Stripe-rip-off SaaS. Our conversion jumped 22% after switching.",
    author: "Mira K.",
    role: "Founder, Tinytool",
    accent: "bg-accent-pink",
    rotation: "-rotate-1",
  },
  {
    quote:
      "I shipped my whole marketing site in a weekend. The components are sharp, the docs are honest. 10/10.",
    author: "Devon R.",
    role: "Indie hacker",
    accent: "bg-accent-lime",
    rotation: "rotate-1",
  },
  {
    quote:
      "Stopped paying for three different design systems. This one kit covers everything our team needs.",
    author: "Priya N.",
    role: "Design Lead, Mosaic",
    accent: "bg-accent-blue",
    rotation: "-rotate-1",
  },
];

export function Testimonials() {
  return (
    <section className="border-black border-b-2 bg-secondary-background py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-16 flex flex-col items-center text-center">
          <Badge variant="purple">TESTIMONIALS</Badge>
          <h2 className="mt-4 max-w-3xl font-display text-4xl tracking-tighter sm:text-5xl md:text-6xl">
            Real people. Real ship.
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((t) => (
            <Card className={t.rotation} key={t.author}>
              <CardContent className="space-y-6 p-6 pt-6">
                <div
                  className={`grid size-12 place-items-center rounded-md border-2 border-black shadow-brutal-sm ${t.accent}`}
                >
                  <Quote className="size-6" />
                </div>
                <p className="font-medium text-lg leading-relaxed">
                  "{t.quote}"
                </p>
                <div className="border-black border-t-2 pt-4">
                  <div className="font-black font-display text-lg">
                    {t.author}
                  </div>
                  <div className="text-muted-foreground text-sm">{t.role}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
