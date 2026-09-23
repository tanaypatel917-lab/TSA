import Link from "next/link";
import type { Module } from "@/content/types";

export function StudyShell({ module, title, intro, kind, children }: { module: Module; title?: string; intro?: string; kind: "Lesson" | "Practice" | "Knowledge check"; children: React.ReactNode }) {
  return <div className="shell study-shell"><nav className="breadcrumb" aria-label="Breadcrumb"><Link href="/modules">Explore</Link><span aria-hidden="true">/</span><Link href={`/modules/${module.slug}`}>{module.title}</Link><span aria-hidden="true">/</span><span aria-current="page">{kind}</span></nav>{title && <header className="study-heading"><div><div className="study-kicker">{kind === "Practice" ? "Put an idea to work" : "Make your thinking visible"}</div><h1>{title}</h1>{intro && <p>{intro}</p>}</div><span className="study-heading-mark" aria-hidden="true">{kind === "Practice" ? "[ ]" : "?"}</span></header>}{children}</div>;
}
