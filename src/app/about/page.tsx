import type { Metadata } from "next";
import Link from "next/link";
import { modules } from "@/content";

export const metadata: Metadata = { title: "About & Teacher Guide", description: "How AI Compass works, learning objectives per module, and how to run it in a classroom." };

const objectives: Record<string, { objectives: string[]; classTime: string; standards: string }> = {
  foundations: { objectives: ["Explain the difference between rule-based programs and machine learning using everyday examples such as spam filters.", "Describe how a language model predicts text one token at a time and why that can produce hallucinations.", "Identify how training data can introduce bias and name at least two ways teams check for it."], classTime: "Two 50-minute periods (lessons + classifier activity), quiz as homework", standards: "AI4K12 Big Ideas 1-3 (Perception, Representation & Reasoning, Learning)" },
  tools: { objectives: ["Write a prompt that states role, task, context, format, and constraints.", "Iterate on an AI response and verify an important claim against a trusted source.", "Decide when a calculator, a library source, a teacher, or no tool at all is the better choice."], classTime: "Two 50-minute periods, including the prompt lab in pairs", standards: "ISTE Students 1.3 (Knowledge Constructor), 1.5 (Computational Thinker)" },
  ethics: { objectives: ["Apply a class AI policy to a concrete situation and explain the reasoning.", "Recognize proxy variables and explain why overall accuracy can hide unfair outcomes.", "Evaluate a suspicious video or claim using source, date, context, and corroboration."], classTime: "Two or three 50-minute periods; scenarios work well as a whole-class discussion", standards: "AI4K12 Big Idea 5 (Societal Impact); ISTE Students 1.2 (Digital Citizen)" },
  "real-world": { objectives: ["Describe how AI changes tasks within a career rather than replacing whole jobs.", "Explain why medical and environmental AI need human oversight and representative testing.", "Reflect on a case study and identify a benefit, a risk, and an open question."], classTime: "One or two 50-minute periods; case studies can be split across small groups", standards: "AI4K12 Big Idea 5; NGSS science-and-engineering practices (evaluating information)" },
  capstone: { objectives: ["Plan a small project that gives AI a narrow, checkable role.", "Document prompts, outputs, verification steps, and disclosure of assistance.", "Identify a stop rule and a stakeholder who should give feedback."], classTime: "One period to draft the plan, plus a short presentation or peer review", standards: "ISTE Students 1.4 (Innovative Designer), 1.6 (Creative Communicator)" }
};

const totalMinutes = (moduleId: string) => modules.find((module) => module.id === moduleId)?.lessons.reduce((sum, lesson) => sum + lesson.minutes, 0) ?? 0;

