import type { Metadata } from "next";
import Link from "next/link";
import { modules } from "@/content";
import { sources } from "@/content/sources";
import { SplitText } from "@/components/motion/SplitText";

export const metadata: Metadata = { title: "Sources", description: "Reputable sources behind the AI Compass lessons." };

const moduleTitle = (id: string) => modules.find((module) => module.id === id)?.title ?? id;

export default function SourcesPage() {
  return <div className="shell py-32">
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="lg:col-span-8"><p className="eyebrow"><span className="mr-3 text-accent">01</span> Where the facts come from</p><SplitText as="h1" className="mt-7 font-display text-[clamp(3rem,8vw,7rem)] leading-[.88]">Sources and<br /><em>further reading.</em></SplitText></div>
      <p className="self-end text-lg leading-relaxed text-ink/75 lg:col-start-9 lg:col-span-4">Every factual claim in AI Compass is grounded in public material from research institutes, standards bodies, government agencies, and technology educators.</p>
    </div>
    <ul className="mt-24 grid border-l border-t border-line sm:grid-cols-2">
      {sources.map((source) => <li key={source.url} className="card flex flex-col gap-4">
        <div><h2 className="font-display text-3xl italic"><a className="link-underline" href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a></h2><p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-ink/75">{source.publisher}</p></div>
        <p className="leading-relaxed text-ink/75">{source.note}</p>
        <p className="mt-auto font-mono text-[10px] uppercase tracking-[0.12em] text-ink/75">Used in: {source.modules.map((id, index) => { const target = modules.find((module) => module.id === id); return <span key={id}>{index > 0 && ", "}{target ? <Link className="link-underline text-ink" href={`/modules/${target.slug}`}>{moduleTitle(id)}</Link> : moduleTitle(id)}</span>; })}</p>
      </li>)}
    </ul>
    <section className="card mt-12 max-w-3xl"><p className="eyebrow">Reading note</p><h2 className="mt-5 font-display text-4xl italic">How to read a source</h2><p className="mt-4 max-w-prose leading-relaxed text-ink/75">Ask who published it, when it was updated, what evidence it gives, and whether other reputable sources agree. Links open in a new tab and may change over time; if one breaks, search for the title and publisher together.</p></section>
  </div>;
}
