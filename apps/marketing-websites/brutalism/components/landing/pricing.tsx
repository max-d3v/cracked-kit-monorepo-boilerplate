import { Check } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const tiers = [
  {
    name: "Hobby",
    price: "$0",
    cadence: "forever",
    description: "Personal projects and side hustles.",
    features: [
      "Core component library",
      "Light + dark themes",
      "Community Discord",
      "MIT license",
    ],
    cta: "Get started",
    variant: "neutral" as const,
    highlight: false,
  },
  {
    name: "Studio",
    price: "$29",
    cadence: "per month",
    description: "For freelancers shipping client work.",
    features: [
      "Everything in Hobby",
      "Premium templates",
      "Figma source files",
      "Email support",
      "Commercial use",
    ],
    cta: "Start free trial",
    variant: "default" as const,
    highlight: true,
  },
  {
    name: "Agency",
    price: "$99",
    cadence: "per month",
    description: "Teams shipping at scale.",
    features: [
      "Everything in Studio",
      "Custom palettes",
      "Priority support",
      "5 team seats",
      "White-label rights",
    ],
    cta: "Talk to sales",
    variant: "dark" as const,
    highlight: false,
  },
];

export function Pricing() {
  return (
    <section
      className="border-black border-b-2 bg-background py-24"
      id="pricing"
    >
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-16 flex flex-col items-center text-center">
          <Badge variant="blue">PRICING</Badge>
          <h2 className="mt-4 max-w-3xl font-display text-4xl tracking-tighter sm:text-5xl md:text-6xl">
            Pay once. Or don't.
            <br />
            <span className="bg-accent-pink px-2">Your call.</span>
          </h2>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Transparent pricing. No "contact us for a quote." No usage tiers
            engineered to confuse procurement.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {tiers.map((tier) => (
            <Card
              className={
                tier.highlight
                  ? "relative bg-main shadow-brutal-lg lg:-translate-y-2"
                  : "relative"
              }
              key={tier.name}
            >
              {tier.highlight && (
                <div className="absolute -top-4 right-6">
                  <Badge variant="dark">Most Popular</Badge>
                </div>
              )}
              <CardHeader>
                <div className="font-bold font-mono text-sm uppercase">
                  {tier.name}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-5xl">{tier.price}</span>
                  <span className="text-muted-foreground text-sm">
                    {tier.cadence}
                  </span>
                </div>
                <p className="text-muted-foreground">{tier.description}</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {tier.features.map((feature) => (
                    <li className="flex items-start gap-3" key={feature}>
                      <span
                        aria-hidden="true"
                        className="mt-0.5 grid size-5 shrink-0 place-items-center rounded border-2 border-black bg-white"
                      >
                        <Check className="size-3" strokeWidth={3} />
                      </span>
                      <span className="font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link className="block" href="#signup">
                  <Button className="w-full" size="lg" variant={tier.variant}>
                    {tier.cta}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
