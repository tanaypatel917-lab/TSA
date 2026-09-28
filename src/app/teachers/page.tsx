import type { Metadata } from "next";
import Link from "next/link";
import { modules } from "@/content";
import { referenceById, referenceNumber } from "@/content/references";
import { bigIdeas, chapterPlans } from "@/content/toolkit";
import { moduleVisuals } from "@/content/visuals";
import { PageHero } from "@/components/PageHero";
import { ChapterPlans } from "@/components/teachers/ChapterPlans";
import { PolicyBuilder } from "@/components/teachers/PolicyBuilder";
import { ProgressChecker } from "@/components/teachers/ProgressChecker";
import "./teachers.css";

export const metadata: Metadata = { title: "Teacher toolkit | Wordplay", description: "Lesson plans, worksheets, a progress file checker and a classroom AI policy builder for teaching AI literacy with Wordplay." };

const lessonCount = modules.reduce((total, module) => total + module.lessons.length, 0);
const basics = [
  ["No accounts", "Students open the site and start. There are no logins, class codes or data collection to set up."],
  ["Progress files", "Progress stays on each student’s device. Students export a file from My learning so you can check it below."],
  ["Runs locally", "Activities use rules built into the site, not a live AI service, so they work the same for every student."]
];
const teacherSources = ["touretzky-2019", "unesco-2023", "teachai", "nist-2023", "mcadoo-2023"];

export default function TeachersPage() {
  return <div className="teachers">
    <PageHero tone="sky" label="For teachers" title="Teach AI literacy in five chapters." lede="Lesson plans, worksheets and classroom tools for using Wordplay with grades 9–12. Everything prints, and nothing needs a login." mark="✎">
      <dl className="page-hero-stats"><div><dt>Chapter plans</dt><dd>{chapterPlans.length}</dd></div><div><dt>Worksheets</dt><dd>{chapterPlans.length}</dd></div><div><dt>Lessons</dt><dd>{lessonCount}</dd></div><div><dt>Accounts needed</dt><dd>0</dd></div></dl>
    </PageHero>
    <section className="shell teachers-basics" aria-label="How Wordplay works in class">{basics.map(([title, text], index) => <article key={title} data-reveal={index}><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><h2>{title}</h2><p>{text}</p></article>)}</section>
    <section className="shell teachers-section" aria-labelledby="plans-title">
      <div className="teachers-heading"><h2 id="plans-title">Chapter plans</h2><p>Each plan has goals, timing, a warm-up, discussion questions and activity tips. Print the plan, a student worksheet or its answer guide.</p></div>
      <ChapterPlans />
    </section>
    <section className="teachers-align" aria-labelledby="align-title"><div className="shell">
      <div className="teachers-heading"><h2 id="align-title">Standards alignment</h2><p>Chapters mapped to the AI4K12 Five Big Ideas in AI (Touretzky et al., 2019).</p></div>
      <div className="align-table" role="region" aria-label="Alignment table" tabIndex={0}><table>
        <thead><tr><th scope="col">Big Idea</th>{modules.map((module) => <th key={module.id} scope="col">{moduleVisuals[module.id].chapter}</th>)}</tr></thead>
        <tbody>{bigIdeas.map((idea) => <tr key={idea.id}><th scope="row"><strong>{idea.id}. {idea.name}</strong><span>{idea.text}</span></th>{chapterPlans.map((plan) => <td key={plan.moduleId}>{plan.bigIdeas.includes(idea.id) ? <span className="align-yes" aria-label="Covered">✓</span> : <span className="sr-only">Not a focus</span>}</td>)}</tr>)}</tbody>
      </table></div>
    </div></section>
    <section className="shell teachers-section" aria-labelledby="checker-title">
      <div className="teachers-heading"><h2 id="checker-title">Check a progress file</h2><p>See chapters completed, quiz scores, XP, badges and streaks for one student or a whole class.</p></div>
      <ProgressChecker />
    </section>
    <section className="shell teachers-section" aria-labelledby="policy-title">
      <div className="teachers-heading"><h2 id="policy-title">Classroom AI policy</h2><p>Choose what’s allowed, add a disclosure note, and print a one-page policy for your class. Based on guidance from UNESCO, TeachAI, APA and MLA.</p></div>
      <PolicyBuilder />
    </section>
    <section className="shell teachers-section teachers-sources" aria-labelledby="teacher-sources-title">
      <h2 id="teacher-sources-title">Frameworks behind this toolkit</h2>
      <ul>{teacherSources.map((id) => { const reference = referenceById(id)!; return <li key={id}><Link href={`/references#ref-${id}`}><span>[{referenceNumber(id)}]</span> {reference.title}</Link><small>{reference.publisher}</small></li>; })}</ul>
      <Link href="/references" className="text-link">All references <span aria-hidden="true">↗</span></Link>
    </section>
  </div>;
}
