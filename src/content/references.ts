export type ReferenceKind = "research" | "institution" | "journalism" | "guide";

export const referenceKinds: Record<ReferenceKind, string> = {
  research: "Research",
  institution: "Institutions",
  journalism: "Journalism",
  guide: "Guides"
};

export type Reference = {
  id: string;
  kind: ReferenceKind;
  publisher: string;
  short: string;
  authors: string;
  date: string;
  title: string;
  source?: string;
  url: string;
  note: string;
  lessons: string[];
};

export type ReferenceGroup = { id: string; title: string; description: string; references: Reference[] };

export type Credit = { name: string; detail: string; url?: string };

export const referencesCheckedOn = "September 22, 2026";

export const referenceGroups: ReferenceGroup[] = [
  {
    id: "foundations",
    title: "AI Foundations",
    description: "How AI systems learn from examples, how language models write, and why errors and bias happen.",
    references: [
      { id: "touretzky-2019", kind: "research", publisher: "AAAI", short: "Envisioning AI for K-12", authors: "Touretzky, D., Gardner-McCune, C., Martin, F., & Seehorn, D.", date: "2019", title: "Envisioning AI for K-12: What should every child know about AI?", source: "Proceedings of the AAAI Conference on Artificial Intelligence, 33(01)", url: "https://ojs.aaai.org/index.php/AAAI/article/view/5053", note: "The AI4K12 Five Big Ideas (perception, representation and reasoning, learning, natural interaction, and societal impact) shaped what the course covers.", lessons: ["foundations/what-is-ai", "foundations/rules-and-learning"] },
      { id: "google-mlcc", kind: "guide", publisher: "Google", short: "Machine learning crash course", authors: "Google for Developers", date: "n.d.", title: "Machine learning crash course", url: "https://developers.google.com/machine-learning/crash-course", note: "How models learn patterns from labeled examples, including classification tasks such as spam filtering.", lessons: ["foundations/rules-and-learning"] },
      { id: "openai-tokens", kind: "guide", publisher: "OpenAI", short: "Understanding tokens", authors: "OpenAI", date: "n.d.", title: "Understanding and counting tokens", source: "OpenAI Help Center", url: "https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-to-count-them", note: "What tokens are, and how a language model reads and generates text one token at a time.", lessons: ["foundations/language-models"] },
      { id: "ouyang-2022", kind: "research", publisher: "arXiv", short: "Learning from human feedback", authors: "Ouyang, L., Wu, J., Jiang, X., et al.", date: "2022", title: "Training language models to follow instructions with human feedback", source: "arXiv:2203.02155", url: "https://arxiv.org/abs/2203.02155", note: "How extra training with human feedback makes model responses more helpful and less harmful.", lessons: ["foundations/language-models"] },
      { id: "ji-2022", kind: "research", publisher: "arXiv", short: "Survey of hallucination", authors: "Ji, Z., Lee, N., Frieske, R., et al.", date: "2022", title: "Survey of hallucination in natural language generation", source: "arXiv:2202.03629", url: "https://arxiv.org/abs/2202.03629", note: "Why language models produce fluent text that is unsupported or invented.", lessons: ["foundations/language-models", "foundations/strengths-and-limits"] },
      { id: "buolamwini-2018", kind: "research", publisher: "PMLR", short: "Gender Shades", authors: "Buolamwini, J., & Gebru, T.", date: "2018", title: "Gender shades: Intersectional accuracy disparities in commercial gender classification", source: "Proceedings of Machine Learning Research, 81", url: "https://proceedings.mlr.press/v81/buolamwini18a.html", note: "Evidence that a high overall accuracy can hide much worse results for some groups of people.", lessons: ["foundations/data-and-bias", "ethics/fairness"] },
      { id: "dastin-2018", kind: "journalism", publisher: "Reuters", short: "Amazon’s biased recruiting tool", authors: "Dastin, J.", date: "2018, October 10", title: "Amazon scraps secret AI recruiting tool that showed bias against women", source: "Reuters", url: "https://www.reuters.com/article/world/amazon-scraps-secret-ai-recruiting-tool-that-showed-bias-against-women-idUSKCN1MK08J/", note: "A real hiring model that learned to favor the narrow past workforce it was trained on.", lessons: ["foundations/data-and-bias"] }
    ]
  },
  {
    id: "tools",
    title: "AI Tools & Techniques",
    description: "Writing clear prompts, checking results, and choosing when a tool fits the task.",
    references: [
      { id: "openai-prompting", kind: "guide", publisher: "OpenAI", short: "Prompt engineering guide", authors: "OpenAI", date: "n.d.", title: "Prompt engineering", source: "OpenAI API documentation", url: "https://developers.openai.com/api/docs/guides/prompt-engineering", note: "Practical guidance on clear instructions, roles, context, examples, and testing a prompt before relying on it.", lessons: ["tools/prompt-anatomy", "tools/iterate-verify"] },
      { id: "unesco-2023", kind: "institution", publisher: "UNESCO", short: "Generative AI in education", authors: "UNESCO", date: "2023", title: "Guidance for generative AI in education and research", url: "https://www.unesco.org/en/articles/guidance-generative-ai-education-and-research", note: "International guidance on human-centered, age-appropriate, and privacy-aware use of generative AI in schools.", lessons: ["tools/study-tools", "tools/when-not-to-use", "ethics/academic-integrity"] },
      { id: "openai-data", kind: "guide", publisher: "OpenAI", short: "How chats train models", authors: "OpenAI", date: "n.d.", title: "How your data is used to improve model performance", source: "OpenAI Help Center", url: "https://help.openai.com/en/articles/5722486", note: "An example of a consumer AI service that can train on conversations unless the user opts out.", lessons: ["tools/when-not-to-use", "ethics/privacy"] },
      { id: "copyright-office", kind: "institution", publisher: "U.S. Copyright Office", short: "Copyright and AI", authors: "U.S. Copyright Office", date: "n.d.", title: "Copyright and artificial intelligence", url: "https://www.copyright.gov/ai/", note: "Ongoing U.S. policy work on training data, authorship, and who owns AI-generated material.", lessons: ["tools/creative-and-coding-tools", "real-world/creative-fields"] }
    ]
  },
  {
    id: "ethics",
    title: "Ethical & Responsible Use",
    description: "Academic honesty, fairness, privacy, misinformation, and the real costs of AI.",
    references: [
      { id: "mcadoo-2023", kind: "guide", publisher: "APA Style", short: "How to cite ChatGPT", authors: "McAdoo, T.", date: "2023, April 7", title: "How to cite ChatGPT", source: "APA Style Blog", url: "https://apastyle.apa.org/blog/how-to-cite-chatgpt", note: "How to disclose and cite AI assistance in schoolwork.", lessons: ["ethics/academic-integrity"] },
      { id: "mla-2023", kind: "guide", publisher: "MLA Style Center", short: "Citing AI in MLA style", authors: "Modern Language Association", date: "2023, March 17", title: "How do I cite generative AI in MLA style?", source: "MLA Style Center", url: "https://style.mla.org/citing-generative-ai/", note: "A second citation style for crediting generative AI.", lessons: ["ethics/academic-integrity"] },
      { id: "unesco-2021", kind: "institution", publisher: "UNESCO", short: "Ethics of AI", authors: "UNESCO", date: "2021", title: "Recommendation on the ethics of artificial intelligence", url: "https://www.unesco.org/en/artificial-intelligence/recommendation-ethics", note: "Global principles on fairness, privacy, human oversight, and environmental sustainability.", lessons: ["ethics/fairness", "ethics/privacy", "ethics/impact"] },
      { id: "ed-privacy", kind: "institution", publisher: "U.S. Department of Education", short: "Protecting student privacy", authors: "U.S. Department of Education", date: "n.d.", title: "Protecting student privacy", url: "https://studentprivacy.ed.gov/", note: "How student education records are protected, and why school-managed tools can differ from public websites.", lessons: ["ethics/privacy"] },
      { id: "caulfield-2019", kind: "guide", publisher: "Hapgood", short: "The SIFT method", authors: "Caulfield, M.", date: "2019, June 19", title: "SIFT (the four moves)", source: "Hapgood", url: "https://hapgood.us/2019/06/19/sift-the-four-moves/", note: "Stop, investigate the source, find better coverage, and trace claims back to their original context.", lessons: ["ethics/misinformation", "tools/iterate-verify"] },
      { id: "nsa-2023", kind: "institution", publisher: "NSA, FBI & CISA", short: "Deepfake threats", authors: "National Security Agency, Federal Bureau of Investigation, & Cybersecurity and Infrastructure Security Agency", date: "2023", title: "Contextualizing deepfake threats to organizations", source: "Cybersecurity Information Sheet", url: "https://media.defense.gov/2023/Sep/12/2003298925/-1/-1/0/CSI-DEEPFAKE-THREATS.PDF", note: "How synthetic audio and video are made, and how to verify them before acting.", lessons: ["ethics/misinformation"] },
      { id: "iea-2025", kind: "institution", publisher: "IEA", short: "Energy and AI", authors: "International Energy Agency", date: "2025", title: "Energy and AI", url: "https://www.iea.org/reports/energy-and-ai", note: "How much electricity data centres use today, and how AI could change that by 2030.", lessons: ["ethics/impact", "real-world/climate"] },
      { id: "li-2023", kind: "research", publisher: "arXiv", short: "AI’s water footprint", authors: "Li, P., Yang, J., Islam, M. A., & Ren, S.", date: "2023", title: "Making AI less \u201cthirsty\u201d: Uncovering and addressing the secret water footprint of AI models", source: "arXiv:2304.03271", url: "https://arxiv.org/abs/2304.03271", note: "Estimates of the water used to cool the data centres that train and run AI models.", lessons: ["ethics/impact"] },
      { id: "perrigo-2023", kind: "journalism", publisher: "TIME", short: "The workers behind ChatGPT", authors: "Perrigo, B.", date: "2023, January 18", title: "Exclusive: OpenAI used Kenyan workers on less than $2 per hour to make ChatGPT less toxic", source: "TIME", url: "https://time.com/6247678/openai-chatgpt-kenya-workers/", note: "Reporting on the human data-labeling work behind AI safety filters.", lessons: ["ethics/impact"] }
    ]
  },
  {
    id: "real-world",
    title: "AI in the Real World",
    description: "Careers, medicine, climate science, and creative work.",
    references: [
      { id: "wef-2025", kind: "institution", publisher: "World Economic Forum", short: "Future of Jobs 2025", authors: "World Economic Forum", date: "2025", title: "The future of jobs report 2025", url: "https://www.weforum.org/publications/the-future-of-jobs-report-2025/", note: "Employer survey data on how AI is changing tasks, and which skills are growing in importance.", lessons: ["real-world/careers"] },
      { id: "fda-devices", kind: "institution", publisher: "U.S. FDA", short: "AI-enabled medical devices", authors: "U.S. Food and Drug Administration", date: "n.d.", title: "Artificial intelligence-enabled medical devices", url: "https://www.fda.gov/medical-devices/software-medical-device-samd/artificial-intelligence-enabled-medical-devices", note: "The public list of authorized AI-enabled medical devices, many of them used to read medical images.", lessons: ["real-world/medicine"] },
      { id: "who-2021", kind: "institution", publisher: "WHO", short: "AI ethics in health", authors: "World Health Organization", date: "2021", title: "Ethics and governance of artificial intelligence for health", url: "https://www.who.int/publications/i/item/9789240029200", note: "Principles for accountable, safe, and equitable use of AI in health care.", lessons: ["real-world/medicine"] },
      { id: "nearing-2024", kind: "research", publisher: "Nature", short: "Global flood forecasting", authors: "Nearing, G., Cohen, D., Dube, V., et al.", date: "2024", title: "Global prediction of extreme floods in ungauged watersheds", source: "Nature, 627", url: "https://www.nature.com/articles/s41586-024-07145-1", note: "A machine-learning system that forecasts river floods in places with few measurements.", lessons: ["real-world/climate"] },
      { id: "rolnick-2019", kind: "research", publisher: "arXiv", short: "Machine learning for climate", authors: "Rolnick, D., Donti, P. L., Kaack, L. H., et al.", date: "2019", title: "Tackling climate change with machine learning", source: "arXiv:1906.05433", url: "https://arxiv.org/abs/1906.05433", note: "A survey of machine learning for weather, forests, energy systems, and other climate work.", lessons: ["real-world/climate"] },
      { id: "unesco-2024", kind: "institution", publisher: "UNESCO", short: "AI skills for students", authors: "UNESCO", date: "2024", title: "AI competency framework for students", url: "https://www.unesco.org/en/articles/ai-competency-framework-students", note: "The skills students need to understand, use, and question AI as the tools keep changing.", lessons: ["foundations/what-is-ai", "real-world/keep-learning"] }
    ]
  },
  {
    id: "capstone",
    title: "Capstone and course design",
    description: "Frameworks behind the capstone plan and the course's approach to responsible use.",
    references: [
      { id: "nist-2023", kind: "institution", publisher: "NIST", short: "AI Risk Management Framework", authors: "National Institute of Standards and Technology", date: "2023", title: "Artificial intelligence risk management framework (AI RMF 1.0)", source: "NIST AI 100-1", url: "https://www.nist.gov/itl/ai-risk-management-framework", note: "A framework for testing, documenting, and monitoring AI systems, and for stopping ones that cause harm.", lessons: ["foundations/data-and-bias", "capstone/project-brief", "capstone/responsible-launch"] },
      { id: "teachai", kind: "guide", publisher: "TeachAI", short: "AI guidance for schools", authors: "TeachAI", date: "n.d.", title: "AI guidance for schools toolkit", url: "https://www.teachai.org/toolkit", note: "School guidance on transparent, age-appropriate AI use that the capstone plan follows.", lessons: ["capstone/project-brief", "capstone/responsible-launch"] }
    ]
  },
  {
    id: "introduction",
    title: "Interactive introduction",
    description: "The proof scene pairs a real fact with an invented quote, a common pattern in AI hallucinations.",
    references: [
      { id: "geiling-2013", kind: "journalism", publisher: "Smithsonian", short: "Honey’s shelf life", authors: "Geiling, N.", date: "2013, August 22", title: "The science behind honey\u2019s eternal shelf life", source: "Smithsonian Magazine", url: "https://www.smithsonianmag.com/science-nature/the-science-behind-honeys-eternal-shelf-life-1218690/", note: "Supports the honey half of the claim. The Einstein quote in the same scene is invented on purpose.", lessons: [] }
    ]
  }
];

