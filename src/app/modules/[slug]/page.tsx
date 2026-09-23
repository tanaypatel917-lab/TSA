import type { Metadata } from "next";
import Link from "next/link";
import { KineticText } from "@/components/Kinetic";
import { notFound } from "next/navigation";
import { getModule, modules } from "@/content";
import { glossary } from "@/content/glossary";
import { activityLabels, moduleVisuals } from "@/content/visuals";
import { ChapterProgram, ChapterStart } from "@/components/ChapterProgram";
import { BADGES } from "@/engine/badges";
import { chapterMinutes } from "@/engine/chapters";
import { chapterTerms } from "@/engine/glossary";
import "../modules.css";

export function generateStaticParams() { return modules.map((module) => ({ slug: module.slug })); }

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const currentModule = getModule(params.slug);
  return { title: currentModule ? `${currentModule.title} | Wordplay` : "Chapter | Wordplay" };
}

export default function ModulePage({ params }: { params: { slug: string } }) {
  const currentModule = getModule(params.slug); if (!currentModule) notFound();
  const index = modules.indexOf(currentModule);
  const visual = moduleVisuals[currentModule.id];
  const badge = BADGES.find((item) => item.id === `module-${currentModule.id}`);
  const previous = modules[index - 1];
  const next = modules[index + 1];
  const terms = chapterTerms(currentModule.lessons, glossary);
  return <article className="chapter-page"><header className="chapter-hero" data-module={currentModule.id}><div className="shell"><nav className="breadcrumb" aria-label="Breadcrumb"><Link href="/modules">Explore</Link><span aria-hidden="true">/</span><span aria-current="page">{currentModule.title}</span></nav><div className="chapter-hero-grid"><div><p className="chapter-kicker">Chapter {String(index + 1).padStart(2, "0")} / {visual.chapter}</p><h1><KineticText text={visual.question} /></h1><p className="chapter-lede"><strong>{currentModule.title}.</strong> {currentModule.tagline}</p><ChapterStart module={currentModule} /></div><span className="chapter-glyph" aria-hidden="true">{visual.mark}</span></div><dl className="chapter-facts"><div><dt>Lessons</dt><dd>{currentModule.lessons.length}</dd></div><div><dt>Reading</dt><dd>{chapterMinutes(currentModule)} min</dd></div><div><dt>Practice</dt><dd>{activityLabels[currentModule.activity.kind]}</dd></div><div><dt>Quiz</dt><dd>{currentModule.quiz.length} questions</dd></div></dl></div></header><div className="shell chapter-body"><section aria-labelledby="program-title"><h2 id="program-title">The program</h2><p className="chapter-program-intro">Read the lessons in order, put them to work in the activity, then check your understanding. You can revisit any step.</p><ChapterProgram module={currentModule} /></section><aside className="chapter-outcomes" aria-labelledby="outcomes-title"><h2 id="outcomes-title">By the end, you can explain</h2><ul>{currentModule.lessons.map((lesson) => <li key={lesson.id}>{lesson.keyTakeaways[0]}</li>)}</ul><p className="chapter-rule">Read every lesson, finish the activity, and score at least 70% on the quiz to complete this chapter{badge && <> and earn the <strong>{badge.name}</strong> badge</>}.</p>{terms.length > 0 && <div className="chapter-terms"><h3>Words you will meet</h3><ul>{terms.map((term) => <li key={term.slug}><Link href={`/glossary/#term-${term.slug}`}>{term.term}</Link></li>)}</ul></div>}</aside></div><nav className="shell chapter-pager" aria-label="Chapters">{previous && <Link href={`/modules/${previous.slug}`}><span>Previous chapter</span><strong>{previous.title}</strong></Link>}{next ? <Link href={`/modules/${next.slug}`} className="is-next"><span>Next chapter</span><strong>{next.title}</strong></Link> : <Link href="/learn" className="is-next"><span>Finished the course?</span><strong>See your learning</strong></Link>}</nav></article>;
}
