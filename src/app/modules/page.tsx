import Link from "next/link";
import { modules } from "@/content";

const pad = (n: number) => String(n).padStart(2, "0");

export default function ModulesPage() {
  return (
    <div className="shell py-12 sm:py-16">
      <p className="eyebrow">The learning path / {pad(modules.length)} modules</p>
      <h1 className="display-lg mt-4 max-w-4xl">Choose your next direction<span className="text-signal">.</span></h1>
      <p className="prose-body mt-6 max-w-2xl text-mute">Each module combines short lessons, an interactive activity, and a five-question quiz.</p>
      <ol className="mt-14 grid gap-px border border-ink bg-ink md:grid-cols-2">
        {modules.map((module, index) => (
          <li key={module.id} className={index === 0 ? "md:col-span-2" : ""}>
            <Link href={`/modules/${module.slug}`} className="flip group flex h-full min-h-[260px] flex-col justify-between bg-paper p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-signal sm:p-8">
              <div className="flex items-center justify-between">
                <span className="index">{pad(index + 1)} / {module.lessons.length} lessons · 1 activity · 1 quiz</span>
                <span aria-hidden="true" className="text-2xl">{module.icon}</span>
              </div>
              <div className="mt-10 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                <div>
                  <h2 className={index === 0 ? "display-lg" : "display-md"}>{module.title}</h2>
                  <p className="mt-4 max-w-md text-sm text-mute">{module.tagline}</p>
                </div>
                <span className="mono-label flex items-center gap-2">Explore module <span aria-hidden="true" className="text-xl transition-transform group-hover:translate-x-2">→</span></span>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
