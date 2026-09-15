import { notFound } from "next/navigation";
import Link from "next/link";
import { getModule, modules } from "@/content";
import { ActivityRunner } from "@/components/ActivityRunner";

export function generateStaticParams() { return modules.map((module) => ({ slug: module.slug })); }

export default function ActivityPage({ params }: { params: { slug: string } }) {
  const currentModule = getModule(params.slug); if (!currentModule) notFound();
  return (
    <div className="shell py-12 sm:py-16">
      <Link href={`/modules/${currentModule.slug}`} className="nav-link"><span aria-hidden="true">←</span> {currentModule.title}</Link>
      <div className="mt-10 grid gap-10 lg:grid-cols-[0.35fr_0.65fr]">
        <div>
          <p className="eyebrow">Interactive activity / +25 XP</p>
          <h1 className="display-lg mt-4">Try it<br />yourself<span className="text-signal">.</span></h1>
          <p className="prose-body mt-6 max-w-sm text-mute">Interactive practice is where ideas become skills.</p>
        </div>
        <div><ActivityRunner activity={currentModule.activity} moduleId={currentModule.id} /></div>
      </div>
    </div>
  );
}
