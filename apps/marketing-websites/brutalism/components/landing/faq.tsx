import { Badge } from "@/components/ui/badge";

const faqs = [
  {
    q: "What's neobrutalism?",
    a: "A design movement that rejects polished, generic UI. Think thick borders, hard shadows, raw typography, and unapologetic color. Loud, structural, honest.",
  },
  {
    q: "Will this work with my existing project?",
    a: "Yes. The components are framework-agnostic React + Tailwind. Drop them into Next.js, Vite, Remix, Astro — anywhere Tailwind v4 runs.",
  },
  {
    q: "Can I use it for client work?",
    a: "Hobby tier is MIT-licensed. Studio and Agency tiers include commercial and white-label rights for unlimited client sites.",
  },
  {
    q: "Do you offer dark mode?",
    a: "Yes — every component ships with light and dark tokens. Toggle via next-themes or your favorite theme provider.",
  },
  {
    q: "Is it accessible?",
    a: "Every primitive is keyboard-navigable with visible focus states and proper ARIA. We test against axe-core and screen readers.",
  },
  {
    q: "How is this different from shadcn/ui?",
    a: "Same engineering principles (copy/paste, Tailwind, headless behavior), opposite aesthetic. shadcn whispers — we shout.",
  },
];

export function FAQ() {
  return (
    <section className="border-black border-b-2 bg-background py-24" id="faq">
      <div className="mx-auto max-w-5xl px-4">
        <div className="mb-16 flex flex-col items-center text-center">
          <Badge variant="lime">FAQ</Badge>
          <h2 className="mt-4 max-w-3xl font-display text-4xl tracking-tighter sm:text-5xl md:text-6xl">
            Questions you'll probably ask.
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq) => (
            <details
              className="group rounded-md border-2 border-black bg-secondary-background shadow-brutal transition-all open:shadow-brutal-lg"
              key={faq.q}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-6 font-black font-display text-xl">
                {faq.q}
                <span
                  aria-hidden="true"
                  className="grid size-8 shrink-0 place-items-center rounded border-2 border-black bg-main font-black text-xl transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <div className="border-black border-t-2 p-6 text-base text-muted-foreground leading-relaxed">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
