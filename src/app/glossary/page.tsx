import type { Metadata } from "next";
import { modules } from "@/content";
import { glossary } from "@/content/glossary";
import { GlossaryExplorer } from "@/components/GlossaryExplorer";
import { PageHero } from "@/components/PageHero";
import { lessonsForTerm } from "@/engine/glossary";
import "./glossary.css";

export const metadata: Metadata = { title: "Glossary | Wordplay" };

export default function GlossaryPage() {
  const entries = glossary.map((item) => ({ ...item, lessons: lessonsForTerm(item.term, modules) }));
  return <><PageHero tone="paper" label="Glossary" title="Words that make better questions." lede={`${glossary.length} terms you will meet in the lessons. Search them, jump to the lesson that explains each one, or test yourself with study cards.`} mark="Aa" /><GlossaryExplorer entries={entries} /></>;
}
