import type { Metadata } from "next";
import Link from "next/link";
import { modules } from "@/content";
import { sources } from "@/content/sources";

export const metadata: Metadata = { title: "Sources", description: "Reputable sources behind the AI Compass lessons." };

const moduleTitle = (id: string) => modules.find((module) => module.id === id)?.title ?? id;

export default function SourcesPage() {
  return <div className="shell py-12">
    <p className="eyebrow">Where the facts come from</p>
    <h1 className="mt-2 max-w-3xl text-4xl font-black">Sources and further reading</h1>
    <p className="mt-4 max-w-2xl text-lg text-slate-600">Every factual claim in AI Compass is grounded in publicly available material from research institutes, standards bodies, government agencies, and technology educators. Use these links to dig deeper or to check a lesson for yourself.</p>
    <ul className="mt-8 grid gap-4 md:grid-cols-2">
      {sources.map((source) => <li key={source.url} className="card flex flex-col gap-3">
        <div><h2 className="text-lg font-bold"><a className="text-accent underline decoration-indigo-200 underline-offset-4 hover:decoration-accent" href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a></h2><p className="mt-1 text-sm font-semibold text-slate-500">{source.publisher}</p></div>
        <p className="text-slate-600">{source.note}</p>
        <p className="text-sm text-slate-500">Used in: {source.modules.map((id, index) => { const target = modules.find((module) => module.id === id); return <span key={id}>{index > 0 && ", "}{target ? <Link className="font-semibold text-slate-700 hover:text-accent" href={`/modules/${target.slug}`}>{moduleTitle(id)}</Link> : moduleTitle(id)}</span>; })}</p>
      </li>)}
    </ul>
    <section className="card mt-10 max-w-3xl">
      <h2 className="text-xl font-bold">How to read a source</h2>
      <p className="mt-3 text-slate-600">Ask who published it, when it was updated, what evidence it gives, and whether other reputable sources agree. Links open in a new tab and may change over time; if one breaks, search for the title and publisher together.</p>
    </section>
  </div>;
}
