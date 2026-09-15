"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard", index: "00" },
  { href: "/modules", label: "Modules", index: "01" },
  { href: "/badges", label: "Badges", index: "02" },
  { href: "/glossary", label: "Glossary", index: "03" },
  { href: "/about", label: "About", index: "04" }
];

export function SiteNav() {
  const pathname = usePathname() ?? "/";
  return (
    <nav aria-label="Main navigation" className="flex flex-wrap gap-x-6 gap-y-3">
      {links.map((link) => {
        const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
        return (
          <Link key={link.href} href={link.href} className="nav-link" aria-current={active ? "page" : undefined}>
            <span aria-hidden="true" className="mr-1 text-mute">{link.index}</span>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
