const sections = [
  { title: "How progress works", body: "Lessons award 10 XP, activities award 25 XP, and quizzes award up to 50 XP based on your best score. A return on the next day adds a streak bonus. Levels and badges mark progress without ranking students against each other." },
  { title: "Privacy by design", body: "AI Compass has no accounts, backend, analytics, or API calls. Your progress stays in this browser's local storage. Do not type private information into any practice field." },
  { title: "Export your progress", body: "The dashboard can export a versioned JSON file. Import it on another device to continue. Keep the file private because it contains your learning history." },
  { title: "Teacher guide", body: "Invite students to explain an answer, compare AI output with a source, and discuss the tradeoffs in each scenario. The capstone is designed as a reflection starter, not a grade generator." }
];

export default function AboutPage() {
  return (
    <div className="shell py-12 sm:py-16">
      <p className="eyebrow">For students, families, and teachers</p>
      <h1 className="display-lg mt-4 max-w-5xl">A calm place to learn how AI works<span className="text-signal">.</span></h1>
      <ol className="mt-20 border-t border-ink">
        {sections.map((section, i) => (
          <li key={section.title} className="grid gap-4 border-b border-ink py-10 md:grid-cols-[80px_1fr_1.2fr] md:gap-8">
            <span className="index">{String(i + 1).padStart(2, "0")}</span>
            <h2 className="display-md">{section.title}</h2>
            <p className="prose-body max-w-xl text-mute">{section.body}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
