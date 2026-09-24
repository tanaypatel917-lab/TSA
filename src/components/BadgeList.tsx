"use client";
import { modules } from "@/content";
import { badgeProgress, type BADGES } from "@/engine/badges";
import { useProgress } from "@/state/ProgressProvider";

const tones = ["clay", "sky", "ink"] as const;

export function BadgeList({ badges }: { badges: typeof BADGES }) {
  const { state, hydrated } = useProgress();
  const earned = (id: string) => hydrated && state.badges.includes(id);
  const count = badges.filter((badge) => earned(badge.id)).length;
  const progress = new Map(badges.map((badge) => [badge.id, badgeProgress(badge.id, state, modules)]));
  const closest = hydrated ? badges.filter((badge) => !earned(badge.id) && (progress.get(badge.id)?.value ?? 0) > 0).sort((a, b) => (progress.get(b.id)?.value ?? 0) - (progress.get(a.id)?.value ?? 0))[0]?.id : undefined;
  return <><p className="badge-summary"><strong>{hydrated ? count : "–"}</strong><span>{hydrated ? `of ${badges.length} badges earned on this device` : "Checking this device’s badges…"}</span></p><ul className="badge-grid">{badges.map((badge, index) => {
    const has = earned(badge.id);
    const meter = progress.get(badge.id);
    return <li key={badge.id} className="badge-patch" data-earned={has} data-tone={tones[index % tones.length]} data-closest={badge.id === closest} data-reveal={index % 4}>{badge.id === closest && <span className="badge-closest">Closest</span>}<span className="badge-mark" aria-hidden="true">{badge.mark}</span><h2>{badge.name}</h2><p>{badge.description}</p>{!has && hydrated && meter?.label && <div className="badge-progress"><span className="badge-meter" style={{ "--value": meter.value } as React.CSSProperties} aria-hidden="true" /><span>{meter.label}</span></div>}<span className="badge-state">{has ? "Earned" : "Locked"}</span></li>;
  })}</ul></>;
}
