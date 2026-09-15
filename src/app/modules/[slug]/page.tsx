import Link from "next/link";
import { notFound } from "next/navigation";
import { getModule, modules } from "@/content";

export function generateStaticParams() { return modules.map((module) => ({ slug: module.slug })); }

const pad = (n: number) => String(n).padStart(2, "0");

export default function ModulePage({ params }: { params: { slug: string } }) {
  const currentModule = getModule(params.slug); if (!currentModule) notFound();
  const moduleIndex = modules.findIndex((module) => module.id === currentModule.id);
  const steps = currentModule.lessons.length + 2;
  return (
    <div className="shell py-12 sm:py-16">
      <Link href="/modules" className="nav-link"><span aria-hidden="true">←</span> All modules</Link>
      <div className="mt-10">
        <p className="eyebrow">Module {pad(moduleIndex + 1)} / {pad(steps)} steps</p>
        <h1 className="display-lg mt-4 max-w-5xl">{currentModule.title}</h1>
        <p className="prose-body mt-6 max-w-xl text-mute">{currentModule.tagline}</p>
      </div>

      <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_0.35fr]">
        <div>
          <div className="flex items-end justify-between border-b border-ink pb-3"><h2 className="display-sm">Lessons</h2><span className="index">read</span></div>
          <ol className="divide-y divide-ink border-b border-ink">
            {currentModule.lessons.map((lesson, index) => (
              <li key={lesson.id}>
                <Link className="group flex items-baseline gap-5 py-5 transition-colors hover:text-signal focus-visible:outline-none focus-visible:text-signal sm:gap-8" href={`/modules/${currentModule.slug}/lessons/${lesson.id}`}>
                  <span className="index w-8 shrink-0">{pad(index + 1)}</span>
                  <span className="flex-1"><strong className="block font-display text-lg font-bold leading-tight sm:text-xl">{lesson.title}</strong><span className="index mt-1 block">{lesson.minutes} min read · {lesson.keyTakeaways.length} takeaways</span></span>
                  <span aria-hidden="true" className="text-xl transition-transform group-hover:translate-x-2">→</span>
                </Link>
              </li>
            ))}
          </ol>

          <div className="mt-12 grid gap-px border border-ink bg-ink md:grid-cols-2">
            <Link href={`/modules/${currentModule.slug}/activity`} className="flip flex min-h-[220px] flex-col justify-between bg-paper p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-signal sm:p-8">
              <span className="eyebrow">Interactive activity</span>
              <div><h3 className="display-sm mt-8">{currentModule.activity.title}</h3><p className="mt-3 text-sm text-mute">{currentModule.activity.intro}</p></div>
            </Link>
            <Link href={`/modules/${currentModule.slug}/quiz`} className="flip flex min-h-[220px] flex-col justify-between bg-paper p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-signal sm:p-8">
              <span className="eyebrow">Knowledge check</span>
              <div><h3 className="display-sm mt-8">Five-question quiz</h3><p className="mt-3 text-sm text-mute">Test your understanding and keep your best score.</p></div>
            </Link>
          </div>
        </div>

        <aside className="terminal frame h-fit p-6 sm:p-8">
          <p className="mono-label">:// module map</p>
          <ol className="mt-6 space-y-3 font-display text-sm text-paper">
            <li className="flex gap-3"><span className="font-mono text-signal">01</span>Read each lesson.</li>
            <li className="flex gap-3"><span className="font-mono text-signal">02</span>Try the activity.</li>
            <li className="flex gap-3"><span className="font-mono text-signal">03</span>Take the quiz. You need 70% for module completion.</li>
          </ol>
          <p className="mono-label mt-8 border-t border-signal/40 pt-4 text-paper/70">tip: revisit any step and improve your quiz score later.</p>
        </aside>
      </div>
    </div>
  );
}
