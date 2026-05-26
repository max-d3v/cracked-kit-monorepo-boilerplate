import { Marquee } from "@/components/ui/marquee";

const logos = [
  "LINEAR",
  "SPLUNK",
  "DROPBOX",
  "NOTION",
  "RAMP",
  "RETOOL",
  "VERCEL",
  "ANTHROPIC",
  "CURSOR",
  "PERPLEXITY",
];

export function LogoCloud() {
  return (
    <section className="relative border-white/[0.04] border-y bg-[#0a0818]/50 py-12">
      <div className="mx-auto max-w-7xl px-6">
        <p className="mb-8 text-center font-medium text-muted-foreground text-xs uppercase tracking-[0.2em]">
          Trusted by forward-thinking teams shipping at scale
        </p>
        <Marquee>
          {logos.map((logo) => (
            <span
              className="whitespace-nowrap font-display font-medium text-2xl text-white/30 tracking-[0.12em] transition-colors hover:text-white/60"
              key={logo}
            >
              {logo}
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
