import {
  ArrowRight,
  Bot,
  Cpu,
  Network,
  Play,
  Sparkles,
  Workflow,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HeroBg } from "@/components/ui/hero-bg";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <HeroBg />

      <div className="relative mx-auto max-w-7xl px-6 pt-28 pb-24 md:pt-36 md:pb-32 lg:pt-40">
        <div className="flex flex-col items-center text-center">
          <Link
            className="group relative mb-8 inline-flex items-center gap-2 rounded-full py-1 pr-4 pl-1"
            href="#agents"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/15 px-3 py-0.5 font-medium text-[11px] text-blue-200">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-blue-400" />
              </span>
              NEW
            </span>
            <span className="font-medium text-sm text-white/90">
              Agent orchestration is live
            </span>
            <ArrowRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </Link>

          <h1 className="max-w-4xl text-balance font-display font-semibold text-5xl text-gradient leading-[1.05] tracking-tight sm:text-6xl md:text-7xl lg:text-[88px]">
            Your AI workforce,
            <br />
            <span className="text-gradient-blue">ready for production.</span>
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-balance text-lg text-muted-foreground leading-relaxed md:text-xl">
            Design, deploy, and scale autonomous agents that reason, act, and
            collaborate. Built for teams shipping intelligence at the edge of
            what's possible.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link href="#signup">
              <Button size="lg">
                Start building
                <ArrowRight />
              </Button>
            </Link>
            <Link href="#demo">
              <Button size="lg" variant="secondary">
                <Play className="size-3.5 fill-current" />
                Watch demo
              </Button>
            </Link>
          </div>

          <div className="mt-8 flex items-center gap-6 text-muted-foreground text-xs">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-400" />
              SOC 2 Type II
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-400" />
              99.99% uptime
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-400" />
              Free 14-day trial
            </span>
          </div>
        </div>

        <div className="relative mx-auto mt-20 max-w-5xl">
          <div className="pointer-events-none absolute -top-12 left-1/2 h-24 w-2/3 -translate-x-1/2 bg-blue-500/30 blur-3xl" />

          <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-transparent p-1.5 shadow-[0_30px_80px_-20px_rgba(59,130,246,0.4)] backdrop-blur-sm">
            <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-[#080a18]">
              <div className="flex items-center justify-between gap-2 border-white/[0.05] border-b bg-white/[0.02] px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-white/10" />
                  <span className="size-2.5 rounded-full bg-white/10" />
                  <span className="size-2.5 rounded-full bg-white/10" />
                </div>
                <div className="flex items-center gap-2 rounded-md bg-white/[0.04] px-3 py-1 font-mono text-[11px] text-muted-foreground">
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                  nova.ai / agents / production
                </div>
                <div className="w-12" />
              </div>

              <div className="grid grid-cols-12 gap-px bg-white/[0.04]">
                <aside className="col-span-3 hidden flex-col gap-1 bg-[#080a18] p-4 md:flex">
                  {[
                    { icon: Bot, label: "Agents", count: 24 },
                    { icon: Workflow, label: "Workflows", count: 8 },
                    { icon: Network, label: "Integrations", count: 42 },
                    { icon: Cpu, label: "Models", count: 12 },
                  ].map((item) => (
                    <div
                      className="flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-white/[0.03]"
                      key={item.label}
                    >
                      <span className="inline-flex items-center gap-2 text-muted-foreground">
                        <item.icon className="size-3.5" />
                        {item.label}
                      </span>
                      <span className="font-mono text-[10px] text-white/40">
                        {item.count}
                      </span>
                    </div>
                  ))}
                </aside>

                <main className="col-span-12 space-y-4 bg-[#080a18] p-6 md:col-span-9">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-display font-medium text-foreground text-sm">
                        Customer triage agent
                      </div>
                      <div className="mt-0.5 inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <span className="size-1.5 rounded-full bg-emerald-400" />
                        Running · 3 active tasks
                      </div>
                    </div>
                    <Badge variant="blue">
                      <Sparkles className="size-3" />
                      GPT-5
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    {[
                      {
                        action: "fetch_ticket",
                        desc: "Loaded ticket #4821 — billing inquiry",
                        ms: 142,
                      },
                      {
                        action: "search_kb",
                        desc: "Found 3 relevant articles · confidence 0.94",
                        ms: 318,
                      },
                      {
                        action: "draft_reply",
                        desc: "Composed personalized response with refund offer",
                        ms: 612,
                      },
                      {
                        action: "route_to_human",
                        desc: "Escalated · attached context summary",
                        ms: 89,
                      },
                    ].map((step, i) => (
                      <div
                        className="flex items-center gap-3 rounded-md border border-white/[0.05] bg-white/[0.02] px-3 py-2.5 font-mono text-xs"
                        key={step.action}
                      >
                        <span className="text-white/30">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="text-blue-300">{step.action}</span>
                        <span className="flex-1 truncate text-muted-foreground">
                          {step.desc}
                        </span>
                        <span className="text-emerald-400">{step.ms}ms</span>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-2">
                    {[
                      {
                        label: "Resolved today",
                        value: "1,284",
                        trend: "+18%",
                      },
                      { label: "Avg. response", value: "1.2s", trend: "-9%" },
                      { label: "CSAT", value: "94.7", trend: "+2.1" },
                    ].map((stat) => (
                      <div
                        className="rounded-md border border-white/[0.05] bg-white/[0.02] p-3"
                        key={stat.label}
                      >
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                          {stat.label}
                        </div>
                        <div className="mt-1 flex items-baseline gap-1.5">
                          <span className="font-display font-medium text-foreground text-lg">
                            {stat.value}
                          </span>
                          <span className="font-mono text-[10px] text-emerald-400">
                            {stat.trend}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </main>
              </div>
            </div>
          </div>

          <div className="absolute top-1/3 -left-6 hidden rounded-xl border border-white/[0.08] bg-[#0a0c1f]/90 p-3 backdrop-blur-xl lg:block">
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-md bg-cyan-500/15">
                <Zap className="size-4 text-cyan-300" />
              </span>
              <div>
                <div className="font-medium text-foreground text-xs">
                  Latency
                </div>
                <div className="font-mono text-[10px] text-emerald-400">
                  ↓ 42% this week
                </div>
              </div>
            </div>
          </div>

          <div className="absolute top-2/3 -right-6 hidden rounded-xl border border-white/[0.08] bg-[#0a0c1f]/90 p-3 backdrop-blur-xl lg:block">
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-md bg-sky-500/15">
                <Bot className="size-4 text-sky-300" />
              </span>
              <div>
                <div className="font-medium text-foreground text-xs">
                  24 agents
                </div>
                <div className="font-mono text-[10px] text-muted-foreground">
                  3 deploying
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
