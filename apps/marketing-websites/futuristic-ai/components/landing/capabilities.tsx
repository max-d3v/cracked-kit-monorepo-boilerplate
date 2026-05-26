import { Brain, Network, Settings2, Workflow } from "lucide-react";
import BorderGlow from "@/components/border-glow";
import { Badge } from "@/components/ui/badge";

const capabilities = [
  {
    icon: Workflow,
    title: "Design intelligent agents",
    description:
      "Composable workflows with a visual builder. Drag, drop, ship — no infrastructure required.",
  },
  {
    icon: Brain,
    title: "Advanced reasoning",
    description:
      "Plug in any frontier model. Fine-tune behavior with prompts, tools, and guardrails.",
  },
  {
    icon: Settings2,
    title: "Autonomous decisions",
    description:
      "Goal-oriented agents that plan, retry, and self-correct. You set the outcome.",
  },
  {
    icon: Network,
    title: "Universal integrations",
    description:
      "Connect to any data source or API. 80+ pre-built connectors, custom tools in minutes.",
  },
];

export function Capabilities() {
  return (
    <section className="relative py-24 md:py-32" id="capabilities">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <Badge variant="blue">Platform</Badge>
          <h2 className="mt-5 font-display font-semibold text-4xl text-gradient tracking-tight md:text-5xl">
            The complete agent stack
          </h2>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            Everything you need to design, deploy, and scale AI agents in
            production — without stitching together a dozen libraries.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {capabilities.map((cap) => {
            const Icon = cap.icon;
            return (
              <BorderGlow
                backgroundColor="#080a18"
                borderRadius={16}
                colors={["#3b82f6", "#22d3ee", "#38bdf8"]}
                coneSpread={25}
                edgeSensitivity={30}
                glowColor="210 80 60"
                glowIntensity={0.8}
                glowRadius={30}
                key={cap.title}
              >
                <div className="group p-8">
                  <div className="relative mb-5 inline-flex">
                    <span className="absolute inset-0 rounded-lg bg-blue-500/20 opacity-0 blur-xl transition-opacity group-hover:opacity-100" />
                    <span className="relative grid size-11 place-items-center rounded-lg border border-white/[0.08] bg-gradient-to-br from-blue-500/15 to-cyan-500/10">
                      <Icon
                        className="size-5 text-blue-200"
                        strokeWidth={1.5}
                      />
                    </span>
                  </div>
                  <h3 className="mb-2 font-display font-medium text-base text-foreground">
                    {cap.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {cap.description}
                  </p>
                </div>
              </BorderGlow>
            );
          })}
        </div>
      </div>
    </section>
  );
}
