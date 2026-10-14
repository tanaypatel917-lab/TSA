import type { Metadata } from "next";
import { modules } from "@/content";
import { glossary } from "@/content/glossary";
import { PageHero } from "@/components/PageHero";
import { TrayPageContent } from "@/components/WordTray";
import { lessonsForTerm } from "@/engine/glossary";
import "./tray.css";

export const metadata: Metadata = { title: "Word tray" };

const entries = glossary.map(({ term, definition }) => ({ term, definition, lessons: lessonsForTerm(term, modules) }));

export default function TrayPage() {
  return <div className="tray-page"><PageHero stage="deck" tone="clay" label="Word tray" title="Your words, ready to study." lede="Save words from the glossary or any lesson. They stay in this browser only." mark="Aa" /><TrayPageContent entries={entries} /></div>;
}
