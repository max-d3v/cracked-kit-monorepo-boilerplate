import Link from "next/link";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Changelog", href: "#changelog" },
      { label: "Roadmap", href: "#roadmap" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Docs", href: "#docs" },
      { label: "Components", href: "#components" },
      { label: "Templates", href: "#templates" },
      { label: "Blog", href: "#blog" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#about" },
      { label: "Careers", href: "#careers" },
      { label: "Contact", href: "#contact" },
      { label: "Press kit", href: "#press" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-secondary-background">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
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
          <p className="max-w-xs text-muted-foreground text-sm">
            A neobrutalism starter kit for builders who want their site to be
            felt, not just seen.
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="mb-4 font-black font-display text-base">
              {col.title}
            </h3>
            <ul className="space-y-3">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link
                    className="font-medium text-muted-foreground transition-colors hover:text-foreground"
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

      <div className="border-black border-t-2 bg-main">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 md:flex-row">
          <p className="font-bold text-sm">
            © {new Date().getFullYear()} BRUTAL. Built loud.
          </p>
          <div className="flex items-center gap-6 text-sm">
            <Link className="font-bold hover:underline" href="#privacy">
              Privacy
            </Link>
            <Link className="font-bold hover:underline" href="#terms">
              Terms
            </Link>
            <Link className="font-bold hover:underline" href="#license">
              License
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
