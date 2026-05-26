import type { Metadata } from "next";
import { Capabilities } from "@/components/landing/capabilities";
import { CTA } from "@/components/landing/cta";
import { FAQ } from "@/components/landing/faq";

import { Footer } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { LogoCloud } from "@/components/landing/logo-cloud";
import { Navbar } from "@/components/landing/navbar";
import { Pricing } from "@/components/landing/pricing";
import { Testimonial } from "@/components/landing/testimonial";
import { UseCases } from "@/components/landing/use-cases";

export const metadata: Metadata = {
  title: "Nova — Your AI workforce, ready for production",
  description:
    "Design, deploy, and scale autonomous AI agents that reason, act, and collaborate. Built for teams shipping intelligence at the edge of what's possible.",
  keywords: [
    "AI agents",
    "agentic AI",
    "AI orchestration",
    "Next.js template",
    "AI landing page",
    "futuristic UI",
    "shadcn template",
    "production AI",
  ],
  openGraph: {
    type: "website",
    title: "Nova — Your AI workforce, ready for production",
    description:
      "Design, deploy, and scale autonomous AI agents. Built for teams shipping intelligence at the edge of what's possible.",
  },
};

export default function Page() {
  return (
    <main className="relative min-h-svh overflow-hidden bg-background">
      <Navbar />
      <Hero />
      <LogoCloud />
      <Capabilities />

      <UseCases />
      <Testimonial />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
