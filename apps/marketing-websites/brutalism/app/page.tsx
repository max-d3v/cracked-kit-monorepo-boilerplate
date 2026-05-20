import type { Metadata } from "next";
import { CTA } from "@/components/landing/cta";
import { FAQ } from "@/components/landing/faq";
import { Features } from "@/components/landing/features";
import { Footer } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { MarqueeStrip } from "@/components/landing/marquee-strip";
import { Navbar } from "@/components/landing/navbar";
import { Pricing } from "@/components/landing/pricing";
import { Testimonials } from "@/components/landing/testimonials";

export const metadata: Metadata = {
  title: "BRUTAL. — A neobrutalism starter for builders who ship loud.",
  description:
    "A no-nonsense neobrutalism starter kit. Thick borders, hard shadows, vibrant fills. Built on Next.js, Tailwind v4, and the neobrutalism-components registry.",
  keywords: [
    "neobrutalism",
    "brutalism design",
    "Next.js template",
    "Tailwind CSS",
    "landing page template",
    "neobrutalism components",
    "marketing site template",
  ],
  openGraph: {
    type: "website",
    title: "BRUTAL. — A neobrutalism starter for builders who ship loud.",
    description:
      "Thick borders, hard shadows, vibrant fills. A Next.js + Tailwind v4 starter that gets out of your way.",
  },
};

export default function Page() {
  return (
    <main className="min-h-svh">
      <Navbar />
      <Hero />
      <MarqueeStrip />
      <Features />
      <Pricing />
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
