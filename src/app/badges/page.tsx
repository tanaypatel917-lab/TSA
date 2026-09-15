import { BADGES } from "@/engine/badges";
import { BadgeList } from "@/components/BadgeList";

export default function BadgesPage() { return <div className="shell py-12"><p className="eyebrow">Keep going</p><h1 className="mt-2 text-4xl font-black">Badge shelf</h1><p className="mt-4 max-w-2xl text-lg text-slate-600">Badges celebrate useful habits, not just speed. Complete the activities and return to improve quiz scores.</p><BadgeList badges={BADGES} /></div>; }
