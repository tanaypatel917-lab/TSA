import type { Lesson, Module } from "@/content/types";

export type TermLesson = { href: string; title: string };
export type GlossaryEntry = { term: string; definition: string };
export type LessonTerm = GlossaryEntry & { slug: string; paragraph: number; start: number; end: number };

const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const pattern = (term: string, flags = "i") => new RegExp(`\\b${escape(term)}s?\\b`, flags);
const tooCommon = new Set(["AI"]);

export function termSlug(term: string) {
  return term.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function lessonsForTerm(term: string, moduleList: Module[], limit = 2): TermLesson[] {
  const match = pattern(term);
  return moduleList
    .flatMap((module) => module.lessons.map((lesson) => ({ module, lesson, inTitle: match.test(lesson.title), inBody: lesson.body.some((paragraph) => match.test(paragraph)) })))
    .filter((found) => found.inTitle || found.inBody)
    .sort((a, b) => Number(b.inTitle) - Number(a.inTitle))
    .slice(0, limit)
    .map(({ module, lesson }) => ({ href: `/modules/${module.slug}/lessons/${lesson.id}`, title: lesson.title }));
}

export function lessonTerms(body: string[], entries: GlossaryEntry[]): LessonTerm[] {
  const found: LessonTerm[] = [];
  for (const entry of [...entries].filter((item) => !tooCommon.has(item.term)).sort((a, b) => b.term.length - a.term.length)) {
    const hit = body.flatMap((text, paragraph) => [...text.matchAll(pattern(entry.term, "gi"))].map((match) => ({ paragraph, start: match.index ?? 0, end: (match.index ?? 0) + match[0].length })))
      .find((candidate) => !found.some((term) => term.paragraph === candidate.paragraph && candidate.start < term.end && candidate.end > term.start));
    if (hit) found.push({ ...entry, slug: termSlug(entry.term), ...hit });
  }
  return found.sort((a, b) => a.paragraph - b.paragraph || a.start - b.start);
}

export function chapterTerms(lessons: Lesson[], entries: GlossaryEntry[]) {
  const seen = new Map<string, LessonTerm>();
  for (const lesson of lessons) for (const term of lessonTerms(lesson.body, entries)) if (!seen.has(term.term)) seen.set(term.term, term);
  return [...seen.values()].map(({ term, slug }) => ({ term, slug }));
}
