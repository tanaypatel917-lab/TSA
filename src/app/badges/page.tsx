import { BADGES } from "@/engine/badges";
import { BadgeList } from "@/components/BadgeList";

export default function BadgesPage() { return <div className="shell py-32"><div className="grid gap-8 lg:grid-cols-12"><div className="lg:col-span-7"><p className="eyebrow"><span className="mr-3 text-accent">01</span> Keep going</p><h1 className="mt-7 font-display text-[clamp(3rem,8vw,7rem)] leading-[.88]">Signals of<br /><em>progress.</em></h1></div><p className="self-end text-lg leading-relaxed text-ink/65 lg:col-start-9 lg:col-span-4">Badges celebrate useful habits, not just speed. Complete activities and return to improve quiz scores.</p></div><BadgeList badges={BADGES} /></div>; }
