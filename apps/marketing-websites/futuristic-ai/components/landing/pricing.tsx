import { Check, Sparkles } from "lucide-react";
import Link from "next/link";
import BorderGlow from "@/components/border-glow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const tiers = [
  {
    name: "Starter",
    price: "$0",
    cadence: "free for 14 days",
    description: "For builders exploring agentic AI.",
    features: [
      "1 user",
      "1,000 monthly interactions",
      "5 agents",
      "Community support",
      "Standard models",
    ],
    cta: "Start free",
    variant: "secondary" as const,
    highlight: false,
  },
  {
    name: "Professional",
    price: "$77",
    cadence: "per month",
    description: "For teams running production agents.",
    features: [
      "3 users included",
      "50,000 monthly interactions",
      "50 agents",
      "Priority support · 24h",
      "Frontier models (GPT-5, Claude 4.7)",
      "Custom integrations",
      "Advanced analytics",
    ],
    cta: "Start free trial",
    variant: "default" as const,
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    cadence: "annual contract",
    description: "For mission-critical deployments.",
    features: [
      "Unlimited users",
      "Unlimited interactions",
      "Unlimited agents",
      "Dedicated success engineer",
      "SOC 2, HIPAA, GDPR",
      "On-prem & VPC deployment",
      "99.99% uptime SLA",
    ],
    cta: "Contact sales",
    variant: "secondary" as const,
    highlight: false,
  },
];

export function Pricing() {
  return (
    <section className="relative py-24 md:py-32" id="pricing">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <Badge variant="emerald">Pricing</Badge>
          <h2 className="mt-5 font-display font-semibold text-4xl text-gradient tracking-tight md:text-5xl">
            Simple, transparent pricing.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            Pay only for what you use. Scale up or down anytime. No hidden fees,
            no annual lock-in (unless you want it).
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {tiers.map((tier) => (
            <BorderGlow
              backgroundColor={tier.highlight ? "#0a1228" : "#080a18"}
              borderRadius={16}
              colors={
                tier.highlight
                  ? ["#3b82f6", "#22d3ee", "#60a5fa"]
                  : ["#3b82f6", "#22d3ee", "#38bdf8"]
              }
              coneSpread={25}
              edgeSensitivity={30}
              glowColor="210 80 60"
              glowIntensity={tier.highlight ? 1 : 0.7}
              glowRadius={tier.highlight ? 40 : 30}
              key={tier.name}
            >
              <div className="relative h-full p-8">
                {tier.highlight && (
                  <div className="absolute -top-3 right-6">
                    <Badge variant="blue">
                      <Sparkles className="size-3" />
                      Most popular
                    </Badge>
                  </div>
                )}

                <div className="font-medium text-muted-foreground text-sm uppercase tracking-wider">
                  {tier.name}
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="font-display font-semibold text-5xl text-foreground">
                    {tier.price}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {tier.cadence}
                  </span>
                </div>
                <p className="mt-3 text-muted-foreground text-sm">
                  {tier.description}
                </p>

                <Link className="mt-6 block" href="#signup">
                  <Button className="w-full" size="lg" variant={tier.variant}>
                    {tier.cta}
                  </Button>
                </Link>

                <ul className="mt-8 space-y-3 border-white/[0.06] border-t pt-6">
                  {tier.features.map((feature) => (
                    <li
                      className="flex items-start gap-3 text-sm"
                      key={feature}
                    >
                      <span
                        aria-hidden="true"
                        className="mt-0.5 grid size-4.5 shrink-0 place-items-center rounded-full bg-blue-500/20"
                      >
                        <Check
                          className="size-3 text-blue-200"
                          strokeWidth={3}
                        />
                      </span>
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </BorderGlow>
          ))}
        </div>
      </div>
    </section>
  );
}
