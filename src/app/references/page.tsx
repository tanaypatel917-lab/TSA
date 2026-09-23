import type { Metadata } from "next";
import { modules } from "@/content";
import { creditGroups, referenceGroups, referenceNumber, referencesCheckedOn } from "@/content/references";
import { moduleVisuals } from "@/content/visuals";
import { PageHero } from "@/components/PageHero";
import { ReferencesExplorer, type BoardChapter, type ExplorerGroup } from "@/components/references/ReferencesExplorer";
import "./references.css";

export const metadata: Metadata = { title: "References | Wordplay" };

const introKey = "intro/proof";
const lessonLinks = new Map<string, { href: string; title: string }>(modules.flatMap((module) => module.lessons.map((lesson) => [`${module.id}/${lesson.id}`, { href: `/modules/${module.slug}/lessons/${lesson.id}`, title: lesson.title }])));
const chapters: BoardChapter[] = [...modules.map((module) => ({ id: module.id, label: moduleVisuals[module.id].chapter, lessons: module.lessons.map((lesson, index) => ({ key: `${module.id}/${lesson.id}`, title: lesson.title, number: index + 1 })) })), { id: "introduction", label: "Introduction", lessons: [{ key: introKey, title: "The proof scene", number: 1 }] }];
const groups: ExplorerGroup[] = referenceGroups.map((group) => ({ ...group, label: moduleVisuals[group.id]?.chapter ?? "Introduction", references: group.references.map((reference) => ({ ...reference, number: referenceNumber(reference.id), links: reference.lessons.length ? reference.lessons : group.id === "introduction" ? [introKey] : [], used: reference.lessons.map((key) => lessonLinks.get(key)).filter((lesson) => lesson !== undefined) })) }));

export default function ReferencesPage() {
  const references = referenceGroups.flatMap((group) => group.references);
  const connections = groups.reduce((total, group) => total + group.references.reduce((sum, reference) => sum + reference.links.length, 0), 0);
  const cited = new Set(references.flatMap((reference) => reference.lessons)).size;
  const publishers = [...new Set(references.map((reference) => reference.publisher))];
  const checked = new Date(referencesCheckedOn).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const typefaces = creditGroups.find((group) => group.id === "type")?.credits ?? [];
  return <div className="references-page"><PageHero tone="ink" label="References" title="Where our facts come from." lede="Every lesson is backed by real, checked sources. See how they connect, then cite them yourself." mark="“”"><dl className="page-hero-stats"><div><dt>Sources</dt><dd>{references.length}</dd></div><div><dt>Lessons cited</dt><dd>{cited} of {lessonLinks.size}</dd></div><div><dt>Connections</dt><dd>{connections}</dd></div><div><dt>Links checked</dt><dd>{checked}</dd></div></dl></PageHero><div className="publisher-marquee" aria-hidden="true"><div className="marquee-track">{[0, 1].map((copy) => <div key={copy} className="marquee-set">{publishers.map((publisher) => <span key={publisher}>{publisher}<i>*</i></span>)}</div>)}</div></div><ReferencesExplorer chapters={chapters} groups={groups} checkedOn={referencesCheckedOn} /><section id="references-credits" className="shell credits" aria-labelledby="references-credits-title"><h2 id="references-credits-title">Typefaces, 3D, and software</h2><p className="credits-lede">The tools and typefaces behind Wordplay, with their licenses.</p><div className="specimens">{typefaces.map((typeface, index) => <figure key={typeface.name} className="specimen" data-face={index === 0 ? "display" : "body"}><p className="specimen-glyphs" aria-hidden="true">{index === 0 ? "Aa?" : "Aa"}</p><p className="specimen-sample" aria-hidden="true">{index === 0 ? "Ask better. Think further." : "Learn how AI works, test its answers, and make decisions you can explain."}</p><figcaption>{typeface.url ? <a href={typeface.url} rel="noreferrer">{typeface.name}</a> : typeface.name}<span>{typeface.detail}</span><span>{index === 0 ? "Headlines and display type" : "Reading and interface text"}</span></figcaption></figure>)}</div><div className="credit-columns">{creditGroups.filter((group) => group.id !== "type").map((group) => <div key={group.id} className="credit-group"><h3>{group.title}</h3><dl className="credit-list">{group.credits.map((credit) => <div key={credit.name}><dt>{credit.url ? <a href={credit.url} rel="noreferrer">{credit.name}</a> : credit.name}</dt><dd>{credit.detail}</dd></div>)}</dl></div>)}</div></section></div>;
}
