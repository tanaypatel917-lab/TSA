import { notFound } from "next/navigation";
import { getModule, modules } from "@/content";
import { QuizRunner } from "@/components/QuizRunner";

export function generateStaticParams() { return modules.map((module) => ({ slug: module.slug })); }
export default function QuizPage({ params }: { params: { slug: string } }) {
  const currentModule = getModule(params.slug); if (!currentModule) notFound();
  return <div className="shell py-32"><div className="mx-auto max-w-[900px]"><p className="eyebrow"><span className="mr-3 text-accent">03</span> {currentModule.title}</p><h1 className="mt-7 font-display text-[clamp(3rem,7vw,6rem)] leading-[.9]">Knowledge <em>check.</em></h1><p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/65">Answer one question at a time. Explanations appear right away.</p><div className="mt-16"><QuizRunner module={currentModule} /></div></div></div>;
}
