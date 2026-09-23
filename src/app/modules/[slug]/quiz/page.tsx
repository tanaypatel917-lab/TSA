import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getModule, modules } from "@/content";
import { QuizRunner } from "@/components/QuizRunner";
import { StudyShell } from "@/components/StudyShell";
import "../../modules.css";

export function generateStaticParams() { return modules.map((module) => ({ slug: module.slug })); }

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const currentModule = getModule(params.slug);
  return { title: currentModule ? `Knowledge check: ${currentModule.title} | Wordplay` : "Knowledge check | Wordplay" };
}

export default function QuizPage({ params }: { params: { slug: string } }) {
  const currentModule = getModule(params.slug); if (!currentModule) notFound();
  return <StudyShell module={currentModule} kind="Knowledge check" title="Knowledge check" intro="Answer one question at a time. Explanations appear right away."><QuizRunner module={currentModule} /></StudyShell>;
}
