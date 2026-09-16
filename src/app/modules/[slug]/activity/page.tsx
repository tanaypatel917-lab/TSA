import { notFound } from "next/navigation";
import { getModule, modules } from "@/content";
import { ActivityRunner } from "@/components/ActivityRunner";
import { SplitText } from "@/components/motion/SplitText";

export function generateStaticParams() { return modules.map((module) => ({ slug: module.slug })); }
export default function ActivityPage({ params }: { params: { slug: string } }) {
  const currentModule = getModule(params.slug); if (!currentModule) notFound();
  return <div className="shell py-32"><div className="mx-auto max-w-[900px]"><p className="eyebrow"><span className="mr-3 text-accent">02</span> {currentModule.title}</p><SplitText as="h1" className="mt-7 font-display text-[clamp(3rem,7vw,6rem)] leading-[.9]">Try it <em>yourself.</em></SplitText><p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/65">Interactive practice is where ideas become skills.</p><div className="mt-16"><ActivityRunner activity={currentModule.activity} moduleId={currentModule.id} /></div></div></div>;
}
