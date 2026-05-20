import { Marquee } from "@/components/ui/marquee";

const items = [
  "NEXT.JS",
  "TAILWIND V4",
  "REACT 19",
  "TYPESCRIPT",
  "TURBOREPO",
  "NEOBRUTALISM",
  "OPEN SOURCE",
  "ZERO BLOAT",
];

export function MarqueeStrip() {
  return (
    <section className="border-black border-b-2 bg-main py-4">
      <Marquee>
        {items.map((item) => (
          <div className="flex items-center gap-12" key={item}>
            <span className="whitespace-nowrap font-black font-display text-2xl tracking-tight">
              {item}
            </span>
            <span aria-hidden="true" className="size-3 rotate-45 bg-black" />
          </div>
        ))}
      </Marquee>
    </section>
  );
}