export const creditGroups: { id: string; title: string; credits: Credit[] }[] = [
  {
    id: "type",
    title: "Typefaces",
    credits: [
      { name: "Clash Display", url: "https://www.fontshare.com/fonts/clash-display", detail: "Indian Type Foundry, via Fontshare. Used under the ITF Free Font License." },
      { name: "Uncut Sans", url: "https://uncut.wtf/sans-serif/uncut-sans/", detail: "Kasper Nordkvist, 2022. Used under the SIL Open Font License 1.1." }
    ]
  },
  {
    id: "visuals",
    title: "3D and imagery",
    credits: [
      { name: "Spline", url: "https://spline.design/", detail: "The question-mark sculpture was modeled in Spline for Wordplay. The intro scene and the Wordplay World island, stations, crates and gates are built from Spline shapes when the page loads. Used under the Spline Terms of Service; the Built with Spline mark stays visible." },
      { name: "Original typography and diagrams", detail: "Every other visual is an original type composition or diagram made for Wordplay. The site uses no stock photography, icon libraries or AI-generated images." }
    ]
  },
  {
    id: "content",
    title: "Writing",
    credits: [
      { name: "Lessons, quizzes and activities", detail: "Written for Wordplay in our own words. Facts are paraphrased and cited to the sources listed above; nothing is copied from them." },
      { name: "Wordplay World missions", detail: "Crate messages are written for Wordplay or adapted from the site’s own activities." },
      { name: "Glossary", detail: "Twenty definitions written for Wordplay at a grade 9 reading level." }
    ]
  },
  {
    id: "software",
    title: "Software",
    credits: [
      { name: "Next.js", url: "https://nextjs.org/", detail: "Vercel. MIT License." },
      { name: "React and React DOM", url: "https://react.dev/", detail: "Meta. MIT License." },
      { name: "Spline runtime", url: "https://spline.design/terms", detail: "Spline, Inc. Loads and animates the 3D scenes. The package declares no open-source license, so it is used under the Spline Terms of Service." },
      { name: "TypeScript", url: "https://www.typescriptlang.org/", detail: "Microsoft. Apache License 2.0." },
      { name: "Tailwind CSS and Tailwind Forms", url: "https://tailwindcss.com/", detail: "Tailwind Labs. MIT License." },
      { name: "PostCSS, Autoprefixer and ESLint", url: "https://postcss.org/", detail: "Build and code-quality tools. MIT License." },
      { name: "Vitest", url: "https://vitest.dev/", detail: "Unit tests. MIT License." },
      { name: "Playwright", url: "https://playwright.dev/", detail: "Microsoft. Browser tests. Apache License 2.0." }
    ]
  },
  {
    id: "inspiration",
    title: "Design inspiration",
    credits: [
      { name: "F\u00e9lix P\u00e9ault portfolio", url: "https://www.awwwards.com/sites/felix-peault-portfolio", detail: "Awwwards Site of the Day. Studied for poster layouts and variable type." },
      { name: "Erika Moreira portfolio", url: "https://www.awwwards.com/sites/erika-moreira-portfolio", detail: "Awwwards Site of the Day. Studied for kinetic headlines and copy-led hierarchy." },
      { name: "ToyFight", url: "https://www.awwwards.com/sites/toyfight-1", detail: "Awwwards Site of the Day. Studied for playful motion." },
      { name: "Lando Norris by OFF+BRAND", url: "https://www.awwwards.com/sites/lando-norris", detail: "Awwwards Site of the Year 2025. Studied for game energy and bold two-color contrast." },
      { name: "Bruno Simon portfolio", url: "https://thefwa.com/news/fwa-of-the-year-2025-peoples-choice-award-winners-announced", detail: "FWA of the Year 2025. Studied for exploring a site by driving through a 3D world." },
      { name: "MicrobeXplorer", url: "https://microbexplorer.dtu.dk/", detail: "Lovie Awards Gold winner for schools and education, built for high school students. Studied for explorable science. No code or artwork was copied from any of these sites." }
    ]
  }
];

