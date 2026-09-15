import { notFound } from "next/navigation";
import { getModule, modules } from "@/content";
import { ActivityRunner } from "@/components/ActivityRunner";

export function generateStaticParams() { return modules.map((module) => ({ slug: module.slug })); }

export default function ActivityPage({ params }: { params: { slug: string } }) {
  const currentModule = getModule(params.slug); if (!currentModule) notFound();
  return <div className="shell py-12"><div className="mx-auto max-w-3xl"><p className="eyebrow">{currentModule.icon} {currentModule.title}</p><h1 className="mt-3 text-4xl font-black">Try it yourself</h1><p className="mt-3 text-lg text-slate-600">Interactive practice is where ideas become skills.</p><div className="mt-8"><ActivityRunner activity={currentModule.activity} moduleId={currentModule.id} /></div></div></div>;
}
