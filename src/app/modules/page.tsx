import Link from "next/link";
import { modules } from "@/content";

export default function ModulesPage() {
  return <div className="shell py-12"><p className="eyebrow">The learning path</p><h1 className="mt-2 text-4xl font-black">Choose your next direction.</h1><p className="mt-4 max-w-2xl text-lg text-slate-600">Each module combines short lessons, an interactive activity, and a five-question quiz.</p><div className="mt-8 grid gap-5 md:grid-cols-2">{modules.map((module, index) => <Link href={`/modules/${module.slug}`} key={module.id} className="card group hover:-translate-y-1 hover:border-indigo-300"><div className="flex items-center justify-between"><span className="text-4xl">{module.icon}</span><span className="text-sm font-bold text-slate-400">0{index + 1}</span></div><h2 className="mt-6 text-2xl font-bold group-hover:text-accent">{module.title}</h2><p className="mt-2 text-slate-600">{module.tagline}</p><p className="mt-6 text-sm font-bold text-accent">Explore module →</p></Link>)}</div></div>;
}
