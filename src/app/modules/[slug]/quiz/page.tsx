import { notFound } from "next/navigation";
import { getModule, modules } from "@/content";
import { QuizRunner } from "@/components/QuizRunner";

export function generateStaticParams() { return modules.map((module) => ({ slug: module.slug })); }

export default function QuizPage({ params }: { params: { slug: string } }) {
  const currentModule = getModule(params.slug); if (!currentModule) notFound();
  return <div className="shell py-12"><div className="mx-auto max-w-3xl"><p className="eyebrow">{currentModule.icon} {currentModule.title}</p><h1 className="mt-3 text-4xl font-black">Knowledge check</h1><p className="mt-3 text-lg text-slate-600">Answer one question at a time. Explanations appear right away.</p><div className="mt-8"><QuizRunner module={currentModule} /></div></div></div>;
}
