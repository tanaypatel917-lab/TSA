import { KineticText } from "./Kinetic";

export type PageTone = "rose" | "citron" | "ink" | "paper";

export function PageHero({ label, title, lede, mark, tone, children }: { label: string; title: string; lede: string; mark: string; tone: PageTone; children?: React.ReactNode }) {
  return <header className="page-hero" data-tone={tone}><div className="shell page-hero-grid"><p className="page-hero-label">{label}</p><h1><KineticText text={title} /></h1><p className="page-hero-lede">{lede}</p>{children}<span className="page-hero-mark" aria-hidden="true">{mark}</span></div></header>;
}