export default function AboutPage() {
  return <div className="shell py-12">
    <p className="eyebrow">For students, families, and teachers</p>
    <h1 className="mt-2 max-w-3xl text-4xl font-black">A calm place to learn how AI works.</h1>
    <p className="mt-4 max-w-2xl text-lg text-slate-600">AI Compass is a self-paced course with five modules, hands-on activities, and short quizzes. It runs entirely in the browser, needs no account, and makes no calls to real AI services, so it is safe to use in any school.</p>

    <div className="mt-10 grid gap-5 md:grid-cols-2">
      <section className="card"><h2 className="text-xl font-bold">How progress works</h2><p className="mt-3 text-slate-600">Lessons award 10 XP, activities award 25 XP, and quizzes award up to 50 XP based on your best score. A return on the next day adds a streak bonus. Levels and badges mark progress without ranking students against each other.</p></section>
      <section className="card"><h2 className="text-xl font-bold">Export your progress</h2><p className="mt-3 text-slate-600">The dashboard can export a versioned JSON file. Import it on another device to continue. Keep the file private because it contains your learning history.</p></section>
    </div>

    <section className="mt-12" aria-labelledby="teacher-guide">
      <p className="eyebrow">Teacher guide</p>
      <h2 id="teacher-guide" className="mt-2 text-3xl font-black">Modules, learning objectives, and class time</h2>
      <p className="mt-3 max-w-2xl text-slate-600">Each module follows the same arc: read the lessons, complete one interactive activity, then take an eight-question quiz with instant explanations. Reading times are estimates for a grade-9 reading level.</p>
      <div className="mt-6 grid gap-5">
        {modules.map((module) => { const plan = objectives[module.id]; return <section key={module.id} className="card">
          <div className="flex flex-wrap items-baseline justify-between gap-3"><h3 className="text-xl font-bold"><span aria-hidden="true" className="mr-2">{module.icon}</span><Link className="hover:text-accent" href={`/modules/${module.slug}`}>{module.title}</Link></h3><p className="text-sm font-semibold text-slate-500">{module.lessons.length} lessons · about {totalMinutes(module.id)} min reading · {module.quiz.length} quiz questions</p></div>
          {plan && <div className="mt-4 grid gap-4 md:grid-cols-[2fr_1fr]">
            <div><h4 className="text-sm font-bold uppercase tracking-wide text-slate-500">Students will be able to</h4><ul className="mt-2 list-disc space-y-1 pl-5 text-slate-700">{plan.objectives.map((objective) => <li key={objective}>{objective}</li>)}</ul></div>
            <div className="space-y-3 text-sm text-slate-600"><p><span className="font-bold text-slate-800">Suggested class time:</span> {plan.classTime}</p><p><span className="font-bold text-slate-800">Alignment:</span> {plan.standards}</p></div>
          </div>}
        </section>; })}
      </div>
    </section>

    <section className="mt-12 grid gap-5 md:grid-cols-2" aria-labelledby="classroom">
      <div className="card md:col-span-2">
        <h2 id="classroom" className="text-2xl font-black">How to run this in a classroom</h2>
        <ol className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            ["Set expectations first", "Open with the Ethical & Responsible Use module's academic-integrity lesson, or share your own AI policy, so students know what use is allowed in your class before they start experimenting."],
            ["Read together, then alone", "Read the first lesson of a module aloud and click a few glossary terms as a group. Then let students finish the module at their own pace on a laptop or phone."],
            ["Use activities for discussion", "The classifier, prompt lab, and scenarios are designed to be talked about. Pause after each and ask students to defend a choice to a partner."],
            ["Treat quizzes as practice", "Quizzes can be retaken and keep the best score. Ask students to explain one question they missed instead of grading the number."],
            ["Finish with the capstone", "The capstone worksheet produces a plan students can present or peer-review. Pair it with a real assignment so the plan gets used."],
            ["Keep learning visible", "Because progress is stored per device, ask students to export their progress file or take a screenshot of their badge shelf if you need evidence of completion."]
          ].map(([title, text]) => <li key={title} className="rounded-2xl bg-slate-50 p-4"><h3 className="font-bold">{title}</h3><p className="mt-2 text-sm text-slate-600">{text}</p></li>)}
        </ol>
      </div>
      <section className="card"><h2 className="text-xl font-bold">Discussion starters</h2><ul className="mt-3 list-disc space-y-2 pl-5 text-slate-600"><li>Where did you use AI this week without noticing it?</li><li>What is one claim an AI tool made that you would want to check, and how would you check it?</li><li>Who is affected by a recommendation system besides the person using it?</li><li>When is choosing not to use AI the smartest option?</li></ul></section>
      <section className="card"><h2 className="text-xl font-bold">Accessibility</h2><p className="mt-3 text-slate-600">Every activity works with a keyboard alone, glossary tooltips are screen-reader friendly, colors meet contrast guidelines, and animation respects the reduced-motion setting. Text can be resized with the browser zoom.</p></section>
    </section>

    <section className="card mt-12 max-w-3xl" aria-labelledby="privacy">
      <h2 id="privacy" className="text-2xl font-black">Privacy statement</h2>
      <p className="mt-3 text-slate-600">All data stays on this device. AI Compass has no accounts, no backend server, no analytics, no cookies, and no calls to external AI services. XP, badges, quiz scores, and activity answers are saved only in this browser&apos;s local storage and can be cleared at any time from the dashboard or by clearing site data.</p>
      <p className="mt-3 text-slate-600">The practice fields do not send text anywhere, but students should still avoid typing personal information about themselves or others. Teachers never receive student data unless a student chooses to share an exported progress file.</p>
      <p className="mt-3 text-sm text-slate-500">Factual content is cited on the <Link className="underline hover:text-accent" href="/sources">Sources</Link> page.</p>
    </section>
  </div>;
}
