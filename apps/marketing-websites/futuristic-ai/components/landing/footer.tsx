import { Github, Linkedin, Sparkles, Twitter } from "lucide-react";
import Link from "next/link";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Platform", href: "#features" },
      { label: "Solutions", href: "#solutions" },
      { label: "Pricing", href: "#pricing" },
      { label: "Changelog", href: "#changelog" },
      { label: "Roadmap", href: "#roadmap" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "#docs" },
      { label: "API reference", href: "#api" },
      { label: "Guides", href: "#guides" },
      { label: "Templates", href: "#templates" },
      { label: "Blog", href: "#blog" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#about" },
      { label: "Customers", href: "#customers" },
      { label: "Careers", href: "#careers" },
      { label: "Press kit", href: "#press" },
      { label: "Contact", href: "#contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "#privacy" },
      { label: "Terms", href: "#terms" },
      { label: "Security", href: "#security" },
      { label: "DPA", href: "#dpa" },
      { label: "Subprocessors", href: "#subprocessors" },
    ],
  },
];

const compliance = ["SOC 2", "GDPR", "HIPAA", "CCPA", "ISO 27001"];

export function Footer() {
  return (
    <footer className="relative border-white/[0.04] border-t bg-[#06051a]">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_3fr]">
          <div>
            <Link
              className="inline-flex items-center gap-2.5 font-display font-semibold text-base"
              href="/"
            >
              <span
                aria-hidden="true"
                className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 shadow-[0_0_24px_rgba(59,130,246,0.5)]"
              >
                <Sparkles className="size-4 text-white" strokeWidth={2.5} />
              </span>
              NOVA
            </Link>
            <p className="mt-4 max-w-xs text-muted-foreground text-sm leading-relaxed">
              The agentic AI platform for teams shipping intelligence at
              production scale.
            </p>

            <div className="mt-6 flex items-center gap-2">
              {[
                { icon: Twitter, href: "#twitter", label: "Twitter" },
                { icon: Github, href: "#github", label: "GitHub" },
                { icon: Linkedin, href: "#linkedin", label: "LinkedIn" },
              ].map((social) => (
                <Link
                  aria-label={social.label}
                  className="grid size-9 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.02] text-muted-foreground transition-colors hover:border-white/[0.15] hover:bg-white/[0.05] hover:text-foreground"
                  href={social.href}
                  key={social.label}
                >
                  <social.icon className="size-4" strokeWidth={1.5} />
                </Link>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {columns.map((col) => (
              <div key={col.title}>
                <h3 className="mb-4 font-medium text-foreground text-sm">
                  {col.title}
                </h3>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        className="text-muted-foreground text-sm transition-colors hover:text-foreground"
                        href={link.href}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-white/[0.04] border-t">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 text-muted-foreground text-xs md:flex-row">
          <p>
            © {new Date().getFullYear()} Nova Labs, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            {compliance.map((badge) => (
              <span
                className="rounded-md border border-white/[0.06] bg-white/[0.02] px-2.5 py-1 font-medium text-[10px] tracking-wider"
                key={badge}
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
