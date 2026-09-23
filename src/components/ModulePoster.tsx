import Link from "next/link";
import type { Module } from "@/content/types";
import { moduleVisuals } from "@/content/visuals";

export function ModulePoster({ module, index }: { module: Module; index: number }) {
  const visual = moduleVisuals[module.id];
  return <Link href={`/modules/${module.slug}`} className={`module-poster poster-${module.id}`} data-reveal={index % 2}><div className="poster-top"><span>{String(index + 1).padStart(2, "0")} / {visual.chapter}</span><span aria-hidden="true">↗</span></div><h3>{visual.question}</h3><div className="poster-art" aria-hidden="true">{module.id === "foundations" ? <><span>?</span><span>?</span><span>?</span></> : visual.mark}</div>{module.id === "real-world" && <p className="poster-subjects">School. Work. Health. Creativity.</p>}<div className="poster-bottom"><strong>{module.title}</strong><p>{module.tagline}</p><span>{module.lessons.length} lessons · {module.lessons.reduce((total, lesson) => total + lesson.minutes, 0)} min reading</span></div></Link>;
}
