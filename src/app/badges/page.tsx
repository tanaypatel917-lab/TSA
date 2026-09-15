import { BADGES } from "@/engine/badges";
import { BadgeList } from "@/components/BadgeList";

export default function BadgesPage() {
  return (
    <div className="shell py-12 sm:py-16">
      <p className="eyebrow">Keep going / {String(BADGES.length).padStart(2, "0")} badges</p>
      <h1 className="display-lg mt-4">Badge shelf<span className="text-signal">.</span></h1>
      <p className="prose-body mt-6 max-w-2xl text-mute">Badges celebrate useful habits, not just speed. Complete the activities and return to improve quiz scores.</p>
      <BadgeList badges={BADGES} />
    </div>
  );
}
