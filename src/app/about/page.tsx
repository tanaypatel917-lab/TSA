import type { Metadata } from "next";
import Link from "next/link";
import { modules } from "@/content";

export const metadata: Metadata = { title: "About & Teacher Guide", description: "How AI Compass works, learning objectives per module, and how to run it in a classroom." };

const pad = (n: number) => String(n).padStart(2, "0");

const sections = [
  { title: "How progress works", body: "Lessons award 10 XP, activities award 25 XP, and quizzes award up to 50 XP based on your best score. A return on the next day adds a streak bonus. Levels and badges mark progress without ranking students against each other." },
  { title: "Privacy by design", body: "All data stays on this device. AI Compass has no accounts, no backend server, no analytics, no cookies, and no calls to external AI services. XP, badges, quiz scores, and activity answers live only in this browser's local storage and can be cleared from the dashboard at any time. Do not type private information into any practice field." },
  { title: "Export your progress", body: "The dashboard can export a versioned JSON file. Import it on another device to continue. Keep the file private because it contains your learning history." },
  { title: "Accessibility", body: "Every activity works with a keyboard alone, glossary tooltips are screen-reader friendly, colors meet contrast guidelines, and animation respects the reduced-motion setting. Text can be resized with browser zoom." }
];

const objectives: Record<string, { objectives: string[]; classTime: string; standards: string }> = {
  foundations: { objectives: ["Explain the difference between rule-based programs and machine learning using everyday examples such as spam filters.", "Describe how a language model predicts text one token at a time and why that can produce hallucinations.", "Identify how training data can introduce bias and name at least two ways teams check for it."], classTime: "Two 50-minute periods (lessons + classifier activity), quiz as homework", standards: "AI4K12 Big Ideas 1-3 (Perception, Representation & Reasoning, Learning)" },
  tools: { objectives: ["Write a prompt that states role, task, context, format, and constraints.", "Iterate on an AI response and verify an important claim against a trusted source.", "Decide when a calculator, a library source, a teacher, or no tool at all is the better choice."], classTime: "Two 50-minute periods, including the prompt lab in pairs", standards: "ISTE Students 1.3 (Knowledge Constructor), 1.5 (Computational Thinker)" },
  ethics: { objectives: ["Apply a class AI policy to a concrete situation and explain the reasoning.", "Recognize proxy variables and explain why overall accuracy can hide unfair outcomes.", "Evaluate a suspicious video or claim using source, date, context, and corroboration."], classTime: "Two or three 50-minute periods; scenarios work well as a whole-class discussion", standards: "AI4K12 Big Idea 5 (Societal Impact); ISTE Students 1.2 (Digital Citizen)" },
  "real-world": { objectives: ["Describe how AI changes tasks within a career rather than replacing whole jobs.", "Explain why medical and environmental AI need human oversight and representative testing.", "Reflect on a case study and identify a benefit, a risk, and an open question."], classTime: "One or two 50-minute periods; case studies can be split across small groups", standards: "AI4K12 Big Idea 5; NGSS science-and-engineering practices (evaluating information)" },
  capstone: { objectives: ["Plan a small project that gives AI a narrow, checkable role.", "Document prompts, outputs, verification steps, and disclosure of assistance.", "Identify a stop rule and a stakeholder who should give feedback."], classTime: "One period to draft the plan, plus a short presentation or peer review", standards: "ISTE Students 1.4 (Innovative Designer), 1.6 (Creative Communicator)" }
};

const classroom = [
  ["Set expectations first", "Open with the Ethical & Responsible Use module's academic-integrity lesson, or share your own AI policy, so students know what use is allowed before they start experimenting."],
  ["Read together, then alone", "Read the first lesson of a module aloud and open a few glossary terms as a group. Then let students finish the module at their own pace on a laptop or phone."],
  ["Use activities for discussion", "The classifier, prompt lab, and scenarios are designed to be talked about. Pause after each and ask students to defend a choice to a partner."],
  ["Treat quizzes as practice", "Quizzes can be retaken and keep the best score. Ask students to explain one question they missed instead of grading the number."],
  ["Finish with the capstone", "The capstone worksheet produces a plan students can present or peer-review. Pair it with a real assignment so the plan gets used."],
  ["Keep learning visible", "Because progress is stored per device, ask students to export their progress file or screenshot their badge shelf if you need evidence of completion."]
];

const starters = ["Where did you use AI this week without noticing it?", "What is one claim an AI tool made that you would want to check, and how would you check it?", "Who is affected by a recommendation system besides the person using it?", "When is choosing not to use AI the smartest option?"];

