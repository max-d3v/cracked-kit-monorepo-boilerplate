import { Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const links = [
  { label: "Platform", href: "#features" },
  { label: "Solutions", href: "#solutions" },
  { label: "Pricing", href: "#pricing" },
  { label: "Docs", href: "#docs" },
];

export function Navbar() {
  return (
    <header className="fixed top-5 right-0 left-0 z-50 mx-auto w-full max-w-5xl px-4">
      <nav className="flex h-14 items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.04] px-5 shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-2xl">
        <Link
          className="flex items-center gap-2.5 font-display font-semibold text-base tracking-tight"
          href="/"
        >
          <span
            aria-hidden="true"
            className="relative grid size-8 place-items-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 shadow-[0_0_24px_rgba(59,130,246,0.5)]"
          >
            <Sparkles className="size-4 text-white" strokeWidth={2.5} />
          </span>
          NOVA
          <span className="ml-1 font-mono text-[10px] text-muted-foreground">
            v2.0
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              className="rounded-full px-4 py-1.5 font-medium text-muted-foreground text-sm transition-colors hover:bg-white/[0.06] hover:text-foreground"
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link className="hidden sm:block" href="#login">
            <Button size="sm" variant="ghost">
              Sign in
            </Button>
          </Link>
          <Link href="#signup">
            <Button size="sm">Get started</Button>
          </Link>
        </div>
      </nav>
    </header>
  );
}
