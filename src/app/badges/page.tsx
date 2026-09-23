import type { Metadata } from "next";
import { BADGES } from "@/engine/badges";
import { BadgeList } from "@/components/BadgeList";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = { title: "Badges | Wordplay" };

export default function BadgesPage() {
  return <><PageHero tone="ink" label="Badges" title="Habits worth keeping." lede="Badges mark useful habits: finishing chapters, checking your work, and coming back. Nothing here ranks you against anyone else." mark="*" /><section className="shell badges-section" aria-label="Badge collection"><BadgeList badges={BADGES} /></section></>;
}