const totalMinutes = (moduleId: string) => modules.find((module) => module.id === moduleId)?.lessons.reduce((sum, lesson) => sum + lesson.minutes, 0) ?? 0;

export default function AboutPage() {
  return (
    <div className="shell py-12 sm:py-16">
      <p className="eyebrow">For students, families, and teachers</p>
      <h1 className="display-lg mt-4 max-w-5xl">A calm place to learn how AI works<span className="text-signal">.</span></h1>
      <p className="prose-body mt-6 max-w-2xl text-mute">AI Compass is a self-paced course with five modules, hands-on activities, and short quizzes. It runs entirely in the browser, needs no account, and makes no calls to real AI services, so it is safe to use in any school.</p>

      <ol className="mt-20 border-t border-ink">
        {sections.map((section, i) => (
          <li key={section.title} className="grid gap-4 border-b border-ink py-10 md:grid-cols-[80px_1fr_1.2fr] md:gap-8">
            <span className="index">{pad(i + 1)}</span>
            <h2 className="display-md">{section.title}</h2>
            <p className="prose-body max-w-xl text-mute">{section.body}</p>
          </li>
        ))}
      </ol>

      <section className="mt-24" aria-labelledby="teacher-guide">
        <p className="eyebrow">Teacher guide</p>
        <h2 id="teacher-guide" className="display-lg mt-4 max-w-4xl">Modules, objectives, and class time<span className="text-signal">.</span></h2>
        <p className="prose-body mt-6 max-w-2xl text-mute">Each module follows the same arc: read the lessons, complete one interactive activity, then take an eight-question quiz with instant explanations. Reading times are estimates for a grade-9 reading level.</p>
        <ol className="mt-12 border-t border-ink">
          {modules.map((module, i) => { const plan = objectives[module.id]; return (
            <li key={module.id} className="grid gap-6 border-b border-ink py-10 md:grid-cols-[80px_1fr_1.2fr] md:gap-8">
              <span className="index">{pad(i + 1)}</span>
              <div>
                <h3 className="display-md"><Link className="hover:text-signal" href={`/modules/${module.slug}`}>{module.title}</Link></h3>
                <p className="index mt-4">{module.lessons.length} lessons · ~{totalMinutes(module.id)} min reading · {module.quiz.length} quiz questions</p>
                {plan && <dl className="mono-label mt-6 space-y-3 text-mute"><div><dt className="text-ink">:// class time</dt><dd className="mt-1 normal-case tracking-normal">{plan.classTime}</dd></div><div><dt className="text-ink">:// alignment</dt><dd className="mt-1 normal-case tracking-normal">{plan.standards}</dd></div></dl>}
              </div>
              {plan && <div><p className="mono-label">:// students will be able to</p><ul className="prose-body mt-4 max-w-xl space-y-3 text-mute">{plan.objectives.map((objective) => <li key={objective} className="flex gap-4"><span aria-hidden="true" className="text-signal">→</span><span>{objective}</span></li>)}</ul></div>}
            </li>
          ); })}
        </ol>
      </section>

      <section className="mt-24" aria-labelledby="classroom">
        <p className="eyebrow">In the classroom</p>
        <h2 id="classroom" className="display-lg mt-4 max-w-4xl">How to run this with a class<span className="text-signal">.</span></h2>
        <ol className="mt-12 grid border-t border-ink sm:grid-cols-2 lg:grid-cols-3">
          {classroom.map(([title, text], i) => (
            <li key={title} className="border-b border-ink py-8 pr-6 sm:[&:nth-child(2n)]:pl-6 lg:[&:nth-child(2n)]:pl-0 lg:[&:nth-child(3n+2)]:px-6 lg:[&:nth-child(3n)]:pl-6">
              <span className="index">{pad(i + 1)}</span>
              <h3 className="display-sm mt-3">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-mute">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-24 grid gap-10 md:grid-cols-2" aria-labelledby="starters">
        <div>
          <p className="eyebrow">Discussion starters</p>
          <h2 id="starters" className="display-md mt-4">Questions worth a whole period<span className="text-signal">.</span></h2>
        </div>
        <ul className="prose-body space-y-4 text-mute">{starters.map((question) => <li key={question} className="flex gap-4 border-b border-ink pb-4"><span aria-hidden="true" className="text-signal">?</span><span>{question}</span></li>)}</ul>
      </section>

      <p className="index mt-24">Factual content is cited on the <Link className="underline decoration-signal underline-offset-4 hover:text-ink" href="/sources">Sources</Link> page.</p>
    </div>
  );
}
