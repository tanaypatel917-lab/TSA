import { notFound } from "next/navigation";
import { getModule, modules } from "@/content";
import { LessonClient } from "@/components/LessonClient";

export function generateStaticParams() { return modules.flatMap((module) => module.lessons.map((lesson) => ({ slug: module.slug, lessonId: lesson.id }))); }

export default function LessonPage({ params }: { params: { slug: string; lessonId: string } }) {
  const currentModule = getModule(params.slug); const lesson = currentModule?.lessons.find((item) => item.id === params.lessonId);
  if (!currentModule || !lesson) notFound();
  return <LessonClient module={currentModule} lesson={lesson} index={currentModule.lessons.findIndex((item) => item.id === lesson.id)} />;
}