const allReferences = referenceGroups.flatMap((group) => group.references);

export function referenceNumber(id: string) {
  return allReferences.findIndex((reference) => reference.id === id) + 1;
}

export function formatCitation(reference: Pick<Reference, "authors" | "date" | "title" | "source" | "url">) {
  return `${reference.authors} (${reference.date}). ${reference.title}.${reference.source ? ` ${reference.source}.` : ""} ${reference.url}`;
}

export function referencesForLesson(moduleId: string, lessonId: string) {
  return allReferences.filter((reference) => reference.lessons.includes(`${moduleId}/${lessonId}`));
}

export const copyrightChecklist: { item: string; answer: string }[] = [
  { item: "Is all written content original?", answer: "Yes. Lessons, quizzes, activities, missions and definitions are written for Wordplay; facts are cited, not copied." },
  { item: "Does the site use images, photos, video, audio or icons made by others?", answer: "No. Every visual is original type, diagrams or 3D built in Spline for this site." },
  { item: "Are third-party fonts and code licensed for this use?", answer: "Yes. Each one is listed below with its license, and the font license files ship with the site." },
  { item: "Is the site built from a template or theme?", answer: "No. The design and code are custom; frameworks are listed under Software." },
  { item: "Were other websites copied?", answer: "No. Award-winning sites were studied for ideas only and are credited under Design inspiration." }
];
