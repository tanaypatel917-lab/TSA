import type { Metadata } from "next";
import Link from "next/link";
import { modules } from "@/content";
import { sources } from "@/content/sources";

export const metadata: Metadata = { title: "Sources", description: "Reputable sources behind the AI Compass lessons." };

const pad = (n: number) => String(n).padStart(2, "0");
const moduleTitle = (id: string) => modules.find((module) => module.id === id)?.title ?? id;

export default function SourcesPage() {
  return (
    <div className="shell py-12 sm:py-16">
      <p className="eyebrow">Where the facts come from / {pad(sources.length)} sources</p>
      <h1 className="display-lg mt-4 max-w-4xl">Sources and further reading<span className="text-signal">.</span></h1>
      <p className="prose-body mt-6 max-w-2xl text-mute">Every factual claim in AI Compass is grounded in publicly available material from research institutes, standards bodies, government agencies, and technology educators. Use these links to dig deeper or to check a lesson for yourself.</p>
      <ol className="mt-14 border-t border-ink">
        {sources.map((source, i) => (
          <li key={source.url} className="grid gap-4 border-b border-ink py-8 md:grid-cols-[80px_1fr_1.2fr] md:gap-8">
            <span className="index">{pad(i + 1)}</span>
            <div>
              <h2 className="display-sm"><a className="underline decoration-signal decoration-2 underline-offset-4 hover:text-signal" href={source.url} target="_blank" rel="noopener noreferrer">{source.title}<span className="sr-only"> (opens in a new tab)</span></a></h2>
              <p className="mono-label mt-3 text-mute">:// {source.publisher}</p>
            </div>
            <div>
              <p className="prose-body max-w-xl text-mute">{source.note}</p>
              <p className="index mt-4">Used in: {source.modules.map((id, index) => { const target = modules.find((module) => module.id === id); return <span key={id}>{index > 0 && ", "}{target ? <Link className="underline decoration-signal underline-offset-4 hover:text-ink" href={`/modules/${target.slug}`}>{moduleTitle(id)}</Link> : moduleTitle(id)}</span>; })}</p>
            </div>
          </li>
        ))}
      </ol>
      <section className="terminal frame mt-16 max-w-3xl p-8 sm:p-10">
        <p className="mono-label">:// How to read a source</p>
        <p className="mt-4 font-display text-lg text-paper">Ask who published it, when it was updated, what evidence it gives, and whether other reputable sources agree. Links open in a new tab and may change over time; if one breaks, search for the title and publisher together.</p>
      </section>
    </div>
  );
}
