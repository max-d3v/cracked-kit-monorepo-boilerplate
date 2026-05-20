import {
  Bolt,
  Boxes,
  LayoutGrid,
  Palette,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  {
    icon: Zap,
    title: "Stupid Fast",
    description:
      "Turbopack-powered dev, edge-ready builds. Page loads measured in milliseconds, not seconds.",
    accent: "bg-accent-lime",
  },
  {
    icon: Palette,
    title: "Loud By Default",
    description:
      "Thick black borders, hard offset shadows, vibrant fills. No more shy gradients.",
    accent: "bg-accent-pink",
  },
  {
    icon: Boxes,
    title: "Drop-in Components",
    description:
      "20+ neobrutalism primitives — buttons, cards, badges, marquees. Copy, paste, ship.",
    accent: "bg-accent-blue",
  },
  {
    icon: ShieldCheck,
    title: "Type-Safe",
    description:
      "End-to-end TypeScript. Strict null checks. The compiler is your friend, not your enemy.",
    accent: "bg-accent-purple",
  },
  {
    icon: LayoutGrid,
    title: "Composable",
    description:
      "Built on Tailwind v4 design tokens. Swap palettes, shadows, and radii in seconds.",
    accent: "bg-main",
  },
  {
    icon: Bolt,
    title: "Production-Ready",
    description:
      "SEO metadata, accessibility, dark mode hooks. Skip the boilerplate and ship the idea.",
    accent: "bg-accent-red",
  },
];

export function Features() {
  return (
    <section
      className="border-black border-b-2 bg-secondary-background py-24"
      id="features"
    >
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-16 flex flex-col items-center text-center">
          <Badge variant="pink">FEATURES</Badge>
          <h2 className="mt-4 max-w-3xl font-display text-4xl tracking-tighter sm:text-5xl md:text-6xl">
            Everything you need.
            <br />
            <span className="bg-accent-lime px-2">Nothing you don't.</span>
          </h2>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            We threw out the playbook on gradient hero blobs and friendly
            mascots. What's left is a kit that gets out of your way.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title}>
                <CardHeader>
                  <div
                    className={`grid size-14 place-items-center rounded-md border-2 border-black shadow-brutal-sm ${feature.accent}`}
                  >
                    <Icon className="size-7" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="font-bold font-mono text-sm">
                    {"→"} learn more
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
