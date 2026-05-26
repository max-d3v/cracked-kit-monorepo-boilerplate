import {
  ArrowUpRight,
  Headphones,
  LineChart,
  Microscope,
  Settings2,
} from "lucide-react";
import BorderGlow from "@/components/border-glow";
import { Badge } from "@/components/ui/badge";

const useCases = [
  {
    icon: Headphones,
    title: "Customer service",
    description:
      "Resolve tickets at superhuman speed with empathy-tuned agents and full conversational memory.",
    metrics: [
      { label: "CSAT score", value: "95%" },
      { label: "Cost reduction", value: "80%" },
    ],
  },
  {
    icon: LineChart,
    title: "Sales & marketing",
    description:
      "Personalize at scale. Agents that qualify leads, write copy, and run multi-channel campaigns autonomously.",
    metrics: [
      { label: "Conversion rate", value: "3×" },
      { label: "Time saved", value: "60%" },
    ],
  },
  {
    icon: Settings2,
    title: "Operations",
    description:
      "Automate document processing, ticket routing, and back-office workflows with auditable agent runs.",
    metrics: [
      { label: "Processing speed", value: "70% ↑" },
      { label: "Accuracy", value: "90%" },
    ],
  },
  {
    icon: Microscope,
    title: "Research & analysis",
    description:
      "Unleash agents on terabytes of unstructured data. Synthesize, summarize, and surface what matters.",
    metrics: [
      { label: "Faster insights", value: "10×" },
      { label: "Source coverage", value: "100%" },
    ],
  },
];

export function UseCases() {
  return (
    <section className="relative py-24 md:py-32" id="solutions">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <Badge variant="sky">Solutions</Badge>
          <h2 className="mt-5 font-display font-semibold text-4xl text-gradient tracking-tight md:text-5xl">
            Transformation, by the numbers.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            Teams across every function are shipping measurable outcomes with
            Nova. Here's what they're seeing.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {useCases.map((useCase) => {
            const Icon = useCase.icon;
            return (
              <BorderGlow
                backgroundColor="#080a18"
                borderRadius={16}
                colors={["#3b82f6", "#22d3ee", "#38bdf8"]}
                coneSpread={25}
                edgeSensitivity={30}
                glowColor="210 80 60"
                glowIntensity={0.8}
                glowRadius={35}
                key={useCase.title}
              >
                <div className="group relative flex h-full flex-col p-8">
                  <div className="flex items-start justify-between">
                    <span className="grid size-11 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.04]">
                      <Icon
                        className="size-5 text-foreground"
                        strokeWidth={1.5}
                      />
                    </span>
                    <ArrowUpRight
                      className="size-5 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground"
                      strokeWidth={1.5}
                    />
                  </div>

                  <h3 className="mt-6 font-display font-medium text-foreground text-xl">
                    {useCase.title}
                  </h3>
                  <p className="mt-3 max-w-md text-muted-foreground text-sm leading-relaxed">
                    {useCase.description}
                  </p>

                  <div className="mt-8 grid grid-cols-2 gap-4 border-white/[0.06] border-t pt-6">
                    {useCase.metrics.map((metric) => (
                      <div key={metric.label}>
                        <div className="font-display font-semibold text-3xl text-gradient-blue">
                          {metric.value}
                        </div>
                        <div className="mt-1 text-muted-foreground text-xs uppercase tracking-wider">
                          {metric.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </BorderGlow>
            );
          })}
        </div>
      </div>
    </section>
  );
}
