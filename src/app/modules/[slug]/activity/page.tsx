import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getModule, modules } from "@/content";
import { ActivityRunner } from "@/components/ActivityRunner";
import { StudyShell } from "@/components/StudyShell";
import "../../modules.css";

export function generateStaticParams() { return modules.map((module) => ({ slug: module.slug })); }

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const currentModule = getModule(params.slug);
  return { title: currentModule ? `${currentModule.activity.title} | Wordplay` : "Practice | Wordplay" };
}

export default function ActivityPage({ params }: { params: { slug: string } }) {
  const currentModule = getModule(params.slug); if (!currentModule) notFound();
  const { activity } = currentModule;
  const prompt = activity.kind === "prompt-lab";
  return <StudyShell module={currentModule} kind="Practice" title={prompt ? "Prompt Lab" : activity.title} intro={activity.intro}><div className={prompt ? undefined : "activity-frame"}><ActivityRunner activity={activity} moduleId={currentModule.id} /></div><nav className="study-next" aria-label="Chapter steps"><Link href={`/modules/${currentModule.slug}`} className="text-link">← Back to {currentModule.title}</Link><Link href={`/modules/${currentModule.slug}/quiz`} className="text-link">Next: Knowledge check <span aria-hidden="true">↗</span></Link></nav></StudyShell>;
}
