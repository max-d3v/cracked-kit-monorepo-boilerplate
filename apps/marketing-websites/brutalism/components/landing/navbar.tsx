import Link from "next/link";
import { Button } from "@/components/ui/button";

const links = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-black border-b-2 bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link
          className="flex items-center gap-2 font-black font-display text-xl"
          href="/"
        >
          <span
            aria-hidden="true"
            className="grid size-9 place-items-center rounded-md border-2 border-black bg-main shadow-brutal-sm"
          >
            B!
          </span>
          BRUTAL.
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              className="font-bold text-base decoration-4 decoration-main underline-offset-4 hover:underline"
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="#login">
            <Button size="sm" variant="neutral">
              Login
            </Button>
          </Link>
          <Link href="#signup">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
