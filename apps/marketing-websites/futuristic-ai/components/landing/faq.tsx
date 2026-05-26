import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const faqs = [
  {
    q: "What exactly is an AI agent?",
    a: "An AI agent is software that can perceive its environment, reason about a goal, and take autonomous actions to achieve it. Unlike a chatbot, agents can call tools, query data, and chain multi-step workflows without human-in-the-loop at every step.",
  },
  {
    q: "Which language models do you support?",
    a: "All the frontier models — GPT-5, Claude 4.7 Opus, Gemini 2.5 Pro, Mistral, Llama 4 — plus your own fine-tunes. Switch models per agent or even per step. We handle routing, fallback, and cost optimization.",
  },
  {
    q: "How do you handle data privacy and compliance?",
    a: "Nova is SOC 2 Type II, GDPR, HIPAA, and CCPA compliant out of the box. Data is encrypted in transit and at rest, never used for model training, and supports VPC and on-prem deployment for regulated workloads.",
  },
  {
    q: "Can I connect Nova to my existing tools?",
    a: "Yes — 80+ pre-built integrations (Salesforce, HubSpot, Snowflake, Slack, Linear, Notion, etc.) plus a TypeScript SDK to build custom tools in minutes. Anything with an API can become an agent capability.",
  },
  {
    q: "How is pricing calculated?",
    a: "We charge per interaction (one full agent task), not per token. This means costs are predictable and scale with business value, not with how chatty your prompt is. Enterprise plans include unlimited interactions.",
  },
  {
    q: "What if my agents hallucinate or make mistakes?",
    a: "Nova ships with built-in evaluation suites, observability for every step, and guardrails for tool use. You can replay any agent run, A/B test versions, and roll back instantly if quality drops.",
  },
];

export function FAQ() {
  return (
    <section
      className="relative border-white/[0.04] border-y bg-[#08071a] py-24 md:py-32"
      id="faq"
    >
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-14 text-center">
          <Badge variant="outline">FAQ</Badge>
          <h2 className="mt-5 font-display font-semibold text-4xl text-gradient tracking-tight md:text-5xl">
            Questions, answered.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Still have questions?{" "}
            <a
              className="text-foreground underline-offset-4 hover:underline"
              href="#contact"
            >
              Talk to our team
            </a>
            .
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq) => (
            <details
              className="group rounded-xl border border-white/[0.06] bg-white/[0.02] transition-colors open:border-white/[0.12] open:bg-white/[0.03]"
              key={faq.q}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 font-display font-medium text-base text-foreground transition-colors hover:text-white">
                {faq.q}
                <span
                  aria-hidden="true"
                  className="grid size-7 shrink-0 place-items-center rounded-full border border-white/[0.08] bg-white/[0.04] transition-transform group-open:rotate-45"
                >
                  <Plus className="size-3.5 text-muted-foreground" />
                </span>
              </summary>
              <div className="px-6 pb-6 text-muted-foreground text-sm leading-relaxed">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
