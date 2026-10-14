import type { Metadata } from "next";
import Link from "next/link";
import { modules } from "@/content";
import { ChapterIndex } from "@/components/ChapterIndex";
import { CertificateGoal } from "@/components/CertificateGoal";
import { CourseSpine } from "@/components/CourseSpine";
import { PageHero } from "@/components/PageHero";
import { chapterMinutes } from "@/engine/chapters";
import "./modules.css";

export const metadata: Metadata = { title: "Explore chapters | Wordplay" };

export default function ModulesPage() {
  const lessons = modules.reduce((total, module) => total + module.lessons.length, 0);
  const minutes = modules.reduce((total, module) => total + chapterMinutes(module), 0);
  return <><PageHero stage="orbit" tone="sky" label="Explore" title="Five questions worth asking." lede="Each chapter pairs short lessons with a hands-on activity and a five-question quiz. Start anywhere, or begin with AI Foundations." mark="↗"><dl className="page-hero-stats"><div><dt>Chapters</dt><dd>{modules.length}</dd></div><div><dt>Lessons</dt><dd>{lessons}</dd></div><div><dt>Reading</dt><dd>{Math.floor(minutes / 60)} h {minutes % 60} min</dd></div><div><dt>Activities</dt><dd>{modules.length}</dd></div></dl></PageHero><CourseSpine modules={modules} /><section className="chapter-index-section" aria-labelledby="chapter-index-title"><h2 id="chapter-index-title" className="sr-only">All chapters</h2><ChapterIndex modules={modules} /></section><CertificateGoal /><p className="timeline-explore shell"><Link href="/timeline/">See where it all started: the AI timeline <span aria-hidden="true">→</span></Link></p></>;
}
