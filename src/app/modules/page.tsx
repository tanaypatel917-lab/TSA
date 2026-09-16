import { modules } from "@/content";
import { ModuleList } from "@/components/ModuleList";
import { SplitText } from "@/components/motion/SplitText";

export default function ModulesPage() {
  return <div className="shell py-32"><div className="grid gap-8 lg:grid-cols-12"><div className="lg:col-span-8"><p className="eyebrow"><span className="mr-3 text-accent">01</span> The learning path</p><SplitText as="h1" className="mt-7 font-display text-[clamp(3rem,8vw,7rem)] leading-[.88]">Choose your<br /><em>direction.</em></SplitText></div><p className="self-end text-lg leading-relaxed text-ink/65 lg:col-start-9 lg:col-span-4">Five ways into AI literacy. Start with the foundations, or follow the question that has your attention today.</p></div><div className="mt-24"><ModuleList modules={modules} /></div></div>;
}
