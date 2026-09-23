import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getModule, modules } from "@/content";
import { glossary } from "@/content/glossary";
import { referencesForLesson } from "@/content/references";
import { LessonClient } from "@/components/LessonClient";
import { lessonTerms } from "@/engine/glossary";
import "../../../modules.css";

export function generateStaticParams() { return modules.flatMap((module) => module.lessons.map((lesson) => ({ slug: module.slug, lessonId: lesson.id }))); }

export function generateMetadata({ params }: { params: { slug: string; lessonId: string } }): Metadata {
  const lesson = getModule(params.slug)?.lessons.find((item) => item.id === params.lessonId);
  return { title: lesson ? `${lesson.title} | Wordplay` : "Lesson | Wordplay" };
}

export default function LessonPage({ params }: { params: { slug: string; lessonId: string } }) {
  const currentModule = getModule(params.slug); const lesson = currentModule?.lessons.find((item) => item.id === params.lessonId);
  if (!currentModule || !lesson) notFound();
  return <LessonClient module={currentModule} lesson={lesson} index={currentModule.lessons.findIndex((item) => item.id === lesson.id)} sources={referencesForLesson(currentModule.id, lesson.id)} terms={lessonTerms(lesson.body, glossary)} />;
}
