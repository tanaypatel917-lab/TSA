import type { Metadata } from "next";
import { glossary } from "@/content/glossary";

export const metadata: Metadata = { title: "Glossary · AI Compass", description: "Student-friendly definitions of key AI terms." };

const sorted = [...glossary].sort((a, b) => a.term.localeCompare(b.term));

export default function GlossaryPage() { return <div className="shell py-12"><p className="eyebrow">Words to know</p><h1 className="mt-2 text-4xl font-black">AI glossary</h1><p className="mt-4 max-w-2xl text-lg text-slate-600">Keep this page nearby while you learn. These {glossary.length} terms also appear as dotted words inside lessons, where you can select them for a quick definition.</p><dl className="mt-8 grid gap-4 sm:grid-cols-2">{sorted.map((item) => <div className="card" id={item.term.toLowerCase().replace(/\s+/g, "-")} key={item.term}><dt className="text-lg font-bold text-accent">{item.term}</dt><dd className="mt-2 text-slate-600">{item.definition}</dd></div>)}</dl></div>; }
